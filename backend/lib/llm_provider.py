"""
llm_provider — Compat-Shim für `emergentintegrations.llm.chat`.

Das Problem
-----------
12 backend/routes/* Files binden direkt `emergentintegrations.llm.chat`:

    from emergentintegrations.llm.chat import LlmChat, UserMessage
    chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=…, system_message=…)
    chat.with_model("openai", "gpt-5.2")
    resp = await chat.send_message(UserMessage(text="…"))

Wir wollen weg von Emergent, ohne die 12 Routes auf einmal umzuschreiben
und in Produktion einen Halbtag stillzustehen. Dieser Shim emuliert die
Emergent-API mit nativen SDKs:

    from lib.llm_provider import LlmChat, UserMessage
    chat = LlmChat(api_key=ANTHROPIC_KEY, session_id=…, system_message=…)
    chat.with_model("anthropic", "claude-haiku-4-5-20251001")
    resp = await chat.send_message(UserMessage(text="…"))

Routes ändern sich mit nur 2 Zeilen:

    -from emergentintegrations.llm.chat import LlmChat, UserMessage
    +from lib.llm_provider import LlmChat, UserMessage
    …
    -chat.with_model("openai", "gpt-5.2")
    +chat.with_model("anthropic", "claude-haiku-4-5-20251001")

Provider-Auswahl per Env
------------------------
- `ANTHROPIC_API_KEY` gesetzt  → Anthropic-Pfad (Claude)
- `OPENAI_API_KEY` gesetzt     → OpenAI-Pfad (GPT)
- sonst `EMERGENT_LLM_KEY`     → Emergent-Pfad (alt, Wrapper)

Die `with_model("provider", "model")`-Aufrufe override den Provider explizit.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger("wladbot.llm")


# ─── User-Message ──────────────────────────────────────────────────
# Drop-in für `emergentintegrations.llm.chat.UserMessage`.

class UserMessage:
    """Einfacher Container, exakt wie Emergent-UserMessage."""

    def __init__(self, text: str = "", files: Optional[list] = None):
        self.text = text
        self.files = files or []

    def __repr__(self) -> str:
        return f"<UserMessage text={self.text[:40]!r}…>"


# ─── Provider-Adapters ─────────────────────────────────────────────

class _AnthropicAdapter:
    """Direkter Pfad → official `anthropic` SDK."""

    def __init__(self, api_key: str, model: str, system_message: str):
        try:
            import anthropic  # noqa: E402
        except ImportError as e:  # pragma: no cover — wir installieren das SDK
            raise RuntimeError(
                "anthropic SDK not installed. Add `anthropic>=0.39` to requirements.txt."
            ) from e
        self._client = anthropic.AsyncAnthropic(api_key=api_key)
        self._model = model
        self._system = system_message

    async def send(self, user_text: str) -> str:
        msg = await self._client.messages.create(
            model=self._model,
            max_tokens=4096,
            system=self._system,
            messages=[{"role": "user", "content": user_text}],
        )
        # claude antwortet als Liste von Content-Blocks; wir mergen text-only.
        parts = [b.text for b in msg.content if getattr(b, "type", "") == "text"]
        return "".join(parts)


class _OpenAIAdapter:
    """Direkter Pfad → official `openai` SDK (bereits in requirements.txt)."""

    def __init__(self, api_key: str, model: str, system_message: str):
        try:
            from openai import AsyncOpenAI
        except ImportError as e:  # pragma: no cover
            raise RuntimeError("openai SDK not installed.") from e
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model
        self._system = system_message

    async def send(self, user_text: str) -> str:
        resp = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": self._system},
                {"role": "user", "content": user_text},
            ],
            max_tokens=4096,
        )
        return resp.choices[0].message.content or ""


class _EmergentAdapter:
    """Legacy-Pfad → emergentintegrations. Nur aktiv solange wir die
    Migration nicht abgeschlossen haben. Wird gelöscht zusammen mit
    der Dependency."""

    def __init__(self, api_key: str, model: str, system_message: str, session_id: str):
        from emergentintegrations.llm.chat import LlmChat  # type: ignore
        self._chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message,
        )
        # Emergent will provider + model getrennt.
        provider, model_id = self._parse(model)
        self._chat.with_model(provider, model_id)

    @staticmethod
    def _parse(model: str) -> tuple[str, str]:
        # Modell-Strings im Format "openai/gpt-5.2" oder "openai:gpt-5.2"
        # mappen wir auf (provider, model_id). Default-Provider openai.
        for sep in ("/", ":"):
            if sep in model:
                p, m = model.split(sep, 1)
                return p, m
        return "openai", model

    async def send(self, user_text: str) -> str:
        from emergentintegrations.llm.chat import UserMessage as EmUserMessage  # type: ignore
        return await self._chat.send_message(EmUserMessage(text=user_text))


# ─── LlmChat — public, identische Signatur wie Emergent ───────────

class LlmChat:
    """Drop-in für `emergentintegrations.llm.chat.LlmChat`.

    Behält die Methoden-Kette der Emergent-API:

        chat = LlmChat(api_key=..., session_id=..., system_message=...)
        chat.with_model("anthropic", "claude-haiku-4-5-20251001")
        resp = await chat.send_message(UserMessage(text="..."))

    `api_key` wird wegen Backward-Compat akzeptiert, aber bei
    Anthropic / OpenAI von ENV überschrieben. Dadurch können
    Routes weiter `EMERGENT_LLM_KEY` übergeben, ohne dass das
    den Provider wechselt — der ENV-Switch steuert.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        session_id: Optional[str] = None,
        system_message: str = "",
    ):
        self._api_key = api_key
        self._session_id = session_id or "ad-hoc"
        self._system = system_message
        self._provider = self._default_provider()
        # Default-Modelle, werden überschrieben durch `with_model(...)`.
        self._model = self._default_model(self._provider)
        self._adapter = None  # lazy — erst beim ersten send() instanziieren

    @staticmethod
    def _default_provider() -> str:
        if os.environ.get("ANTHROPIC_API_KEY"):
            return "anthropic"
        if os.environ.get("OPENAI_API_KEY"):
            return "openai"
        return "emergent"

    @staticmethod
    def _default_model(provider: str) -> str:
        return {
            "anthropic": "claude-haiku-4-5-20251001",
            "openai":    "gpt-4o-mini",
            "emergent":  "openai/gpt-5.2",
        }[provider]

    def with_model(self, provider_or_model: str, model: Optional[str] = None) -> "LlmChat":
        """
        Akzeptiert beide Signaturen:
          - with_model("anthropic", "claude-haiku-4-5-20251001")
          - with_model("openai/gpt-5.2")
        Damit bleiben alte Emergent-Callsites unverändert.
        """
        if model is None:
            # Emergent ließ auch `with_model("openai/gpt-5.2")` zu.
            self._model = provider_or_model
        else:
            # Wenn ein Env-Native-Provider verfügbar ist, bleiben wir dort —
            # `with_model("openai", "...")` wechselt nicht zurück auf Emergent.
            preferred = self._default_provider()
            if preferred in ("anthropic", "openai"):
                self._provider = preferred
                # Behalte das alte Modell falls Provider gleich, sonst Default.
                self._model = self._default_model(preferred) if preferred != provider_or_model else model
            else:
                self._provider = provider_or_model
                self._model = model
        return self

    def _build_adapter(self):
        if self._provider == "anthropic":
            return _AnthropicAdapter(
                api_key=os.environ["ANTHROPIC_API_KEY"],
                model=self._model,
                system_message=self._system,
            )
        if self._provider == "openai":
            return _OpenAIAdapter(
                api_key=os.environ["OPENAI_API_KEY"],
                model=self._model,
                system_message=self._system,
            )
        # Legacy fallback
        return _EmergentAdapter(
            api_key=self._api_key or os.environ.get("EMERGENT_LLM_KEY", ""),
            model=self._model,
            system_message=self._system,
            session_id=self._session_id,
        )

    async def send_message(self, message: UserMessage) -> str:
        if self._adapter is None:
            self._adapter = self._build_adapter()
        try:
            return await self._adapter.send(message.text)
        except Exception as e:
            logger.error("llm_provider send failed (provider=%s model=%s): %s",
                         self._provider, self._model, e)
            raise

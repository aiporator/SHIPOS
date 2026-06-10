# Emergent → Native Anthropic/OpenAI · Migration Status

> Wir lösen die Abhängigkeit von `emergentintegrations` schrittweise auf.
> Der Compat-Shim in `backend/lib/llm_provider.py` macht das schmerzlos:
> identische API, ENV-basierter Provider-Switch.

## Status pro Route (Stand dieser PR)

| Route                          | Was nutzt es                | Status     | Notiz |
| ------------------------------ | --------------------------- | ---------- | ----- |
| `routes/chat.py`               | LlmChat                     | ✅ Shim    | Default-Hauptchat |
| `routes/challengers.py`        | LlmChat                     | ✅ Shim    | |
| `routes/folders.py`            | LlmChat                     | ✅ Shim    | |
| `routes/video.py`              | LlmChat + OpenAISpeechToText| ✅ Shim    | STT + Chat beide |
| `routes/voice_tts.py`          | LlmChat + OpenAISpeechToText| ✅ Shim    | Inkl. lokal-importierte Aufrufe |
| `routes/playbooks.py`          | LlmChat                     | ✅ Shim    | |
| `routes/tools.py`              | LlmChat                     | ✅ Shim    | |
| `routes/admin_quality.py`      | LlmChat                     | ✅ Shim    | Internes Audit-Tool |
| `routes/simulations.py`        | LlmChat                     | ✅ Shim    | |
| `routes/checkin.py`            | LlmChat                     | ✅ Shim    | Daily-Checkin |
| `routes/uploads.py`            | EMERGENT_LLM_KEY als Storage-Token | ⏸ defer | Object-Storage-Migration, eigener Sprint |
| `routes/payments.py`           | StripeCheckout-Wrapper      | ⏸ defer | Direkte stripe-SDK-Migration nötig |

Nicht-Routen die noch lesen: `services_wladhub_autosync.py` (nutzt nur
EMERGENT_LLM_KEY, kein LLM-Call) — wird beim Storage-Pass mitabgehandelt.

## Provider-Switch — was muss ich in Vercel setzen?

In **Project Settings → Environment Variables** (Production):

```
ANTHROPIC_API_KEY=sk-ant-…       # → Claude Haiku 4.5 (Default ab Migration)
OPENAI_API_KEY=sk-…              # → GPT-4o-mini (für STT/Voice + Fallback)
EMERGENT_LLM_KEY=…               # bleibt vorerst drin für payments.py + uploads.py
```

Reihenfolge der Auto-Detection im Shim:

1. `ANTHROPIC_API_KEY` gesetzt → Anthropic
2. `OPENAI_API_KEY` gesetzt → OpenAI
3. sonst → Emergent (Legacy)

`with_model("openai", "gpt-5.2")` Aufrufe in den Routes bleiben ohne
Effekt: der Shim respektiert die ENV-Preferenz. Heißt: ihr deployt
einmal mit beiden Keys parallel, Traffic läuft schon nativ, Emergent
ist nur noch Notfall-Backup.

## Test-Plan nach dem ENV-Switch

1. `POST /api/chat` → Antwort kommt zurück (Wladbot Hauptfall).
2. `POST /api/checkin` → Daily-Check funktioniert.
3. `POST /api/voice/transcribe` (oder Voice-Mode-Overlay im UI) →
   STT muss klappen (nutzt `OpenAISpeechToText`).
4. Sentry-Tab: keine `llm_provider send failed`-Errors.
5. PostHog: Chat-Volume bleibt stabil — wenn es einbricht, einzelne
   Routes prüfen.

## Rollback

Soll der native Provider zurück auf Emergent fallen:

```
# In Vercel:
ANTHROPIC_API_KEY=   (leer setzen)
OPENAI_API_KEY=      (leer setzen)
EMERGENT_LLM_KEY=…   (bleibt aktiv)
```

Redeploy nicht nötig — der Shim liest beim ersten Request neu. Ein
manueller Reload des FastAPI-Workers kann das schneller machen.

## Was als nächstes raus muss

### a) `routes/payments.py` (Stripe-Wrapper)

`emergentintegrations.payments.stripe.checkout` kapselt:
- `StripeCheckout`-Klasse
- `CheckoutSessionRequest` / `CheckoutSessionResponse`
- Webhook-Signature-Validierung

Migration auf die offizielle `stripe`-Python-SDK:

```python
import stripe
stripe.api_key = STRIPE_API_KEY
session = stripe.checkout.Session.create(
    line_items=[…],
    mode="payment",
    success_url=…,
    cancel_url=…,
)
```

Webhook (bereits ausgelagert in Supabase Edge Function — siehe
backend/routes/payments.py Kommentar bei `/webhook/stripe`).
Dauer: 1 Sprint-Day mit sauberem Stripe-Test-Mode.

### b) `routes/uploads.py` + Object-Storage

`emergentagent.com`-CDN durch S3-/R2-/Supabase-Storage ersetzen.
Storage-Init-Endpoint dort ist ein Emergent-spezifisches Auth-Modell —
muss komplett ersetzt werden, kein Drop-in. Dauer: 1–2 Sprint-Days.

### c) `requirements.txt` Entfernung

Erst wenn alle 3 Punkte oben durch sind:

```
# requirements.txt
- emergentintegrations==0.1.0
+ stripe>=8.0
```

Dann auch `EMERGENT_LLM_KEY` aus den ENV-Vars in Vercel löschen.

## Wieso ein Shim und nicht direkt SDK-Calls überall?

Drei Gründe:

1. **Atomarität.** Wenn 10 Routes parallel migriert werden müssen,
   ist die Wahrscheinlichkeit dass eine vergessen wird ~100 %.
   Shim heißt: heute 9 Routes geflippt, payments.py morgen, alle
   funktionieren weiter.
2. **Rollback in einer Minute.** ENV leeren → zurück auf Emergent.
   Kein Hotfix-Push, kein Stress.
3. **Test-Surface.** Wenn Claude Haiku auf einer Route schlechter
   antwortet als GPT-5.2, sehen wir das pro Route und können
   gezielt `with_model("openai", "gpt-4o")` im Code halten, während
   alles andere auf Claude läuft. Der Shim respektiert beide Wege.

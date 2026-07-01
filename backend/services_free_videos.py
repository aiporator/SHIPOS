"""4 Free CTA Videos — Lead-Magnet Funnel (Godmode).

Single source of truth for the "4 kostenlose Videos" funnel that runs on
leader-os.de. The funnel:

    Landing offer  →  register  →  /free-videos (all 4 instantly playable)
                                →  Day 1-4 email drip (one video per day)

The four videos come from the shared Google-Drive folder
(1v-SH3J2bM_BP9x2mvsjEU0ALHjXf4ZvY). Each slot can be sourced from — in
priority order:

  1. youtube_id  — preferred once the clips are on YouTube (the file titles
                   literally read "YouTube Video 0X"). Set this and the
                   player/email use YouTube.
  2. vimeo_id    — Vimeo HD (same family as the weekly Lernvideo library).
  3. drive_id    — Google-Drive preview embed. Works today WITHOUT re-hosting,
                   but the Drive file must be shared
                   "Anyone with the link → Viewer" for the embed to play.

A slot with NO source is treated as "coming soon": shown locked on the page
and SKIPPED by the email drip (we never email a broken "watch this" link).
This mirrors the existing weekly video-drip behaviour in lifecycle_emails.

To swap a source later just edit the dict below (and the frontend mirror in
frontend/src/data/freeVideos.js — keep the two in sync).
"""

# Ordered Day 1 → Day 4. `day` drives the email drip cadence (one per day).
FREE_VIDEOS = [
    {
        "id": "fv1",
        "day": 1,
        "title": "KI-Leadership: Der erste Hebel",
        "subtitle": "Warum die meisten Führungskräfte KI falsch einsetzen",
        "duration": "AI · CTA 01",
        # Google-Drive: "YouTube Video 01 KI CTA.mp4"
        "drive_id": "16MqmrIEOG4xrqm_j8VyJq3gJH168Wyg4",
        "youtube_id": "",
        "vimeo_id": "",
        "hook": (
            "Fangen wir mit dem an, was fast jeder Leader übersieht: KI ist kein "
            "Werkzeug, das du 'auch noch' bedienst — sie ist das Betriebssystem "
            "unter deiner Führung. Video 1 zeigt dir den ersten Hebel."
        ),
        "takeaway": (
            "Du verstehst nach diesem Video, warum KI-native Führung dein "
            "größter Wettbewerbsvorteil der nächsten 24 Monate ist — und wo "
            "du heute anfängst."
        ),
    },
    {
        "id": "fv2",
        "day": 2,
        "title": "Vom Reagieren zum Antizipieren",
        "subtitle": "KI als dein Co-Pilot im Führungsalltag",
        "duration": "AI · CTA 04",
        # Google-Drive: "Youtube Video 04 KI CTA.mp4"
        "drive_id": "1-KJxED0b74Zgph3Q9hnOIAhnuxNQcK5o",
        "youtube_id": "",
        "vimeo_id": "",
        "hook": (
            "Tag 2. Gestern der Hebel, heute die Anwendung: wie du aufhörst, "
            "Feuer zu löschen — und anfängst, Entscheidungen 3 Züge im Voraus "
            "zu treffen."
        ),
        "takeaway": (
            "Du bekommst das Denkmodell, mit dem du KI vom Spielzeug zum "
            "Frühwarnsystem für dein Team machst."
        ),
    },
    {
        "id": "fv3",
        "day": 3,
        "title": "Das System hinter der Wirkung",
        "subtitle": "Wie aus KI-Impulsen eine Routine wird",
        "duration": "AI · CTA 05",
        # Google-Drive: "YouTube Video 05.mp4"
        "drive_id": "1hIMfxWbZVZbtmWyN1YWf3nVMkQfKsxfQ",
        "youtube_id": "",
        "vimeo_id": "",
        "hook": (
            "Tag 3. Einzelne Aha-Momente verpuffen — Systeme bleiben. Heute "
            "zeigen wir, wie du das Gelernte in eine wöchentliche Routine "
            "gießt, die auch dann läuft, wenn der Kalender brennt."
        ),
        "takeaway": (
            "Du hast am Ende einen konkreten Wochen-Rhythmus, der KI fest in "
            "deine Führung einbaut."
        ),
    },
    {
        "id": "fv4",
        "day": 4,
        "title": "Dein nächster Schritt",
        "subtitle": "Leader-OS in Aktion — und wie es für dich weitergeht",
        "duration": "AI · FINALE",
        # 4th CTA clip — add the source (youtube_id / vimeo_id / drive_id) here.
        # Until then this slot shows "in Kürze" on the page and is skipped by
        # the email drip, so the funnel never links to a broken video.
        "drive_id": "",
        "youtube_id": "",
        "vimeo_id": "",
        "hook": (
            "Tag 4 — das Finale. Du hast den Hebel, das Denkmodell und die "
            "Routine. Jetzt zeigen wir dir, wie Leader-OS all das für dich "
            "auf Autopilot stellt."
        ),
        "takeaway": (
            "Du weißt genau, wie dein Weg mit Leader-OS weitergeht — und "
            "startest deine 14 Tage kostenlos."
        ),
    },
]

# Map for O(1) lookups.
FREE_VIDEOS_BY_ID = {v["id"]: v for v in FREE_VIDEOS}


def video_source(video: dict) -> tuple[str, str] | tuple[None, None]:
    """Resolve the (kind, id) of the first available source for a video.

    kind ∈ {"youtube", "vimeo", "drive"}. Returns (None, None) if the slot
    has no source yet ("coming soon").
    """
    if video.get("youtube_id"):
        return "youtube", video["youtube_id"]
    if video.get("vimeo_id"):
        return "vimeo", video["vimeo_id"]
    if video.get("drive_id"):
        return "drive", video["drive_id"]
    return None, None


def is_ready(video: dict) -> bool:
    """True if the video has any playable source."""
    kind, _ = video_source(video)
    return kind is not None


def embed_url(video: dict) -> str | None:
    """Public embed/preview URL for the video, or None if not ready."""
    kind, ref = video_source(video)
    if kind == "youtube":
        return f"https://www.youtube.com/embed/{ref}"
    if kind == "vimeo":
        return f"https://player.vimeo.com/video/{ref}"
    if kind == "drive":
        return f"https://drive.google.com/file/d/{ref}/preview"
    return None


def ready_videos() -> list[dict]:
    """The subset of FREE_VIDEOS that currently have a playable source."""
    return [v for v in FREE_VIDEOS if is_ready(v)]

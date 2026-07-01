/**
 * 4 Free CTA Videos — Lead-Magnet Funnel (Godmode).
 *
 * Frontend mirror of backend/services_free_videos.py — KEEP IN SYNC.
 * The gated /free-videos page and the public FreeVideoFunnelSection both
 * read from here. Each slot resolves a source in priority order:
 *   youtube_id → vimeo_id → drive_id (Google-Drive preview embed).
 *
 * A Drive-sourced video only plays if the Drive file is shared
 * "Anyone with the link → Viewer". A slot with no source shows as
 * "in Kürze" (coming soon) and is not playable.
 */

export const FREE_VIDEOS = [
  {
    id: 'fv1',
    day: 1,
    title: 'KI-Leadership: Der erste Hebel',
    subtitle: 'Warum die meisten Führungskräfte KI falsch einsetzen',
    tag: 'AI · CTA 01',
    driveId: '16MqmrIEOG4xrqm_j8VyJq3gJH168Wyg4',
    youtubeId: '',
    vimeoId: '',
    blurb:
      'KI ist kein Werkzeug, das du „auch noch" bedienst — sie ist das Betriebssystem unter deiner Führung. Video 1 zeigt dir den ersten Hebel.',
    bullets: [
      'Warum „KI als Werkzeug" der teuerste Denkfehler deiner Karriere ist',
      'Der 5-Minuten-Audit: wo dein Führungsalltag heute Zeit verbrennt',
      'Das eine Prinzip, das KI-native Leader von allen anderen trennt',
    ],
  },
  {
    id: 'fv2',
    day: 2,
    title: 'Vom Reagieren zum Antizipieren',
    subtitle: 'KI als dein Co-Pilot im Führungsalltag',
    tag: 'AI · CTA 04',
    driveId: '1-KJxED0b74Zgph3Q9hnOIAhnuxNQcK5o',
    youtubeId: '',
    vimeoId: '',
    blurb:
      'Hör auf, Feuer zu löschen — triff Entscheidungen drei Züge im Voraus. Wie KI vom Spielzeug zum Frühwarnsystem für dein Team wird.',
    bullets: [
      'Raus aus dem Reaktions-Modus — ohne eine Minute mehr Arbeitszeit',
      'Die 3-Züge-Methode: entscheiden, bevor das Problem auf dem Tisch liegt',
      'Warum dein Team dir mehr vertraut, wenn KI deine Vorbereitung übernimmt',
    ],
  },
  {
    id: 'fv3',
    day: 3,
    title: 'Das System hinter der Wirkung',
    subtitle: 'Wie aus KI-Impulsen eine Routine wird',
    tag: 'AI · CTA 05',
    driveId: '1hIMfxWbZVZbtmWyN1YWf3nVMkQfKsxfQ',
    youtubeId: '',
    vimeoId: '',
    blurb:
      'Einzelne Aha-Momente verpuffen — Systeme bleiben. Der Wochen-Rhythmus, der KI fest in deine Führung einbaut.',
    bullets: [
      'Der 15-Minuten-Wochen-Rhythmus, der auch dann läuft, wenn der Kalender brennt',
      'Warum Aha-Momente verpuffen — und was Systeme anders machen',
      'Deine Checkliste für das erste KI-Führungs-Ritual (ab Woche 1)',
    ],
  },
  {
    id: 'fv4',
    day: 4,
    title: 'Dein nächster Schritt',
    subtitle: 'Leader-OS in Aktion — und wie es für dich weitergeht',
    tag: 'AI · FINALE',
    // 4th CTA clip — add a source (youtubeId / vimeoId / driveId) once available.
    driveId: '',
    youtubeId: '',
    vimeoId: '',
    blurb:
      'Du hast den Hebel, das Denkmodell und die Routine. Das Finale zeigt, wie Leader-OS all das für dich auf Autopilot stellt.',
    bullets: [
      'Wie du Hebel, Denkmodell und Routine auf Autopilot stellst',
      'Dein konkreter 30-Tage-Plan nach der Serie',
      'Der nächste Schritt — wenn du mehr willst (völlig freiwillig)',
    ],
  },
];

/** Resolve the embed URL for a video, or null if no source is set yet. */
export function freeVideoEmbedUrl(video) {
  if (!video) return null;
  if (video.youtubeId) return `https://www.youtube.com/embed/${video.youtubeId}`;
  if (video.vimeoId) return `https://player.vimeo.com/video/${video.vimeoId}`;
  if (video.driveId) return `https://drive.google.com/file/d/${video.driveId}/preview`;
  return null;
}

/** True if the video has any playable source. */
export function isFreeVideoReady(video) {
  return Boolean(video && (video.youtubeId || video.vimeoId || video.driveId));
}

// ── Opt-in state (public squeeze page) ──────────────────────────────────────
// The standalone /gratis-videos landing page reveals the videos inline once a
// visitor gives their email — no account required (max opt-in rate). We only
// remember the "has opted in" flag client-side; the actual lead is persisted
// server-side via /api/leader-check/intent.
export const FREE_VIDEO_OPTIN_KEY = 'leader_os_free_videos_optin';

export function hasFreeVideoOptIn() {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(localStorage.getItem(FREE_VIDEO_OPTIN_KEY));
  } catch {
    return false;
  }
}

export function setFreeVideoOptIn(email) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FREE_VIDEO_OPTIN_KEY, email || '1');
  } catch {
    /* ignore storage failures — the reveal still works for the session */
  }
}

/**
 * freeVideos · config for the free 4-video lead-magnet funnel (/gratis).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  👉 TO GO LIVE: paste each video's ID + provider below.              │
 * │     provider: 'vimeo'  → id = the numeric Vimeo id (e.g. '1197728183')│
 * │     provider: 'youtube'→ id = the YouTube video id (e.g. 'fb1DEBJ3DqQ')│
 * │     provider: 'drive'  → id = the Google-Drive file id               │
 * │                          (share the file "anyone with link")         │
 * │  A video with an empty id renders a branded "coming soon" placeholder │
 * │  so the funnel never looks broken before the assets are in.          │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * The drip: subscribers who opt in are tagged campaign='free-video-series'
 * (see FreeVideosPage). One email per day, one video per day — wired on the
 * email side (Resend sequence / Supabase cron), see docs/RUNBOOK.
 */

export const FREE_VIDEOS = [
  {
    day: 1,
    provider: 'vimeo',
    id: '', // ← paste video 1 id
    thumb: '/videos/free/thumb-01.webp',
    title: 'Warum die meisten Führungskräfte unsichtbar bleiben.',
    hook: 'Der eine Denkfehler, der dich Beförderung, Gehalt und Respekt kostet — und wie du ihn heute abstellst.',
    duration: '8 Min',
  },
  {
    day: 2,
    provider: 'vimeo',
    id: '', // ← paste video 2 id
    thumb: '/videos/free/thumb-02.webp',
    title: 'Natürliche Autorität · ohne lauter zu werden.',
    hook: 'Die 3 Signale, an denen dein Team in 4 Sekunden entscheidet, ob es dir folgt.',
    duration: '11 Min',
  },
  {
    day: 3,
    provider: 'vimeo',
    id: '', // ← paste video 3 id
    thumb: '/videos/free/thumb-03.webp',
    title: 'Weniger arbeiten, mehr bewirken.',
    hook: 'Wie du dein Team dazu bringst, von allein Verantwortung zu übernehmen — Schluss mit Mikromanagement.',
    duration: '9 Min',
  },
  {
    day: 4,
    provider: 'vimeo',
    id: '', // ← paste video 4 id
    thumb: '/videos/free/thumb-04.webp',
    title: 'Dein 30-Tage-Plan zur KI-nativen Führungskraft.',
    hook: 'Der genaue Fahrplan, mit dem du Wlads Methodik in deinen Alltag bringst — in 10 Minuten pro Tag.',
    duration: '12 Min',
  },
];

export const isVideoReady = (v) => Boolean(v && v.id);

export const anyVideoReady = FREE_VIDEOS.some(isVideoReady);

export const embedSrc = (v) => {
  if (!v || !v.id) return null;
  if (v.provider === 'vimeo') {
    return `https://player.vimeo.com/video/${v.id}?dnt=1&title=0&byline=0&portrait=0`;
  }
  if (v.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`;
  }
  if (v.provider === 'drive') {
    return `https://drive.google.com/file/d/${v.id}/preview`;
  }
  return null;
};

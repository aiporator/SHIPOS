# Google Ads Setup · LeaderOS

> Kompletter Einrichtungs-Runbook für den ersten Google-Ads-Launch.
> Landing: **`leader-os.de/wladbot`** (Ad-Landing, statisch, kein React)
> · Conversion: **Pageview `/wladbot/danke`** (nur nach erfolgreichem
> E-Mail-Submit erreichbar).
>
> Ergänzt `RUNBOOK_ADS_CHANNELS.md` §4 (Keyword-Liste, Budget-Hygiene)
> und `ADS_90D.md` (Creatives). Hier steht das **technische** Setup:
> Konto, Tag, Consent, Conversion-Actions, UTM-Konventionen.

**Stand:** August 2026 · Webinar-Termin überall im Repo:
**Do 17.09.2026, 10:00 CEST** (`2026-09-17T08:00:00Z`).

---

## 0. Was im Code bereits fertig ist

| Baustein | Wo | Status |
| --- | --- | --- |
| Ad-Landing `/wladbot` | `frontend/public/wladbot/index.html` | ✅ live (statisch, LCP-schnell, keine React-Bundle-Kosten) |
| Danke-/Conversion-Page `/wladbot/danke` | `frontend/public/wladbot/danke/index.html` | ✅ live, `noindex` |
| UTM-Passthrough | `/wladbot`-Form liest `utm_campaign` aus der URL und schickt es als `campaign` an `POST /api/leader-check/intent` (Fallback `wladbot-hero`, max 64 Zeichen) | ✅ |
| Lead-Persistenz | Mongo `nurture_leads` (Feld `campaign`) → sofortige Welcome-Mail → 7-Mail-Journey (`/api/cron/lead-nurture`, Tag 0/2/4/6/8/10/12) | ✅ |
| Ehrliche Scarcity | Countdown auf den echten Webinar-Termin, blendet sich nach Ablauf aus | ✅ |

**Noch NICHT im Code:** das Google-Tag (gtag.js) und Consent Mode.
Beides absichtlich — erst wenn das Konto existiert und die AW-ID bekannt
ist (siehe §2/§3). Bis dahin ist die Conversion serverseitig über
`nurture_leads.campaign` + PostHog messbar.

---

## 1. Konto anlegen (User-Aktion, ~20 Min)

1. [ads.google.com](https://ads.google.com) → Konto mit der
   Firmen-Google-Identität anlegen (nicht privat!).
   - Währung **EUR**, Zeitzone **Berlin** — beides ist später
     unveränderbar.
   - **Expertenmodus** wählen ("Kampagne ohne Zielvorhaben erstellen"),
     sonst zwingt der Wizard sofort eine Smart-Campaign auf.
2. Rechnungsprofil (Firmendaten, USt-ID) hinterlegen.
3. Die **AW-Conversion-ID** notieren: Tools → Datenmanager → Google-Tag.
   Format `AW-XXXXXXXXXX`. Die brauchen wir für §3.
4. Google Ads ↔ Google Search Console verknüpfen (Tools → Verknüpfte
   Konten) — GSC ist für beide Domains bereits verifiziert.

## 2. Conversion-Actions definieren

Im Konto unter Ziele → Conversions → Neue Conversion-Aktion → Website:

| Name | Typ | Trigger | Wert | Zählung |
| --- | --- | --- | --- | --- |
| `wladbot_lead` | Lead | Pageview `leader-os.de/wladbot/danke` | 5 € (Platzhalter, später aus echter Lead→Kauf-Rate ableiten) | Eine pro Klick |
| `webinar_signup` | Lead | Pageview `leader-os.de/webinar/danke` | 8 € | Eine pro Klick |
| `signup_started` | Sekundär (Beobachtung) | Pageview `leader-os.de/signup` | — | Eine |

Warum Pageview statt Klick-Event: `/wladbot/danke` ist **nur** nach
erfolgreichem `POST /api/leader-check/intent` erreichbar (JS-Redirect
nach `r.ok`). Ein Pageview dort == ein echter Lead in `nurture_leads`.
Kein zusätzliches Event-Wiring nötig, kein Doppelzähl-Risiko.

`wladbot_lead` als **primäre** Conversion markieren (steuert das
Bidding), die anderen als sekundär.

## 3. Google-Tag einbauen (Code-Aktion, wenn AW-ID vorliegt)

Wenn die AW-ID da ist, in **beiden** wladbot-Seiten (`index.html` +
`danke/index.html`) vor `</head>`:

```html
<!-- Consent Mode v2: Default DENIED, bevor gtag lädt -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
gtag('js', new Date());
gtag('config', 'AW-XXXXXXXXXX');
</script>
```

Nach Consent-Opt-in (Cookie-Banner, siehe §4):

```js
gtag('consent', 'update', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});
```

**CSP erweitern (Pflicht, sonst blockt der Browser das Tag).**
In `vercel.json`, Header `Content-Security-Policy`:

- `script-src` + ` https://www.googletagmanager.com`
- `img-src` + ` https://www.googletagmanager.com https://*.google.com https://*.google.de https://*.doubleclick.net`
- `connect-src` + ` https://www.googletagmanager.com https://*.google-analytics.com https://*.g.doubleclick.net https://*.google.com`
- `frame-src` + ` https://td.doubleclick.net`

(Die Conversion-Pings laufen je nach Consent-Status über
`google.com/pagead`, `googleads.g.doubleclick.net` oder — im
Cookieless-Ping des Consent Mode — `google-analytics.com`.)

## 4. Consent Mode v2 · DSGVO

Pflicht für EU-Traffic seit März 2024 — ohne v2-Signale verweigert
Google Personalisierung & Remarketing komplett.

- **Modell: Advanced Consent Mode** (Tag lädt immer, Default `denied`,
  cookieless Pings bis Opt-in). Alternative "Basic" (Tag erst nach
  Opt-in laden) verliert die Modellierung — nicht empfohlen.
- Die statischen wladbot-Seiten haben **kein** Cookie-Banner. Optionen:
  1. **Minimal-Banner selbst bauen** (ein `<div>`, zwei Buttons,
     `localStorage`-Flag, ruft `gtag('consent','update',…)`) — passt
     zur Zero-Dependency-Philosophie der statischen Seiten. Empfohlen.
  2. CMP (Cookiebot/Usercentrics) — erst nötig, wenn mehr Vendor-Tags
     dazukommen. Kostet, lädt fremdes JS, braucht weitere CSP-Einträge.
- Bis das Banner steht, **keine** Remarketing-Listen aktivieren — reine
  Conversion-Messung mit Consent-Default-denied + Modellierung ist
  zulässig und funktioniert.
- Datenschutzerklärung (`/datenschutz`) um Google-Ads-Conversion-Tracking
  + Consent-Mode-Abschnitt ergänzen, sobald das Tag live ist.

## 5. Kampagnen-Struktur · Launch (30 €/Tag gesamt)

Budget-Rahmen aus `RUNBOOK_ADS_CHANNELS.md` (30 €/Tag Google Search,
Long-Tail zuerst). Struktur:

```
Konto
└── Kampagne S-01 · Search · WladBot (20 €/Tag)
    ├── AdGroup "ki-coach"      → kw: ki coach führung, ai coaching deutsch,
    │                              ki führungskräfte training
    ├── AdGroup "rhetorik"      → kw: rhetorik coach online, argumentation
    │                              training, überzeugend argumentieren lernen
    └── AdGroup "wlad-brand"    → kw: wlad jachtchenko, wladislaw jachtchenko
                                   (Brand-Schutz, billig, hohe CVR)
└── Kampagne S-02 · Search · Webinar (10 €/Tag)
    └── AdGroup "webinar"       → kw: führung webinar kostenlos, leadership
                                   training online — Landing /webinar
```

- Gebotsstrategie: Start **Max. Klicks** mit CPC-Limit 2,50 €; nach
  ≥ 30 Conversions auf **Conversions maximieren** umstellen.
- Ausrichtung: Deutschland + Österreich + Schweiz (deutschsprachig),
  Sprache Deutsch.
- Keyword-Match: Phrase + Exact, **kein** Broad zum Start.
- Auszuschließende Keywords ab Tag 1: `kostenlos ohne anmeldung`, `job`,
  `gehalt`, `ausbildung`, `studium`, `buch pdf download`.
- **Performance Max erst NACH ≥ 50 Search-Conversions** — PMax ohne
  Conversion-Historie verbrennt Budget auf Display-Müll.

### Anzeigentexte (RSA, kanon-ehrlich)

Alle Claims aus `WLAD_CANON.md` — keine erfundenen Zahlen:

```
Headlines (je ≤ 30 Zeichen):
  Dein KI-Coach. 24/7.
  3× SPIEGEL-Bestseller
  Wlads Methodik als KI
  Antwort in Sekunden
  Führung ist trainierbar
  Kostenlos starten
Descriptions (je ≤ 90 Zeichen):
  WladBot kennt die Methodik von Wlad Jachtchenko. Frag ihn, was dich
  gerade blockiert.
  400.000+ Klienten seit 2007. Jetzt als KI-Coach in deiner Tasche.
  Kostenlos testen.
Final-URL: https://leader-os.de/wladbot?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}
```

## 6. UTM-Konventionen

Ein Schema für alle Kanäle — `campaign` landet 1:1 in
`nurture_leads.campaign` und in PostHog:

| Parameter | Wert (Beispiele) | Regel |
| --- | --- | --- |
| `utm_source` | `google` · `meta` · `linkedin` · `newsletter` | Plattform, klein |
| `utm_medium` | `cpc` · `paid-social` · `email` | Kanaltyp |
| `utm_campaign` | `g-search-wladbot` · `g-search-webinar` · `webinar-2026-09-17` | kebab-case, ≤ 64 Zeichen, Prefix `g-` für Google |

Beispiel Final-URL Kampagne S-01:
`https://leader-os.de/wladbot?utm_source=google&utm_medium=cpc&utm_campaign=g-search-wladbot`

Auswertung: Mongo `nurture_leads` gruppiert nach `campaign` (Leads) ×
PostHog-Funnel `/wladbot → /wladbot/danke → signup` (Conversion-Rate) ×
Google-Ads-Kostenexport = **CPL pro Kampagne**.

## 7. Launch-Checkliste

- [ ] §1 Konto + Rechnungsprofil (User)
- [ ] §2 Conversion-Actions angelegt, `wladbot_lead` primär (User)
- [ ] §3 gtag + Consent-Default in beide wladbot-Seiten, CSP erweitert (Code-PR)
- [ ] §4 Minimal-Consent-Banner auf beiden Seiten (Code-PR)
- [ ] `/datenschutz` ergänzt (Code-PR)
- [ ] §5 Kampagnen S-01/S-02 mit RSAs + negativen Keywords (User)
- [ ] Test: Ad-Preview-Klick → Formular mit Testmail → `/wladbot/danke`
      lädt → Conversion erscheint in Google Ads (bis 3 h Verzögerung)
      → Lead in `nurture_leads` mit `campaign='g-search-wladbot'`
- [ ] Wöchentlicher Reporting-Loop aus `RUNBOOK_ADS_CHANNELS.md` läuft

---

*Pflege: Bei Webinar-Terminwechsel den Termin oben UND
`utm_campaign=webinar-…`-Werte in `backend/routes/webinar.py`
(`WEBINAR_CAMPAIGN`) mitziehen.*

# SEO & AEO Playbook · LeaderOS

> Wie leader-os.de in **Google, Bing und Antwort-Maschinen** (ChatGPT,
> Claude, Perplexity, Copilot, Gemini, Siri) gefunden und **zitiert**
> wird. Keyword-Universum steht in `SEO_KEYWORDS.md`, Anzeigen in
> `GOOGLE_ADS_SETUP.md` — hier steht die technische Sichtbarkeit.

**Stand:** August 2026.

---

## 0. Das eine Problem, das alles erklärt

Die Marketing-Seite ist eine **Create-React-App**. CRA liefert auf jeder
Route dieselbe leere Shell aus; der Inhalt entsteht erst im Browser
durch JavaScript.

Googlebot rendert JavaScript (mit Verzögerung). **Die Antwort-Crawler
tun das nicht:** GPTBot, ClaudeBot, PerplexityBot, Applebot und
Bytespider lesen das rohe HTML. Für sie war jede Seite außer der
Startseite jahrelang leer.

Daraus folgt die Grundregel dieses Repos:

> **Alles, was zitiert werden soll, muss ohne JavaScript im HTML
> stehen.**

Dafür gibt es genau zwei Mechanismen:

| Mechanismus | Wofür | Wo |
| --- | --- | --- |
| **Build-Prerendering** | die 153 Journal-Artikel + `/journal` | `frontend/scripts/prerender-articles.mjs`, läuft in `yarn build` |
| **Statische Seiten in `public/`** | Kampagnen- und Antwort-Seiten (`/fragen`, `/os`, `/app`, `/wladbot`) | `frontend/public/<name>/index.html`, von Vercel vor dem SPA-Rewrite ausgeliefert |

Eine React-Route ohne einen dieser beiden Mechanismen ist für
Antwort-Maschinen **unsichtbar**. Beim Anlegen neuer Marketing-Seiten
also immer zuerst diese Frage stellen.

---

## 1. Was live ist

### Crawler-Zugang (`frontend/public/robots.txt`)

- **Bing läuft ohne Drossel.** Bis August 2026 stand dort
  `Crawl-delay: 5` — ein hartes Limit von ~17.280 Seiten/Tag. Das hat
  dreifach geschadet: Bing selbst, **ChatGPT-Search**, **Copilot** und
  **DuckDuckGo** sitzen alle auf dem Bing-Index. Crawl-Budget gehört in
  die Bing Webmaster Tools (Crawl Control), nicht in robots.txt.
- **Alle Antwort-Crawler sind explizit erlaubt**: GPTBot, OAI-SearchBot,
  ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Perplexity-User,
  Google-Extended, Google-CloudVertexBot, **Applebot** (Siri/Spotlight —
  nicht mit `Applebot-Extended` verwechseln, das steuert nur Training),
  **DuckAssistBot**, **Amazonbot**, MicrosoftPreview, CCBot, MistralBot,
  meta-externalagent.
- **SEO-Spam-Scraper bleiben gesperrt**: Ahrefs, Semrush, MJ12, DotBot,
  PetalBot. Kein Nutzen, nur Last.

### Indexierung

- `sitemap-index.xml` → `sitemap.xml` (15 statische URLs, inkl.
  `/fragen`, `/os`, `/app`, `/wladbot`), `sitemap-articles.xml` (153
  Artikel, generiert), `sitemap-image.xml`, `sitemap-news.xml`.
- **IndexNow** (`.github/workflows/indexnow.yml` +
  `frontend/scripts/indexnow-submit.mjs`): jeder Push auf `mvpcode`, der
  Sitemaps, Artikel oder statische Seiten anfasst, meldet nach 3 Minuten
  Wartezeit alle URLs an Bing / Yandex / Seznam / Naver. Bing indexiert
  gepingte URLs typischerweise in Minuten statt Tagen — und weil
  ChatGPT-Search auf Bing sitzt, ist das der **schnellste AEO-Hebel**,
  den wir haben. Google nimmt an IndexNow nicht teil.
  Key: `frontend/public/57d353bdcebaa0a63677822fd59447f8.txt`
  (öffentlich per Definition, kein Secret — deshalb im `.gitleaks.toml`
  gezielt per Regex allowlisted, nicht per Pfad).

  **Host-Auflösung:** IndexNow verlangt, dass die Key-Datei und alle
  gemeldeten URLs auf demselben Host liegen — ein Redirect dazwischen
  ist ein 403/422-Risiko. Weil in Vercel derzeit `www` Primary ist und
  der Apex mit 308 dorthin weiterleitet, ermittelt der Workflow den
  tatsächlich ausliefernden Host (`curl -sSL` + `url_effective`) und
  meldet an diesen. Nach dem Domain-Flip (§4) ergibt dieselbe Logik
  automatisch wieder `leader-os.de`; am Skript ist dann nichts zu
  ändern. Für die Discovery ist das unkritisch: IndexNow ist ein
  "diese URL hat sich geändert"-Signal, keine Canonical-Aussage — Bing
  crawlt die gemeldete URL und wertet ihr `<link rel="canonical">
  selbst aus.

  Manuell: `node scripts/indexnow-submit.mjs --dry-run`, Host per
  `INDEXNOW_HOST=` überschreibbar.

### Zitierbarkeit (AEO)

- **`/fragen`** (`frontend/public/fragen/index.html`) — 9 vollständige
  Antworten als statisches HTML: LeaderOS, Wlad Jachtchenko,
  Leader-Check, WladBot-vs-ChatGPT, SEXIER-Modell, Feedbackformel, die 5
  Rollen, Preise, "warum Seminare nicht wirken". `FAQPage`- und
  `BreadcrumbList`-Schema, **wortgleich zum sichtbaren Text** (Googles
  Regel für strukturierte Daten — und die Bedingung dafür, dass
  Antwort-Engines den Absatz sauber übernehmen).
- **`llms.txt`** — die kuratierte Landkarte für LLMs: Hauptseiten,
  kanonische Framework-Definitionen, Preise, Kontakt. Enthält bewusst
  eine Liste **dokumentierter Falschzitate** ("SEXI", "R = Repeat", "5
  Ebenen des Zuhörens"), damit Modelle die richtige Variante wählen.
- **Entity-Graph in `public/index.html`**: Organization, Person (Wlad),
  Course, WebSite+SearchAction, SoftwareApplication — verknüpft über
  `@id`. Artikel-Prerender hängt `BlogPosting` + `BreadcrumbList` an
  dieselben `@id`s.

> **Achtung bei FAQ-Schema:** `public/index.html` ist die SPA-Shell und
> wird auf **jeder** Route ausgeliefert. Seiten-spezifisches Schema
> (FAQPage, Article, Product) gehört deshalb NIE dorthin — sonst
> behauptet `/login` und `/dashboard` ebenfalls, eine FAQ-Seite zu sein.
> Solches Schema gehört in eine statische Seite oder ins Prerendering.

---

## 2. Warum Seiten trotzdem nicht ranken · Diagnose

| GSC-Meldung | Wahre Ursache | Fix |
| --- | --- | --- |
| *Seite mit Weiterleitung* | Vercel hat `www` als Primary-Domain → Apex leitet mit 308 um, während alle Canonicals auf den Apex zeigen | **Offen · User-Aktion:** in Vercel `leader-os.de` als Primary setzen, `www` → 308 auf Apex. Gleiches für leader-check.de. Danach in GSC "Fehlerbehebung validieren" |
| *Gefunden – zurzeit nicht indexiert* | SPA-Shell lieferte auf jeder tiefen URL den Homepage-Canonical | ✅ gelöst durch Prerendering + statische Seiten |
| Seite ist in keiner Sitemap und hat keinen internen Link | Orphan — Crawler findet sie nie | Sitemap-Eintrag **und** interner Link (z. B. Footer) |

---

## 3. Regeln für neue Seiten

1. **Kein `noindex` aus Versehen.** Nur Danke-/Bestätigungsseiten sind
   `noindex, follow`.
2. **`max-image-preview:large, max-snippet:-1`** in den Robots-Meta —
   ohne das liefert Google nur Mini-Thumbnails und gekürzte Snippets in
   Discover und AI Overviews.
3. **Canonical absolut** auf `https://leader-os.de/<pfad>` (ohne
   Trailing Slash — `vercel.json` hat `trailingSlash: false`).
4. **Ein `<h1>` pro Seite**, danach saubere `<h2>`-Hierarchie. Antwort-
   Maschinen zerlegen Seiten an den Überschriften.
5. **Antwort-zuerst schreiben.** Der erste Absatz unter einer
   `<h2>`-Frage muss die vollständige Antwort enthalten — auch ohne den
   Rest der Seite verständlich. Genau dieser Absatz wird zitiert.
6. **Jede Zahl aus `WLAD_CANON.md`.** Ein Falschzitat, das eine
   Antwort-Maschine übernimmt, verbreitet sich weiter als jede Anzeige.
7. **In `sitemap.xml` eintragen und intern verlinken** (Footer:
   `frontend/src/components/landing/LandingFooter.js`). Statische Seiten
   dort mit `href` verlinken, nicht mit `to` — ein React-`<Link>` würde
   clientseitig routen und im SPA-404 landen.
8. **`llms.txt` ergänzen**, wenn die Seite eine Frage beantwortet.

---

## 4. Offene User-Aktionen

| Aktion | Wo | Warum |
| --- | --- | --- |
| **Domain-Flip** | Vercel → Project → Domains: `leader-os.de` als Primary, `www` redirect | Behebt "Seite mit Weiterleitung" in GSC. **Größter offener Hebel.** Solange er aussteht, meldet IndexNow an `www.leader-os.de`, während alle Canonicals auf den Apex zeigen — das funktioniert, ist aber ein unnötig gemischtes Signal. |
| **Bing Webmaster Tools** | bing.com/webmasters | Domain verifizieren (Import aus GSC geht in einem Klick), Sitemap einreichen, IndexNow-Key sichtbar machen. Ohne Verifizierung sehen wir keine Bing-Daten |
| **GSC "Validate Fix"** | Search Console | Nach dem Domain-Flip die betroffenen Reports neu prüfen lassen + Sitemap neu einreichen |
| **`msvalidate.01`-Meta** | `frontend/public/index.html` | Nur nötig, wenn die Bing-Verifizierung nicht per GSC-Import läuft — Code kommt aus Bing Webmaster Tools |

---

## 5. Messen

- **Google:** Search Console → Leistung, Filter auf die neuen URLs
  (`/fragen`, `/os`, `/app`, `/wladbot`). Erste Impressionen realistisch
  nach 1–2 Wochen.
- **Bing:** Webmaster Tools → Seitenverkehr + "URL-Prüfung" für die
  IndexNow-gemeldeten URLs.
- **AEO (kein Dashboard, manuell):** einmal pro Monat in ChatGPT,
  Claude, Perplexity und Copilot die Kern-Fragen stellen — "Was ist das
  SEXIER-Modell?", "Wer ist Wlad Jachtchenko?", "Wie gibt man richtig
  Feedback?" — und protokollieren, ob wir **zitiert** werden und ob die
  Definition **korrekt** ist. Falsche Definitionen sind ein Signal, dass
  `llms.txt` und `/fragen` nachgeschärft werden müssen.

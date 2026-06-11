# Launch Tomorrow — Emergent stays, shipos parks on preview

> Entscheidung 2026-06-11: Wir gehen morgen **auf Emergent** live (das ist
> wo der funktionierende Backend + die Production-DB liegt). Die ganze
> Nike-DNA-Arbeit im shipos-Repo (Landing-Redesign, MiniChallenge,
> WladSignGuy, Light-Mode-LeaderCheck, Login) parkt auf
> `preview.leader-os.de` und wird Stück für Stück nach Production
> übertragen — kein Big-Bang.

## Warum nicht Vercel morgen

1. **Backend lebt auf Emergent.** `frontend/` ruft `/api/*` auf, das in
   `vercel.json` zu `command-center-229.preview.emergentagent.com`
   gerewritet wird. Emergent gibt aktuell `403 host_not_allowed` zurück,
   weil die Custom-Domain-Mapping für `leader-os.de` dort entfernt
   wurde, als wir DNS auf Vercel geflippt haben.
2. **Vercel-Project-Settings ERROR** (Build 762ms, leere Logs). Das ist
   ein UI-Reset im Vercel-Dashboard, kein Code-Fix.
3. **Datenbank.** Auth-User, Quiz-Attempts, Stripe-Customers leben in
   der Emergent-MongoDB **und** Supabase. Switch zu Vercel ohne saubere
   Daten-Migration verliert User-State.

## Morgen — Sequenz (≈30 Min Arbeit)

### Schritt 1: Emergent re-aktivieren

1. Login Emergent Dashboard
2. Projekt → Settings → Custom Domains
3. **Re-add** alle 4 Hostnames:
   - `leader-os.de`
   - `www.leader-os.de`
   - `leader-check.de`
   - `www.leader-check.de`
4. Emergent zeigt jetzt das Target an. Vermutlich entweder:
   - **CNAME-Target** wie `<projektslug>.emergentagent.com`, oder
   - **A-Record IPs** (Cloudflare-Range `172.66.x.x` oder `162.159.x.x`)

   Notier dir was Emergent sagt — das brauchst du in Schritt 2.

### Schritt 2: GoDaddy DNS flippen

In GoDaddy → leader-os.de → DNS:

| Vorher (Vercel)            | Nachher (Emergent)                                |
|----------------------------|---------------------------------------------------|
| `A @ → 76.76.21.21`        | **löschen**                                       |
| `CNAME www → cname.vercel-dns.com` | **löschen**                               |
| —                          | Was Emergent in Schritt 1 als Target gegeben hat  |

Wenn Emergent CNAME gibt aber GoDaddy bare `@` CNAME nicht erlaubt:
ALIAS-Record nutzen falls verfügbar, sonst die A-IPs verwenden die
Emergent normalerweise auch parallel anbietet.

Dasselbe für `leader-check.de`.

TTL: 600 (10 Min). DNS-Propagation: meist 5–30 Minuten in DE.

### Schritt 3: Verifizieren

```bash
curl -I https://leader-os.de/                    # 200, nicht 403
curl -I https://leader-os.de/login               # 200
curl -I https://leader-os.de/api/health          # 200
curl -I https://leader-check.de/                 # 200
curl -I https://leader-check.de/quiz             # 200
```

Wenn alles 200 → live. Wenn 403 → DNS hat noch nicht durchpropagiert,
5 Min warten und nochmal.

## shipos-Repo — wo parken die neuen Sachen

Das hier liegt fertig auf Branch `claude/add-vimeo-links-9cL3u` (PR #66):

- Nike-DNA Landing-Redesign (HeroSection, TrackField, MiniChallenge,
  WladSignGuy, WladIntroVideo, ManifestoSection)
- Light-Nike LeaderCheckLanding mit Methodik-Tiles + Testimonials
- LoginPage Nike-Redesign mit prominenten OAuth-Buttons
- Quiz-Redesign (QuizView, QuizResult, QuestionTypes)
- Compat-Shims für Backend (Anthropic, Stripe, Supabase Storage)
- Remotion-Video-Doc

Diese Arbeit ist **nicht weg**. Wir lassen sie liegen bis
`preview.leader-os.de` aufgebaut ist, dann mergen wir und testen sie auf
der Preview-Domain mit echten Usern.

## Emergent ablösen — 14-Tage-Plan

**Phase 1 (Tag 1–3) — preview.leader-os.de live auf Vercel**

1. Vercel-Project-Settings fixen (Production Branch = `mvpcode`,
   Framework = CRA, kein Override).
2. `preview.leader-os.de` in Vercel-Project → Domains adden.
3. GoDaddy: `CNAME preview → cname.vercel-dns.com`.
4. PR #66 in `mvpcode` mergen — Auto-Deploy auf preview.

**Phase 2 (Tag 4–10) — Backend strangulieren**

Jeden `/api/*`-Endpoint einzeln nach Supabase Edge Functions ziehen.
Reihenfolge (von risikoarm zu risikoreich):

1. `/api/health` — trivial
2. `/api/leader-check/*` — anonymous, nur Schreibzugriff auf
   `incomplete_attempts`
3. `/api/checkout` — Stripe (Edge Function existiert teilweise schon)
4. `/api/auth/*` — Supabase Auth ist schon dual-betrieb, nur Cleanup
5. `/api/chat` — WladBot RAG, der dickste Brocken

Pro Endpoint: erst auf preview testen, dann in `vercel.json` rewrite
umstellen, dann auf prod schalten.

**Phase 3 (Tag 11–14) — Cutover**

1. Wenn alle `/api/*`-Endpoints auf Vercel/Supabase laufen und
   preview.leader-os.de mind. 5 Tage stabil ist:
2. DNS-Flip wie Schritt 2 oben, nur diesmal in die andere Richtung.
3. Emergent-Projekt einfrieren (nicht löschen — als Backup behalten).

## Was wir heute Nacht *nicht* mehr machen

- Keine DNS-Änderungen heute (passiert morgen früh, bewusst).
- Kein Force-Push auf `mvpcode`.
- Keine Emergent-Settings ändern — du machst das morgen im Dashboard.

## Was ich heute Nacht aufräume

- [x] PR #66 stehen lassen, nicht mergen (wartet auf Phase 1)
- [x] Branch-Cleanup vorbereiten (Liste, nicht ausführen — siehe
      `docs/BRANCH_CLEANUP.md`)
- [x] Diese Doc als Single-Source-of-Truth für morgen

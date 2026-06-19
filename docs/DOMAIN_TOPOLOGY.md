# Domain-Topologie — canonical

> Last updated: 2026-06-18. **Bindestriche = Marketing-Landing-Pages
> (Vercel). Ohne Bindestriche = Apps (Emergent).** Eselsbrücke:
> die mit dem Strich ist die Brücke zur App.

## TL;DR — die Eselsbrücke

```
Mit Bindestrich     →  Landing (Marketing)  →  Vercel    →  shipos/mvpcode
Ohne Bindestrich    →  App (echte Action)   →  Emergent  →  Emergent-Projekt
```

| Memo | Vier Hosts |
|---|---|
| Landing leader-OS | `leader-os.de`     → Vercel |
| App     leader-OS | `leaderos.de`      → Emergent |
| Landing leader-Check | `leader-check.de` → Vercel |
| App     leader-Check | `leadercheck.de`  → Emergent |

## Wo welcher Name in Code/Copy erscheinen darf

- **Visible user copy + Buttons**: immer die Ziel-URL nennen wo der
  Klick hingeht. "Diagnose auf leadercheck.de" → User klickt → er
  ist genau dort. Konsistent.
- **Code-Kommentare + Docs**: auseinanderhalten. "leader-check.de
  Vercel landing" vs "leadercheck.de Emergent app". Future-Devs
  müssen es lesen können.
- **SEO + Wlad-Audience Erinnerung**: `leader-os.de` und
  `leader-check.de` sind die merkbaren Markennamen — die werden
  in Newsletter-Subjects, Visitenkarten, QR-Aufdrucken verwendet.

## Die vier Hosts

| Domain | Hosting | Inhalt | Build aus |
|---|---|---|---|
| `leader-os.de` | Vercel | Nike-DNA Marketing-Landing | shipos `mvpcode` |
| `leader-check.de` | Vercel | Diagnostic Marketing-Landing | shipos `mvpcode` |
| `leaderos.de` | Emergent | App: Login + Dashboard + WladBot + Coaching | Emergent Projekt A |
| `leadercheck.de` | Emergent | App: Diagnose-Quiz + Score + Lead-Capture | Emergent Projekt B |

## CTA-Fluss

```
Visitor → leader-os.de       (Landing, Vercel)
              ↓ "Diagnose starten" Button
          leadercheck.de     (Quiz, Emergent)
              ↓ Quiz fertig, Score angezeigt
              ↓ "Sprint starten" Button
          leaderos.de/login  (App, Emergent)
              ↓ Login
          leaderos.de/dashboard


Visitor → leader-check.de    (Landing, Vercel)
              ↓ "Diagnose starten" Button
          leadercheck.de     (Quiz, Emergent)
              ↓ ... wie oben
```

## DNS-Setup

| Host | Type | Value |
|---|---|---|
| `leader-os.de` | A | `76.76.21.21` (Vercel) |
| `www.leader-os.de` | CNAME | `cname.vercel-dns.com` |
| `leader-check.de` | A | `76.76.21.21` (Vercel) |
| `www.leader-check.de` | CNAME | `cname.vercel-dns.com` |
| `leaderos.de` | CNAME | `<emergent-target>` (von Emergent Dashboard) |
| `leadercheck.de` | CNAME | `<emergent-target>` (von Emergent Dashboard) |

## Frontend-Code-Konsequenzen

`isLeaderCheckHost()` in `LandingPage.js` muss prüfen:
```js
/(^|\.)leader-check\.de$/i.test(hostname)
```

Aber **nicht** `leadercheck.de` matchen — das ist die App und wird
nicht von der React-Landing serviert, sondern von Emergent direkt.

### CTA-Targets in der Vercel-Landing

| Button | Wo | Target |
|---|---|---|
| "Diagnose starten" | überall im Funnel | `https://leadercheck.de/` |
| "Login" | LandingNav | `https://leaderos.de/login` |
| "Sprint starten" | Pricing, Final-CTA | `https://leaderos.de/checkout?tier=sprint` |
| "WladBot starten" | Hero-Sub-CTA | `https://leaderos.de/chat` |

## Supabase Auth Allowlist

Alle vier Hosts müssen in der Supabase Redirect-URL-Allowlist sein:
```
https://leader-os.de/**
https://www.leader-os.de/**
https://leader-check.de/**
https://www.leader-check.de/**
https://leaderos.de/**
https://leadercheck.de/**
http://localhost:3000/**
```

## Was als nächstes

1. **GoDaddy DNS:** A-Records für `leaderos.de` + `leadercheck.de`
   auf Emergent-Target setzen (sobald Emergent die Domain accepted).
2. **Emergent:** Custom Domains `leaderos.de` und `leadercheck.de`
   adden in den jeweiligen Projekten.
3. **Supabase:** Allowlist erweitern auf die 6 Patterns oben.
4. **Frontend:** CTA-Targets nachziehen (LandingNav, Hero, Pricing,
   FinalCTA). Ist ein separater PR sobald die App-Domains live sind.

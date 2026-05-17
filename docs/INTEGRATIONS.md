# Frontend integrations — `aiporator/vibe-coding-platform`

Source of truth for wiring **Supabase**, **PostHog (EU)**, and **Sentry** into
the Next.js frontend. Apply this in `aiporator/vibe-coding-platform`, not here.

All snippets target **Next.js 15+ / App Router / TypeScript**.

---

## 0. Architecture

One Next.js app serves both domains via Vercel host-based rewrites:

| Domain             | Route folder         | Audience               |
| ------------------ | -------------------- | ---------------------- |
| `leader-check.de`  | `app/check/*`        | Anonymous funnel       |
| `leader-os.de`     | `app/os/*`           | Authed coaching app    |

**Deploy topology:** one repo → two Vercel projects (same code, same env, one
domain attached per project). Single Supabase project, single PostHog project,
single Sentry project — three integrations to wire, not six.

---

## 1. Env vars

Set in **both Vercel projects** (Production, Preview, Development scopes).

| Name                            | Where to get it                                | Notes                                |
| ------------------------------- | ---------------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Studio → Settings → API               | `https://srujvjjncrszhaaxepxf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Studio → Settings → API               | `eyJ...`                             |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog EU → Project → Settings                | `phc_xmMQneHWug8LVcr94h4vt8pVzDKstBXrYmSgu2moVdE8` |
| `NEXT_PUBLIC_POSTHOG_HOST`      | constant                                       | `https://eu.i.posthog.com`           |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry → Project → Settings → Client Keys      | `https://...@o....ingest.de.sentry.io/...` |
| `SENTRY_ORG`                    | Sentry org slug                                | build-time only                      |
| `SENTRY_PROJECT`                | Sentry project slug                            | build-time only                      |
| `SENTRY_AUTH_TOKEN`             | Sentry → User → Auth Tokens (`project:write`)  | build-time only — **never commit**   |

Mirror these into `.env.example` (no values) and `.env.local` (with values, gitignored).

---

## 2. Dependencies

```bash
npm install \
  @supabase/ssr @supabase/supabase-js \
  posthog-js \
  @sentry/nextjs \
  @opentelemetry/api-logs \
  @opentelemetry/sdk-logs \
  @opentelemetry/exporter-logs-otlp-http \
  @opentelemetry/resources
```

---

## 3. Supabase (SSR client)

### `lib/supabase/client.ts` — browser

```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### `lib/supabase/server.ts` — RSC + route handlers

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // RSC context — set ignored, refresh happens in middleware
          }
        },
      },
    }
  )
}
```

### `middleware.ts` — session refresh on every request

```ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

The `monitoring` exclusion is for Sentry's tunnel route (see §6).

---

## 4. PostHog — browser SDK

### `app/providers.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { createClient } from '@/lib/supabase/client'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email
      if (email) {
        const emailLower = email.trim().toLowerCase()
        posthog.alias(emailLower)
        posthog.identify(emailLower, { email: emailLower })
      } else {
        posthog.reset()
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### `app/layout.tsx` — wrap root

```tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Funnel email capture (leader-check side)

The moment the anonymous funnel captures an email (before Supabase Auth exists):

```ts
import posthog from 'posthog-js'

export function identifyFromFunnel(email: string) {
  const emailLower = email.trim().toLowerCase()
  posthog.alias(emailLower)
  posthog.identify(emailLower, { email: emailLower })
}
```

`emailLower` matches `public.users.email_lower` in Supabase. Same key on both
sides keeps the PostHog person and the Supabase user tied together — same
contract documented in `CLAUDE.md`.

---

## 5. PostHog OTel logs + Sentry — `instrumentation.ts`

Both Sentry and the PostHog OTel logger hook into Next.js's `register()`
export. They coexist in one file at the repo root:

```ts
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')

    const { OTLPLogExporter } = await import(
      '@opentelemetry/exporter-logs-otlp-http'
    )
    const { resourceFromAttributes } = await import('@opentelemetry/resources')
    const { LoggerProvider, SimpleLogRecordProcessor } = await import(
      '@opentelemetry/sdk-logs'
    )

    const exporter = new OTLPLogExporter({
      url: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/otlp/v1/logs`,
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_POSTHOG_KEY!}`,
      },
    })

    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({ 'service.name': 'leader-os' }),
    })
    loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter))

    ;(globalThis as unknown as { __posthogLogger: ReturnType<LoggerProvider['getLogger']> })
      .__posthogLogger = loggerProvider.getLogger('leader-os')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
```

Use the logger from server code:

```ts
const logger = (globalThis as any).__posthogLogger
logger?.emit({
  severityText: 'INFO',
  body: 'session.start',
  attributes: { user_id, surface: 'leader-os' },
})
```

---

## 6. Sentry

Bootstrap with the wizard once locally, then commit the result:

```bash
npx @sentry/wizard@latest -i nextjs --saas
```

**Pick the EU region** when prompted (`de.sentry.io`). The wizard creates:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Wraps `next.config.js` / `next.config.ts` with `withSentryConfig`
- Adds `onRequestError` to `instrumentation.ts` (already covered in §5)

Lock these defaults after wizard runs:

### `sentry.client.config.ts`

```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
})
```

### `sentry.server.config.ts` + `sentry.edge.config.ts`

```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

### `next.config.ts` wrapper

```ts
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [{ type: 'host', value: '(www\\.)?leader-check\\.de' }],
          destination: '/check/:path*',
        },
        {
          source: '/:path*',
          has: [{ type: 'host', value: '(www\\.)?leader-os\\.de' }],
          destination: '/os/:path*',
        },
      ],
    }
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
})
```

`tunnelRoute: '/monitoring'` routes Sentry events through your own domain to
bypass ad-blockers (Brave, uBlock).

### `app/global-error.tsx` — required by Sentry

```tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
      </body>
    </html>
  )
}
```

---

## 7. Vercel setup

1. **Create two Vercel projects** from `aiporator/vibe-coding-platform`. Name
   them `leader-check` and `leader-os`. Same build command, same root.
2. **Attach domains:** `leader-check.de` (+ `www`) to the first project;
   `leader-os.de` (+ `www`) to the second.
3. **Paste env vars from §1** into both projects (Production + Preview).
4. **Tie Sentry build secrets** (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`,
   `SENTRY_PROJECT`) — these run at build, not runtime.
5. **First deploy** — Sentry will report the release; PostHog will start
   receiving events on first page view.

---

## 8. Pre-launch checklist

Database side (already done — see `docs/RUNBOOK.md`):

- [x] Supabase schema, RLS, triggers, advisor green
- [x] Edge functions deployed (`ingest-leader-check`, `ingest-leader-os`,
      `ai-strategist`, `wladbot-chat`)

Frontend side (do these before flipping DNS):

- [ ] All env vars set in both Vercel projects
- [ ] PostHog network calls verified → `eu.i.posthog.com` (never `us.i.posthog.com`)
- [ ] Sentry test event fires from each runtime: browser, node, edge
- [ ] OTel log appears in PostHog → Logs (server-side `logger.emit`)
- [ ] `posthog.identify()` fires on both Supabase auth + funnel email capture
- [ ] Anonymous → authed alias verified: same person in PostHog before/after signup
- [ ] `middleware.ts` matcher excludes `/monitoring`, `/_next`, static assets
- [ ] Host-based rewrite confirmed: `leader-check.de/` serves `app/check/page.tsx`
- [ ] CSP / `next.config.ts` `headers()` (if you add any) allow
      `eu.i.posthog.com`, `*.sentry.io`, the Supabase URL
- [ ] Supabase RLS smoke: anon can call `upsert_incomplete_attempt`, cannot read `users`
- [ ] `dashboard_summary(7)` returns expected JSON from an authed server component
- [ ] Run `npx @sentry/wizard@latest -i nextjs --saas` once, commit the diff
- [ ] Run `get_advisors(type='security')` — only the documented `anon` warn

---

## 9. How to apply this in `vibe-coding-platform`

This doc lives in SHIPOS because SHIPOS is the integration spec / source of
truth. To execute against the frontend repo:

**Option A — new Claude Code session:**

1. Open Claude Code on the web → New session
2. Select `aiporator/vibe-coding-platform`
3. Prompt: *"Apply `docs/INTEGRATIONS.md` from aiporator/shipos main. Install
   deps, create every file, run the Sentry wizard, open a PR."*

**Option B — manually:**

Paste each file block above into the corresponding path in
`vibe-coding-platform`. Run the install command from §2. Run the Sentry
wizard from §6. Commit.

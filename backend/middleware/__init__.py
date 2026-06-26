"""Rate limiting + security headers middleware."""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from collections import defaultdict
import time
import asyncio


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-window rate limiter per client IP.

    Tiers:
      - Auth endpoints (/api/auth/login, /register): 20 req/min (brute-force protection)
      - AI endpoints (/api/chat/, /api/video-challenges/*/analyze): 20 req/min
      - General API: 120 req/min
      - Static/non-API: unlimited
    """

    def __init__(self, app):
        super().__init__(app)
        self._hits: dict[str, list[float]] = defaultdict(list)
        self._cleanup_counter = 0

    def _get_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _get_limit(self, path: str) -> tuple[int, int]:
        """Returns (max_requests, window_seconds) for the given path."""
        if "/api/auth/login" in path or "/api/auth/register" in path:
            return 20, 60
        if "/api/chat/send" in path or "/analyze" in path:
            return 20, 60
        if path.startswith("/api/"):
            return 120, 60
        return 0, 0  # no limit for non-API

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        max_req, window = self._get_limit(path)

        if max_req == 0:
            return await call_next(request)

        ip = self._get_ip(request)
        key = f"{ip}:{path.split('/')[2] if len(path.split('/')) > 2 else 'api'}"
        now = time.monotonic()

        # Prune old entries
        self._hits[key] = [t for t in self._hits[key] if now - t < window]

        if len(self._hits[key]) >= max_req:
            retry_after = int(window - (now - self._hits[key][0])) + 1
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Bitte warte einen Moment."},
                headers={"Retry-After": str(retry_after)},
            )

        self._hits[key].append(now)

        # Periodic cleanup of stale keys (every 500 requests)
        self._cleanup_counter += 1
        if self._cleanup_counter >= 500:
            self._cleanup_counter = 0
            asyncio.get_event_loop().call_soon(self._cleanup, now, window)

        return await call_next(request)

    def _cleanup(self, now: float, max_window: int = 120):
        stale = [k for k, v in self._hits.items() if not v or now - v[-1] > max_window]
        for k in stale:
            del self._hits[k]


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Production-grade security headers.
    Prevents clickjacking, XSS, MIME sniffing, and enforces HTTPS.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent clickjacking — only allow embedding from same origin
        response.headers["X-Frame-Options"] = "SAMEORIGIN"

        # Block MIME-type sniffing (prevents IE from interpreting files as different MIME types)
        response.headers["X-Content-Type-Options"] = "nosniff"

        # XSS Protection fallback for older browsers
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy — send origin only, strip path info
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions policy — disable unused browser features
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=(), payment=()"

        # HSTS — force HTTPS for 1 year (only on HTTPS responses)
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Content-Security-Policy · the actual XSS defense (X-XSS-Protection
        # above is just an IE/legacy-Edge fallback). API responses don't render
        # in a browser context normally, but if the backend ever returns HTML
        # (error pages, OG previews on /api/og/*, redirect-flows from Stripe)
        # this CSP keeps it safe.
        #
        # Allowlist mirrors what the frontend actually loads at runtime:
        #   - Google Identity Services for OAuth One-Tap
        #   - Apple ID + Microsoft MSAL for the other providers
        #   - Cal.com embed
        #   - PostHog EU ingest
        #   - Sentry SDK + ingest
        #   - Stripe.js (checkout redirects)
        #   - Resend + Supabase for any inline fetch
        # connect-src is the permissive surface (XHR/WS); script-src is locked
        # to the exact provider origins so injected <script> from a stored XSS
        # cannot reach a CDN we don't trust.
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' "
            "https://accounts.google.com https://appleid.cdn-apple.com "
            "https://alcdn.msauth.net https://app.cal.com https://js.stripe.com "
            "https://eu-assets.i.posthog.com https://browser.sentry-cdn.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https: blob:; "
            "media-src 'self' https://player.vimeo.com https://*.vimeocdn.com; "
            "frame-src https://accounts.google.com https://appleid.apple.com "
            "https://login.microsoftonline.com https://app.cal.com "
            "https://js.stripe.com https://player.vimeo.com; "
            "connect-src 'self' "
            "https://accounts.google.com https://appleid.apple.com "
            "https://login.microsoftonline.com "
            "https://eu.i.posthog.com https://eu-assets.i.posthog.com "
            "https://*.ingest.sentry.io https://*.ingest.de.sentry.io "
            "https://api.resend.com https://srujvjjncrszhaaxepxf.supabase.co "
            "https://api.stripe.com; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self' https://leaderos.de https://leadercheck.de; "
            "frame-ancestors 'self'"
        )

        return response

# Uptime and health monitoring

Production uses the built-in health endpoint plus automated checks. GitHub Actions runs [`.github/workflows/uptime.yml`](../.github/workflows/uptime.yml) every 5 minutes against `/api/health`; failed runs notify repo watchers via GitHub.

For email alerts outside GitHub, add a free external monitor below.

## Health check URL

```
GET https://recipe-book-platform.netlify.app/api/health
```

Expected response (`200`):

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-06-15T12:00:00.000Z"
}
```

Replace the host with your `NEXT_PUBLIC_SITE_URL` if you use a custom domain.

## UptimeRobot (free)

1. Create an account at [uptimerobot.com](https://uptimerobot.com).
2. **Add monitor** → type **HTTP(s)**.
3. URL: your `/api/health` URL (see above).
4. Interval: 5 minutes (free tier).
5. Alert contacts: email (and optional Slack/webhook).

## Better Stack (free tier)

1. Create a project at [betterstack.com/uptime](https://betterstack.com/uptime).
2. **Create monitor** → **URL** → paste `/api/health`.
3. Set expected status code `200` and check interval (e.g. 3 minutes on free tier).

## What to monitor

| Check | URL | Notes |
|-------|-----|--------|
| App health | `/api/health` | Fast, no database dependency |
| Public recipes API | `/api/recipes` | Optional; confirms Supabase + API routes |
| Homepage | `/` | Optional; full page render |

For production, **at minimum** monitor `/api/health`. Add `/api/recipes` if you want to catch Supabase misconfiguration.

## Error tracking

Runtime errors are reported to **Sentry** when `NEXT_PUBLIC_SENTRY_DSN` is set. See [NETLIFY_ENV.md](./NETLIFY_ENV.md).

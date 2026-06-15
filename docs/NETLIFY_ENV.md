# Netlify environment variables

Required for full production behavior (API routes, recipe CRUD, favorites):

| Variable | Scope | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Set on Netlify |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | All | Set on Netlify |
| `SUPABASE_SERVICE_ROLE_KEY` | Build + runtime (server only) | Set on Netlify |
| `NEXT_PUBLIC_SENTRY_DSN` | All | Set on Netlify |
| `NEXT_PUBLIC_SITE_URL` | All | Set on Netlify (`https://recipe-book-platform.netlify.app`) |

## Quick checklist

- [x] `NEXT_PUBLIC_SUPABASE_URL` and anon/publishable key set
- [x] `SUPABASE_SERVICE_ROLE_KEY` set (server-only, never `NEXT_PUBLIC_`)
- [x] `NEXT_PUBLIC_SITE_URL` matches live URL (`https://recipe-book-platform.netlify.app`)
- [x] `NEXT_PUBLIC_SENTRY_DSN` set for error monitoring
- [x] Uptime monitor on `/api/health` — GitHub Actions workflow [uptime.yml](../.github/workflows/uptime.yml); optional UptimeRobot — see [MONITORING.md](./MONITORING.md)

## Health endpoint

After deploy, verify:

```bash
curl -s https://recipe-book-platform.netlify.app/api/health
```

Expect `{"status":"ok","version":"…","timestamp":"…"}`.

## Sentry (error monitoring)

1. Create a free project at [sentry.io](https://sentry.io) → platform **Next.js**.
2. Copy the **DSN** from **Project Settings → Client Keys**.
3. Netlify → **Site configuration** → **Environment variables** → add:
   - Key: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: your DSN (e.g. `https://…@….ingest.sentry.io/…`)
   - Scopes: **All**
4. Redeploy. Errors from API routes, `error.tsx`, and `global-error.tsx` are reported automatically.

Sentry stays disabled locally unless you add the DSN to `.env.local`.

## Add missing service role

1. Supabase Dashboard → **Project Settings** → **API** → copy **service_role** (secret).
2. Netlify → **Site configuration** → **Environment variables** → **Add variable**.
3. Key: `SUPABASE_SERVICE_ROLE_KEY`, value: paste service role, scopes: **All** (or at least Builds + Functions).
4. Trigger **Deploy site** (clear cache optional).

Never prefix the service role with `NEXT_PUBLIC_`.

## GitHub Actions (E2E)

Add repository **Secrets** (Settings → Secrets and variables → Actions) so the E2E job can bake public Supabase config at build time:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

## Verify locally

```bash
cd frontend
cp .env.example .env.local
# fill all three Supabase values
npm run verify:supabase
```

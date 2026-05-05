# Supabase (Receptbok)

Databas och auth ligger i **Supabase** (Postgres). Next.js anropar Supabase från servern via API‑rutter under `frontend/src/pages/api/` — du behöver inte MongoDB eller den gamla Express‑servern för recept eller inloggning.

## 1. Skapa projekt

1. [supabase.com](https://supabase.com) → nytt projekt.
2. **Project Settings → API**: kopiera **URL**, **anon** (eller publishable) och **service_role** (hemlig).

## 2. Schema / migrationer

Kör SQL i **SQL Editor** (eller `supabase link` + `supabase db push` med CLI):

**Rekommenderat** — kör migrationerna i ordning:

1. `migrations/20260502190000_initial.sql`
2. `migrations/20260505163000_rpc_recipes_and_favorites.sql`
3. `migrations/20260505210000_recipe_basic_media_rpc.sql`

Det skapar bland annat `recipes`, `profiles`, `favorite_recipes`, trigger för nya profiler och RPC för recept/favoriter samt snabb metadata‑hämtning (`get_public_recipe_basic` / `get_public_recipe_media`).

**Äldre setup:** du kan fortfarande köra hela `schema.sql` om du följer ett äldre dokument — migrationerna ovan är källan för nya miljöer.

## 3. Miljövariabler (Next.js / Netlify)

| Variabel | Var? | Syfte |
|----------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Klient + server | Projekt‑URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klient + server | Publik anon‑nyckel |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Valfritt klient | Alias som vissa klienter läser (samma värde som anon om du använder nyckelformat från nya dashboard) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Endast server** | Lista/uppdatera recept via service‑roll |

**Lägg aldrig `service_role` i `NEXT_PUBLIC_*`.**

## 4. Auth redirect URLs

I Supabase: **Authentication → URL Configuration**

- **Site URL:** din produktions‑URL (t.ex. `https://ellisreceptbok.netlify.app`).
- **Redirect URLs**, lägg bl.a. till:

```text
https://ellisreceptbok.netlify.app/**
https://**--ellisreceptbok.netlify.app/**
http://localhost:3000/**
```

## 5. Bilder

Recept kan använda URL eller data‑URL i `image`. För Storage och signerade URL:er senare, se [Storage docs](https://supabase.com/docs/guides/storage).

## 6. Migrera gamla recept

```bash
cd frontend
LEGACY_RECIPES_URL=http://localhost:3001/recipes npm run migrate:recipes
npm run verify:supabase
```

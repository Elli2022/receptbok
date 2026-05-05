# Receptbok

Modern Next.js‑app för publika recept, kontoinloggning, sparade favoriter och PWA på mobil.

## Projekt och branching

- Versionshistorik: `VERSION_HISTORY.md`
- Bidrag: `CONTRIBUTING.md`

## Stack

- Next.js, React, TypeScript  
- Tailwind CSS  
- Supabase (Postgres + Auth) via Next.js API‑routes  
- Netlify (se `netlify.toml`)  
- PWA

## Supabase

1. Skapa projekt på [supabase.com](https://supabase.com).
2. Kör SQL från `supabase/migrations/` i ordning (se [supabase/README.md](supabase/README.md)). Övriga `.sql` i `supabase/` är äldre patchar vid behov.
3. Under utveckling kan du stänga av **Confirm email** under Authentication → Providers om du vill att `signUp` direkt får session.

## Snabbstart (frontend)

```bash
cd frontend
npm install
cp .env.example .env.local
# Fyll i NEXT_PUBLIC_SUPABASE_* och SUPABASE_SERVICE_ROLE_KEY (se supabase/README.md)
npm run lint
npm run build
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Migrera gamla recept (Mongo → Supabase)

```bash
cd frontend
LEGACY_RECIPES_URL=http://localhost:3001/recipes npm run migrate:recipes
```

Alternativt:

```bash
BACKEND_URL=https://din-gamla-backend.example.com npm run migrate:recipes
```

Verifiera:

```bash
npm run verify:supabase
```

## Netlify

`netlify.toml`: base `frontend`, build `npm run build`, publicera `.next`, Node 22.

Lägg samma Supabase‑variabler som lokalt under **Site settings → Environment variables**.  
Exponera **inte** `SUPABASE_SERVICE_ROLE_KEY` som `NEXT_PUBLIC_*`.

## Mobile app mode

Efter deploy: öppna sajten i Safari på iPhone/iPad → Dela → **Lägg till på hemskärmen**.

## API (Next.js)

| Metod | Route | Beskrivning |
|--------|--------|-------------|
| GET / POST | `/api/recipes` | Lista publika / skapa (inloggning) |
| GET / PUT / DELETE | `/api/recipes/[id]` | Ett recept |
| GET / POST | `/api/favorites` | Favorit‑id / spara |
| DELETE | `/api/favorites/[id]` | Ta bort favorit |
| POST | `/api/auth/login` | Inloggning (cookies) |
| POST | `/api/users` | Registrering |

## Mappen `backend/`

Express + MongoDB + S3 är **inaktuellt** för detta flöde; källan för recept/auth är Supabase.

## Versioner, CI och övrigt

- SemVer och releaser: `CHANGELOG.md`, `RELEASING.md`
- CI: GitHub Actions — frontend `lint` + `build`
- **Licens:** `LICENSE` (ISC)
- **Säkerhet:** `SECURITY.md`

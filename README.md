# Receptbok

Receptbok is a modern Next.js recipe app for public recipe browsing, user
accounts, personal saved recipes, and iOS home-screen installation.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS
- Supabase Auth and Supabase Postgres
- Netlify hosting
- PWA support for iOS and mobile browsers

## Netlify

This repository is prepared for Netlify through `netlify.toml` in the
repository root:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `22`

Add these environment variables in Netlify:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Do not commit Supabase secret keys, database strings, AWS keys, or other
secrets. The app does not need `SUPABASE_SECRET_KEY` for normal login,
registration, public recipe search, or saved recipes.

## Supabase

Run `supabase/schema.sql` in Supabase SQL Editor before using the hosted app.
It creates:

- public profiles for display names
- public recipes that everyone can search and read
- saved recipes that only the logged-in user can access
- Row Level Security policies for reading, saving, creating, updating, and
  deleting records safely

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` with the same Supabase variables used in Netlify.

## Mobile App Mode

After deploying to Netlify, open the HTTPS site in Safari on iPhone or iPad and
choose Share -> Add to Home Screen.

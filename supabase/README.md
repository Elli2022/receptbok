# Supabase setup

1. Open your Supabase project.
2. Go to SQL Editor.
3. Create a new query.
4. Paste everything from `schema.sql`.
5. Run the query.

The SQL creates:

- public profiles for user names
- public recipes that everyone can read
- saved recipes that only the logged-in user can read and change
- Row Level Security policies for the app

The app needs these Netlify variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The app does not need the Supabase secret key for normal use.

## Auth redirect URLs

In Supabase, open Authentication -> URL Configuration.

Set Site URL to your main Netlify URL:

```text
https://ellisreceptbok.netlify.app
```

Add these Redirect URLs:

```text
https://ellisreceptbok.netlify.app/**
https://supabase-recipe-library--ellisreceptbok.netlify.app/**
https://**--ellisreceptbok.netlify.app/**
http://localhost:3000/**
```

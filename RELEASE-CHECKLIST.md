# Release Checklist

1. Ensure Supabase env vars are set in local `.env.local` and Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run frontend quality checks:
   - `cd frontend && npm run lint && npm run build`
3. (Optional) Migrate legacy recipes:
   - `cd frontend && LEGACY_RECIPES_URL=http://localhost:3001/recipes npm run migrate:recipes`
4. Verify Supabase RPC/tables:
   - `cd frontend && npm run verify:supabase`
5. Update changelog/version and create release tag:
   - `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
   - `git push origin vX.Y.Z`

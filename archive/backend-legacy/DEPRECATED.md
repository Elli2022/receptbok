Denna Express-server med MongoDB och S3 användes tidigare som separat backend.

**Nu:** använd Supabase (Postgres + Auth) och Next.js API-rutter i `frontend/src/pages/api/`. Du behöver normalt inte starta den här servern.

## Legacy-uppladdningar (`uploads/`)

Tidigare serverades `backend/uploads/` som statiska filer under `/images/`. Vid migration till Supabase kopierades hash-namngivna filer (t.ex. fel Häxan-bild på lasagne) som bildsökvägar. Mappen är nu tom — alla receptbilder ligger i `frontend/public/images/` och refereras därifrån i databasen.

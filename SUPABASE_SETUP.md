# FLOCK OS + Supabase setup

1. supabase.com -> New project (save the DB password).
2. Authentication -> Providers -> Email -> turn OFF "Confirm email" (for development).
3. SQL Editor -> New query -> paste supabase/migrations/001_schema.sql -> Run. This enables row-level security so authenticated users can only access rows owned by their account.
4. Project Settings -> API -> copy Project URL + anon public key.
5. Copy .env.example to .env and paste both values. (Never use the service_role key.)
6. npm install --legacy-peer-deps   (or: bun install)
7. npm run dev -> sign up -> register your farm and sheds, then create your first flock.

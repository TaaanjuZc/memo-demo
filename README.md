# Memo (Next.js + Supabase)
1. Supabase: create a project, open SQL Editor, run supabase/schema.sql.
2. Auth > Providers: keep Email on, turn "Allow new users to sign up" OFF. Optional: enable Google. Auth > MFA: enable TOTP.
3. Auth > URL Configuration: add your Vercel URL and http://localhost:3000 as Site URL / redirect URLs.
4. First admin: Auth > Users > Add user (email + password, auto confirm). Then in SQL Editor:
   insert into profiles(id,name,role) select id,'Your name','admin' from auth.users where email='you@gmail.com';
5. Copy .env.example to .env.local and fill the three values (Project URL, anon key, service role key). Never share the service role key.
6. npm install && npm run dev. On Vercel, add the same three variables in Project Settings > Environment Variables.

## Phase 2
Run supabase/schema2.sql once in the SQL Editor (settings, private file storage, payment-verification guard). Then run `npm install` again (adds xlsx).
Reports, Settings and Admin are admin-only. Payments can be verified only by Finance or Admin (enforced in the database).

## Phase 3: Woosh email
1. Run supabase/schema3.sql once. 2. Add WOOSH_WEBHOOK_SECRET (any random 32+ character string) to .env.local and to your host's environment variables, then redeploy.
3. In Settings, "Woosh email updates" starts on "Review first". 4. Install woosh-gmail-script.gs in the Woosh Gmail (see the chat steps).

## Phase 4: Per-person access
Run supabase/schema4.sql once. Then in Admin, open "Access" on any team member and tick what they can see and do. Admins always have full access.

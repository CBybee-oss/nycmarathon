# NYC Marathon 2026 — Sub-4:20 Build (cloud-synced)

Your training app with secure cloud sync. Sign in with your email (one-tap
magic link, no password) and your data lives in your own private database row —
it survives clearing your browser, switching phones, everything, and syncs
across every device you sign in on.

Stack: React + Vite (app), Supabase (database + login), Netlify (hosting).
All on free tiers.


╔══════════════════════════════════════════════════════════════════╗
║  WHAT'S IN THIS FOLDER (and what's NOT)                           ║
╚══════════════════════════════════════════════════════════════════╝

When you unzip this, you'll see these files and one folder:

    README.md            ← this file
    supabase-setup.sql   ← database setup (you'll paste this into Supabase)
    .env.example         ← template for local testing (optional)
    index.html           ┐
    package.json         │
    package-lock.json    │  the app itself —
    vite.config.js       │  you upload ALL of these
    netlify.toml         │
    src/                 ┘  (a folder containing the app code)

You will NOT see `node_modules` or `dist` folders. That is correct and
intentional — those are build output that Netlify generates automatically.
You don't create them, find them, or upload them.

>>> When a step below says "upload the files," it means: select EVERYTHING
>>> listed above — every file plus the `src` folder — and upload all of it.
>>> There's no special subfolder to pick. The whole thing goes up together.


╔══════════════════════════════════════════════════════════════════╗
║  SETUP — three free accounts, wired together. ~20 min, one time. ║
║  I wrote all the code; you create the accounts and paste 2 values.║
╚══════════════════════════════════════════════════════════════════╝

────────────────────────────────────────────────────────────────────
PART 1 — Supabase (your database + login system)
────────────────────────────────────────────────────────────────────
1.  Go to https://supabase.com → "Start your project" → sign up (free).

2.  Click "New project".
    • Name: anything (e.g. "nyc-marathon").
    • Database password: make one up, save it somewhere (rarely needed).
    • Region: pick the one nearest you. Click "Create new project".
    • Wait ~2 minutes for it to finish setting up.

3.  Build the data table:
    • Left sidebar → "SQL Editor" → "New query".
    • Open `supabase-setup.sql` (from this folder) in any text editor,
      select ALL the text, copy it.
    • Paste into the Supabase query box → click "Run" (bottom right).
    • You should see "Success. No rows returned." That's correct.

4.  Grab your two connection values:
    • Left sidebar → "Project Settings" (gear icon) → "API".
    • Copy "Project URL"  →  save it as your VITE_SUPABASE_URL
    • Copy the "anon public" key (or "Publishable key" if that's shown
      instead)  →  save it as your VITE_SUPABASE_KEY
    • Keep both handy for Part 3. (Both are safe to expose publicly —
      your data is protected by the security rules from step 3.)

────────────────────────────────────────────────────────────────────
PART 2 — GitHub (holds the code so Netlify can build it)
────────────────────────────────────────────────────────────────────
5.  Go to https://github.com → sign up / sign in.

6.  Click the "+" (top right) → "New repository".
    • Name: e.g. "nyc-marathon".
    • Set it to "Private".
    • Click "Create repository".

7.  Upload the app:
    • On the new empty repo page, click the link
      "uploading an existing file".
    • Drag in EVERYTHING from this folder — all the files listed in the
      "WHAT'S IN THIS FOLDER" section above, including the `src` folder.
      (Skip README.md and supabase-setup.sql if you like; they don't affect
      the app. Everything else should go up. When in doubt, upload it all.)
    • Click "Commit changes".

────────────────────────────────────────────────────────────────────
PART 3 — Netlify (builds + hosts the live site)
────────────────────────────────────────────────────────────────────
8.  Go to https://app.netlify.com → sign in (you can use your GitHub login).

9.  Click "Add new site" → "Import an existing project" → "GitHub" →
    authorize if asked → pick your "nyc-marathon" repo.

10. Netlify reads the build settings automatically from `netlify.toml`:
        Build command:     npm run build
        Publish directory: dist
    Leave those exactly as shown. (THIS is where the `dist` folder gets
    created — by Netlify, during the build. You never touch it.)

11. Add your two Supabase values BEFORE deploying:
    • Look for "Add environment variables" on the deploy screen
      (or do it later under Site configuration → Environment variables).
    • Add two variables:
        Key: VITE_SUPABASE_URL    Value: (your Project URL from step 4)
        Key: VITE_SUPABASE_KEY    Value: (your anon/publishable key)

12. Click "Deploy". Wait ~1 minute. You'll get a live URL like
    https://something-random-123.netlify.app

13. IMPORTANT last step — point Supabase back at your live URL:
    • In Supabase → "Authentication" → "URL Configuration".
    • Set "Site URL" to your Netlify URL (e.g. https://yourname.netlify.app).
    • Add that same URL under "Redirect URLs" too. Save.
    • This makes the email sign-in link send you to the right place.


╔══════════════════════════════════════════════════════════════════╗
║  DONE                                                             ║
╚══════════════════════════════════════════════════════════════════╝

Open your Netlify URL → type your email → tap the link in your inbox →
you're in, with cloud sync. On your phone, use the browser's "Add to Home
Screen" for an app icon that opens straight to TODAY. Sign in with the same
email on any device and your data follows you.


╔══════════════════════════════════════════════════════════════════╗
║  GOOD TO KNOW                                                     ║
╚══════════════════════════════════════════════════════════════════╝

• Renaming the site: in Netlify → Site configuration → "Change site name"
  to get something like cameron-nyc-2026.netlify.app.

• Updating the app later: just push new code to GitHub (or re-upload the
  changed files) — Netlify rebuilds automatically. Your logged data lives in
  Supabase, not in the deploy, so updates never erase your progress.

• No keys set? The app quietly falls back to browser-only storage so it still
  runs — it just won't sync. Setting the two env vars is what turns on cloud.

• Your data is one row in the `training_state` table, readable only by you
  (enforced by the database itself, not just the app).


╔══════════════════════════════════════════════════════════════════╗
║  RUNNING IT ON YOUR OWN COMPUTER (optional, for testing)         ║
╚══════════════════════════════════════════════════════════════════╝

Requires Node.js installed. In a terminal, inside this folder:

    npm install              (installs dependencies — creates node_modules)
    cp .env.example .env      then edit .env with your two Supabase values
    npm run dev              (opens a local preview at localhost:5173)
    npm run build            (creates the dist folder, same as Netlify does)

# QuickGig

Short-term gig marketplace for Bhopal, India. React 18 + Vite + MUI v5 frontend, Flask + SQLite backend, **Supabase Auth** for Google and email/password sign-in.

## Run it

**Easiest — double-click `START-HERE.bat`** (repo root). It opens both servers in their own windows, installing dependencies on first run. The app then lives at **http://localhost:3000**.

Or start each server manually:

**Terminal 1 — backend** (first run seeds the demo dataset, creates `backend/quickgig.db`):

```powershell
cd backend
python -m venv .venv                    # once
.\.venv\Scripts\pip install -r requirements.txt   # once
.\.venv\Scripts\python app.py           # serves http://127.0.0.1:5001
```

**Terminal 2 — frontend**:

```powershell
cd frontend
npm install                             # once
npm run dev                             # serves http://localhost:3000
```

> **Where do I point the browser?** At **http://localhost:3000** — that's the app. The backend (`127.0.0.1:5001`) has no UI: it only serves `/api/*` data to the frontend. Visiting it directly shows a small landing page with that reminder.

The Vite dev server proxies `/api` → Flask, so no CORS configuration is needed in development.

> Already had a working checkout? This build added backend dependencies (`PyJWT`, `python-dotenv`) and the frontend's `@supabase/supabase-js`. Run the install steps above once, then restart both servers.

## Signing in

Two ways, both handled by Supabase Auth:

- **Continue with Google** on `/login` and `/register`.
- **Email + password** — create an account, or log in.

The Flask API stores no credentials at all: it verifies the Supabase access token and keeps the app's profile, jobs and applications in SQLite. Leaving the feed and returning keeps you signed in; logging out clears the Supabase session.

The seeded gigs and application are sample data owned by a demo *Seva Events* profile with no credentials. Seeded profiles are claimed by verified email the first time a matching identity signs in, so demo ownership survives a sign-up.

## Set up Google & email sign-in (Supabase)

The Google handshake has to happen server-side, so this needs a Supabase project (free tier is fine). Until the keys are in place the app says exactly what's missing instead of failing silently.

1. **Create a project** at [supabase.com](https://supabase.com) and wait for it to finish provisioning.
2. **Email**: Authentication → Providers → Email is on by default. For local development, turn **Confirm email** off (Authentication → Providers → Email); otherwise sign-ups need the confirmation email, and Supabase's built-in sender is rate-limited. With it off, sign-up logs you straight in.
3. **Google**: Authentication → Providers → Google. Supabase shows a **Callback URL** — create a Google Cloud *OAuth 2.0 Client ID* (Web application) whose **Authorized redirect URI** is that callback, and whose **Authorized JavaScript origin** is `http://localhost:3000`. Paste the client ID/secret into Supabase and enable the provider.
4. **Redirect URLs**: Authentication → URL Configuration → Site URL `http://localhost:3000`; Redirect URLs add `http://localhost:3000/**`.
5. **Keys**:
   - `frontend/.env` (copy `frontend/.env.example`):
     ```
     VITE_SUPABASE_URL=https://<project-ref>.supabase.co
     VITE_SUPABASE_ANON_KEY=<anon / publishable key>
     ```
   - `backend/.env` (copy `backend/.env.example`):
     ```
     SUPABASE_URL=https://<project-ref>.supabase.co
     ```
6. **Restart both servers.**

Both frontend keys are public by design (they ship in the bundle). Never put a **service-role** key in the frontend, and the backend needs no key at all — it verifies tokens against the project's public JWKS.

*Legacy projects:* projects that still sign JWTs with the shared secret (rather than asymmetric signing keys) should set `SUPABASE_JWT_SECRET` in `backend/.env` instead.

## How auth works

The browser holds the Supabase session (PKCE, auto-refresh). Every API call sends it as `Authorization: Bearer <supabase access token>`. Flask verifies the signature against `/auth/v1/.well-known/jwks.json` (cached keys, checked `iss`/`aud`/`exp`) and maps the token's `sub` to a local `users` row, creating it on first sight. The role picked at sign-up travels in Supabase `user_metadata.user_type`. Nothing password-shaped ever reaches this server.

## API surface (backend/app.py)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/auth/me` | ✓ | Current profile (also provisions the local row on first request) |
| GET | `/api/jobs` | – | All OPEN jobs (filters: `search`, `category`, `remoteOnly`) |
| GET | `/api/jobs/feed?page&per` | – | Paged reel feed `{items, page, per, total, has_more}` |
| GET | `/api/jobs/<id>` | – | Enriched detail |
| POST | `/api/jobs` | ✓ org | Post a gig — JSON, or multipart with optional `image` (JPG/PNG/WebP ≤ 4 MB) |
| POST | `/api/applications` | ✓ | Apply `{job_id, cover_letter, application_files:[{name,size,type}]}` |
| GET | `/api/applications/mine` | ✓ | Own applications incl. attached file metadata |
| GET | `/api/uploads/jobs/<file>` | – | Serves uploaded gig photos from `backend/uploads/jobs` |

`✓` means `Authorization: Bearer <supabase access token>`. Enriched jobs carry `org_name`, `org_rating`, `org_avatar_url`, `application_count`, `applied` and `is_own`, so UI states are real rather than guessed.

SQLite (`backend/db.py`) — no ORM, schema in plain view. `init_db()` migrates an older demo database in place (adds the Supabase identity columns, retires the old password column) without touching jobs or applications.

## Gig feed (`/feed`)

A reels-style vertical feed: one gig per screen, media as the canvas, caption over the bottom gradient, and an Apply / Details action rail on the right. Snap scrolling (wheel, trackpad, touch), ArrowUp/Down paging, position dots and a `3 / 7` counter. On desktop the stage is a centered portrait card; on phones it's full-bleed. The feed owns the viewport — no footer, no page scrollbar — and the rendered list stays capped, so looping the catalog forever doesn't grow the DOM.

## Smoke test

```powershell
cd backend
.\.venv\Scripts\python.exe smoke_test.py
```

23 checks over the real HTTP surface — provisioning, token rejection, job posting with an upload, applications, duplicate guards, seeded-profile claiming. It is self-contained: a throwaway database in the OS temp directory, an ephemeral port, and locally signed Supabase-style tokens. It needs no Supabase project, no network, and leaves your dev database untouched.

## Notes

- Attachments are metadata-only (name/size/type) — by design; see the honest-demo note in the apply form.
- Seeded jobs carry no photos; the feed renders an editorial category tile instead. Any gig you post with a photo shows it full-bleed in the reel.
- Scrollbars are hidden app-wide by design (see `DESIGN.md`); wheel, touch and keyboard scrolling all still work.

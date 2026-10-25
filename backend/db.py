"""SQLite setup for QuickGig — stdlib sqlite3, no ORM.

Identity lives in Supabase Auth (Google + email/password). This local `users`
table is the app-side profile that jobs and applications point at; it is keyed
to a Supabase identity by `supabase_uid` and holds no credentials.
"""

import sqlite3

DB_PATH = "quickgig.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  supabase_uid  TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'email',
  user_type     TEXT NOT NULL DEFAULT 'individual'
                CHECK (user_type IN ('individual', 'organization')),
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL UNIQUE,
  avatar_url    TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  rating        REAL NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  posted_by      INTEGER NOT NULL REFERENCES users (id),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT '',
  location       TEXT NOT NULL DEFAULT '',
  is_remote      INTEGER NOT NULL DEFAULT 0,
  pay_amount     REAL NOT NULL DEFAULT 0,
  pay_type       TEXT NOT NULL DEFAULT 'fixed' CHECK (pay_type IN ('fixed', 'hourly')),
  duration_hours REAL NOT NULL DEFAULT 1,
  status         TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FILLED', 'CLOSED')),
  image_url      TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id       INTEGER NOT NULL REFERENCES jobs (id),
  applicant_id INTEGER NOT NULL REFERENCES users (id),
  cover_letter TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN')),
  applied_at   TEXT NOT NULL,
  UNIQUE (job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS application_files (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications (id),
  name           TEXT NOT NULL,
  size           INTEGER NOT NULL DEFAULT 0,
  type           TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs (posted_by);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications (applicant_id);
"""
# idx_users_supabase_uid is created by _migrate(): on an older database the
# column doesn't exist yet when the schema script runs.


def connect():
    """Row-shaped connection. One per call; safe for Flask's threaded dev server."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _migrate(conn):
    """Bring an existing demo database up to the Supabase-identity schema.

    CREATE TABLE IF NOT EXISTS never alters a table that already exists, and the
    old file predates managed auth — so add the identity columns and retire the
    password column in place. Existing jobs/applications are left untouched.
    """
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)")}
    if "supabase_uid" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN supabase_uid TEXT")
    if "auth_provider" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'email'")
    if "user_type" not in columns:
        # Very old demo databases only; the column predates managed auth.
        conn.execute(
            "ALTER TABLE users ADD COLUMN user_type TEXT NOT NULL DEFAULT 'individual'"
        )
    if "password_hash" in columns:
        try:
            conn.execute("ALTER TABLE users DROP COLUMN password_hash")
        except sqlite3.OperationalError:
            pass  # SQLite < 3.35 — the unused column stays, which is harmless.
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_uid ON users (supabase_uid)")


def init_db():
    conn = connect()
    conn.executescript(SCHEMA)
    _migrate(conn)
    conn.commit()
    conn.close()

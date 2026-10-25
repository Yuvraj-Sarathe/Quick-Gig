"""QuickGig API — the real backend behind the React frontend.

Contract notes (mirrors the old mock layer exactly):
- All JSON uses snake_case keys, same field names as the mocks.
- GET /api/jobs returns a plain array (sorted newest first), like the mock did.
- GET /api/jobs/feed returns {items, page, per, total, has_more} for the reel feed.
- Errors are always {error: "<human message>"} — the UI shows that string.
- Enriched jobs carry org_name, org_rating, application_count, applied, is_own.

Auth: Supabase Auth is the only identity source (Google + email/password).
The frontend sends the Supabase access token as `Authorization: Bearer <jwt>`;
we verify it against the project's JWKS and map `sub` to a local profile row in
`users` (created on first sight). This backend never stores credentials.
"""

import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone

import jwt
from dotenv import load_dotenv
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from jwt.exceptions import PyJWTError, PyJWKClientConnectionError, PyJWKClientError
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename

import db
import seed

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "jobs")
JOB_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
JOB_IMAGE_MAX_BYTES = 4 * 1024 * 1024  # 4 MB

CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

# Supabase project config. Only the project URL is needed to verify tokens —
# no service key ever touches this process. SUPABASE_JWT_SECRET is for legacy
# projects still signing with the shared secret (and for the offline test suite).
SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET") or ""
SUPABASE_ISSUER = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else ""
SUPABASE_JWKS_URL = f"{SUPABASE_ISSUER}/.well-known/jwks.json" if SUPABASE_URL else ""
SUPABASE_AUDIENCE = "authenticated"

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = JOB_IMAGE_MAX_BYTES
CORS(app, origins=CORS_ORIGINS, supports_credentials=True)


class SupabaseUnavailable(RuntimeError):
    """Auth server (or its keys) couldn't be reached — not a bad token."""


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# --------------------------------------------------------------------------- #
# Auth: verify Supabase access tokens, map them to local profiles
# --------------------------------------------------------------------------- #

_JWKS_CLIENT = None
_JWKS_LOCK = threading.Lock()


def _signing_key(token):
    """Public key for this token from the project JWKS (cached ~5 min).

    The lock serializes the first fetch so parallel requests don't all hit
    Supabase; afterwards it's a dict lookup.
    """
    global _JWKS_CLIENT
    with _JWKS_LOCK:
        if _JWKS_CLIENT is None:
            _JWKS_CLIENT = jwt.PyJWKClient(SUPABASE_JWKS_URL, cache_keys=True, lifespan=300)
        return _JWKS_CLIENT.get_signing_key_from_jwt(token).key


def verify_supabase_token(token):
    """Decoded claims, or None when the token is invalid.

    Raises SupabaseUnavailable when the project isn't configured or its keys
    can't be fetched — that is a server problem, not an unauthenticated user.
    """
    try:
        options = {"require": ["exp", "sub", "aud"]}
        if SUPABASE_JWT_SECRET:
            return jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience=SUPABASE_AUDIENCE,
                issuer=SUPABASE_ISSUER or None,
                options=options,
            )
        if not SUPABASE_URL:
            raise SupabaseUnavailable(
                "Supabase isn't configured on the server — set SUPABASE_URL in backend/.env."
            )
        options["require"] = ["exp", "sub", "aud", "iss"]
        return jwt.decode(
            token,
            _signing_key(token),
            algorithms=["ES256", "RS256"],
            audience=SUPABASE_AUDIENCE,
            issuer=SUPABASE_ISSUER,
            options=options,
        )
    except SupabaseUnavailable:
        raise
    except PyJWKClientConnectionError as exc:
        raise SupabaseUnavailable(
            "Couldn't reach Supabase to verify your session. Check your connection and try again."
        ) from exc
    except (PyJWKClientError, PyJWTError):
        return None


def _split_name(meta, email):
    """Google gives full_name; our own signup form gives first/last separately."""
    first = (meta.get("first_name") or "").strip()
    last = (meta.get("last_name") or "").strip()
    if not first:
        full = (meta.get("full_name") or meta.get("name") or "").strip()
        if full:
            parts = full.split()
            first = parts[0]
            if not last:
                last = " ".join(parts[1:])
    if not first:
        first = (email.split("@")[0] or "Neighbour").strip()
    return first[:60], last[:60]


def ensure_user_from_claims(conn, claims):
    """The local profile row for this Supabase identity, created when missing.

    Seeded demo profiles have no Supabase identity; they are claimed by email
    the first time a verified identity with that address signs in, so the demo
    gigs keep their owner. A row already bound to another identity is refused.
    """
    uid = (claims.get("sub") or "").strip()
    if not uid:
        return None

    row = conn.execute("SELECT * FROM users WHERE supabase_uid = ?", (uid,)).fetchone()
    if row:
        return row

    meta = claims.get("user_metadata") or {}
    email = (claims.get("email") or meta.get("email") or "").strip().lower()
    if not email:
        return None
    provider = ((claims.get("app_metadata") or {}).get("provider") or "email").strip().lower()
    avatar = (meta.get("avatar_url") or meta.get("picture") or "").strip()
    first, last = _split_name(meta, email)

    existing = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        if existing["supabase_uid"] and existing["supabase_uid"] != uid:
            return None
        conn.execute(
            """UPDATE users
                  SET supabase_uid = ?,
                      auth_provider = ?,
                      avatar_url = CASE WHEN avatar_url = '' THEN ? ELSE avatar_url END
                WHERE id = ?""",
            (uid, provider, avatar, existing["id"]),
        )
        conn.commit()
        return conn.execute("SELECT * FROM users WHERE id = ?", (existing["id"],)).fetchone()

    user_type = (meta.get("user_type") or "").strip().lower()
    if user_type not in ("individual", "organization"):
        user_type = "individual"

    try:
        cur = conn.execute(
            """INSERT INTO users (supabase_uid, auth_provider, user_type, first_name,
                                  last_name, email, avatar_url, bio, location,
                                  rating, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)""",
            (
                uid,
                provider,
                user_type,
                first,
                last,
                email,
                avatar,
                (meta.get("bio") or "").strip(),
                (meta.get("location") or "").strip(),
                now_iso(),
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        # Two parallel first requests for the same identity — the other one won.
        conn.rollback()
        return conn.execute("SELECT * FROM users WHERE supabase_uid = ?", (uid,)).fetchone()

    return conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()


def public_user(row):
    """users row → the shape the frontend stores (never any credential)."""
    return {
        "id": row["id"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "email": row["email"],
        "user_type": row["user_type"],
        "avatar_url": row["avatar_url"],
        "bio": row["bio"],
        "location": row["location"],
        "rating": row["rating"],
        "auth_provider": row["auth_provider"],
    }


def current_user():
    """Auth'd users row or None (cached for the request)."""
    if "user" in g:
        return g.user
    g.user = None
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None
    claims = verify_supabase_token(token)
    if not claims:
        return None
    g.user = ensure_user_from_claims(g.conn, claims)
    return g.user


@app.before_request
def open_db():
    g.conn = db.connect()


@app.teardown_request
def close_db(exc):
    conn = getattr(g, "conn", None)
    if conn is not None:
        conn.close()


# --------------------------------------------------------------------------- #
# Error handlers
# --------------------------------------------------------------------------- #

@app.errorhandler(RequestEntityTooLarge)
def image_too_large(err):
    return jsonify(error="That file is over the 4 MB limit."), 413


@app.errorhandler(SupabaseUnavailable)
def supabase_down(err):
    return jsonify(error=str(err)), 503


@app.errorhandler(404)
def not_found(err):
    return jsonify(error="Not found."), 404


@app.errorhandler(500)
def server_error(err):
    return jsonify(error="Something went wrong on the server."), 500


@app.get("/")
def index():
    """Friendly landing so nobody sees a raw 404 by visiting the API directly."""
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<title>QuickGig API</title>"
        "<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:560px;"
        "margin:15vh auto 0;padding:0 24px;color:#1C231F;line-height:1.6}"
        "h1{font-family:Georgia,serif;font-weight:600;margin-bottom:4px}"
        "code{background:#F3F8F4;border:1px solid #E2E8E3;border-radius:6px;"
        "padding:2px 6px;font-size:0.9em}a{color:#175C34;font-weight:600}"
        ".card{border:1px solid #E2E8E3;border-radius:14px;padding:28px;"
        "background:#FAFBF9}</style></head>"
        "<body><div class='card'><h1>⚡ QuickGig API</h1>"
        "<p>This is the <strong>backend</strong> — there's nothing to browse here.</p>"
        "<p>The app lives at <a href='http://localhost:3000'>http://localhost:3000</a> "
        "(the React frontend). Keep this window open; it serves the data.</p>"
        "<p style='color:#5A6962;font-size:0.9em'>Health check: "
        "<a href='/api/jobs'>/api/jobs</a> should show a list of gigs.</p>"
        "</div></body></html>"
    )


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #

@app.get("/api/auth/me")
def me():
    """Current profile. Also the provisioning point: the first authenticated
    request from a new Supabase identity creates its local row."""
    row = current_user()
    if not row:
        return jsonify(error="Session expired — please log in again."), 401
    return jsonify(user=public_user(row))


# --------------------------------------------------------------------------- #
# Jobs
# --------------------------------------------------------------------------- #

# Keep this fragment in sync with db.SCHEMA (same column order as the table).
JOB_FIELDS = """j.id, j.posted_by, j.title, j.description, j.category, j.location,
    j.is_remote, j.pay_amount, j.pay_type, j.duration_hours, j.status, j.image_url, j.created_at"""


def job_row_to_dict(row, user_id, applied_job_ids, own_job_ids):
    job = {
        "id": row["id"],
        "posted_by": row["posted_by"],
        "title": row["title"],
        "description": row["description"],
        "category": row["category"],
        "location": row["location"],
        "is_remote": bool(row["is_remote"]),
        "pay_amount": row["pay_amount"],
        "pay_type": row["pay_type"],
        "duration_hours": row["duration_hours"],
        "status": row["status"],
        "image_url": row["image_url"],
        "created_at": row["created_at"],
        "org_name": row["org_name"],
        "org_rating": row["org_rating"],
        "org_avatar_url": row["org_avatar_url"],
        "application_count": row["application_count"],
        "applied": row["id"] in applied_job_ids,
        "is_own": row["id"] in own_job_ids,
    }
    if user_id is None:
        job["applied"] = False
        job["is_own"] = False
    return job


def query_jobs(filters=None, user=None):
    """All OPEN jobs, newest first, enriched. Shared by /jobs and /jobs/feed."""
    filters = filters or {}
    user_id = user["id"] if user else None

    where = ["j.status = 'OPEN'"]
    params = []
    q = (filters.get("search") or "").strip().lower()
    if q:
        where.append("(LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ?)")
        params += [f"%{q}%", f"%{q}%"]
    category = filters.get("category", "")
    if category:
        where.append("j.category = ?")
        params.append(category)
    if filters.get("remoteOnly"):
        where.append("j.is_remote = 1")

    sql = f"""
        SELECT {JOB_FIELDS},
               TRIM(u.first_name || ' ' || u.last_name) AS org_name,
               u.rating AS org_rating,
               u.avatar_url AS org_avatar_url,
               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
        FROM jobs j
        JOIN users u ON u.id = j.posted_by
        WHERE {" AND ".join(where)}
        ORDER BY j.created_at DESC
    """
    rows = g.conn.execute(sql, params).fetchall()

    applied_job_ids, own_job_ids = set(), set()
    if user_id:
        applied_job_ids = {
            r["job_id"]
            for r in g.conn.execute(
                "SELECT job_id FROM applications WHERE applicant_id = ?", (user_id,)
            ).fetchall()
        }
        own_job_ids = {
            r["id"] for r in g.conn.execute("SELECT id FROM jobs WHERE posted_by = ?", (user_id,))
        }
    return [job_row_to_dict(r, user_id, applied_job_ids, own_job_ids) for r in rows]


@app.get("/api/jobs")
def jobs_list():
    return jsonify(query_jobs(request.args, current_user()))


@app.get("/api/jobs/feed")
def jobs_feed():
    try:
        page = max(1, int(request.args.get("page", 1)))
        per = min(50, max(1, int(request.args.get("per", 10))))
    except ValueError:
        return jsonify(error="Bad pagination params."), 400
    results = query_jobs(request.args, current_user())
    start = (page - 1) * per
    window = results[start: start + per]
    return jsonify(
        items=window,
        page=page,
        per=per,
        total=len(results),
        has_more=page * per < len(results),
    )


@app.get("/api/jobs/<int:job_id>")
def job_detail(job_id):
    user = current_user()
    results = query_jobs({}, user)
    for enrich in results:
        if enrich["id"] == job_id:
            return jsonify(enrich)
    return jsonify(error="Job not found"), 404


def _validate_job_payload(data):
    """Shared by JSON and multipart posting. Returns (fields, error_tuple)."""
    fields = {
        "title": (data.get("title") or "").strip(),
        "description": (data.get("description") or "").strip(),
        "category": (data.get("category") or "").strip(),
        "location": (data.get("location") or "").strip(),
        "pay_amount": data.get("pay_amount"),
        "pay_type": (data.get("pay_type") or "").strip(),
        "duration_hours": data.get("duration_hours"),
        "is_remote": str(data.get("is_remote")).lower() in ("1", "true", "yes") if isinstance(data.get("is_remote"), str) else bool(data.get("is_remote")),
    }
    if not fields["title"]:
        return None, ("A title is required.", 400)
    if not fields["category"]:
        return None, ("Pick a category.", 400)
    if fields["pay_type"] not in ("fixed", "hourly"):
        return None, ("Pay type must be fixed or hourly.", 400)
    try:
        fields["pay_amount"] = float(fields["pay_amount"])
        fields["duration_hours"] = float(fields["duration_hours"])
    except (TypeError, ValueError):
        return None, ("Pay and duration must be numbers.", 400)
    if fields["pay_amount"] <= 0 or fields["duration_hours"] <= 0:
        return None, ("Pay and duration must be above zero.", 400)
    if not fields["is_remote"] and not fields["location"]:
        return None, ("A location is required unless the gig is remote.", 400)
    return fields, None


def _save_job_image(image_file):
    ext = os.path.splitext(image_file.filename or "")[1].lower()
    if ext not in JOB_IMAGE_EXTENSIONS:
        raise ValueError("Image must be a JPG, PNG or WebP file.")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filename = uuid.uuid4().hex + ext
    image_file.save(os.path.join(UPLOAD_DIR, filename))
    return f"/api/uploads/jobs/{filename}"


@app.post("/api/jobs")
def create_job():
    user = current_user()
    if not user:
        return jsonify(error="Log in to post a job."), 401
    if user["user_type"] != "organization":
        return jsonify(error="Only organization accounts can post jobs."), 403

    if request.content_type and "multipart/form-data" in request.content_type:
        data = {k: request.form.get(k) for k in request.form}
        image_file = request.files.get("image")
    else:
        data = request.get_json(silent=True) or {}
        image_file = None

    fields, error = _validate_job_payload(data)
    if error:
        message, status = error
        return jsonify(error=message), status

    image_url = None
    if image_file and image_file.filename:
        try:
            image_url = _save_job_image(image_file)
        except ValueError as e:
            return jsonify(error=str(e)), 400

    cur = g.conn.execute(
        """INSERT INTO jobs (posted_by, title, description, category, location,
                             is_remote, pay_amount, pay_type, duration_hours, status,
                             image_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)""",
        (
            user["id"],
            fields["title"],
            fields["description"],
            fields["category"],
            fields["location"],
            int(fields["is_remote"]),
            fields["pay_amount"],
            fields["pay_type"],
            fields["duration_hours"],
            image_url,
            now_iso(),
        ),
    )
    g.conn.commit()
    job = job_row_to_dict(
        g.conn.execute(
            f"""SELECT {JOB_FIELDS}, u.first_name || ' ' || u.last_name AS org_name,
                     u.rating AS org_rating,
                     u.avatar_url AS org_avatar_url,
                     0 AS application_count
                FROM jobs j JOIN users u ON u.id = j.posted_by WHERE j.id = ?""",
            (cur.lastrowid,),
        ).fetchone(),
        user["id"],
        set(),
        {cur.lastrowid},
    )
    return jsonify(job), 201


@app.get("/api/uploads/jobs/<path:filename>")
def serve_job_image(filename):
    return send_from_directory(UPLOAD_DIR, secure_filename(filename), max_age=86400)


# --------------------------------------------------------------------------- #
# Applications
# --------------------------------------------------------------------------- #

@app.post("/api/applications")
def apply():
    user = current_user()
    if not user:
        return jsonify(error="Log in to apply."), 401
    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id")
    cover_letter = (data.get("cover_letter") or "").strip()
    files = data.get("application_files") or []

    if not cover_letter:
        return jsonify(error="Write a short cover note first."), 400
    job = g.conn.execute("SELECT id, status, posted_by FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if not job:
        return jsonify(error="Job not found"), 404
    if job["posted_by"] == user["id"]:
        return jsonify(error="This is your own posting."), 400

    dup = g.conn.execute(
        "SELECT 1 FROM applications WHERE job_id = ? AND applicant_id = ?", (job_id, user["id"])
    ).fetchone()
    if dup:
        return jsonify(error="You already applied to this job"), 409

    cur = g.conn.execute(
        """INSERT INTO applications (job_id, applicant_id, cover_letter, status, applied_at)
           VALUES (?, ?, ?, 'PENDING', ?)""",
        (job_id, user["id"], cover_letter, now_iso()),
    )
    for f in files:
        f = f if isinstance(f, dict) else {}
        g.conn.execute(
            "INSERT INTO application_files (application_id, name, size, type) VALUES (?, ?, ?, ?)",
            (cur.lastrowid, (f.get("name") or "file")[:255], int(f.get("size") or 0), (f.get("type") or "")[:100]),
        )
    g.conn.commit()
    return jsonify(
        application={
            "id": cur.lastrowid,
            "job_id": job_id,
            "applicant_id": user["id"],
            "cover_letter": cover_letter,
            "status": "PENDING",
            "applied_at": now_iso(),
            "files": files,
        }
    ), 201


@app.get("/api/applications/mine")
def my_applications():
    user = current_user()
    if not user:
        return jsonify(error="Log in first."), 401
    rows = g.conn.execute(
        """SELECT a.id, a.job_id, a.applicant_id, a.cover_letter, a.status, a.applied_at,
                  j.title AS job_title
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
            WHERE a.applicant_id = ?
            ORDER BY a.applied_at DESC""",
        (user["id"],),
    ).fetchall()
    apps = []
    for r in rows:
        file_rows = g.conn.execute(
            "SELECT name, size, type FROM application_files WHERE application_id = ?", (r["id"],)
        ).fetchall()
        app_dict = dict(r)
        app_dict["files"] = [dict(f) for f in file_rows]
        apps.append(app_dict)
    return jsonify(apps)


# --------------------------------------------------------------------------- #
# Boot
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    db.init_db()
    seed.run()
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5001)), debug=os.environ.get("FLASK_DEBUG") == "1")

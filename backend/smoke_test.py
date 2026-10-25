"""Offline smoke suite for the QuickGig API.

Self-contained: builds a throwaway SQLite database, starts the Flask app on a
free port, and mints Supabase-style tokens locally (HS256 dev secret), so the
whole auth path is exercised without a Supabase project or network access.

Run:  backend\\.venv\\Scripts\\python.exe smoke_test.py
Exit code 0 = all checks passed.
"""

import base64
import json
import os
import tempfile
import threading
import time
import urllib.error
import urllib.request

WORKDIR = tempfile.mkdtemp(prefix="quickgig-smoke-")
SUPABASE_URL = "https://smoke.supabase.test"
SUPABASE_SECRET = "smoke-test-secret-0123456789abcdef"

# Config must be in place before the app module imports it.
os.environ["SUPABASE_URL"] = SUPABASE_URL
os.environ["SUPABASE_JWT_SECRET"] = SUPABASE_SECRET
os.environ.pop("SUPABASE_ANON_KEY", None)

import importlib.util  # noqa: E402
import sys  # noqa: E402

import jwt  # noqa: E402
from werkzeug.serving import make_server  # noqa: E402

import db  # noqa: E402
import seed  # noqa: E402

# `backend/app/` is a leftover stub package, so `import app` would resolve to it.
# Load the real single-file API by path instead.
_spec = importlib.util.spec_from_file_location(
    "quickgig_api", os.path.join(os.path.dirname(os.path.abspath(__file__)), "app.py")
)
api = importlib.util.module_from_spec(_spec)
sys.modules["quickgig_api"] = api
_spec.loader.exec_module(api)

db.DB_PATH = os.path.join(WORKDIR, "quickgig.db")
api.UPLOAD_DIR = os.path.join(WORKDIR, "uploads", "jobs")
db.init_db()
seed.run()

server = make_server("127.0.0.1", 0, api.app)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_port}"

PASS = []


def token(sub, email, *, user_type=None, name="Test Person", provider="google",
          exp_delta=3600, aud="authenticated", secret=SUPABASE_SECRET, avatar=""):
    now = int(time.time())
    payload = {
        "sub": sub,
        "email": email,
        "aud": aud,
        "iss": f"{SUPABASE_URL}/auth/v1",
        "iat": now,
        "exp": now + exp_delta,
        "role": "authenticated",
        "app_metadata": {"provider": provider, "providers": [provider]},
        "user_metadata": {
            "full_name": name,
            "email_verified": True,
            "avatar_url": avatar,
            "user_type": user_type,
        },
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def req(method, path, body=None, tok=None, multipart=None):
    headers = {}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if tok:
        headers["Authorization"] = f"Bearer {tok}"
    if multipart:
        data, content_type = multipart
        headers["Content-Type"] = content_type
    try:
        with urllib.request.urlopen(
            urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
        ) as r:
            raw = r.read()
            return r.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw) if raw else None
        except json.JSONDecodeError:
            return e.code, None


def check(name, cond, extra=""):
    PASS.append(bool(cond))
    print(f"{'PASS' if cond else 'FAIL'}  {name}  {extra}")


# --------------------------------------------------------------------- public
status, jobs = req("GET", "/api/jobs")
check("jobs list", status == 200 and len(jobs) == 7 and all("org_name" in j for j in jobs),
      f"count={len(jobs)}")

status, feed = req("GET", "/api/jobs/feed?page=1&per=3")
check("feed page 1", status == 200 and len(feed["items"]) == 3 and feed["has_more"] is True
      and feed.get("total") == 7, f"total={feed.get('total')}")

status, feed_last = req("GET", "/api/jobs/feed?page=3&per=3")
check("feed last page", status == 200 and feed_last["has_more"] is False and len(feed_last["items"]) == 1,
      f"has_more={feed_last.get('has_more')}")

# ----------------------------------------------------------------------- auth
status, _ = req("GET", "/api/auth/me")
check("me without token", status == 401, f"status={status}")

status, _ = req("GET", "/api/auth/me",
                tok=token("u-bad", "bad@example.com", secret="wrong-secret-0123456789abcdef0123"))
check("reject bad signature", status == 401, f"status={status}")

status, _ = req("GET", "/api/auth/me", tok=token("u-exp", "exp@example.com", exp_delta=-60))
check("reject expired token", status == 401, f"status={status}")

status, _ = req("GET", "/api/auth/me", tok=token("u-aud", "aud@example.com", aud="anon"))
check("reject wrong audience", status == 401, f"status={status}")

seeker_token = token("u-seeker", "seeker@example.com", user_type="individual", name="Test Seeker")
status, me = req("GET", "/api/auth/me", tok=seeker_token)
seeker = (me or {}).get("user", {})
check("google sign-in provisions profile",
      status == 200 and seeker.get("email") == "seeker@example.com"
      and seeker.get("user_type") == "individual"
      and seeker.get("first_name") == "Test"
      and seeker.get("last_name") == "Seeker",
      f"status={status} user={seeker.get('first_name')} {seeker.get('last_name')}")

status, me_again = req("GET", "/api/auth/me", tok=seeker_token)
check("provisioning is idempotent",
      status == 200 and me_again["user"]["id"] == seeker["id"],
      f"id={seeker.get('id')} again={me_again.get('user', {}).get('id')}")

org_token = token("u-org", "poster@example.com", user_type="organization", name="Test Poster")
status, me_org = req("GET", "/api/auth/me", tok=org_token)
org = (me_org or {}).get("user", {})
check("organization role comes from metadata",
      status == 200 and org.get("user_type") == "organization", f"role={org.get('user_type')}")

# ----------------------------------------------------------------------- jobs
status, err = req("POST", "/api/jobs", {
    "title": "x", "description": "y", "category": "Delivery", "location": "MP Nagar",
    "pay_amount": 100, "pay_type": "fixed", "duration_hours": 1, "is_remote": False,
}, tok=seeker_token)
check("individual can't post", status == 403, f"status={status} error={err.get('error')}")

status, err = req("POST", "/api/jobs", {"title": "x"})
check("anon can't post", status == 401, f"status={status}")

status, err = req("POST", "/api/jobs", {
    "title": "", "category": "", "pay_amount": 0, "pay_type": "bad", "duration_hours": 0,
}, tok=org_token)
check("job validation", status == 400, f"status={status} error={err.get('error')}")

png = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMYQAAAABJRU5ErkJggg=="
)
boundary = "----quickgigsmoke"
parts = []
for key, value in [
    ("title", "Photo gig test"), ("description", "uploaded via smoke test"),
    ("category", "Delivery"), ("location", "MP Nagar"), ("pay_amount", "200"),
    ("pay_type", "hourly"), ("duration_hours", "2"), ("is_remote", "false"),
]:
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode())
parts.append(
    f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="test.png"\r\n'
    f"Content-Type: image/png\r\n\r\n".encode() + png + f"\r\n--{boundary}--\r\n".encode()
)
status, created = req("POST", "/api/jobs", tok=org_token, multipart=(
    b"".join(parts), f"multipart/form-data; boundary={boundary}"))
check("post job with image", status == 201 and bool(created.get("image_url")),
      f"status={status} image_url={created.get('image_url')}")

img_status = None
if created and created.get("image_url"):
    try:
        with urllib.request.urlopen(BASE + created["image_url"]) as r:
            img_status = r.status
    except urllib.error.HTTPError as e:
        img_status = e.code
check("uploaded image serves", img_status == 200, f"status={img_status}")

# ----------------------------------------------------------------- applications
status, new = req("POST", "/api/applications", {
    "job_id": 3, "cover_letter": "smoke test apply",
    "application_files": [{"name": "cv.pdf", "size": 10240, "type": "application/pdf"}],
}, tok=seeker_token)
check("new apply", status == 201 and new.get("application", {}).get("status") == "PENDING",
      f"status={status}")

status, dup = req("POST", "/api/applications", {"job_id": 3, "cover_letter": "dup"}, tok=seeker_token)
check("duplicate apply", status == 409 and "already applied" in dup.get("error", ""),
      f"status={status} error={dup.get('error')}")

status, mine = req("GET", "/api/applications/mine", tok=seeker_token)
first = mine[0] if mine else {}
check("applications mine", status == 200 and len(mine) == 1
      and first.get("job_title") == "Remote WordPress fix"
      and len(first.get("files", [])) == 1,
      f"count={len(mine)} files={len(first.get('files', []))}")

own_job_id = created["id"]
status, err = req("POST", "/api/applications", {"job_id": own_job_id, "cover_letter": "own"}, tok=org_token)
check("can't apply to your own gig", status == 400, f"status={status} error={err.get('error')}")

status, feed2 = req("GET", "/api/jobs/feed?page=1&per=50")
check("new gig appears in feed", status == 200 and feed2.get("total") == 8,
      f"total={feed2.get('total')}")

# ------------------------------------------------- seeded profile claim by email
claim_token = token("u-aman", "aman@example.com", user_type="individual", name="Aman Sharma")
status, claimed = req("GET", "/api/auth/me", tok=claim_token)
check("seeded profile claimed by email",
      status == 200 and claimed["user"]["id"] == 1
      and claimed["user"]["auth_provider"] == "google",
      f"id={claimed.get('user', {}).get('id')} provider={claimed.get('user', {}).get('auth_provider')}")

status, conflicted = req("GET", "/api/auth/me",
                         tok=token("u-other", "aman@example.com", user_type="individual"))
check("identity bound to another account is refused", status == 401, f"status={status}")

# ----------------------------------------------------------------------- schema
conn = db.connect()
columns = {r["name"] for r in conn.execute("PRAGMA table_info(users)")}
conn.close()
check("users table has no credentials", "password_hash" not in columns and "supabase_uid" in columns,
      f"columns={sorted(columns)}")

server.shutdown()
print(f"\n{sum(PASS)}/{len(PASS)} passed")
raise SystemExit(0 if all(PASS) else 1)

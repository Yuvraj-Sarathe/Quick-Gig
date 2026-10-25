"""First-run seed — the Bhopal demo dataset from the frontend mocks.

Runs once when quickgig.db is empty. Seeded profiles own the demo gigs but
have no credentials: sign-in is handled entirely by Supabase Auth, so these
rows are claimed by email the first time a matching identity signs in.
"""

from datetime import datetime, timedelta, timezone

import db

DAY = 86_400  # seconds


def iso_now_minus(days):
    return datetime.now(timezone.utc).isoformat()


def ago(days):
    return (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()


def is_empty():
    conn = db.connect()
    count = conn.execute("SELECT COUNT(*) AS n FROM users").fetchone()["n"]
    conn.close()
    return count == 0


USERS = [
    {
        "email": "aman@example.com",
        "first_name": "Aman",
        "last_name": "Sharma",
        "user_type": "individual",
        "bio": "Two-wheeler, own tools, free on weekends. Bairagarh side.",
        "location": "Kolar Road, Bhopal",
        "rating": 4.8,
    },
    {
        "email": "seva@example.com",
        "first_name": "Seva",
        "last_name": "Events",
        "user_type": "organization",
        "bio": "Local event staffing and facility services across Bhopal.",
        "location": "10 No. Market, Bhopal",
        "rating": 4.6,
    },
]

# All posted by the org (user id 2 in seed order), newest first.
JOBS = [
    {
        "title": "Event setup crew needed",
        "description": "Help set up tables, chairs and decor for a wedding near Lalghati. "
        "Two people needed, supervisor on site, lunch provided.",
        "category": "Events",
        "location": "Lalghati",
        "is_remote": 0,
        "pay_amount": 1100,
        "pay_type": "fixed",
        "duration_hours": 5,
        "days_ago": 2,
    },
    {
        "title": "Same-day document courier",
        "description": "Pick up legal documents from an office in MP Nagar and deliver them "
        "across town the same day. Two-wheeler required.",
        "category": "Delivery",
        "location": "MP Nagar",
        "is_remote": 0,
        "pay_amount": 70,
        "pay_type": "hourly",
        "duration_hours": 3,
        "days_ago": 1,
    },
    {
        "title": "Remote WordPress fix",
        "description": "Fix a broken plugin causing layout issues on a WordPress site. "
        "Small task — screen-share guidance provided.",
        "category": "Tech Help",
        "location": "Remote",
        "is_remote": 1,
        "pay_amount": 500,
        "pay_type": "fixed",
        "duration_hours": 2,
        "days_ago": 4,
    },
    {
        "title": "Apartment deep cleaning",
        "description": "Deep clean a 2-BHK flat in Arera Colony before the new tenant moves in. "
        "Cleaning supplies provided.",
        "category": "Cleaning",
        "location": "Arera Colony",
        "is_remote": 0,
        "pay_amount": 700,
        "pay_type": "fixed",
        "duration_hours": 4,
        "days_ago": 3,
    },
    {
        "title": "Weekend catering helper",
        "description": "Assist serving and table refills at a house function off Kolar Road. "
        "Light work, lunch and travel allowance included.",
        "category": "Events",
        "location": "Kolar Road",
        "is_remote": 0,
        "pay_amount": 850,
        "pay_type": "fixed",
        "duration_hours": 6,
        "days_ago": 5,
    },
    {
        "title": "Class 8 tutor — maths & science",
        "description": "Evening tuition for a Class 8 student, CBSE syllabus, two evenings "
        "a week near 10 No. Market.",
        "category": "Tutoring",
        "location": "10 No. Market",
        "is_remote": 0,
        "pay_amount": 180,
        "pay_type": "hourly",
        "duration_hours": 2,
        "days_ago": 6,
    },
    {
        "title": "2-BHK furniture shift",
        "description": "Move a 2-BHK household from Shahpura to Kolar Road. Van and one extra "
        "helper provided.",
        "category": "Moving",
        "location": "Shahpura",
        "is_remote": 0,
        "pay_amount": 1400,
        "pay_type": "fixed",
        "duration_hours": 4,
        "days_ago": 8,
    },
]


def run():
    if not is_empty():
        return
    conn = db.connect()
    cur = conn.cursor()
    for u in USERS:
        cur.execute(
            """INSERT INTO users (first_name, last_name, email, user_type,
                                  avatar_url, bio, location, rating, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                u["first_name"],
                u["last_name"],
                u["email"],
                u["user_type"],
                "",
                u["bio"],
                u["location"],
                u["rating"],
                ago(30),
            ),
        )
    org_id = cur.execute(
        "SELECT id FROM users WHERE user_type = 'organization' LIMIT 1"
    ).fetchone()["id"]
    applicant_id = cur.execute(
        "SELECT id FROM users WHERE user_type = 'individual' LIMIT 1"
    ).fetchone()["id"]
    for j in JOBS:
        cur.execute(
            """INSERT INTO jobs (posted_by, title, description, category, location,
                                 is_remote, pay_amount, pay_type, duration_hours,
                                 status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)""",
            (
                org_id,
                j["title"],
                j["description"],
                j["category"],
                j["location"],
                j["is_remote"],
                j["pay_amount"],
                j["pay_type"],
                j["duration_hours"],
                ago(j["days_ago"]),
            ),
        )
    first_job_id = cur.execute("SELECT id FROM jobs ORDER BY id LIMIT 1").fetchone()["id"]
    cur.execute(
        """INSERT INTO applications (job_id, applicant_id, cover_letter, status, applied_at)
           VALUES (?, ?, ?, 'PENDING', ?)""",
        (
            first_job_id,
            applicant_id,
            "I have experience setting up events and I am free both weekend days.",
            ago(1),
        ),
    )
    conn.commit()
    conn.close()
    print(f"Seed complete — {len(USERS)} users, {len(JOBS)} jobs, 1 application.")

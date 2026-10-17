# QuickGig - Data Model (Planned)

Planned SQLAlchemy schemas for the files in `backend/app/models/`. The files are still empty — treat the fields below as the agreed starting point and update this doc if implementation changes.

---

## Entities

### `user.py` — User
| Field (planned) | Type | Notes |
|---|---|---|
| id | int, PK | |
| name | string | Individual name or organization name |
| email | string, unique | Login credential |
| password_hash | string | Never stored in plain text |
| role | enum | `individual` or `organization` — drives permissions |
| created_at | datetime | |

### `job.py` — Job
| Field (planned) | Type | Notes |
|---|---|---|
| id | int, PK | |
| title | string | |
| description | text | |
| location | string | On-site / remote / hybrid |
| category | string | Used by `JobListings.jsx` filters |
| budget | decimal | Payment offered for the gig |
| status | enum | `open` → `closed` / `completed` |
| organization_id | FK → user.id | Owner must have role `organization` |
| created_at | datetime | |

### `application.py` — Application
| Field (planned) | Type | Notes |
|---|---|---|
| id | int, PK | |
| job_id | FK → job.id | |
| applicant_id | FK → user.id | Must have role `individual` |
| cover_note | text | Optional message sent with the application |
| resume_path | string | File stored via `app/services/` |
| status | enum | `applied` → `reviewed` → `accepted` / `rejected` |
| applied_at | datetime | |

Proposed constraint: one application per applicant per job (unique on `job_id` + `applicant_id`).

### Review — deferred
The original spec listed a Review model alongside the others, but no `review.py` exists yet. Deferred to a later phase — see [`decisions.md`](decisions.md).

---

## Relationships

```
User (organization) 1 ─── * Job
User (individual)   1 ─── * Application
Job                 1 ─── * Application
```

*   An organization posts many jobs; an individual applies to many jobs.
*   Status enums and field names must stay in sync with [`api-endpoints.md`](api-endpoints.md) and [`data-flow.md`](data-flow.md).

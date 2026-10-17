# QuickGig - API Endpoints (Proposed)

Blueprints live in `backend/app/routes/`. The paths below are the agreed plan — routes are not implemented yet, so update this table as they are built.

Conventions: all responses are JSON · **Protected** = requires `Authorization: Bearer <JWT>` · role checks run via decorators in `app/utils/`.

---

## `auth_routes.py` — `/api/auth`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an Individual or Organization account |
| POST | `/api/auth/login` | Public | Verify credentials, return JWT + profile |
| GET | `/api/auth/me` | Protected | Current user from the token (feeds `AuthContext.jsx`) |

---

## `job_routes.py` — `/api/jobs`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/jobs` | Public | List jobs; query params for search/filter (`q`, `category`, `status`) |
| GET | `/api/jobs/<id>` | Public | Single job (feeds `JobDetails.jsx`) |
| POST | `/api/jobs` | Protected · organization | Create a gig (from `PostJob.jsx`) |
| PUT | `/api/jobs/<id>` | Protected · owner org | Update a gig |
| DELETE | `/api/jobs/<id>` | Protected · owner org | Remove a gig |

---

## `app_routes.py` — `/api/applications`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/applications` | Protected · individual | Apply to a job ("Apply Now") |
| GET | `/api/applications/mine` | Protected · individual | Own applications (`Dashboard.jsx`) |
| GET | `/api/jobs/<id>/applications` | Protected · owner org | Applicants for a job |
| PATCH | `/api/applications/<id>` | Protected · owner org | Change status: `reviewed`, `accepted`, `rejected` |

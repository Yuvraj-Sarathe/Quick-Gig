# QuickGig - Open Decisions & TODOs

Decisions the codebase and docs deliberately leave open. Resolve one → update the linked docs in the same change.

| # | Decision | Status | Notes |
|---|----------|--------|-------|
| 1 | Styling stack | **OPEN** | `package.json` lists `mui`, but the choice isn't final. Pick Tailwind CSS or MUI before building the frontend, then update `architecture-overview.md` (the `index.css` line) and `package.json`. |
| 2 | Database | **OPEN** | `data-flow.md` assumes PostgreSQL. Decide dev (e.g. SQLite) vs production (PostgreSQL) and set the URI scheme in `config.py`. |
| 3 | Celery | **OPEN** | Listed in `backend/requirements.txt`. Presumed purpose: async email notifications via Flask-Mail. Confirm worker setup or drop the dependency. |
| 4 | Review model | **DEFERRED** | Original spec mentioned a Review model, but `review.py` does not exist. Scheduled for a later phase — see `data-model.md`. |

---

## TODO convention for code files

Once we start filling the empty files, each file should open with a comment pointing at its doc, e.g.:

```python
# TODO: see docs/data-model.md — define User model (role: individual | organization)
```

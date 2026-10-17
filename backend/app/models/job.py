# TODO: Job model — see docs/data-model.md
#   - fields: id, title, description, location, category, budget,
#     status enum (open -> closed / completed), organization_id (FK -> user.id), created_at
#   - relationship: owning User (organization) 1 --- * Job
#   - status transitions are driven from app_routes/owner actions (docs/data-flow.md §4)

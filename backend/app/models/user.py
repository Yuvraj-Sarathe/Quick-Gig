# TODO: User model — see docs/data-model.md
#   - fields: id, name, email (unique), password_hash, role (individual | organization), created_at
#   - role drives all permission checks (decorators in app/utils/)
#   - helper methods: hash/verify password (werkzeug.security), serialize() for JSON responses
#   - relationships: jobs (as organization), applications (as individual)

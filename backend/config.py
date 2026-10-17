# TODO: configuration — see docs/architecture-overview.md (config.py) + docs/decisions.md
#   - split config classes: Development / Production
#   - SQLALCHEMY_DATABASE_URI — decision #2: SQLite (dev) vs PostgreSQL (prod)
#   - SECRET_KEY + JWT_SECRET_KEY — load from .env, never commit real values
#   - MAIL_SERVER / MAIL_USERNAME / MAIL_PASSWORD for Flask-Mail (see decision #3)
#   - JWT expiry window (e.g. 24h) used by auth_routes and app/utils

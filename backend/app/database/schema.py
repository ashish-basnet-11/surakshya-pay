from sqlalchemy import text
from sqlalchemy.engine import Engine

# create_all() only creates missing tables; it never alters existing ones. These idempotent
# statements bring databases created by older versions up to date.
# ponytail: hand-rolled upgrades; switch to Alembic once schema changes become frequent.
UPGRADES = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()",
    "CREATE INDEX IF NOT EXISTS ix_users_created_at ON users (created_at)",
    "CREATE INDEX IF NOT EXISTS ix_transactions_user_id ON transactions (user_id)",
    "CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id)",
    "CREATE INDEX IF NOT EXISTS ix_budgets_user_id ON budgets (user_id)",
]


def ensure_schema(engine: Engine) -> None:
    from app.database import base  # noqa: F401  (registers all models)

    base.Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        for statement in UPGRADES:
            conn.execute(text(statement))

from database import engine
from sqlalchemy import text

cols = [
    "user_email VARCHAR",
    "attempted_email VARCHAR",
    "user_id INTEGER",
    "status VARCHAR",
    "success BOOLEAN DEFAULT FALSE",
    "cosine_distance FLOAT",
    "match_score FLOAT",
    "ip_address VARCHAR",
    "device VARCHAR",
    "location VARCHAR",
    "timestamp TIMESTAMPTZ"
]

with engine.connect() as conn:
    for col_def in cols:
        col_name = col_def.split()[0]
        conn.execute(text(f"ALTER TABLE login_history ADD COLUMN IF NOT EXISTS {col_def}"))
    conn.commit()
print("Migration done")
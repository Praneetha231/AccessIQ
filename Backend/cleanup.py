# backend/cleanup.py
from database import engine
from sqlalchemy import text

def reset_database():
    with engine.connect() as connection:
        # Drop the users table and cascading foreign keys
        connection.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
        connection.execute(text("DROP TABLE IF EXISTS inbox_messages CASCADE;"))
        connection.commit()
        print("Database tables dropped successfully.")

if __name__ == "__main__":
    reset_database()
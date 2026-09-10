# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Put your ACTUAL pgAdmin 4 password in place of YOUR_ACTUAL_PGADMIN_PASSWORD
DATABASE_URL = "postgresql://postgres:1234@127.0.0.1:5432/accessiq"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
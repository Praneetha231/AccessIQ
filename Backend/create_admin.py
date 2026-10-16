# create_admin.py - PostgreSQL version
from database import SessionLocal
import models

db = SessionLocal()

# Check if tables exist
try:
    admin_email = "praneethadukkipati@gmail.com"
    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    if existing:
        print(f"Admin {admin_email} already exists")
    else:
        print(f"Admin will be created on first face register with {admin_email}")
        print("Go to Frontend and Register with this email + your face")
    print("✅ DB is ready!")
    print(f"Total users: {db.query(models.User).count()}")
except Exception as e:
    print(f"Error: {e}")
    print("Make sure uvicorn main:app is running in other terminal to create tables first")

db.close()
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("Adding new columns to users table...")
    
    # Add hashed_password if not exists
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR"))
        print("✅ Added hashed_password")
    except Exception as e:
        print(f"hashed_password already exists or error: {e}")
    
    # Add role if not exists
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'"))
        print("✅ Added role")
    except Exception as e:
        print(f"role already exists or error: {e}")

    # Add is_active if not exists
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
        print("✅ Added is_active")
    except Exception as e:
        print(f"is_active already exists or error: {e}")

    conn.commit()
    print("\n🎉 DB fixed! Now run python create_admin.py")
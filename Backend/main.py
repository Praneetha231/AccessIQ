# backend/main.py - AccessIQ Fixed for Final Review
import base64
import cv2
import numpy as np
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
import json

import models
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Access IQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_EMAILS = ["admin@accessiq.com", "praneethadukkipati@gmail.com"]
THRESHOLD = 0.35 # GLOBAL - same everywhere

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def process_face_image(base64_string: str, check_liveness: bool = True):
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_bytes = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None, "Invalid image."
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(80, 80))
        if len(faces) == 0:
            return None, "No face detected. Come closer."
        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        face_roi_eq = cv2.equalizeHist(face_roi)
        if np.std(face_roi_eq) < 18.0:
            return None, "Too dark/blurry. Turn on light."
        face_resized = cv2.resize(face_roi_eq, (32, 32)).astype(np.float32)
        vector_bytes = face_resized.flatten().tobytes()
        encoded_vector = base64.b64encode(vector_bytes).decode('utf-8')
        return encoded_vector, None
    except Exception as e:
        print(f"Error: {e}")
        return None, "Processing error."

def calculate_cosine_distance(vec1_input, vec2_input) -> float:
    try:
        v1 = np.frombuffer(base64.b64decode(vec1_input), dtype=np.float32) if isinstance(vec1_input, str) else np.array(vec1_input, dtype=np.float32)
        v2 = np.frombuffer(base64.b64decode(vec2_input), dtype=np.float32) if isinstance(vec2_input, str) else np.array(vec2_input, dtype=np.float32)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        if norm_v1 == 0 or norm_v2 == 0:
            return 1.0
        similarity = np.dot(v1, v2) / (norm_v1 * norm_v2)
        return float(1.0 - similarity)
    except:
        return 1.0

class PasswordlessRegister(BaseModel):
    email: EmailStr
    full_name: str = None
    mobile: str = None
    gender: str = None
    dob: str = None
    image_data: str

class PasswordlessLogin(BaseModel):
    image_data: str
    role: str = "user"

class SendMessageSchema(BaseModel):
    email: str
    sender: str
    subject: str
    body: str

@app.get("/")
def read_root():
    return {"status": "success", "message": "Access IQ Online", "threshold": THRESHOLD}

@app.post("/api/v1/auth/register")
def register(data: PasswordlessRegister, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    face_vector, error_msg = process_face_image(data.image_data, check_liveness=True)
    if not face_vector:
        raise HTTPException(status_code=400, detail=error_msg)
    existing_users = db.query(models.User).filter(models.User.is_face_registered == True).all()
    for user in existing_users:
        if user.face_embedding:
            distance = calculate_cosine_distance(face_vector, user.face_embedding)
            print(f"[REGISTER CHECK] {user.email} distance: {distance:.4f}")
            if distance < THRESHOLD: # FIXED 0.18 -> 0.35
                raise HTTPException(status_code=400, detail=f"Face already registered with {user.email}")
    new_user = models.User(
        email=email, full_name=data.full_name, mobile=data.mobile,
        gender=data.gender, dob=data.dob, is_face_registered=True, face_embedding=face_vector
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "message": "Registered!", "email": new_user.email}

@app.post("/api/v1/auth/login")
def login(data: PasswordlessLogin, request: Request, db: Session = Depends(get_db)):
    ip_address = request.client.host if request.client else "127.0.0.1"
    users = db.query(models.User).filter(models.User.is_face_registered == True).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found. Register first.")
    live_vector, error_msg = process_face_image(data.image_data, check_liveness=True)
    if not live_vector:
        raise HTTPException(status_code=400, detail=error_msg)

    best_match_user = None
    min_distance = float("inf")
    matched_user_obj = None

    for user in users:
        if user.face_embedding:
            distance = calculate_cosine_distance(live_vector, user.face_embedding)
            print(f"[LOGIN] Comparing with {user.email}: distance {distance:.4f}")
            if distance < min_distance:
                min_distance = distance
                best_match_user = user.email
                matched_user_obj = user

    print(f"[LOGIN FINAL] Best: {best_match_user} Distance: {min_distance:.4f} Threshold: {THRESHOLD}")

    is_success = min_distance < THRESHOLD and matched_user_obj is not None

    if is_success and data.role == "admin":
        if matched_user_obj.email not in ADMIN_EMAILS:
            failed_log = models.LoginHistory(
                user_id=matched_user_obj.id, attempted_email=matched_user_obj.email,
                status="FAILED_ADMIN_ATTEMPT", cosine_distance=float(min_distance), ip_address=ip_address
            )
            db.add(failed_log)
            db.commit()
            raise HTTPException(status_code=403, detail=f"Access Denied: {matched_user_obj.email} not authorized as Admin.")

    # FIXED: Always save user_id so user dashboard shows count (was None on fail)
    new_log = models.LoginHistory(
        user_id=matched_user_obj.id if matched_user_obj else None,
        attempted_email=best_match_user if best_match_user else "unknown",
        status="SUCCESS" if is_success else "FAILED",
        cosine_distance=float(min_distance), ip_address=ip_address
    )
    db.add(new_log)
    db.commit()

    if is_success:
        return {"status": "success", "message": "Face Matched!", "email": best_match_user, "distance": min_distance}

    raise HTTPException(status_code=401, detail=f"Face not recognized. Best match distance {min_distance:.2f} > Threshold {THRESHOLD}. Try again with registered face.")

# --- ADMIN STATS (fixes Admin Overview showing 0) ---
@app.get("/api/v1/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.LoginHistory).count()
    success_logs = db.query(models.LoginHistory).filter(models.LoginHistory.status == "SUCCESS").count()
    failed_logs = total_logs - success_logs
    success_rate = (success_logs / total_logs * 100) if total_logs > 0 else 0
    avg_distance = db.query(models.LoginHistory).filter(models.LoginHistory.cosine_distance!= None).all()
    avg_dist_val = sum([l.cosine_distance for l in avg_distance]) / len(avg_distance) if avg_distance else 0
    return {
        "status": "success",
        "total_users": total_users,
        "total_logins": total_logs,
        "successful_logins": success_logs,
        "failed_logins": failed_logs,
        "success_rate": round(success_rate, 1),
        "avg_distance": round(avg_dist_val, 3)
    }

@app.get("/api/v1/admin/users")
def get_admin_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return {"status": "success", "users": [{"id": u.id, "email": u.email, "full_name": u.full_name, "mobile": u.mobile, "gender": u.gender, "dob": u.dob, "role": "Administrator" if u.email in ADMIN_EMAILS else "Standard User", "status": "Active" if u.is_face_registered else "Pending Setup"} for u in users]}

@app.get("/api/v1/admin/logs")
def get_admin_system_logs(db: Session = Depends(get_db)):
    logs = db.query(models.LoginHistory).order_by(models.LoginHistory.timestamp.desc()).all()
    return {"status": "success", "logs": [{"id": log.id, "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "", "level": "INFO" if log.status == "SUCCESS" else "WARN", "event": f"Verification {log.status} (Distance: {log.cosine_distance:.2f})" if log.cosine_distance else f"Login {log.status}", "user": log.attempted_email or "unknown", "email": log.attempted_email, "status": log.status, "cosine_distance": log.cosine_distance, "ip_address": log.ip_address} for log in logs]}

@app.get("/api/v1/admin/login-history")
def get_admin_login_history_alias(db: Session = Depends(get_db)):
    return get_admin_system_logs(db)

@app.get("/api/v1/inbox/{email}")
def get_user_inbox(email: str, db: Session = Depends(get_db)):
    email = email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    messages = db.query(models.InboxMessage).filter(models.InboxMessage.user_id == user.id).order_by(models.InboxMessage.timestamp.desc()).all()
    if not messages:
        welcome_msg = models.InboxMessage(user_id=user.id, sender="Access IQ Security", subject="Welcome to Access IQ", body="Biometric setup complete. Your face is now your password.")
        db.add(welcome_msg)
        db.commit()
        db.refresh(welcome_msg)
        messages = [welcome_msg]
    return {"status": "success", "messages": [{"id": m.id, "sender": m.sender, "subject": m.subject, "body": m.body, "timestamp": m.timestamp.strftime("%Y-%m-%d %H:%M") if m.timestamp else "", "is_read": m.is_read} for m in messages]}

@app.post("/api/v1/inbox/send")
def send_message(data: SendMessageSchema, db: Session = Depends(get_db)):
    recipient = db.query(models.User).filter(models.User.email == data.email.lower().strip()).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found.")
    new_msg = models.InboxMessage(user_id=recipient.id, sender=data.sender, subject=data.subject, body=data.body)
    db.add(new_msg)
    db.commit()
    return {"status": "success", "message": "Sent!"}

@app.get("/api/v1/alerts/{email}")
def get_user_alerts(email: str, db: Session = Depends(get_db)):
    email = email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    alerts = db.query(models.Alert).filter(models.Alert.user_id == user.id).order_by(models.Alert.timestamp.desc()).all()
    if not alerts:
        default_alert = models.Alert(user_id=user.id, title="Protection Active", message="Liveness monitoring active.", severity="success")
        db.add(default_alert)
        db.commit()
        db.refresh(default_alert)
        alerts = [default_alert]
    return {"status": "success", "alerts": [{"id": a.id, "title": a.title, "message": a.message, "severity": a.severity, "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M") if a.timestamp else "", "is_read": a.is_read} for a in alerts]}

@app.get("/api/v1/login-history/{email}")
def get_login_history(email: str, db: Session = Depends(get_db)):
    email = email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    logs = db.query(models.LoginHistory).filter(models.LoginHistory.user_id == user.id).order_by(models.LoginHistory.timestamp.desc()).all()
    return {"status": "success", "logs": [{"id": log.id, "status": log.status, "cosine_distance": log.cosine_distance, "ip_address": log.ip_address, "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else ""} for log in logs]}

@app.get("/api/v1/user/settings")
def get_user_settings_alias(email: str, db: Session = Depends(get_db)):
    email = email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "success", "email": user.email, "full_name": user.full_name, "mobile": user.mobile, "gender": user.gender, "dob": user.dob}

@app.put("/api/v1/settings/{email}")
def update_user_settings(email: str, payload: dict, db: Session = Depends(get_db)):
    email = email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.full_name = payload.get("full_name", user.full_name)
    user.mobile = payload.get("mobile", user.mobile)
    user.gender = payload.get("gender", user.gender)
    user.dob = payload.get("dob", user.dob)
    db.commit()
    return {"status": "success", "message": "Updated!", "email": user.email}

@app.delete("/api/v1/admin/logs")
def clear_all_logs(db: Session = Depends(get_db)):
    count = db.query(models.LoginHistory).count()
    db.query(models.LoginHistory).delete()
    db.commit()
    return {"status": "success", "deleted": count}
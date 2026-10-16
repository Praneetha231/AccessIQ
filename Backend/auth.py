import base64
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from database import get_db
from models import User, LoginHistory

IST = timezone(timedelta(hours=5, minutes=30))

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

def calculate_cosine_distance(embedding1, embedding2):
    dot_product = np.dot(embedding1, embedding2)
    norm_a = np.linalg.norm(embedding1)
    norm_b = np.linalg.norm(embedding2)
    if norm_a == 0 or norm_b == 0:
        return 1.0
    cosine_similarity = dot_product / (norm_a * norm_b)
    return 1.0 - cosine_similarity

@router.post("/login")
def biometric_login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    image_data = payload.get("image_data")

    if not email or not image_data:
        raise HTTPException(status_code=400, detail="Email and image data are required.")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    try:
        header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
        img_bytes = base64.b64decode(encoded)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise ValueError("Invalid image frame.")

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            raise HTTPException(status_code=401, detail="No face detected in live scan.")

        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face_roi, (100, 100))
        live_vector = face_resized.flatten().astype(float)

        stored_vector = np.array(user.face_embedding, dtype=float)
        distance = calculate_cosine_distance(live_vector, stored_vector)
        match_success = distance < 0.4

        audit_log = LoginHistory(
            user_email=email,
            success=match_success,
            status="SUCCESS" if match_success else "FAILED",
            match_score=float(distance),
            device="Chrome • Windows",
            location="Mudinepalli, IN",
            timestamp=datetime.now(IST)
        )
        db.add(audit_log)
        db.commit()

        if not match_success:
            raise HTTPException(status_code=401, detail=f"Biometric mismatch. Distance: {distance:.2f}")

        return {
            "status": "success",
            "message": "Biometric verification successful.",
            "email": user.email,
            "match_score": distance
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication processing error: {str(e)}")

@router.get("/login-history/{email}")
def get_login_history(email: str, db: Session = Depends(get_db)):
    logs = db.query(LoginHistory).filter(LoginHistory.user_email == email).order_by(LoginHistory.timestamp.desc()).all()
    return {"logs": [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "status": log.status,
            "device": log.device,
            "location": log.location,
            "match_score": log.match_score
        } for log in logs
    ]}
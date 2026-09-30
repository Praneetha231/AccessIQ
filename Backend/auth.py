import base64
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

# Assuming your models and database session dependency are imported here
# from database import get_db
# from models import User, LoginHistory

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

def calculate_cosine_distance(embedding1, embedding2):
    """Calculates the cosine distance between two face vectors."""
    dot_product = np.dot(embedding1, embedding2)
    norm_a = np.linalg.norm(embedding1)
    norm_b = np.linalg.norm(embedding2)
    if norm_a == 0 or norm_b == 0:
        return 1.0
    cosine_similarity = dot_product / (norm_a * norm_b)
    return 1.0 - cosine_similarity

@router.post("/login")
def biometric_login(payload: dict, db: Session = Depends(get_db)):
    """
    Passwordless biometric login endpoint.
    Expects JSON payload with 'email' and 'image_data' (Base64 string).
    """
    email = payload.get("email")
    image_data = payload.get("image_data")

    if not email or not image_data:
        raise HTTPException(status_code=400, detail="Email and image data are required.")

    # 1. Fetch user from database
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    try:
        # 2. Decode Base64 image to OpenCV matrix
        header, encoded = image_data.split(",", 1) if "," in image_data else ("", image_data)
        img_bytes = base64.b64decode(encoded)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise ValueError("Invalid image frame.")

        # 3. Detect face using OpenCV Haar Cascades
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            raise HTTPException(status_code=401, detail="No face detected in live scan.")

        # Extract Region of Interest (ROI) and normalize
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face_roi, (100, 100))
        live_vector = face_resized.flatten().astype(float)

        # 4. Retrieve stored user face embedding from database
        stored_vector = np.array(user.face_embedding, dtype=float)

        # 5. Calculate cosine distance
        distance = calculate_cosine_distance(live_vector, stored_vector)
        match_success = distance < 0.4  # Strict security threshold

        # 6. Log attempt in LoginHistory table
        audit_log = LoginHistory(
            user_email=email,
            success=match_success,
            match_score=float(distance),
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
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

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Authentication processing error: {str(e)}")
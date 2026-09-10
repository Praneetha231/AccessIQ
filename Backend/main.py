# backend/main.py
import base64
import cv2
import numpy as np
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

# Import models FIRST so SQLAlchemy initializes all relationship mappers
import models

# Synchronize database schema AFTER models are loaded into Base metadata
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Access IQ API", version="1.0.0")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safely Load Haar Cascades for Face and Eyes
face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
eye_cascade_path = cv2.data.haarcascades + 'haarcascade_eye.xml'

face_cascade = cv2.CascadeClassifier(face_cascade_path)
eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

if face_cascade.empty() or eye_cascade.empty():
    print("Warning: Haar Cascade XML files could not be loaded properly.")


def process_face_image(base64_string: str, check_liveness: bool = True):
    """Decodes camera snapshot, extracts ROI, and generates a Base64 string vector."""
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_bytes = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return None, "Invalid image format received."

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect face ROI
        faces = face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=3, 
            minSize=(40, 40)
        )
        if len(faces) == 0:
            return None, "No face detected. Please face the camera directly."

        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]

        # Equalize histogram to fix ambient lighting and shadows
        face_roi_eq = cv2.equalizeHist(face_roi)

        # Liveness check: Relaxed eye check with fallback
        if check_liveness:
            eyes = eye_cascade.detectMultiScale(
                face_roi_eq, 
                scaleFactor=1.05, 
                minNeighbors=1, 
                minSize=(8, 8)
            )
            # Fallback check: Ensure face ROI has sufficient variance if eyes are missed by cascade
            if len(eyes) < 1 and np.std(face_roi_eq) < 15.0:
                return None, "Liveness check failed: Image is too dark or blurry. Please face the light."

        # Resize to 32x32 and convert to float32
        face_resized = cv2.resize(face_roi_eq, (32, 32)).astype(np.float32)
        
        # Encode float32 vector bytes into compact Base64 string (~1.3KB)
        vector_bytes = face_resized.flatten().tobytes()
        encoded_vector = base64.b64encode(vector_bytes).decode('utf-8')
        
        return encoded_vector, None
    except Exception as e:
        print(f"Error processing image: {e}")
        return None, "An unexpected error occurred during face processing."


def calculate_cosine_distance(vec1_input, vec2_input) -> float:
    """Calculates cosine distance handling Base64 strings or legacy raw list formats."""
    try:
        # Decode vector 1 if string
        if isinstance(vec1_input, str):
            v1 = np.frombuffer(base64.b64decode(vec1_input), dtype=np.float32)
        else:
            v1 = np.array(vec1_input, dtype=np.float32)

        # Decode vector 2 if string
        if isinstance(vec2_input, str):
            v2 = np.frombuffer(base64.b64decode(vec2_input), dtype=np.float32)
        else:
            v2 = np.array(vec2_input, dtype=np.float32)

        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)

        if norm_v1 == 0 or norm_v2 == 0:
            return 1.0

        dot_product = np.dot(v1, v2)
        similarity = dot_product / (norm_v1 * norm_v2)
        return float(1.0 - similarity)
    except Exception as e:
        print(f"Distance calculation error: {e}")
        return 1.0


# ----------------------------
# Pydantic Schemas
# ----------------------------
class PasswordlessRegister(BaseModel):
    email: EmailStr
    image_data: str

class PasswordlessLogin(BaseModel):
    image_data: str  # 1:N biometric login requires no email

class SendMessageSchema(BaseModel):
    email: str
    sender: str
    subject: str
    body: str


# ----------------------------
# API Endpoints
# ----------------------------
@app.get("/")
def read_root():
    return {"status": "success", "message": "Access IQ Passwordless Engine Online"}

@app.post("/api/v1/auth/register")
def register(data: PasswordlessRegister, db: Session = Depends(get_db)):
    # 1. Check if email already exists
    db_user = db.query(models.User).filter(models.User.email == data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="This email address is already registered.")

    # 2. Extract face vector
    face_vector, error_msg = process_face_image(data.image_data, check_liveness=True)
    if not face_vector:
        raise HTTPException(status_code=400, detail=error_msg)

    # 3. Enforce 1 Face = 1 Email rule using Cosine Distance
    existing_users = db.query(models.User).filter(models.User.is_face_registered == True).all()
    for user in existing_users:
        if user.face_encoding:
            distance = calculate_cosine_distance(face_vector, user.face_encoding)
            if distance < 0.55:
                raise HTTPException(
                    status_code=400, 
                    detail=f"This face is already registered under account: {user.email}"
                )

    # 4. Save clean registration
    new_user = models.User(
        email=data.email,
        is_face_registered=True,
        face_encoding=face_vector
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success", 
        "message": "Account & Face registered successfully!", 
        "email": new_user.email
    }

@app.post("/api/v1/auth/login")
def login(data: PasswordlessLogin, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.is_face_registered == True).all()
    if not users:
        raise HTTPException(status_code=404, detail="No registered users found in system database.")

    live_vector, error_msg = process_face_image(data.image_data, check_liveness=True)
    if not live_vector:
        raise HTTPException(status_code=400, detail=error_msg)

    best_match_user = None
    min_distance = float("inf")

    for user in users:
        if user.face_encoding:
            distance = calculate_cosine_distance(live_vector, user.face_encoding)
            print(f"DEBUG: Comparing with {user.email} | Cosine Distance: {distance:.4f}")

            if distance < min_distance:
                min_distance = distance
                best_match_user = user.email

    if min_distance < 0.55 and best_match_user:
        return {
            "status": "success",
            "message": "Biometric Face Recognition Successful!",
            "email": best_match_user
        }

    raise HTTPException(
        status_code=401, 
        detail=f"Face not recognized. Best distance match was {min_distance:.2f} (Threshold: < 0.55)."
    )

@app.get("/api/v1/inbox/{email}")
def get_user_inbox(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    messages = db.query(models.InboxMessage).filter(models.InboxMessage.user_id == user.id).all()
    
    # Auto-seed welcome message if inbox is empty
    if not messages:
        welcome_msg = models.InboxMessage(
            user_id=user.id,
            sender="Access IQ Security",
            subject="Welcome to Access IQ System",
            body="Your biometric authentication setup is complete and secure."
        )
        db.add(welcome_msg)
        db.commit()
        db.refresh(welcome_msg)
        messages = [welcome_msg]

    return {
        "status": "success",
        "email": email,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "subject": m.subject,
                "body": m.body,
                "timestamp": m.timestamp.strftime("%Y-%m-%d %H:%M") if m.timestamp else "",
                "is_read": m.is_read
            } for m in messages
        ]
    }

@app.post("/api/v1/inbox/send")
def send_message(data: SendMessageSchema, db: Session = Depends(get_db)):
    # Verify target recipient exists
    recipient = db.query(models.User).filter(models.User.email == data.email).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found.")

    new_msg = models.InboxMessage(
        user_id=recipient.id,
        sender=data.sender,
        subject=data.subject,
        body=data.body
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {"status": "success", "message": "Message sent successfully!"}
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv

from Backend.src.models import User
from Backend.src.schemas import UserCreate
from Backend.src.security import get_password_hash, verify_password, create_access_token

# Load env variables
load_dotenv()

SMTP_EMAIL = os.getenv("EMAIL_USER")
SMTP_PASSWORD = os.getenv("EMAIL_PASS")

# In-memory OTP store
otp_store = {}

def register_user(db: Session, user_data: UserCreate):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


def send_otp(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    code = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": code,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }

    try:
        msg = MIMEText(f"Your CallMyDriver OTP is: {code}\n\nThis OTP expires in 5 minutes.")
        msg["Subject"] = "Your CallMyDriver OTP Code"
        msg["From"] = SMTP_EMAIL
        msg["To"] = email

        server = smtplib.SMTP("smtp.gmail.com",587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    return {"message": "OTP sent successfully"}


def verify_otp(db: Session, email: str, otp: str):
    record = otp_store.get(email)

    if not record:
        raise HTTPException(status_code=400, detail="OTP not found.")
    if datetime.utcnow() > record["expires"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired.")
    if record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    del otp_store[email]

    user = db.query(User).filter(User.email == email).first()
    token = create_access_token(data={"sub": user.email})
    return {"message": "Verified successfully", "token": token}
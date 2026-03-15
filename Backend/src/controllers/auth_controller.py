from dotenv import load_dotenv
load_dotenv()
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from src.models import User
from src.schemas import UserCreate
from src.security import get_password_hash, verify_password, create_access_token
import random
import time
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

def send_otp(email: str):
    otp = str(random.randint(100000, 999999))
    otp_store[email] = {
        "otp": otp,
        "expiry": time.time() + 60,
        "attempts": 0
    }

    email_user = os.getenv("EMAIL_USER")
    email_pass = os.getenv("EMAIL_PASS")

    if email_user and email_pass:
        try:
            msg = MIMEMultipart()
            msg["From"] = email_user
            msg["To"] = email
            msg["Subject"] = "CallMyDriver - Your OTP Code"
            body = f"""
            <h2>🔑 CallMyDriver OTP Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="color:#f0a500; letter-spacing:8px">{otp}</h1>
            <p>This OTP expires in <b>60 seconds</b>.</p>
            <p>Do not share this with anyone.</p>
            """
            msg.attach(MIMEText(body, "html"))
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(email_user, email_pass)
            server.sendmail(email_user, email, msg.as_string())
            server.quit()
            print(f"OTP sent to email: {email}")
        except Exception as e:
            print(f"Email error: {e}")
    else:
        print(f"[DEV MODE] OTP for {email}: {otp}")

    return {"message": "OTP sent to your email. Valid for 60 seconds."}

def verify_otp(email: str, input_otp: str):
    record = otp_store.get(email)
    if not record:
        raise HTTPException(status_code=400, detail="OTP not found. Request a new one.")
    if time.time() > record["expiry"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    record["attempts"] += 1
    if record["attempts"] > 3:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="Too many attempts. Account locked.")
    if record["otp"] != input_otp:
        raise HTTPException(status_code=400, detail=f"Invalid OTP. {3 - record['attempts']} attempts left.")
    del otp_store[email]
    return {"message": "OTP verified successfully."}
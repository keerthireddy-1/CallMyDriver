import random
import time
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("JWT_SECRET", "callmydriver_secret_2025")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory OTP store (use Redis in production)
otp_store = {}

# --- Password Hashing ---
def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT Token ---
def generate_token(user_id: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# --- OTP ---
def generate_otp(phone: str) -> str:
    otp = str(random.randint(100000, 999999))
    otp_store[phone] = {
        "otp": otp,
        "expiry": time.time() + 60,  # 60 seconds
        "attempts": 0
    }
    print(f"OTP for {phone}: {otp}")  # Replace with real SMS (Twilio etc.)
    return otp

def verify_otp(phone: str, input_otp: str) -> dict:
    record = otp_store.get(phone)
    if not record:
        return {"success": False, "message": "OTP not found. Request a new one."}
    if time.time() > record["expiry"]:
        del otp_store[phone]
        return {"success": False, "message": "OTP expired. Request a new one."}
    record["attempts"] += 1
    if record["attempts"] > 3:
        del otp_store[phone]
        return {"success": False, "message": "Too many attempts. Account locked."}
    if record["otp"] != input_otp:
        return {"success": False, "message": f"Invalid OTP. {3 - record['attempts']} attempts left."}
    del otp_store[phone]
    return {"success": True, "message": "OTP verified."}
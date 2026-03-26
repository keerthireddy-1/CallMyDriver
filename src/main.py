import uuid
import random
import json
import os
import smtplib
from email.mime.text import MIMEText
from fastapi import FastAPI, WebSocket, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- MAIL CONFIGURATION ---
MAIL_USERNAME = "namithanammi27@gmail.com"
MAIL_PASSWORD = "xpwzymtamiqerxmz"  # ← paste your NEW app password here
MAIL_FROM = "namithanammi27@gmail.com"

def send_email(to: str, otp: str):
    msg = MIMEText(f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">CallMyDriver - OTP Verification</h2>
        <p>Your One-Time Password is:</p>
        <h1 style="color: #4CAF50; letter-spacing: 8px;">{otp}</h1>
        <p style="color: #888; font-size: 13px;">
          This OTP expires in 60 seconds. Do not share it with anyone.
        </p>
      </body>
    </html>
    """, "html")
    msg["Subject"] = "Your CallMyDriver OTP"
    msg["From"] = MAIL_FROM
    msg["To"] = to

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to, msg.as_string())

# --- PERSISTENT STORAGE ---
DB_FILE = "users_db.json"

def load_users():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(DB_FILE, "w") as f:
        json.dump(users, f)

# --- CORE DATA STORAGE ---
class GlobalState:
    def __init__(self):
        self.users_db = load_users()
        self.otp_store = {}
        self.active_drivers = {
            "DRV-RAMESH": {"driver_name": "Ramesh Kumar", "lat": 12.9716, "lng": 77.5946}
        }
        self.all_bookings = {}

state = GlobalState()
app = FastAPI(title="CallMyDriver")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTH MODELS ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register")
async def register(data: RegisterRequest):
    if data.email in state.users_db:
        raise HTTPException(status_code=400, detail="Account already exists")
    state.users_db[data.email] = {
        "name": data.name,
        "phone": data.phone,
        "password": data.password,
    }
    save_users(state.users_db)
    print(f"New User Registered: {data.email}")
    return {"status": "success", "message": "Account created!"}

@app.post("/api/auth/login")
async def login(email: str = Query(...), password: str = Query(...)):
    user = state.users_db.get(email)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials. Please register first.")
    return {"status": "success", "user_id": email}

@app.post("/api/auth/send-otp")
async def send_otp(phone: str = Query(...)):
    otp = str(random.randint(100000, 999999))
    state.otp_store[phone] = otp
    try:
        print(f"Attempting to send OTP {otp} to {phone}...")
        send_email(phone, otp)
        print(f"SUCCESS: OTP sent to {phone}")
    except Exception as e:
        print(f"FAILED: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")
    return {"status": "success", "message": "OTP sent to your email"}

@app.post("/api/auth/verify-otp")
async def verify_otp(phone: str = Query(...), otp: str = Query(...)):
    stored_otp = state.otp_store.get(phone)
    if not stored_otp:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new one.")
    if stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
    del state.otp_store[phone]
    return {"status": "success", "message": "OTP verified successfully"}

# --- BOOKING ENDPOINTS ---

class BookingRequest(BaseModel):
    user_id: str
    pickup_lat: float
    pickup_lng: float
    destination: str

@app.post("/api/bookings/book")
async def book_driver(req: BookingRequest):
    booking_id = f"BKG-{uuid.uuid4().hex[:6].upper()}"
    state.all_bookings[booking_id] = {
        "booking_id": booking_id,
        "driver_name": "Ramesh Kumar",
        "status": "ACCEPTED"
    }
    return state.all_bookings[booking_id]

# --- WEBSOCKET ---
@app.websocket("/api/tracking/{booking_id}/{role}/{client_id}")
async def tracking_socket(websocket: WebSocket, booking_id: str, role: str, client_id: str):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_json()
    except:
        pass
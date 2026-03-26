import uuid
import random
import json
import os
import smtplib
import time

from email.mime.text import MIMEText
from fastapi import FastAPI, WebSocket, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# ✅ LOAD ENV VARIABLES
load_dotenv()

MAIL_USERNAME = os.getenv("EMAIL_USER")
MAIL_PASSWORD = os.getenv("EMAIL_PASS")
MAIL_FROM = MAIL_USERNAME

# ✅ EMAIL SENDER (FIXED)
def send_email_async(to: str, otp: str):
    try:
        msg = MIMEText(f"""
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h2>CallMyDriver OTP</h2>
            <h1 style="color: green;">{otp}</h1>
            <p>This OTP expires in 60 seconds</p>
          </body>
        </html>
        """, "html")

        msg["Subject"] = "OTP Verification"
        msg["From"] = MAIL_FROM
        msg["To"] = to

        server = smtplib.SMTP("smtp.gmail.com",587)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to, msg.as_string())
        server.quit()

        print(f"✅ OTP sent to {to}")

    except Exception as e:
        print(f"❌ Email failed: {e}")

# --- STORAGE ---
DB_FILE = "users_db.json"

def load_users():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(DB_FILE, "w") as f:
        json.dump(users, f)

# --- GLOBAL STATE ---
class GlobalState:
    def __init__(self):
        self.users_db = load_users()
        self.otp_store = {}
        self.otp_expiry = {}
        self.active_drivers = {
            "DRV-RAMESH": {"driver_name": "Ramesh Kumar", "lat": 12.9716, "lng": 77.5946}
        }
        self.all_bookings = {}

state = GlobalState()

# --- APP INIT ---
app = FastAPI(title="CallMyDriver")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class BookingRequest(BaseModel):
    user_id: str
    pickup_lat: float
    pickup_lng: float
    destination: str

# --- REGISTER ---
@app.post("/api/auth/register")
async def register(background_tasks: BackgroundTasks, data: RegisterRequest):
    print(f"🔄 Register attempt: {data.email}")
    
    #if data.email in state.users_db:
        #raise HTTPException(status_code=400, detail="Account already exists")
    
    # Save user
    state.users_db[data.email] = {
        "name": data.name,
        "phone": data.phone,
        "password": data.password,
    }
    save_users(state.users_db)
    
    # Generate OTP
    otp = str(random.randint(100000, 999999))
    state.otp_store[data.email] = otp
    state.otp_expiry[data.email] = time.time() + 60
    
    print(f"📱 OTP {otp} for {data.email}")
    
    # ✅ FIXED: Correct background task usage
    background_tasks.add_task(send_email_async, data.email, otp)
    
    return {
        "status": "success",
        "message": "Account created! Check email for OTP",
        "email": data.email
    }

# --- LOGIN ---
@app.post("/api/auth/login")
async def login(email: str = Query(...), password: str = Query(...)):
    user = state.users_db.get(email)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    return {"status": "success", "user_id": email}

# --- SEND OTP ---
@app.post("/api/auth/send-otp")
async def send_otp(
    phone: str = Query(...),
    background_tasks: BackgroundTasks = None
):
    if phone not in state.users_db:
        raise HTTPException(status_code=400, detail="User not found.")
    
    otp = str(random.randint(100000, 999999))
    state.otp_store[phone] = otp
    state.otp_expiry[phone] = time.time() + 60
    
    # ✅ FIXED
    background_tasks.add_task(send_email_async, phone, otp)

    return {"status": "success", "message": "OTP sent!"}

# --- VERIFY OTP ---
@app.post("/api/auth/verify-otp")
async def verify_otp(phone: str = Query(...), otp: str = Query(...)):
    if phone not in state.otp_store:
        raise HTTPException(status_code=400, detail="OTP not found.")
    
    if time.time() > state.otp_expiry.get(phone, 0):
        del state.otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired.")
    
    if state.otp_store[phone] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")
    
    del state.otp_store[phone]
    del state.otp_expiry[phone]

    return {"status": "success", "message": "Verified!"}

# --- BOOKING ---
@app.post("/api/bookings/book")
async def book_driver(req: BookingRequest):
    booking_id = f"BKG-{uuid.uuid4().hex[:6].upper()}"
    state.all_bookings[booking_id] = {
        "booking_id": booking_id,
        "driver_name": "Ramesh Kumar",
        "status": "ACCEPTED"
    }
    return state.all_bookings[booking_id]

# --- TRACKING ---
@app.websocket("/api/tracking/{booking_id}/{role}/{client_id}")
async def tracking_socket(websocket: WebSocket, booking_id: str, role: str, client_id: str):
    await websocket.accept()
    try:
        while True:
            await websocket.receive_json()
    except:
        pass
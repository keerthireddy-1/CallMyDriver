from src.controllers.auth_controller import register_user, login_user, send_otp, verify_otp
from src.database import get_db, engine
from src.models import Base
from sqlalchemy.orm import Session
from fastapi import Depends
from src.schemas import UserCreate
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uuid

from src.sockets import manager
from src.services.ai_engine import find_best_driver

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CallMyDriver - Backend Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class BookingRequest(BaseModel):
    user_id: str
    pickup_lat: float
    pickup_lng: float
    destination: str

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user)

@app.post("/api/auth/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    return login_user(db, email, password)

@app.post("/api/auth/send-otp")
def otp_send(phone: str):
    return send_otp(phone)

@app.post("/api/auth/verify-otp")
def otp_verify(phone: str, otp: str):
    return verify_otp(phone, otp)

# --- BOOKING ENDPOINTS ---
@app.post("/api/bookings/book")
async def book_driver(req: BookingRequest):
    match = find_best_driver(req.pickup_lat, req.pickup_lng, manager.active_drivers)
    if not match:
        raise HTTPException(status_code=404, detail="No online drivers found")

    booking_id = f"BKG-{uuid.uuid4().hex[:6].upper()}"
    manager.booking_statuses[booking_id] = "PENDING"
    manager.driver_to_booking[match["driver_id"]] = booking_id
    
    manager.all_bookings[booking_id] = {
        "booking_id": booking_id,
        "user_id": req.user_id,
        "driver_name": match["driver_name"],
        "status": "PENDING",
        "distance": match["distance_km"]
    }
    return manager.all_bookings[booking_id]

@app.get("/api/bookings")
async def get_bookings():
    return list(manager.all_bookings.values())

@app.post("/api/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str):
    if booking_id not in manager.all_bookings:
        raise HTTPException(status_code=404, detail="Booking not found")
    await manager.update_status(booking_id, "CANCELLED")
    return {"status": "success", "message": "Booking cancelled"}

# --- DRIVER/WEBSOCKET LOGIC ---
@app.post("/api/auth/driver-login")
async def driver_login(data: Dict[str, Any]):
    driver_id = f"DRV-{uuid.uuid4().hex[:4].upper()}"
    manager.active_drivers[driver_id] = {
        "driver_name": data.get("name", "Arjun"),
        "lat": data.get("lat", 0), "lng": data.get("lng", 0)
    }
    return {"driver_id": driver_id}

@app.websocket("/api/tracking/{booking_id}/{role}/{client_id}")
async def tracking_socket(websocket: WebSocket, booking_id: str, role: str, client_id: str):
    await manager.connect(websocket, booking_id, role)
    try:
        while True:
            data = await websocket.receive_json()
            if manager.booking_statuses.get(booking_id) == "ACCEPTED":
                if role == "driver":
                    manager.update_live_location(client_id, data)
                    await manager.broadcast_to_booking(booking_id, data)
    except: pass
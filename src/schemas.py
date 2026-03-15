from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional
from Backend.src.models import BookingStatus

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Booking Schemas ---
class BookingCreate(BaseModel):
    pickup_location: str
    destination: str
    vehicle_details: str

class BookingResponse(BaseModel):
    id: int
    booking_ref: str
    user_id: int             # Added this so the frontend can link bookings to users!
    pickup_location: str
    destination: str
    vehicle_details: str
    status: BookingStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
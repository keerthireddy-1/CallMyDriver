from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from src.schemas import BookingCreate, BookingResponse
from src.models import User
from src.deps import get_db, get_current_user
from src.controllers import booking_controller

router = APIRouter()

@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    booking_data: BookingCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return booking_controller.create_booking(db, booking_data, current_user)

@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return booking_controller.get_user_bookings(db, current_user)

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return booking_controller.cancel_booking(db, booking_id, current_user)

from sqlalchemy.orm import Session
from fastapi import HTTPException
from Backend.src.models import Booking, User, BookingStatus
from Backend.src.schemas import BookingCreate
import random

def create_booking(db: Session, booking_data: BookingCreate, user: User):
    booking_ref = f"BKG-{random.randint(10000, 99999)}"
    
    new_booking = Booking(
        booking_ref=booking_ref,
        user_id=user.id,
        pickup_location=booking_data.pickup_location,
        destination=booking_data.destination,
        vehicle_details=booking_data.vehicle_details
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

def get_user_bookings(db: Session, user: User):
    return db.query(Booking).filter(Booking.user_id == user.id).all()

def cancel_booking(db: Session, booking_id: int, user: User):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == user.id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.PENDING:
        raise HTTPException(status_code=400, detail="Cannot cancel an accepted or completed booking")
        
    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return booking
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from Backend.src.database import Base
import enum

class BookingStatus(str, enum.Enum):
    PENDING = "Searching for driver..."
    ACCEPTED = "Driver assigned"
    IN_PROGRESS = "Trip in progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    phone = Column(String, unique=True)
    
    bookings = relationship("Booking", back_populates="user")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pickup_location = Column(String)
    destination = Column(String)
    vehicle_details = Column(String)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
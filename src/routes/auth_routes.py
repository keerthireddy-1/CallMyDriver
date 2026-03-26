from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from Backend.src.schemas import UserCreate, UserResponse, Token
from Backend.src.deps import get_db
from Backend.src.controllers import auth_controller

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return auth_controller.register_user(db, user_data)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_controller.login_user(db, form_data.username, form_data.password)

@router.post("/send-otp")
def send_otp(phone: str, db: Session = Depends(get_db)):
    return auth_controller.send_otp(db, phone)

@router.post("/verify-otp")
def verify_otp(phone: str, otp: str, db: Session = Depends(get_db)):
    return auth_controller.verify_otp(db, phone, otp)
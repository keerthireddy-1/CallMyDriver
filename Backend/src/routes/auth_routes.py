from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.schemas import UserCreate, UserResponse, Token
from src.deps import get_db
from src.controllers import auth_controller

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return auth_controller.register_user(db, user_data)

# Note: OAuth2 expects form-data for login, not raw JSON
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return auth_controller.login_user(db, form_data.username, form_data.password)
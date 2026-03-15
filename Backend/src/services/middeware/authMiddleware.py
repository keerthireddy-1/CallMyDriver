from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.services.authService import decode_token
from jose import JWTError

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = decode_token(token)
        return payload  # contains user id and role
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired token.")

def require_role(*roles):
    def role_checker(payload: dict = Depends(verify_token)):
        if payload.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Access denied. Insufficient permissions.")
        return payload
    return role_checker
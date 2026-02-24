import os
from typing import Optional
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, Header
from pydantic import BaseModel

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"  # Supabase default


class User(BaseModel):
    id: str
    email: Optional[str] = None


def decode_token(authorization: str) -> User | None:
    """Return User object or None if dummy or unconfigured."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    if not SUPABASE_JWT_SECRET:
        if token == "dummy":
            return User(id="guest", email="guest@local")
        return User(id=token)
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return User(id=user_id, email=email)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    user = decode_token(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

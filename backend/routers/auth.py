import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..services.supabase_client import supabase

# limiter instance imported from main if needed, but create a local reference
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])


class SessionResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_token: str
    token_type: str
    user: dict


@router.post("/guest", response_model=SessionResponse)
@limiter.limit("10/minute")
async def guest(request: Request):
    """Sign in using a server-side guest account and return the Supabase session.
    Rate limited to 10 requests per IP per minute.
    """
    email = os.getenv("GUEST_EMAIL")
    password = os.getenv("GUEST_PASSWORD")
    # do not leak email/password; response contains only session data
    if not email or not password:
        # create a minimal guest session
        session = {"access_token": "dummy", "user": {"id": "guest", "email": "guest@local"}}
        return session
    data = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if data.get("error"):
        raise HTTPException(status_code=400, detail=data["error"]["message"])
    session = data.get("data", {}).get("session")
    if not session:
        raise HTTPException(status_code=500, detail="Failed to obtain session")
    return session

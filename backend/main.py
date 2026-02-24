import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List

from .routers import auth, workouts, ai
from .services import auth as auth_service

# structured logger
logger = logging.getLogger("fittrack")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

# rate limiter (slowapi)
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# enforce max request size
class ContentSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_length: int):
        super().__init__(app)
        self.max_length = max_length

    async def dispatch(self, request: Request, call_next):
        cl = request.headers.get("content-length")
        if cl and int(cl) > self.max_length:
            return Response("Request payload too large", status_code=413)
        return await call_next(request)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # validate required env vars
    required = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY",
        "SUPABASE_JWT_SECRET",
        "FRONTEND_URL",
    ]
    missing: List[str] = []
    for var in required:
        if not os.getenv(var):
            missing.append(var)
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")
    # configure logging of requests
    yield

app = FastAPI(lifespan=lifespan)
# attach limiter object to app state
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, lambda request, exc: Response("Too many requests", status_code=429))
app.add_middleware(CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.add_middleware(ContentSizeLimitMiddleware, max_length=1_000_000)

# request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    user_id = None
    try:
        auth_header = request.headers.get("authorization")
        if auth_header:
            user = auth_service.decode_token(auth_header)  # new util
            user_id = getattr(user, "id", None)
    except Exception:
        pass
    response = await call_next(request)
    logger.info(f"{request.method} {request.url.path} user={user_id} status={response.status_code}")
    return response

app.include_router(auth.router)
app.include_router(workouts.router)
app.include_router(ai.router)

@app.get("/", tags=["health"])
def root():
    return {"message": "FitTrack Pro backend is running"}

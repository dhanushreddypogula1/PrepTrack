from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from backend.schemas import UserCreate, UserOut, Token, UserLogin
from src.auth import register_user, login_user, get_user_by_id

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"])
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/token")
SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
ALGO   = "HS256"
EXP    = 60 * 24 * 7  # 7 days

def make_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=EXP)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET, algorithm=ALGO)

async def current_user(token: str = Depends(oauth2)) -> dict:
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        user = get_user_by_id(int(payload["sub"]))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/register", response_model=Token)
def register(body: UserCreate):
    res = register_user(body.username, body.email, body.password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    user = get_user_by_id(res["user_id"])
    return Token(access_token=make_token(user["user_id"]), user=UserOut(**user, id=user["user_id"]))

@router.post("/token", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    res = login_user(form.username, form.password)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["message"])
    user = get_user_by_id(res["user_id"])
    return Token(access_token=make_token(user["user_id"]), user=UserOut(**user, id=user["user_id"]))

@router.post("/login", response_model=Token)
def login_json(body: UserLogin):
    res = login_user(body.username, body.password)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["message"])
    user = get_user_by_id(res["user_id"])
    return Token(access_token=make_token(user["user_id"]), user=UserOut(**user, id=user["user_id"]))

@router.get("/me", response_model=UserOut)
def me(user=Depends(current_user)):
    return UserOut(id=user["user_id"], username=user["username"], email=user["email"])

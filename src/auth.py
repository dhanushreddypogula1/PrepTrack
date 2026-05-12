"""
src/auth.py
User registration, login, and lookup.
Returns plain dicts (not ORM objects) so routers can serialize easily.
"""
import re
from passlib.context import CryptContext
from src.database import get_session, User

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def _hash_password(password: str) -> str:
    return pwd_ctx.hash(password)


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_ctx.verify(password, password_hash)
    except Exception:
        return False


def _user_to_dict(u: User) -> dict:
    return {
        "user_id": u.id,
        "username": u.username,
        "email": u.email,
        "avatar_url": u.avatar_url,
    }


def register_user(username: str, email: str, password: str) -> dict:
    """Create a new user. Returns {'success': bool, 'user_id'?: int, 'message'?: str}."""
    username = (username or "").strip()
    email = (email or "").strip().lower()

    # ── Validation ────────────────────────────────────────────────────
    if len(username) < 3:
        return {"success": False, "message": "Username must be at least 3 characters"}
    if len(username) > 50:
        return {"success": False, "message": "Username too long (max 50)"}
    if not EMAIL_RE.match(email):
        return {"success": False, "message": "Invalid email address"}
    if len(password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters"}

    db = get_session()
    try:
        # ── Uniqueness checks ─────────────────────────────────────────
        if db.query(User).filter(User.username == username).first():
            return {"success": False, "message": "Username already taken"}
        if db.query(User).filter(User.email == email).first():
            return {"success": False, "message": "Email already registered"}

        # ── Create ────────────────────────────────────────────────────
        user = User(
            username=username,
            email=email,
            password_hash=_hash_password(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"success": True, "user_id": user.id, "message": "Registered"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Registration failed: {str(e)}"}
    finally:
        db.close()


def login_user(username_or_email: str, password: str) -> dict:
    """Authenticate by username OR email. Returns {'success': bool, 'user_id'?, 'message'?}."""
    identifier = (username_or_email or "").strip()
    if not identifier or not password:
        return {"success": False, "message": "Username and password required"}

    db = get_session()
    try:
        user = (
            db.query(User)
            .filter((User.username == identifier) | (User.email == identifier.lower()))
            .first()
        )
        if not user:
            return {"success": False, "message": "Invalid credentials"}
        if not _verify_password(password, user.password_hash):
            return {"success": False, "message": "Invalid credentials"}
        return {"success": True, "user_id": user.id, "message": "Login successful"}
    finally:
        db.close()


def get_user_by_id(user_id: int) -> dict | None:
    """Lookup user by id. Returns dict or None."""
    db = get_session()
    try:
        u = db.query(User).filter(User.id == user_id).first()
        return _user_to_dict(u) if u else None
    finally:
        db.close()


def get_user_by_username(username: str) -> dict | None:
    db = get_session()
    try:
        u = db.query(User).filter(User.username == username).first()
        return _user_to_dict(u) if u else None
    finally:
        db.close()


def change_password(user_id: int, old_password: str, new_password: str) -> dict:
    """Change a user's password (used by /settings page)."""
    if len(new_password) < 6:
        return {"success": False, "message": "New password must be at least 6 characters"}

    db = get_session()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}
        if not _verify_password(old_password, user.password_hash):
            return {"success": False, "message": "Old password is incorrect"}
        user.password_hash = _hash_password(new_password)
        db.commit()
        return {"success": True, "message": "Password updated"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Update failed: {str(e)}"}
    finally:
        db.close()
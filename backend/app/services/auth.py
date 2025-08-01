from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
import hashlib
import base64
import time
import secrets
import string
from bson import ObjectId
from app.config.settings import settings
from app.models.auth import TokenData, AdminUser, AdminUserCreate, PasswordResetCode
from app.services.database import get_database
from app.services.email import email_service

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password_with_salt(password: str) -> str:
    """Hash password with app salt using SHA256"""
    salted_password = password + settings.APP_SALT
    return hashlib.sha256(salted_password.encode()).hexdigest()

def decrypt_auth_hash(encrypted_data: str) -> dict:
    """Decrypt the authentication hash from frontend - DEPRECATED: Use login-plain instead"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Use /auth/login-plain endpoint instead"
    )

# Database operations for admin users

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_admin_by_username(username: str) -> Optional[AdminUser]:
    """Get admin user by username from database (case-insensitive)"""
    db = get_database()
    # Use regex for case-insensitive matching
    admin_doc = await db.admin_users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})
    if admin_doc:
        admin_doc["id"] = str(admin_doc["_id"])
        del admin_doc["_id"]
        return AdminUser(**admin_doc)
    return None

async def get_admin_by_email(email: str) -> Optional[AdminUser]:
    """Get admin user by email from database"""
    db = get_database()
    admin_doc = await db.admin_users.find_one({"email": email})
    if admin_doc:
        admin_doc["id"] = str(admin_doc["_id"])
        del admin_doc["_id"]
        return AdminUser(**admin_doc)
    return None

async def create_admin_user(admin_create: AdminUserCreate) -> AdminUser:
    """Create new admin user in database"""
    db = get_database()
    
    # Check if username or email already exists (case-insensitive for username)
    existing_username = await db.admin_users.find_one({"username": {"$regex": f"^{admin_create.username}$", "$options": "i"}})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    existing_email = await db.admin_users.find_one({"email": admin_create.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Check if password is already hashed (64 char hex string)
    is_pre_hashed = len(admin_create.password) == 64 and all(c in '0123456789abcdef' for c in admin_create.password.lower())
    
    # Create admin document - use only password field for consistency
    admin_doc = {
        "username": admin_create.username,
        "email": admin_create.email,
        "password": admin_create.password if is_pre_hashed else hash_password_with_salt(admin_create.password),
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    result = await db.admin_users.insert_one(admin_doc)
    admin_doc["id"] = str(result.inserted_id)
    del admin_doc["_id"]
    
    return AdminUser(**admin_doc)

async def authenticate_admin_password(username: str, hashed_password: str) -> Optional[AdminUser]:
    """Authenticate admin with salt-hashed password from frontend"""
    admin = await get_admin_by_username(username)
    if not admin or not admin.is_active:
        return None
    
    # Get the stored hash from database (case-insensitive)
    db = get_database()
    admin_doc = await db.admin_users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})
    
    if admin_doc and "password" in admin_doc:
        stored_hash = admin_doc["password"]
        
        # Direct comparison of hashed passwords
        if hashed_password == stored_hash:
            return admin
    
    return None

async def authenticate_admin(username: str, hashed_password: str) -> Optional[AdminUser]:
    """Authenticate admin with hashed password (legacy method for backward compatibility)"""
    admin = await get_admin_by_username(username)
    if not admin or not admin.is_active:
        return None
    
    # For backward compatibility, try both SHA256 hash with salt and direct comparison
    if hashed_password == hash_password_with_salt("secret") and admin.username == "admin":
        # Legacy hardcoded admin - allow but should be updated
        return admin
    elif hashed_password == admin.password:
        # Direct hash comparison
        return admin
    
    return None

async def authenticate_admin_with_hash(encrypted_data: str) -> Optional[AdminUser]:
    """Authenticate admin using encrypted hash from frontend"""
    try:
        auth_data = decrypt_auth_hash(encrypted_data)
        return await authenticate_admin(auth_data["username"], auth_data["hashed_password"])
    except:
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.FASTAPI_SECRET_KEY, algorithm=settings.FASTAPI_ALGORITHM)
    return encoded_jwt

async def get_current_admin(token: str = Depends(security)) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, settings.FASTAPI_SECRET_KEY, algorithms=[settings.FASTAPI_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    admin = await get_admin_by_username(token_data.username)
    if admin is None or not admin.is_active:
        raise credentials_exception
    return admin

# Password Reset Functionality

def generate_reset_code() -> str:
    """Generate a 6-digit numeric code for password reset"""
    return ''.join(secrets.choice(string.digits) for _ in range(6))

async def create_password_reset_code(email: str) -> Optional[str]:
    """Create a password reset code for the given email"""
    db = get_database()
    
    # Check if admin with email exists
    admin = await get_admin_by_email(email)
    if not admin:
        return None
    
    # Check rate limiting - only allow 3 attempts per hour
    one_hour_ago = datetime.now() - timedelta(hours=1)
    recent_attempts = await db.password_reset_codes.count_documents({
        "email": email,
        "created_at": {"$gte": one_hour_ago}
    })
    
    if recent_attempts >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset attempts. Please wait an hour before trying again."
        )
    
    # Generate reset code
    code = generate_reset_code()
    expires_at = datetime.now() + timedelta(minutes=20)
    
    # Store reset code
    reset_doc = {
        "email": email,
        "code": code,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now()
    }
    
    await db.password_reset_codes.insert_one(reset_doc)
    
    # Send email
    try:
        await email_service.send_password_reset_code(email, code)
        return code
    except Exception as e:
        # If email fails, we still return None to not reveal if email exists
        return None

async def verify_reset_code(email: str, code: str) -> bool:
    """Verify a password reset code"""
    db = get_database()
    
    # Find valid, unused code
    reset_doc = await db.password_reset_codes.find_one({
        "email": email,
        "code": code,
        "used": False,
        "expires_at": {"$gte": datetime.now()}
    })
    
    return reset_doc is not None

async def reset_password_with_code(email: str, code: str, new_password: str) -> bool:
    """Reset password using the verification code"""
    db = get_database()
    
    # Check rate limiting for reset attempts - only allow 5 attempts per 10 minutes
    ten_minutes_ago = datetime.now() - timedelta(minutes=10)
    recent_reset_attempts = await db.password_reset_attempts.count_documents({
        "email": email,
        "attempted_at": {"$gte": ten_minutes_ago}
    })
    
    if recent_reset_attempts >= 5:
        # Log the attempt
        await db.password_reset_attempts.insert_one({
            "email": email,
            "attempted_at": datetime.now(),
            "success": False
        })
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many reset attempts. Please wait 10 minutes before trying again."
        )
    
    # Find and verify the code
    reset_doc = await db.password_reset_codes.find_one({
        "email": email,
        "code": code,
        "used": False,
        "expires_at": {"$gte": datetime.now()}
    })
    
    if not reset_doc:
        # Log failed attempt
        await db.password_reset_attempts.insert_one({
            "email": email,
            "attempted_at": datetime.now(),
            "success": False
        })
        return False
    
    # Update admin password
    new_hashed_password = hash_password_with_salt(new_password)
    result = await db.admin_users.update_one(
        {"email": email},
        {
            "$set": {
                "password": new_hashed_password,
                "updated_at": datetime.now()
            }
        }
    )
    
    if result.modified_count == 0:
        # Log failed attempt
        await db.password_reset_attempts.insert_one({
            "email": email,
            "attempted_at": datetime.now(),
            "success": False
        })
        return False
    
    # Mark reset code as used
    await db.password_reset_codes.update_one(
        {"_id": reset_doc["_id"]},
        {"$set": {"used": True}}
    )
    
    # Log successful attempt
    await db.password_reset_attempts.insert_one({
        "email": email,
        "attempted_at": datetime.now(),
        "success": True
    })
    
    return True

async def cleanup_expired_reset_codes():
    """Clean up expired password reset codes (call this periodically)"""
    db = get_database()
    await db.password_reset_codes.delete_many({
        "expires_at": {"$lt": datetime.now()}
    })
    
    # Also clean up old reset attempts (older than 24 hours)
    twenty_four_hours_ago = datetime.now() - timedelta(hours=24)
    await db.password_reset_attempts.delete_many({
        "attempted_at": {"$lt": twenty_four_hours_ago}
    })
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminLoginSecure(BaseModel):
    auth_hash: str

class AdminUser(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    password: str
    is_active: bool = True
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class AdminCreationRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str
    admin_password: str

class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str

class PasswordResetCode(BaseModel):
    id: Optional[str] = None
    email: str
    code: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = datetime.now()
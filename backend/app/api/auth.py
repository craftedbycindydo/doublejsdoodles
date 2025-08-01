from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.models.auth import (
    AdminLogin, AdminLoginSecure, Token, AdminUser, AdminUserCreate, 
    PasswordResetRequest, PasswordResetConfirm, AdminCreationRequest
)
from app.services.auth import (
    create_access_token, get_current_admin,
    create_admin_user, create_password_reset_code, reset_password_with_code,
    authenticate_admin_password, authenticate_admin_with_hash
)
from app.middleware.security import track_failed_login, is_login_blocked, verify_request_integrity
from app.config.settings import settings
from app.services.auth import hash_password_with_salt

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=Token)
async def login(admin_login: AdminLogin, request: Request):
    """Login endpoint using hashed password"""
    # Get client IP for security tracking
    client_ip = request.client.host if request.client else "unknown"
    
    # Check if IP is temporarily blocked
    if await is_login_blocked(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
        )
    
    try:
        admin = await authenticate_admin_password(admin_login.username, admin_login.password)
        if not admin:
            await track_failed_login(client_ip)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Successful authentication - create token
        access_token_expires = timedelta(minutes=settings.FASTAPI_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": admin.username,
                "ip": client_ip,
                "type": "admin_access"
            }, 
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception:
        await track_failed_login(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=AdminUser)
async def read_admin_me(current_admin: AdminUser = Depends(get_current_admin)):
    return current_admin

# Password Reset Endpoints

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Request password reset code via email"""
    try:
        code = await create_password_reset_code(request.email)
        # Always return success to prevent email enumeration
        return {"message": "If an account with this email exists, a reset code has been sent."}
    except HTTPException:
        # If rate limited, re-raise the exception
        raise
    except Exception:
        # For any other error, return generic message
        return {"message": "If an account with this email exists, a reset code has been sent."}

@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password using verification code"""
    try:
        success = await reset_password_with_code(
            request.email, 
            request.reset_code, 
            request.new_password
        )
        
        if success:
            return {"message": "Password reset successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset code"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )

# Admin Management Endpoints (requires existing admin)

@router.post("/admin/create", response_model=AdminUser)
async def create_new_admin(
    admin_create: AdminUserCreate, 
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Create new admin user (requires existing admin authentication)"""
    try:
        new_admin = await create_admin_user(admin_create)
        return new_admin
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create admin user"
        )

# Public Admin Creation Endpoint (with admin password verification)

@router.post("/admin/create-account", response_model=AdminUser)
async def create_admin_account(request: AdminCreationRequest):
    """Create new admin account with admin password verification (public endpoint)"""
    
    # Verify admin password matches environment variable (both are now hashed)
    expected_admin_hash = hash_password_with_salt(settings.ADMIN_CREATION_PASSWORD)
    if request.admin_password != expected_admin_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin creation password"
        )
    
    # Verify password confirmation (both are hashed)
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirmation password do not match"
        )
    
    # Note: Password strength validation is not applicable for hashed passwords
    # Frontend should validate before hashing
    
    try:
        # Use the username provided by the user
        username = request.username
        
        # Create admin user - store the hashed password directly since it's already hashed
        admin_create = AdminUserCreate(
            username=username,
            email=request.email,
            password=request.password  # This is already hashed from frontend
        )
        
        new_admin = await create_admin_user(admin_create)
        return new_admin
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create admin account"
        )
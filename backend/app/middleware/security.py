from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import time
import hashlib
from collections import defaultdict
from app.config.settings import settings

# Rate limiting storage (in production, use Redis)
request_counts = defaultdict(list)
failed_login_attempts = defaultdict(list)

class SecurityMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)
            
            # Get client IP
            client_ip = self.get_client_ip(request)
            
            # Rate limiting
            if await self.is_rate_limited(client_ip, request.url.path):
                response = JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
                await response(scope, receive, send)
                return
            
            # Track request
            await self.track_request(client_ip, request.url.path)
        
        await self.app(scope, receive, send)
    
    def get_client_ip(self, request: Request) -> str:
        # Handle various proxy headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def is_rate_limited(self, client_ip: str, path: str) -> bool:
        current_time = time.time()
        
        # Different limits for different endpoints
        if "/auth/login" in path:
            # Strict rate limiting for login attempts
            window = 300  # 5 minutes
            max_requests = 5
        elif path.startswith("/admin") or any(method in path for method in ["/litters", "/contact"]):
            # Moderate rate limiting for admin endpoints
            window = 60  # 1 minute
            max_requests = 30
        else:
            # Generous rate limiting for public endpoints
            window = 60  # 1 minute  
            max_requests = 100
        
        # Clean old requests
        request_times = request_counts[client_ip]
        request_counts[client_ip] = [
            req_time for req_time in request_times 
            if current_time - req_time < window
        ]
        
        # Check if limit exceeded
        return len(request_counts[client_ip]) >= max_requests
    
    async def track_request(self, client_ip: str, path: str):
        current_time = time.time()
        request_counts[client_ip].append(current_time)

async def track_failed_login(client_ip: str):
    """Track failed login attempts for additional security"""
    current_time = time.time()
    
    # Clean old attempts (last hour)
    failed_attempts = failed_login_attempts[client_ip]
    failed_login_attempts[client_ip] = [
        attempt_time for attempt_time in failed_attempts
        if current_time - attempt_time < 3600  # 1 hour
    ]
    
    # Add new failed attempt
    failed_login_attempts[client_ip].append(current_time)

async def is_login_blocked(client_ip: str) -> bool:
    """Check if IP is temporarily blocked due to failed login attempts"""
    current_time = time.time()
    
    # Clean old attempts
    failed_attempts = failed_login_attempts[client_ip]
    recent_failures = [
        attempt_time for attempt_time in failed_attempts
        if current_time - attempt_time < 900  # 15 minutes
    ]
    
    # Block if more than 10 failed attempts in 15 minutes
    return len(recent_failures) >= 10

def verify_request_integrity(request_data: dict, expected_fields: list) -> bool:
    """Verify request has all expected fields and no suspicious content"""
    # Check required fields
    for field in expected_fields:
        if field not in request_data:
            return False
    
    # Check for suspicious patterns (basic XSS/injection detection)
    suspicious_patterns = [
        '<script', 'javascript:', 'onload=', 'onerror=',
        'SELECT * FROM', 'DROP TABLE', 'INSERT INTO', 'DELETE FROM',
        '../', '/etc/passwd', 'cmd.exe', 'powershell'
    ]
    
    for field_value in request_data.values():
        if isinstance(field_value, str):
            for pattern in suspicious_patterns:
                if pattern.lower() in field_value.lower():
                    return False
    
    return True

def generate_csrf_token(session_data: str) -> str:
    """Generate CSRF token for forms"""
    current_time = str(int(time.time()))
    token_data = f"{session_data}:{current_time}:{settings.FASTAPI_SECRET_KEY}"
    return hashlib.sha256(token_data.encode()).hexdigest()

def verify_csrf_token(token: str, session_data: str, max_age: int = 3600) -> bool:
    """Verify CSRF token is valid and not expired"""
    try:
        # Extract timestamp from when token might have been generated
        current_time = int(time.time())
        
        # Try last hour of possible generation times
        for past_time in range(current_time - max_age, current_time + 1):
            expected_token_data = f"{session_data}:{past_time}:{settings.FASTAPI_SECRET_KEY}"
            expected_token = hashlib.sha256(expected_token_data.encode()).hexdigest()
            
            if token == expected_token:
                return True
        
        return False
    except:
        return False
from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Database Configuration
    MONGODB_CONNECTION_STRING: str
    MONGODB_DATABASE_NAME: str
    
    # FastAPI Configuration
    FASTAPI_SECRET_KEY: str
    FASTAPI_ALGORITHM: str
    FASTAPI_ACCESS_TOKEN_EXPIRE_MINUTES: int
    FASTAPI_CORS_ORIGINS: str
    
    # Cloudflare R2 Configuration
    CLOUDFLARE_R2_BUCKET_NAME: Optional[str] = None
    CLOUDFLARE_R2_ACCESS_KEY_ID: Optional[str] = None
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: Optional[str] = None
    CLOUDFLARE_R2_ENDPOINT_URL: Optional[str] = None
    CLOUDFLARE_R2_REGION: Optional[str] = None
    CLOUDFLARE_R2_PUBLIC_URL: Optional[str] = None
    
    # Email SMTP Configuration
    EMAIL_SMTP_HOST: Optional[str] = None
    EMAIL_SMTP_PORT: Optional[int] = None
    EMAIL_SMTP_USERNAME: Optional[str] = None
    EMAIL_SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM_ADDRESS: Optional[str] = None
    EMAIL_FROM_NAME: Optional[str] = None
    
    # Cloudflare Configuration
    CLOUDFLARE_API_TOKEN: Optional[str] = None
    CLOUDFLARE_ZONE_ID: Optional[str] = None
    CLOUDFLARE_ACCOUNT_ID: Optional[str] = None
    
    # Application Configuration
    APP_ENVIRONMENT: str
    APP_DEBUG: bool
    APP_SALT: str
    ADMIN_CREATION_PASSWORD: str
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.FASTAPI_CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"

settings = Settings()
import boto3
from botocore.exceptions import ClientError
from app.config.settings import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class CloudflareR2Service:
    def __init__(self):
        self.s3_client = None
        if settings.CLOUDFLARE_R2_ACCESS_KEY_ID and settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=settings.CLOUDFLARE_R2_ENDPOINT_URL,
                aws_access_key_id=settings.CLOUDFLARE_R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
                region_name=settings.CLOUDFLARE_R2_REGION,
            )
    
    async def upload_file(self, file_content: bytes, file_name: str, content_type: str) -> Optional[str]:
        """Upload file to Cloudflare R2 and return public URL"""
        if not self.s3_client:
            logger.warning("Cloudflare R2 not configured")
            return None
            
        try:
            self.s3_client.put_object(
                Bucket=settings.CLOUDFLARE_R2_BUCKET_NAME,
                Key=file_name,
                Body=file_content,
                ContentType=content_type
            )
            
            # Return public URL using env variable
            if settings.CLOUDFLARE_R2_PUBLIC_URL:
                public_url = f"{settings.CLOUDFLARE_R2_PUBLIC_URL}/{file_name}"
            else:
                public_url = f"https://pub-{settings.CLOUDFLARE_R2_BUCKET_NAME}.r2.dev/{file_name}"
            return public_url
            
        except ClientError as e:
            logger.error(f"Error uploading to R2: {e}")
            return None
    
    async def delete_file(self, file_name: str) -> bool:
        """Delete file from Cloudflare R2"""
        if not self.s3_client:
            return False
            
        try:
            self.s3_client.delete_object(
                Bucket=settings.CLOUDFLARE_R2_BUCKET_NAME,
                Key=file_name
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting from R2: {e}")
            return False

r2_service = CloudflareR2Service()
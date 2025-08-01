from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    client: AsyncIOMotorClient = None
    database = None

db_service = DatabaseService()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db_service.client = AsyncIOMotorClient(settings.MONGODB_CONNECTION_STRING)
        db_service.database = db_service.client[settings.MONGODB_DATABASE_NAME]
        logger.info("Connected to MongoDB")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")

async def close_mongo_connection():
    """Close database connection"""
    if db_service.client:
        db_service.client.close()
        logger.info("Disconnected from MongoDB")

def get_database():
    return db_service.database
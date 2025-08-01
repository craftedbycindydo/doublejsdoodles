from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, litters, contact, puppies, homepage
from app.services.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings

app = FastAPI(title="Double JS Doodles API", version="1.0.0")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(litters.router)
app.include_router(puppies.router)
app.include_router(contact.router)
app.include_router(homepage.router)

@app.get("/")
async def root():
    return {"message": "Double JS Doodles API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
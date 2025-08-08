from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from app.api import auth, litters, contact, puppies, homepage, seo
from app.services.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
import os

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

# Include API routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(litters.router, prefix="/api")
app.include_router(puppies.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(seo.router, prefix="/api")
app.include_router(homepage.router, prefix="/api")

# Health check endpoint for Railway
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Double JS Doodles API is running"}

# Serve static files (React build)
static_dir = Path("./static")
if static_dir.exists():
    # React builds create a 'static' subdirectory with CSS/JS assets
    react_static_dir = static_dir / "static"
    if react_static_dir.exists():
        app.mount("/static", StaticFiles(directory=react_static_dir), name="static")
    else:
        # Fallback: serve directly from static if no nested static dir
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    # Serve React app for all non-API routes
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # If it's an API route, let FastAPI handle it
        if full_path.startswith("api/"):
            return {"error": "API endpoint not found"}
        
        # For React Router - serve index.html for any non-API route
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        else:
            return {"error": "Frontend not built", "message": "Static files not found"}
else:
    # Fallback when static files don't exist
    @app.get("/")
    async def root():
        return {"message": "Double JS Doodles API is running", "note": "Frontend static files not found"}
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from app.models.litter import Puppy, PuppyCreate, PuppyUpdate, PuppyStatus
from app.models.auth import AdminUser
from app.services.auth import get_current_admin
from app.services.database import get_database
from app.services.cloudflare_r2 import r2_service
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/puppies", tags=["puppies"])

def serialize_puppy_with_litter(puppy_doc, litter_doc) -> dict:
    """Convert puppy document to dict with litter information"""
    puppy_data = puppy_doc.copy()
    puppy_data["litter"] = {
        "id": str(litter_doc["_id"]),
        "name": litter_doc["name"],
        "breed": litter_doc["breed"],
        "generation": litter_doc["generation"]
    }
    return puppy_data

@router.get("/", response_model=List[dict])
async def get_all_puppies(
    status: Optional[PuppyStatus] = None,
    litter_id: Optional[str] = None,
    limit: int = 50
):
    """Get all puppies with optional filtering by status or litter"""
    db = get_database()
    
    # Build match criteria
    match_criteria = {}
    if litter_id:
        match_criteria["_id"] = ObjectId(litter_id)
    
    # Aggregation pipeline to flatten puppies from all litters
    pipeline = [
        {"$match": match_criteria},
        {"$unwind": "$puppies"},
        {"$replaceRoot": {
            "newRoot": {
                "$mergeObjects": [
                    "$puppies",
                    {
                        "litter": {
                            "id": {"$toString": "$_id"},
                            "name": "$name",
                            "breed": "$breed",
                            "generation": "$generation"
                        }
                    }
                ]
            }
        }}
    ]
    
    # Add status filter if provided
    if status:
        pipeline.append({"$match": {"status": status}})
    
    # Add limit
    pipeline.append({"$limit": limit})
    
    cursor = db.litters.aggregate(pipeline)
    puppies = []
    async for puppy_doc in cursor:
        puppies.append(puppy_doc)
    
    return puppies

@router.get("/available", response_model=List[dict])
async def get_available_puppies():
    """Get all available puppies"""
    return await get_all_puppies(status=PuppyStatus.AVAILABLE)

@router.get("/{puppy_id}", response_model=dict)
async def get_puppy(puppy_id: str):
    """Get specific puppy by ID across all litters"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Find the specific puppy
    puppy = next((p for p in litter_doc["puppies"] if p["id"] == puppy_id), None)
    if not puppy:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    return serialize_puppy_with_litter(puppy, litter_doc)

@router.put("/{puppy_id}", response_model=dict)
async def update_puppy(
    puppy_id: str, 
    puppy_update: PuppyUpdate, 
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update puppy across any litter"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Prepare update data
    update_data = {k: v for k, v in puppy_update.dict(exclude_unset=True).items() if v is not None}
    
    # Create update query for nested puppy
    update_query = {}
    for key, value in update_data.items():
        update_query[f"puppies.$.{key}"] = value
    
    # Update puppy
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$set": update_query}
    )
    
    # Return updated puppy
    updated_litter = await db.litters.find_one({"_id": litter_doc["_id"]})
    updated_puppy = next((p for p in updated_litter["puppies"] if p["id"] == puppy_id), None)
    
    return serialize_puppy_with_litter(updated_puppy, updated_litter)

@router.post("/{puppy_id}/images")
async def upload_puppy_image(
    puppy_id: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload image for a specific puppy"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"puppies/{puppy_id}/{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    image_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Add image URL to puppy's images array
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$push": {"puppies.$.images": image_url}}
    )
    
    return {"image_url": image_url, "message": "Image uploaded successfully"}

@router.delete("/{puppy_id}/images/{image_index}")
async def delete_puppy_image(
    puppy_id: str,
    image_index: int,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete specific image from puppy's images array"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Find the puppy and validate image index
    puppy = next((p for p in litter_doc["puppies"] if p["id"] == puppy_id), None)
    if not puppy or image_index >= len(puppy["images"]) or image_index < 0:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Get the image URL to delete from R2
    image_url = puppy["images"][image_index]
    
    # Extract filename from URL for R2 deletion
    if "/puppies/" in image_url:
        filename = image_url.split("/")[-2:]  # Get last two parts: puppy_id/filename
        filename = f"puppies/{'/'.join(filename)}"
        await r2_service.delete_file(filename)
    
    # Remove image from array using $unset and $pull
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$unset": {f"puppies.$.images.{image_index}": 1}}
    )
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$pull": {"puppies.$.images": None}}
    )
    
    return {"message": "Image deleted successfully"}

@router.post("/{puppy_id}/videos")
async def upload_puppy_video(
    puppy_id: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload video for a specific puppy"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Validate file type
    allowed_types = ["video/mp4", "video/webm", "video/avi", "video/mov"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only MP4, WebM, AVI, and MOV videos are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"puppies/{puppy_id}/videos/{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    video_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not video_url:
        raise HTTPException(status_code=500, detail="Failed to upload video")
    
    # Add video URL to puppy's videos array
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$push": {"puppies.$.videos": video_url}}
    )
    
    return {"video_url": video_url, "message": "Video uploaded successfully"}

@router.patch("/{puppy_id}/status")
async def update_puppy_status(
    puppy_id: str,
    status: PuppyStatus,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update puppy status (available, reserved, sold)"""
    db = get_database()
    
    # Find the litter containing this puppy
    litter_doc = await db.litters.find_one({"puppies.id": puppy_id})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    # Update puppy status
    await db.litters.update_one(
        {"_id": litter_doc["_id"], "puppies.id": puppy_id},
        {"$set": {"puppies.$.status": status}}
    )
    
    return {"message": f"Puppy status updated to {status}"} 
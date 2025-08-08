from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
from bson import ObjectId
from app.models.litter import Litter, LitterCreate, LitterUpdate, Puppy, PuppyCreate, PuppyUpdate
from app.models.auth import AdminUser
from app.services.auth import get_current_admin
from app.services.database import get_database
from app.services.cloudflare_r2 import r2_service
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/litters", tags=["litters"])

def serialize_litter(litter_doc) -> dict:
    """Convert MongoDB document to dict with proper ID handling"""
    if litter_doc:
        litter_doc["id"] = str(litter_doc["_id"])
        del litter_doc["_id"]
        # Convert ObjectId in puppies if any
        for puppy in litter_doc.get("puppies", []):
            if "_id" in puppy:
                puppy["id"] = str(puppy["_id"])
                del puppy["_id"]
    return litter_doc

@router.get("/", response_model=List[Litter])
async def get_all_litters():
    """Get all litters (public endpoint)"""
    db = get_database()
    litters_cursor = db.litters.find()
    litters = []
    async for litter_doc in litters_cursor:
        litters.append(serialize_litter(litter_doc))
    return litters

@router.get("/current", response_model=List[Litter])
async def get_current_litters():
    """Get only current litters (public endpoint)"""
    db = get_database()
    litters_cursor = db.litters.find({"is_current": True})
    litters = []
    async for litter_doc in litters_cursor:
        litters.append(serialize_litter(litter_doc))
    return litters

@router.get("/{litter_id}", response_model=Litter)
async def get_litter(litter_id: str):
    """Get specific litter by ID (public endpoint)"""
    db = get_database()
    litter_doc = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not litter_doc:
        raise HTTPException(status_code=404, detail="Litter not found")
    return serialize_litter(litter_doc)

@router.get("/check-active")
async def check_active_litter():
    """Check if an active litter exists (public endpoint)"""
    db = get_database()
    existing_current = await db.litters.find_one({"is_current": True})
    if existing_current:
        return {
            "has_active_litter": True,
            "active_litter": {
                "id": str(existing_current["_id"]),
                "name": existing_current["name"]
            }
        }
    return {"has_active_litter": False}

@router.post("/make-active/{litter_id}")
async def make_litter_active(litter_id: str, force: bool = False, current_admin: AdminUser = Depends(get_current_admin)):
    """Make a litter active, optionally deactivating others"""
    db = get_database()
    
    # Check if litter exists
    target_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not target_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    # If force is True, deactivate all other litters first
    if force:
        await db.litters.update_many(
            {"_id": {"$ne": ObjectId(litter_id)}},
            {"$set": {"is_current": False, "updated_at": datetime.now()}}
        )
    else:
        # Check if another current litter exists
        existing_current = await db.litters.find_one({
            "is_current": True, 
            "_id": {"$ne": ObjectId(litter_id)}
        })
        if existing_current:
            raise HTTPException(
                status_code=409, 
                detail={
                    "message": "A current/active litter already exists",
                    "existing_litter": {
                        "id": str(existing_current["_id"]),
                        "name": existing_current["name"]
                    }
                }
            )
    
    # Make the target litter active
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$set": {"is_current": True, "updated_at": datetime.now()}}
    )
    
    # Return updated litter
    updated_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    return serialize_litter(updated_litter)

@router.post("/", response_model=Litter)
async def create_litter(litter: LitterCreate, force_active: bool = False, current_admin: AdminUser = Depends(get_current_admin)):
    """Create new litter (admin only)"""
    db = get_database()
    
    # If creating a current litter, check if another current litter exists
    if litter.is_current and not force_active:
        existing_current = await db.litters.find_one({"is_current": True})
        if existing_current:
            raise HTTPException(
                status_code=409, 
                detail={
                    "message": "A current/active litter already exists",
                    "existing_litter": {
                        "id": str(existing_current["_id"]),
                        "name": existing_current["name"]
                    }
                }
            )
    
    # If force_active is True, deactivate all other litters
    if litter.is_current and force_active:
        await db.litters.update_many(
            {},
            {"$set": {"is_current": False, "updated_at": datetime.now()}}
        )
    
    litter_doc = litter.dict()
    litter_doc["created_at"] = datetime.now()
    litter_doc["updated_at"] = datetime.now()
    litter_doc["puppies"] = []
    
    result = await db.litters.insert_one(litter_doc)
    litter_doc["id"] = str(result.inserted_id)
    del litter_doc["_id"]
    
    return litter_doc

@router.put("/{litter_id}", response_model=Litter)
async def update_litter(litter_id: str, litter_update: LitterUpdate, force_active: bool = False, current_admin: AdminUser = Depends(get_current_admin)):
    """Update litter (admin only)"""
    db = get_database()
    
    # Check if litter exists
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    # Prepare update data
    update_data = {k: v for k, v in litter_update.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.now()
    
    # If updating to current, check if another current litter exists
    if update_data.get("is_current") == True and not force_active:
        existing_current = await db.litters.find_one({
            "is_current": True, 
            "_id": {"$ne": ObjectId(litter_id)}
        })
        if existing_current:
            raise HTTPException(
                status_code=409, 
                detail={
                    "message": "A current/active litter already exists",
                    "existing_litter": {
                        "id": str(existing_current["_id"]),
                        "name": existing_current["name"]
                    }
                }
            )
    
    # If force_active is True and making this litter current, deactivate all others
    if update_data.get("is_current") == True and force_active:
        await db.litters.update_many(
            {"_id": {"$ne": ObjectId(litter_id)}},
            {"$set": {"is_current": False, "updated_at": datetime.now()}}
        )
    
    # Update litter
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$set": update_data}
    )
    
    # Return updated litter
    updated_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    return serialize_litter(updated_litter)

@router.delete("/{litter_id}")
async def delete_litter(litter_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete litter (admin only)"""
    db = get_database()
    
    result = await db.litters.delete_one({"_id": ObjectId(litter_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    return {"message": "Litter deleted successfully"}

@router.post("/{litter_id}/puppies", response_model=Puppy)
async def add_puppy_to_litter(litter_id: str, puppy: PuppyCreate, current_admin: AdminUser = Depends(get_current_admin)):
    """Add puppy to litter (admin only)"""
    db = get_database()
    
    # Check if litter exists
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    # Create puppy document
    puppy_doc = puppy.dict()
    puppy_doc["id"] = str(uuid.uuid4())
    puppy_doc["images"] = []
    puppy_doc["videos"] = []
    
    # Add puppy to litter
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$push": {"puppies": puppy_doc}, "$set": {"updated_at": datetime.now()}}
    )
    
    return puppy_doc

@router.put("/{litter_id}/puppies/{puppy_id}", response_model=Puppy)
async def update_puppy(litter_id: str, puppy_id: str, puppy_update: PuppyUpdate, current_admin: AdminUser = Depends(get_current_admin)):
    """Update puppy in litter (admin only)"""
    db = get_database()
    
    # Prepare update data
    update_data = {k: v for k, v in puppy_update.dict(exclude_unset=True).items() if v is not None}
    
    # Create update query for nested puppy
    update_query = {}
    for key, value in update_data.items():
        update_query[f"puppies.$.{key}"] = value
    
    # Update puppy
    result = await db.litters.update_one(
        {"_id": ObjectId(litter_id), "puppies.id": puppy_id},
        {"$set": update_query}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Litter or puppy not found")
    
    # Return updated puppy
    litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    puppy = next((p for p in litter["puppies"] if p["id"] == puppy_id), None)
    
    if not puppy:
        raise HTTPException(status_code=404, detail="Puppy not found")
    
    return puppy

@router.delete("/{litter_id}/puppies/{puppy_id}")
async def delete_puppy(litter_id: str, puppy_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete puppy from litter (admin only)"""
    db = get_database()
    
    result = await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$pull": {"puppies": {"id": puppy_id}}, "$set": {"updated_at": datetime.now()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    return {"message": "Puppy deleted successfully"}

@router.post("/{litter_id}/mother/image")
async def upload_mother_image(
    litter_id: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload image for litter's mother"""
    db = get_database()
    
    # Check if litter exists
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"parents/{litter_id}/mother_{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    image_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Update mother's image_url
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$set": {"mother.image_url": image_url, "updated_at": datetime.now()}}
    )
    
    return {"image_url": image_url, "message": "Mother image uploaded successfully"}

@router.post("/{litter_id}/father/image")
async def upload_father_image(
    litter_id: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload image for litter's father"""
    db = get_database()
    
    # Check if litter exists
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"parents/{litter_id}/father_{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    image_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Update father's image_url
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$set": {"father.image_url": image_url, "updated_at": datetime.now()}}
    )
    
    return {"image_url": image_url, "message": "Father image uploaded successfully"}

@router.delete("/{litter_id}/mother/image")
async def delete_mother_image(
    litter_id: str,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete mother's image"""
    db = get_database()
    
    # Check if litter exists and has mother image
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    mother_image_url = existing_litter.get("mother", {}).get("image_url")
    if not mother_image_url:
        raise HTTPException(status_code=404, detail="Mother image not found")
    
    # Extract filename from URL for R2 deletion
    if "/parents/" in mother_image_url:
        filename = mother_image_url.split("doublejsdoodles/")[-1]  # Get everything after bucket name
        await r2_service.delete_file(filename)
    
    # Remove image_url from mother
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$unset": {"mother.image_url": ""}, "$set": {"updated_at": datetime.now()}}
    )
    
    return {"message": "Mother image deleted successfully"}

@router.delete("/{litter_id}/father/image")
async def delete_father_image(
    litter_id: str,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete father's image"""
    db = get_database()
    
    # Check if litter exists and has father image
    existing_litter = await db.litters.find_one({"_id": ObjectId(litter_id)})
    if not existing_litter:
        raise HTTPException(status_code=404, detail="Litter not found")
    
    father_image_url = existing_litter.get("father", {}).get("image_url")
    if not father_image_url:
        raise HTTPException(status_code=404, detail="Father image not found")
    
    # Extract filename from URL for R2 deletion
    if "/parents/" in father_image_url:
        filename = father_image_url.split("doublejsdoodles/")[-1]  # Get everything after bucket name
        await r2_service.delete_file(filename)
    
    # Remove image_url from father
    await db.litters.update_one(
        {"_id": ObjectId(litter_id)},
        {"$unset": {"father.image_url": ""}, "$set": {"updated_at": datetime.now()}}
    )
    
    return {"message": "Father image deleted successfully"}
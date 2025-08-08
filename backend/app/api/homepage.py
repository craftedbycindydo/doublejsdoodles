from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
from app.models.homepage import (
    HomepageContent, HeroImage, HomepageSection,
    HeroImageCreate, HeroImageUpdate, HomepageSectionCreate, 
    HomepageSectionUpdate, HomepageContentUpdate
)
from app.models.auth import AdminUser
from app.services.auth import get_current_admin
from app.services.database import get_database
from app.services.cloudflare_r2 import r2_service
from datetime import datetime
import uuid
import os

router = APIRouter(prefix="/homepage", tags=["homepage"])

def serialize_homepage_content(doc) -> dict:
    """Convert homepage document to dict"""
    if doc:
        content = doc.copy()
        content["id"] = str(doc["_id"])
        content.pop("_id", None)
        return content
    return {}

@router.get("/content")
async def get_homepage_content():
    """Get current homepage content (public endpoint)"""
    db = get_database()
    content_doc = await db.homepage.find_one()
    
    if not content_doc:
        # Return default content if none exists
        default_content = {
            "hero_images": [],
            "sections": [],
            "meta_title": "Double J's Doodles - Premium Goldendoodle Breeder Colorado | Golden Doodles Near Me | Denver, Utah, Texas",
            "meta_description": "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies. Golden doodles near me - Double J's Doodles La Junta CO.",
            "meta_keywords": "goldendoodle breeder, golden doodles near me, goldendoodle puppies Colorado, goldendoodle breeder Colorado, goldendoodle puppies Denver, goldendoodle Utah, goldendoodle Texas, La Junta Colorado breeder, health tested goldendoodle, home raised puppies",
            "canonical_url": "https://doublejsdoodles.com",
            "og_title": "Double J's Doodles - Premium Goldendoodle Breeder Colorado",
            "og_description": "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies ready for loving homes.",
            "og_image": "https://doublejsdoodles.com/logo512.png",
            "twitter_title": "Double J's Doodles - Premium Goldendoodle Breeder Colorado",
            "twitter_description": "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies.",
            "schema_org": {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": "Double J's Doodles",
                "description": "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas.",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "La Junta",
                    "addressRegion": "CO",
                    "addressCountry": "US"
                },
                "areaServed": ["Colorado", "Utah", "Texas", "Denver", "Colorado Springs"]
            }
        }
        return default_content
    
    return serialize_homepage_content(content_doc)

@router.put("/content")
async def update_homepage_content(
    content_update: HomepageContentUpdate,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update homepage meta content"""
    db = get_database()
    
    update_data = content_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = current_admin.username
    
    result = await db.homepage.update_one(
        {},
        {"$set": update_data},
        upsert=True
    )
    
    if result.matched_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=500, detail="Failed to update homepage content")
    
    # Get updated content
    updated_doc = await db.homepage.find_one()
    return serialize_homepage_content(updated_doc)

@router.post("/hero-images")
async def upload_hero_image(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    subtitle: Optional[str] = Form(None),
    alt_text: str = Form(...),
    order: int = Form(0),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload new hero image"""
    db = get_database()
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"homepage/hero/{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    image_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Create hero image object
    hero_image = HeroImage(
        image_url=image_url,
        title=title,
        subtitle=subtitle,
        alt_text=alt_text,
        order=order
    )
    
    # Add to homepage content
    await db.homepage.update_one(
        {},
        {
            "$push": {"hero_images": hero_image.dict()},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        },
        upsert=True
    )
    
    return {"hero_image": hero_image.dict(), "message": "Hero image uploaded successfully"}

@router.put("/hero-images/{hero_id}")
async def update_hero_image(
    hero_id: str,
    hero_update: HeroImageUpdate,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update hero image details"""
    db = get_database()
    
    update_data = hero_update.dict(exclude_unset=True)
    
    result = await db.homepage.update_one(
        {"hero_images.id": hero_id},
        {
            "$set": {
                **{f"hero_images.$.{k}": v for k, v in update_data.items()},
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hero image not found")
    
    return {"message": "Hero image updated successfully"}

@router.delete("/hero-images/{hero_id}")
async def delete_hero_image(
    hero_id: str,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete hero image"""
    db = get_database()
    
    # Find and remove the hero image
    homepage_doc = await db.homepage.find_one({"hero_images.id": hero_id})
    
    if not homepage_doc:
        raise HTTPException(status_code=404, detail="Hero image not found")
    
    # Find the specific hero image to get the URL for deletion
    hero_image = next((img for img in homepage_doc["hero_images"] if img["id"] == hero_id), None)
    
    if hero_image and hero_image["image_url"]:
        # Extract filename from URL for R2 deletion
        if "/homepage/hero/" in hero_image["image_url"]:
            filename = hero_image["image_url"].split("/")[-1]
            filename = f"homepage/hero/{filename}"
            await r2_service.delete_file(filename)
    
    # Remove from database
    result = await db.homepage.update_one(
        {},
        {
            "$pull": {"hero_images": {"id": hero_id}},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    return {"message": "Hero image deleted successfully"}

@router.post("/sections")
async def create_homepage_section(
    section_create: HomepageSectionCreate,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Create new homepage section"""
    db = get_database()
    
    section = HomepageSection(**section_create.dict())
    
    await db.homepage.update_one(
        {},
        {
            "$push": {"sections": section.dict()},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        },
        upsert=True
    )
    
    return {"section": section.dict(), "message": "Homepage section created successfully"}

@router.put("/sections/{section_id}")
async def update_homepage_section(
    section_id: str,
    section_update: HomepageSectionUpdate,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update homepage section"""
    db = get_database()
    
    update_data = section_update.dict(exclude_unset=True)
    
    result = await db.homepage.update_one(
        {"sections.id": section_id},
        {
            "$set": {
                **{f"sections.$.{k}": v for k, v in update_data.items()},
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Homepage section not found")
    
    return {"message": "Homepage section updated successfully"}

@router.delete("/sections/{section_id}")
async def delete_homepage_section(
    section_id: str,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete homepage section"""
    db = get_database()
    
    result = await db.homepage.update_one(
        {},
        {
            "$pull": {"sections": {"id": section_id}},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Homepage section not found")
    
    return {"message": "Homepage section deleted successfully"}

@router.post("/sections/{section_id}/images")
async def upload_section_image(
    section_id: str,
    file: UploadFile = File(...),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Upload image to homepage section"""
    db = get_database()
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPEG, PNG, and WebP images are allowed."
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"homepage/sections/{section_id}/{uuid.uuid4()}{file_extension}"
    
    # Upload to R2
    file_content = await file.read()
    image_url = await r2_service.upload_file(file_content, unique_filename, file.content_type)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Add image to section
    result = await db.homepage.update_one(
        {"sections.id": section_id},
        {
            "$push": {"sections.$.images": image_url},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Homepage section not found")
    
    return {"image_url": image_url, "message": "Image uploaded successfully"}

@router.delete("/sections/{section_id}/images/{image_index}")
async def delete_section_image(
    section_id: str,
    image_index: int,
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete image from homepage section"""
    db = get_database()
    
    # Find the section and validate image index
    homepage_doc = await db.homepage.find_one({"sections.id": section_id})
    
    if not homepage_doc:
        raise HTTPException(status_code=404, detail="Homepage section not found")
    
    section = next((s for s in homepage_doc["sections"] if s["id"] == section_id), None)
    
    if not section or image_index >= len(section["images"]) or image_index < 0:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Get the image URL to delete from R2
    image_url = section["images"][image_index]
    
    # Extract filename from URL for R2 deletion
    if f"/homepage/sections/{section_id}/" in image_url:
        filename = image_url.split("/")[-1]
        filename = f"homepage/sections/{section_id}/{filename}"
        await r2_service.delete_file(filename)
    
    # Remove image from array
    await db.homepage.update_one(
        {"sections.id": section_id},
        {"$unset": {f"sections.$.images.{image_index}": 1}}
    )
    await db.homepage.update_one(
        {"sections.id": section_id},
        {
            "$pull": {"sections.$.images": None},
            "$set": {
                "updated_at": datetime.utcnow(),
                "updated_by": current_admin.username
            }
        }
    )
    
    return {"message": "Image deleted successfully"} 
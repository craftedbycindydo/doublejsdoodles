from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from app.models.contact import ContactFormSubmission, ContactFormResponse, ContactInquiry
from app.models.auth import AdminUser
from app.services.auth import get_current_admin
from app.services.database import get_database
from app.services.email import email_service
from datetime import datetime
import uuid

router = APIRouter(prefix="/contact", tags=["contact"])

def serialize_contact(contact_doc) -> dict:
    """Convert MongoDB document to dict with proper ID handling"""
    if contact_doc:
        contact_doc["id"] = str(contact_doc["_id"])
        del contact_doc["_id"]
    return contact_doc

@router.post("/", response_model=ContactFormResponse)
async def submit_contact_form(contact_form: ContactFormSubmission):
    """Submit contact form (public endpoint)"""
    db = get_database()
    
    try:
        # Save to database
        contact_doc = contact_form.dict()
        contact_doc["submitted_at"] = datetime.now()
        contact_doc["responded"] = False
        
        result = await db.contacts.insert_one(contact_doc)
        contact_id = str(result.inserted_id)
        
        # Send email notification
        email_sent = False
        if contact_form.puppy_name and contact_form.litter_name:
            email_sent = await email_service.send_puppy_inquiry(
                contact_form.name,
                contact_form.email,
                contact_form.phone,
                contact_form.puppy_name,
                contact_form.litter_name,
                contact_form.message
            )
        else:
            email_sent = await email_service.send_contact_inquiry(
                contact_form.name,
                contact_form.email,
                contact_form.phone,
                contact_form.message,
                contact_form.puppy_name
            )
        
        return ContactFormResponse(
            id=contact_id,
            success=True,
            message="Thank you for your message! We'll get back to you soon." + 
                   ("" if email_sent else " (Note: Email notification may be delayed.)")
        )
        
    except Exception as e:
        # Still save to database even if email fails
        try:
            contact_doc = contact_form.dict()
            contact_doc["submitted_at"] = datetime.now()
            contact_doc["responded"] = False
            result = await db.contacts.insert_one(contact_doc)
            contact_id = str(result.inserted_id)
            
            return ContactFormResponse(
                id=contact_id,
                success=True,
                message="Thank you for your message! We'll get back to you soon."
            )
        except:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to process your request. Please try again later."
            )

@router.get("/inquiries", response_model=List[ContactInquiry])
async def get_contact_inquiries(current_admin: AdminUser = Depends(get_current_admin)):
    """Get all contact inquiries (admin only)"""
    db = get_database()
    
    contacts_cursor = db.contacts.find().sort("submitted_at", -1)
    contacts = []
    async for contact_doc in contacts_cursor:
        contacts.append(serialize_contact(contact_doc))
    
    return contacts

@router.get("/inquiries/{contact_id}", response_model=ContactInquiry)
async def get_contact_inquiry(contact_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Get specific contact inquiry (admin only)"""
    db = get_database()
    
    contact_doc = await db.contacts.find_one({"_id": ObjectId(contact_id)})
    if not contact_doc:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")
    
    return serialize_contact(contact_doc)

@router.patch("/inquiries/{contact_id}/respond")
async def mark_inquiry_responded(contact_id: str, notes: str = "", current_admin: AdminUser = Depends(get_current_admin)):
    """Mark contact inquiry as responded (admin only)"""
    db = get_database()
    
    result = await db.contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {
            "$set": {
                "responded": True,
                "notes": notes,
                "responded_at": datetime.now()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")
    
    return {"message": "Inquiry marked as responded"}

@router.delete("/inquiries/{contact_id}")
async def delete_contact_inquiry(contact_id: str, current_admin: AdminUser = Depends(get_current_admin)):
    """Delete contact inquiry (admin only)"""
    db = get_database()
    
    result = await db.contacts.delete_one({"_id": ObjectId(contact_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact inquiry not found")
    
    return {"message": "Contact inquiry deleted successfully"}
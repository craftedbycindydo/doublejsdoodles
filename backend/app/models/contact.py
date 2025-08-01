from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactFormSubmission(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    puppy_name: Optional[str] = None
    litter_name: Optional[str] = None
    subject: Optional[str] = None

class ContactFormResponse(BaseModel):
    id: str
    success: bool
    message: str

class ContactInquiry(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: str
    message: str
    puppy_name: Optional[str] = None
    litter_name: Optional[str] = None
    subject: Optional[str] = None
    submitted_at: datetime = datetime.now()
    responded: bool = False
    notes: Optional[str] = None
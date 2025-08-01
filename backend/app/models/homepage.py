from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class HeroImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    alt_text: str
    is_active: bool = True
    order: int = 0

class HomepageSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_type: str  # "hero", "about", "featured_litters", "testimonials", "gallery"
    title: str
    content: Optional[str] = None
    images: List[str] = []
    is_active: bool = True
    order: int = 0

class HomepageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_images: List[HeroImage] = []
    sections: List[HomepageSection] = []
    meta_title: Optional[str] = "Double JS Doodles - Premium Goldendoodle Breeder"
    meta_description: Optional[str] = "Discover beautiful, healthy Goldendoodle puppies from Double JS Doodles. Professional breeder with champion bloodlines and loving care."
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str

class HeroImageCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    alt_text: str
    is_active: bool = True
    order: int = 0

class HeroImageUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    alt_text: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class HomepageSectionCreate(BaseModel):
    section_type: str
    title: str
    content: Optional[str] = None
    is_active: bool = True
    order: int = 0

class HomepageSectionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

class HomepageContentUpdate(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

import uuid 
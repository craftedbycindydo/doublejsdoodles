from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class PuppyStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"

class Generation(str, Enum):
    F1 = "F1"
    F1B = "F1B"
    F2 = "F2"
    F2B = "F2B"
    MULTI_GEN = "Multi-Gen"

class Breed(str, Enum):
    GOLDENDOODLE = "Goldendoodle"
    BERNEDOODLE = "Bernedoodle"
    LABRADOODLE = "Labradoodle"

class ParentDog(BaseModel):
    name: str
    breed: str
    color: str
    weight: Optional[float] = None
    health_clearances: List[str] = []
    image_url: Optional[str] = None

class Puppy(BaseModel):
    id: Optional[str] = None
    name: str
    gender: str
    color: str
    birth_date: datetime
    estimated_adult_weight: Optional[float] = None
    status: PuppyStatus = PuppyStatus.AVAILABLE
    images: List[str] = []
    videos: List[str] = []
    microchip_id: Optional[str] = None
    notes: Optional[str] = None

class Litter(BaseModel):
    id: Optional[str] = None
    name: str
    breed: Breed
    generation: Generation
    birth_date: Optional[datetime] = None
    expected_date: Optional[datetime] = None
    mother: ParentDog
    father: ParentDog
    puppies: List[Puppy] = []
    description: Optional[str] = None
    is_current: bool = True
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class LitterCreate(BaseModel):
    name: str
    breed: Breed
    generation: Generation
    birth_date: Optional[datetime] = None
    expected_date: Optional[datetime] = None
    mother: ParentDog
    father: ParentDog
    description: Optional[str] = None
    is_current: bool = True

class LitterUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[Breed] = None
    generation: Optional[Generation] = None
    birth_date: Optional[datetime] = None
    expected_date: Optional[datetime] = None
    mother: Optional[ParentDog] = None
    father: Optional[ParentDog] = None
    description: Optional[str] = None
    is_current: Optional[bool] = None

class PuppyCreate(BaseModel):
    name: str
    gender: str
    color: str
    birth_date: datetime
    estimated_adult_weight: Optional[float] = None
    status: PuppyStatus = PuppyStatus.AVAILABLE
    microchip_id: Optional[str] = None
    notes: Optional[str] = None

class PuppyUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    color: Optional[str] = None
    birth_date: Optional[datetime] = None
    estimated_adult_weight: Optional[float] = None
    status: Optional[PuppyStatus] = None
    microchip_id: Optional[str] = None
    notes: Optional[str] = None
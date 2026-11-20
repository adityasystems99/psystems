from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    summary: str
    stack: List[str]
    liveUrl: Optional[str] = None
    repoUrl: Optional[str] = None
    image: Optional[str] = None

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)
    type: str = Field(default="contact", pattern="^(contact|testimonial)$")

class ContactResponse(BaseModel):
    status: str
    message: str
    id: int

class TestimonialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    message: str
    created_at: Optional[datetime] = None

class ProfileResponse(BaseModel):
    name: str
    title: str
    tagline: str
    bio: str
    skills: Dict[str, List[str]]
    links: Dict[str, str]
    education: List[str]

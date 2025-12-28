from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class ContactForm(BaseModel):
    """Schema for contact form submission"""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr  # Validates email format
    phone: str = Field(..., min_length=10, max_length=20)
    message: str = Field(default="", max_length=2000)


class ContactResponse(BaseModel):
    """Response after contact form submission"""
    success: bool
    message: str
    timestamp: datetime

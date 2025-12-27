from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ItemBase(BaseModel):
    """Base item schema"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: int = Field(..., ge=0)
    is_available: bool = True


class ItemCreate(ItemBase):
    """Schema for creating an item"""
    pass


class ItemUpdate(BaseModel):
    """Schema for updating an item (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None


class ItemResponse(ItemBase):
    """Schema for item responses"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

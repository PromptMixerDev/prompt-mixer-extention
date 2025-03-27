from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

# User schemas
class UserBase(BaseModel):
    """
    Base schema for user data with common fields
    """
    email: EmailStr
    display_name: str
    is_active: bool = True
    payment_status: Literal["paid", "unpaid"] = "unpaid"

class UserCreate(UserBase):
    password: Optional[str] = None
    google_id: Optional[str] = None
    photo_url: Optional[str] = None

class UserUpdate(BaseModel):
    """
    Schema for updating user data
    """
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: Optional[bool] = None
    payment_status: Optional[Literal["paid", "unpaid"]] = None

class UserInDBBase(UserBase):
    id: int
    google_id: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: Optional[str] = None

# Prompt schemas
class PromptBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    is_shared: bool = False
    meta_data: Optional[Dict[str, Any]] = None

class PromptCreate(PromptBase):
    tags: Optional[List[str]] = None

class PromptUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    is_shared: Optional[bool] = None
    meta_data: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class PromptInDBBase(PromptBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Prompt(PromptInDBBase):
    tags: List[str] = []
    owner: User

class PromptInDB(PromptInDBBase):
    pass

# Tag schemas
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagUpdate(TagBase):
    pass

class TagInDBBase(TagBase):
    id: int

    class Config:
        from_attributes = True

class Tag(TagInDBBase):
    pass

class TagInDB(TagInDBBase):
    pass

# Google Auth schemas
class GoogleAuthRequest(BaseModel):
    token: str

class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Prompt variable schema
class PromptVariableBase(BaseModel):
    """
    Base schema for prompt variable
    """
    name: str = Field(..., description="Variable name")
    value: Optional[str] = Field(None, description="Current value of the variable")

class PromptVariable(PromptVariableBase):
    """
    Schema for prompt variable
    """
    pass

# User library schemas
class UserLibraryBase(BaseModel):
    """
    Base schema for user library item
    """
    title: str = Field(..., description="Title of the prompt")
    description: Optional[str] = Field(None, description="Description of the prompt")
    content: str = Field(..., description="Content of the prompt")
    variables: Optional[List[PromptVariable]] = Field(None, description="Variables used in the prompt")
    icon_id: Optional[str] = Field(None, description="ID of the icon from availableIcons")
    color_id: Optional[str] = Field(None, description="ID of the color from availableColors")

class UserLibraryCreate(UserLibraryBase):
    """
    Schema for creating a user library item
    """
    # Дополнительные поля для совместимости с фронтендом (camelCase)
    iconId: Optional[str] = Field(None, description="ID of the icon from availableIcons (camelCase)")
    colorId: Optional[str] = Field(None, description="ID of the color from availableColors (camelCase)")

class UserLibraryUpdate(BaseModel):
    """
    Schema for updating a user library item
    """
    title: Optional[str] = Field(None, description="Title of the prompt")
    description: Optional[str] = Field(None, description="Description of the prompt")
    content: Optional[str] = Field(None, description="Content of the prompt")
    variables: Optional[List[PromptVariable]] = Field(None, description="Variables used in the prompt")
    icon_id: Optional[str] = Field(None, description="ID of the icon from availableIcons")
    color_id: Optional[str] = Field(None, description="ID of the color from availableColors")
    
    # Дополнительные поля для совместимости с фронтендом (camelCase)
    iconId: Optional[str] = Field(None, description="ID of the icon from availableIcons (camelCase)")
    colorId: Optional[str] = Field(None, description="ID of the color from availableColors (camelCase)")

class UserLibraryInDBBase(UserLibraryBase):
    """
    Base schema for user library item in database
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLibrary(UserLibraryInDBBase):
    """
    Schema for user library item
    """
    pass

class UserLibraryList(BaseModel):
    """
    Schema for a list of user library items
    """
    items: List[UserLibrary]
    total: int

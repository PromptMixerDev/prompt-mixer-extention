from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PromptRequest(BaseModel):
    """
    Schema for prompt improvement request
    """
    prompt: str = Field(..., description="Original prompt to improve")
    title: Optional[str] = Field(None, description="Title of the prompt")
    description: Optional[str] = Field(None, description="Description of the prompt")
    url: Optional[str] = Field(None, description="URL where the prompt was improved")

class PromptResponse(BaseModel):
    """
    Schema for prompt improvement response
    """
    improved_prompt: str = Field(..., description="Improved version of the prompt")

class PromptHistoryBase(BaseModel):
    """
    Base schema for prompt history
    """
    title: Optional[str] = None
    description: Optional[str] = None
    original_prompt: str
    improved_prompt: str
    url: Optional[str] = None

class PromptHistoryCreate(PromptHistoryBase):
    """
    Schema for creating a prompt history entry
    """
    user_id: Optional[int] = None

class PromptHistory(PromptHistoryBase):
    """
    Schema for a prompt history entry
    """
    id: int
    created_at: datetime
    user_id: Optional[int] = None

    class Config:
        orm_mode = True

class PromptHistoryList(BaseModel):
    """
    Schema for a list of prompt history entries
    """
    items: List[PromptHistory]
    total: int

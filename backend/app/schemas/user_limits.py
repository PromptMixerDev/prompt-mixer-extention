"""
User Limits Schemas

Schemas for user limits and usage information
"""

from pydantic import BaseModel, Field
from typing import Union, Literal

class UserLimits(BaseModel):
    """
    Schema for user limits and usage information
    """
    isPaidUser: bool = Field(..., description="Whether the user has a paid subscription")
    promptsCount: int = Field(..., description="Number of prompts used")
    improvementsCount: int = Field(..., description="Number of improvements used")
    maxFreePrompts: int = Field(..., description="Maximum number of prompts for free users")
    maxFreeImprovements: int = Field(..., description="Maximum number of improvements for free users")
    promptsLeft: Union[int, Literal[-1]] = Field(..., description="Number of prompts left (-1 for unlimited)")
    improvementsLeft: Union[int, Literal[-1]] = Field(..., description="Number of improvements left (-1 for unlimited)")
    hasReachedPromptsLimit: bool = Field(..., description="Whether the user has reached their prompt limit")
    hasReachedImprovementsLimit: bool = Field(..., description="Whether the user has reached their improvement limit")

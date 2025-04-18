from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional

from app.core.database import Base

class User(Base):
    """
    User model representing application users with authentication and profile information.
    Includes payment status to track subscription state.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    display_name = Column(String)
    photo_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    payment_status = Column(String, default="unpaid", nullable=False)  # Possible values: "paid", "unpaid"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    prompts = relationship("Prompt", back_populates="owner")
    library_items = relationship("UserLibrary", back_populates="user")

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text)
    is_shared = Column(Boolean, default=False)
    meta_data = Column(JSON, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="prompts")
    tags = relationship("PromptTag", back_populates="prompt")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    prompts = relationship("PromptTag", back_populates="tag")

class PromptTag(Base):
    __tablename__ = "prompt_tags"

    prompt_id = Column(Integer, ForeignKey("prompts.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

    # Relationships
    prompt = relationship("Prompt", back_populates="tags")
    tag = relationship("Tag", back_populates="prompts")

class PromptHistory(Base):
    __tablename__ = "prompt_history"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)  # Название промпта
    description = Column(Text, nullable=True)  # Описание промпта
    original_prompt = Column(Text, nullable=False)
    improved_prompt = Column(Text, nullable=False)
    url = Column(String, nullable=True)  # URL страницы, где был улучшен промпт
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Опционально, если хотим связать с пользователем

    # Relationships
    user = relationship("User", backref="prompt_history")

class UserLibrary(Base):
    """
    Model for storing user's prompt library items
    """
    __tablename__ = "user_library"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Содержание промпта
    variables = Column(JSON, nullable=True)  # Переменные промпта в формате JSON
    icon_id = Column(String, nullable=True)  # ID иконки из availableIcons
    color_id = Column(String, nullable=True)  # ID цвета из availableColors
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="library_items")

# UserLibraryTag class removed as it's no longer needed

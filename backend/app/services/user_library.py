import re
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.models import UserLibrary
from app.schemas.user_library import UserLibraryCreate, UserLibraryUpdate, PromptVariable

logger = logging.getLogger(__name__)

class UserLibraryService:
    """
    Service for managing user library items
    """
    
    @staticmethod
    def get_library_items(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get user library items
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of items to skip
            limit: Maximum number of items to return
            
        Returns:
            Tuple of (items, total_count)
        """
        try:
            # Create base query
            query = db.query(UserLibrary).filter(UserLibrary.user_id == user_id)
            
            # Get total count
            total = query.count()
            
            # Get items with pagination
            items = query.order_by(desc(UserLibrary.created_at)).offset(skip).limit(limit).all()
            
            # Convert to list of dictionaries
            result = []
            for item in items:
                # Convert to dictionary
                item_dict = {
                    "id": item.id,
                    "title": item.title,
                    "description": item.description,
                    "content": item.content,
                    "variables": item.variables,
                    "user_id": item.user_id,
                    "created_at": item.created_at,
                    "updated_at": item.updated_at
                }
                
                result.append(item_dict)
            
            return result, total
        
        except Exception as e:
            logger.error(f"Error getting library items: {str(e)}")
            raise
    
    @staticmethod
    def get_library_item(db: Session, item_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific library item
        
        Args:
            db: Database session
            item_id: Item ID
            user_id: User ID
            
        Returns:
            Library item or None if not found
        """
        try:
            # Get item
            item = db.query(UserLibrary).filter(
                UserLibrary.id == item_id,
                UserLibrary.user_id == user_id
            ).first()
            
            if not item:
                return None
            
            # Convert to dictionary
            item_dict = {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "content": item.content,
                "variables": item.variables,
                "user_id": item.user_id,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            }
            
            return item_dict
        
        except Exception as e:
            logger.error(f"Error getting library item: {str(e)}")
            raise
    
    @staticmethod
    def create_library_item(db: Session, item: UserLibraryCreate, user_id: int) -> Dict[str, Any]:
        """
        Create a new library item
        
        Args:
            db: Database session
            item: Item data
            user_id: User ID
            
        Returns:
            Created library item
        """
        try:
            # Extract variables from content if not provided
            variables = item.variables
            if not variables:
                variables = UserLibraryService.extract_variables(item.content)
            
            # Create new item
            db_item = UserLibrary(
                title=item.title,
                description=item.description,
                content=item.content,
                variables=variables,
                user_id=user_id
            )
            
            # Add to database
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            
            # Convert to dictionary
            item_dict = {
                "id": db_item.id,
                "title": db_item.title,
                "description": db_item.description,
                "content": db_item.content,
                "variables": db_item.variables,
                "user_id": db_item.user_id,
                "created_at": db_item.created_at,
                "updated_at": db_item.updated_at
            }
            
            return item_dict
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating library item: {str(e)}")
            raise
    
    @staticmethod
    def update_library_item(
        db: Session, 
        item_id: int, 
        item: UserLibraryUpdate, 
        user_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Update a library item
        
        Args:
            db: Database session
            item_id: Item ID
            item: Updated item data
            user_id: User ID
            
        Returns:
            Updated library item or None if not found
        """
        try:
            # Get item
            db_item = db.query(UserLibrary).filter(
                UserLibrary.id == item_id,
                UserLibrary.user_id == user_id
            ).first()
            
            if not db_item:
                return None
            
            # Update fields
            update_data = item.dict(exclude_unset=True)
            
            # Extract variables from content if content is updated and variables are not provided
            if "content" in update_data and "variables" not in update_data:
                update_data["variables"] = UserLibraryService.extract_variables(
                    update_data["content"],
                    db_item.variables
                )
            
            # Update item
            for key, value in update_data.items():
                setattr(db_item, key, value)
            
            db.commit()
            db.refresh(db_item)
            
            # Convert to dictionary
            item_dict = {
                "id": db_item.id,
                "title": db_item.title,
                "description": db_item.description,
                "content": db_item.content,
                "variables": db_item.variables,
                "user_id": db_item.user_id,
                "created_at": db_item.created_at,
                "updated_at": db_item.updated_at
            }
            
            return item_dict
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating library item: {str(e)}")
            raise
    
    @staticmethod
    def delete_library_item(db: Session, item_id: int, user_id: int) -> bool:
        """
        Delete a library item
        
        Args:
            db: Database session
            item_id: Item ID
            user_id: User ID
            
        Returns:
            True if deleted, False if not found
        """
        try:
            # Get item
            db_item = db.query(UserLibrary).filter(
                UserLibrary.id == item_id,
                UserLibrary.user_id == user_id
            ).first()
            
            if not db_item:
                return False
            
            # Delete item
            db.delete(db_item)
            db.commit()
            
            return True
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting library item: {str(e)}")
            raise
    
    @staticmethod
    def create_from_history(db: Session, history_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Create a library item from history
        
        Args:
            db: Database session
            history_id: History ID
            user_id: User ID
            
        Returns:
            Created library item or None if history not found
        """
        from app.models.models import PromptHistory
        
        try:
            # Get history item
            history_item = db.query(PromptHistory).filter(
                PromptHistory.id == history_id
            ).first()
            
            if not history_item:
                return None
            
            # Extract variables from improved prompt
            variables = UserLibraryService.extract_variables(history_item.improved_prompt)
            
            # Create new library item
            db_item = UserLibrary(
                title=history_item.title or "Untitled Prompt",
                description=history_item.description,
                content=history_item.improved_prompt,
                variables=variables,
                user_id=user_id
            )
            
            # Add to database
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            
            # Convert to dictionary
            item_dict = {
                "id": db_item.id,
                "title": db_item.title,
                "description": db_item.description,
                "content": db_item.content,
                "variables": db_item.variables,
                "user_id": db_item.user_id,
                "created_at": db_item.created_at,
                "updated_at": db_item.updated_at
            }
            
            return item_dict
        
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating library item from history: {str(e)}")
            raise
    
    @staticmethod
    def extract_variables(content: str, existing_variables=None) -> List[Dict[str, str]]:
        """
        Extract variables from prompt content, preserving existing values
        
        Args:
            content: Prompt content
            existing_variables: Existing variables to preserve values from
            
        Returns:
            List of variables
        """
        try:
            # Find all variables in the format {{variable_name}}
            pattern = r"{{([^{}]+)}}"
            matches = re.findall(pattern, content)
            
            # Create a dictionary of existing variables for quick lookup
            existing_vars_dict = {}
            if existing_variables:
                existing_vars_dict = {v.get("name"): v for v in existing_variables}
            
            # Create variables list
            variables = []
            for match in matches:
                name = match.strip()
                existing_var = existing_vars_dict.get(name, {})
                
                variable = {
                    "name": name,
                    "value": existing_var.get("value", "")
                }
                variables.append(variable)
            
            return variables
        
        except Exception as e:
            logger.error(f"Error extracting variables: {str(e)}")
            return []

# Create a singleton instance
user_library_service = UserLibraryService()

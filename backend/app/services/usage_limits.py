"""
Usage Limits Service

This service handles verification of user limits for free users,
including counting prompts and improvements and checking against defined limits.
"""

import logging
from typing import Dict, Any

from app.core.database import SessionLocal
from app.models.models import User, UserLibrary, PromptHistory

logger = logging.getLogger(__name__)

class UsageLimitsService:
    """
    Service for managing and enforcing usage limits for free users
    """
    # Constants for limits
    MAX_FREE_PROMPTS = 10
    MAX_FREE_IMPROVEMENTS = 3
    
    async def check_prompt_limit(self, user_id: int) -> bool:
        """
        Check if a user has reached their prompt limit
        
        Args:
            user_id: The ID of the user to check
            
        Returns:
            bool: True if the limit has been reached, False otherwise
        """
        try:
            # Create a new database session
            db = SessionLocal()
            
            try:
                # Get user to check payment status
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    logger.warning(f"User with ID {user_id} not found")
                    return False
                
                # Paid users have no limits
                if user.payment_status == "paid":
                    return False
                
                # Count user's prompts
                prompt_count = db.query(UserLibrary).filter(
                    UserLibrary.user_id == user_id
                ).count()
                
                # Check if limit reached
                return prompt_count >= self.MAX_FREE_PROMPTS
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error checking prompt limit: {str(e)}")
            # In case of error, allow the operation to proceed
            return False
    
    async def check_improvement_limit(self, user_id: int) -> bool:
        """
        Check if a user has reached their improvement limit
        
        Args:
            user_id: The ID of the user to check
            
        Returns:
            bool: True if the limit has been reached, False otherwise
        """
        try:
            # Create a new database session
            db = SessionLocal()
            
            try:
                # Get user to check payment status
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    logger.warning(f"User with ID {user_id} not found")
                    return False
                
                # Paid users have no limits
                if user.payment_status == "paid":
                    return False
                
                # Count user's improvements
                improvement_count = db.query(PromptHistory).filter(
                    PromptHistory.user_id == user_id
                ).count()
                
                # Check if limit reached
                return improvement_count >= self.MAX_FREE_IMPROVEMENTS
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error checking improvement limit: {str(e)}")
            # In case of error, allow the operation to proceed
            return False
    
    async def get_user_limits(self, user_id: int) -> Dict[str, Any]:
        """
        Get a user's current usage and limits
        
        Args:
            user_id: The ID of the user
            
        Returns:
            Dict containing usage and limit information
        """
        try:
            # Create a new database session
            db = SessionLocal()
            
            try:
                # Get user to check payment status
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    logger.warning(f"User with ID {user_id} not found")
                    return {
                        "isPaidUser": False,
                        "promptsCount": 0,
                        "improvementsCount": 0,
                        "maxFreePrompts": self.MAX_FREE_PROMPTS,
                        "maxFreeImprovements": self.MAX_FREE_IMPROVEMENTS,
                        "promptsLeft": self.MAX_FREE_PROMPTS,
                        "improvementsLeft": self.MAX_FREE_IMPROVEMENTS,
                        "hasReachedPromptsLimit": False,
                        "hasReachedImprovementsLimit": False
                    }
                
                # Check if user is paid
                is_paid_user = user.payment_status == "paid"
                
                # Count user's prompts and improvements
                prompts_count = db.query(UserLibrary).filter(
                    UserLibrary.user_id == user_id
                ).count()
                
                improvements_count = db.query(PromptHistory).filter(
                    PromptHistory.user_id == user_id
                ).count()
                
                # Calculate remaining resources
                prompts_left = float('inf') if is_paid_user else max(0, self.MAX_FREE_PROMPTS - prompts_count)
                improvements_left = float('inf') if is_paid_user else max(0, self.MAX_FREE_IMPROVEMENTS - improvements_count)
                
                # Check if limits reached
                has_reached_prompts_limit = not is_paid_user and prompts_count >= self.MAX_FREE_PROMPTS
                has_reached_improvements_limit = not is_paid_user and improvements_count >= self.MAX_FREE_IMPROVEMENTS
                
                return {
                    "isPaidUser": is_paid_user,
                    "promptsCount": prompts_count,
                    "improvementsCount": improvements_count,
                    "maxFreePrompts": self.MAX_FREE_PROMPTS,
                    "maxFreeImprovements": self.MAX_FREE_IMPROVEMENTS,
                    "promptsLeft": prompts_left if prompts_left != float('inf') else -1,  # Use -1 to represent infinity in JSON
                    "improvementsLeft": improvements_left if improvements_left != float('inf') else -1,
                    "hasReachedPromptsLimit": has_reached_prompts_limit,
                    "hasReachedImprovementsLimit": has_reached_improvements_limit
                }
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Error getting user limits: {str(e)}")
            # Return default values in case of error
            return {
                "isPaidUser": False,
                "promptsCount": 0,
                "improvementsCount": 0,
                "maxFreePrompts": self.MAX_FREE_PROMPTS,
                "maxFreeImprovements": self.MAX_FREE_IMPROVEMENTS,
                "promptsLeft": self.MAX_FREE_PROMPTS,
                "improvementsLeft": self.MAX_FREE_IMPROVEMENTS,
                "hasReachedPromptsLimit": False,
                "hasReachedImprovementsLimit": False
            }

# Create a singleton instance
usage_limits_service = UsageLimitsService()

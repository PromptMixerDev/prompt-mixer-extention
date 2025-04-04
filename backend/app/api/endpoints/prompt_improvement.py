from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional
from app.schemas.prompts import PromptRequest, PromptResponse, PromptHistory, PromptHistoryList
from app.services.prompt_improvement import prompt_improvement_service
from app.services.usage_limits import usage_limits_service
from app.core.database import SessionLocal
from app.api.endpoints.users import get_current_user
from app.models.models import User, PromptHistory as PromptHistoryModel

router = APIRouter()

@router.post("/improve", response_model=PromptResponse)
async def improve_prompt(
    request: PromptRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Improve a prompt using Claude AI
    
    This endpoint takes a prompt and returns an improved version of it.
    If the user is not a paid user and has reached their improvement limit,
    a 403 Forbidden error is returned.
    """
    try:
        # Get user_id if user is authenticated
        user_id = current_user.id if current_user else None
        
        # Check if user has reached their improvement limit
        if user_id is not None:
            has_reached_limit = await usage_limits_service.check_improvement_limit(user_id)
            if has_reached_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You have reached your free improvement limit. Please upgrade to a paid plan to continue."
                )
        
        improved_prompt = await prompt_improvement_service.improve_prompt(
            request.prompt,
            title=request.title,
            description=request.description,
            url=request.url,
            user_id=user_id
        )
        return {"improved_prompt": improved_prompt}
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error improving prompt: {str(e)}")

@router.get("/history", response_model=PromptHistoryList)
async def get_prompt_history(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user)
):
    """
    Get prompt improvement history for the current user
    
    This endpoint returns the history of improved prompts for the authenticated user.
    """
    try:
        history, total = await prompt_improvement_service.get_history(
            skip=skip, 
            limit=limit,
            user_id=current_user.id
        )
        return {"items": history, "total": total}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")

@router.get("/history/{id}", response_model=PromptHistory)
async def get_prompt_history_item(
    id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get prompt history item by ID
    
    This endpoint returns a specific prompt history entry by its ID.
    """
    try:
        # Create a new database session
        db = SessionLocal()
        
        try:
            # Get history item by ID
            history_item = db.query(PromptHistoryModel).filter(
                PromptHistoryModel.id == id,
                PromptHistoryModel.user_id == current_user.id
            ).first()
            
            if not history_item:
                raise HTTPException(status_code=404, detail="History item not found")
                
            return history_item
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history item: {str(e)}")

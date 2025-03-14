from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from app.schemas.prompts import PromptRequest, PromptResponse, PromptHistory, PromptHistoryList
from app.services.prompt_improvement import prompt_improvement_service
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.models.models import User

router = APIRouter()

@router.post("/improve", response_model=PromptResponse)
async def improve_prompt(
    request: PromptRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Improve a prompt using Claude AI
    
    This endpoint takes a prompt and returns an improved version of it.
    """
    try:
        # Get user_id if user is authenticated
        user_id = current_user.id if current_user else None
        
        improved_prompt = await prompt_improvement_service.improve_prompt(
            request.prompt,
            title=request.title,
            description=request.description,
            url=request.url,
            user_id=user_id
        )
        return {"improved_prompt": improved_prompt}
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

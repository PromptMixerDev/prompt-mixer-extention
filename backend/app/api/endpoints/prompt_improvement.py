from fastapi import APIRouter, HTTPException, Depends
from app.schemas.prompts import PromptRequest, PromptResponse
from app.services.prompt_improvement import prompt_improvement_service

router = APIRouter()

@router.post("/improve", response_model=PromptResponse)
async def improve_prompt(request: PromptRequest):
    """
    Improve a prompt using Claude AI
    
    This endpoint takes a prompt and returns an improved version of it.
    """
    try:
        improved_prompt = await prompt_improvement_service.improve_prompt(request.prompt)
        return {"improved_prompt": improved_prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error improving prompt: {str(e)}")

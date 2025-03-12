from pydantic import BaseModel, Field

class PromptRequest(BaseModel):
    """
    Schema for prompt improvement request
    """
    prompt: str = Field(..., description="Original prompt to improve")

class PromptResponse(BaseModel):
    """
    Schema for prompt improvement response
    """
    improved_prompt: str = Field(..., description="Improved version of the prompt")

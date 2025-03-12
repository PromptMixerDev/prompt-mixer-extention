import re
import json
import logging
import asyncio
from typing import Optional
from anthropic import Anthropic
from app.core.config import settings
from app.models.models import PromptHistory
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

# Мета-промпт для улучшения промптов
META_PROMPT_TEMPLATE = """
You are an expert prompt engineer tasked with improving a user-provided prompt to elicit the best possible response from an AI model. Your goal is to analyze the given prompt thoroughly and create a significantly enhanced version that addresses any weaknesses and optimizes its effectiveness.

Here is the original prompt you need to improve:

<original_prompt>
{{prompt}}
</original_prompt>

Please follow these steps to analyze and improve the prompt:

1. Evaluate the original prompt:
   - Summarize the prompt's main objective in one sentence
   - List the key components of the prompt and their purposes
   - Identify any ambiguities or unclear instructions
   - Assess its structure and organization
   - Note potential weaknesses or areas for improvement

2. Brainstorm improvements in the following areas:
   - Clarity: List at least 3 ways to make the prompt easier to understand
   - Specificity: Suggest at least 3 details to guide the AI's response more precisely
   - Structure: Propose at least 2 ways to organize the prompt more logically
   - Grammar and phrasing: Note any errors and at least 2 ideas to improve readability
   - Completeness: Identify at least 2 pieces of missing information or context that would help the AI provide a better response

3. Select the most effective improvements from your brainstorming

4. Rewrite the improved prompt, ensuring it is significantly enhanced compared to the original

5. Review the improved prompt against the original objectives and make final adjustments if necessary

6. Compare the original and improved prompts, noting at least 3 key differences and enhancements

Wrap your thought process for steps 1, 2, 3, and 6 in <prompt_evaluation> tags. Then, present the improved prompt within <improved_prompt> tags. Finally, include your review and any final adjustments in <final_review> tags.

Your output should follow this structure:

<prompt_evaluation>
[Your detailed evaluation of the original prompt, brainstorming of improvements, selection of the most effective changes, and comparison of original and improved prompts]
</prompt_evaluation>

<improved_prompt>
[Your rewritten, significantly improved version of the prompt]
</improved_prompt>

<final_review>
[Your review of the improved prompt and any final adjustments]
</final_review>

Remember, the goal is to create a substantially better version of the original prompt, not just minor improvements. Focus on enhancing its effectiveness, clarity, and ability to elicit high-quality responses from an AI model.
"""

class PromptImprovementService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = settings.CLAUDE_MODEL
    
    async def improve_prompt(self, original_prompt: str, url: Optional[str] = None, user_id: Optional[int] = None) -> str:
        """
        Improve a prompt using Claude API and save to history
        
        Args:
            original_prompt: The original prompt to improve
            url: The URL where the prompt was improved
            user_id: Optional user ID
            
        Returns:
            The improved prompt
        """
        try:
            # Prepare the meta-prompt with the original prompt
            meta_prompt = META_PROMPT_TEMPLATE.replace("{{prompt}}", original_prompt)
            
            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.7,
                system="You are an expert prompt engineer who helps users improve their prompts.",
                messages=[
                    {"role": "user", "content": meta_prompt}
                ]
            )
            
            # Extract the improved prompt from the response
            improved_prompt = self._extract_improved_prompt(response.content[0].text)
            
            # Save to history
            self._save_to_history(original_prompt, improved_prompt, url, user_id)
            
            return improved_prompt
        
        except Exception as e:
            logger.error(f"Error improving prompt: {str(e)}")
            raise
    
    def _extract_improved_prompt(self, response_text: str) -> str:
        """
        Extract the improved prompt from the Claude response
        
        Args:
            response_text: The full response from Claude
            
        Returns:
            The extracted improved prompt
        """
        # Use regex to extract the content between <improved_prompt> tags
        pattern = r"<improved_prompt>(.*?)</improved_prompt>"
        match = re.search(pattern, response_text, re.DOTALL)
        
        if match:
            return match.group(1).strip()
        else:
            # If no match found, return the full response
            logger.warning("Could not extract improved prompt from response")
            return response_text
    
    def _save_to_history(self, original_prompt: str, improved_prompt: str, url: Optional[str] = None, user_id: Optional[int] = None) -> None:
        """
        Save the original and improved prompts to history
        
        Args:
            original_prompt: The original prompt
            improved_prompt: The improved prompt
            url: The URL where the prompt was improved
            user_id: Optional user ID
        """
        try:
            # Create a new database session
            db = SessionLocal()
            
            try:
                # Create a new history entry
                history_entry = PromptHistory(
                    original_prompt=original_prompt,
                    improved_prompt=improved_prompt,
                    url=url,
                    user_id=user_id
                )
                
                # Add to database and commit
                db.add(history_entry)
                db.commit()
                db.refresh(history_entry)
                
                logger.info(f"Saved prompt history entry with ID: {history_entry.id}")
            finally:
                # Close the database session
                db.close()
        except Exception as e:
            logger.error(f"Error saving to history: {str(e)}")
            # Don't raise the exception to avoid breaking the main functionality
    
    async def get_history(self, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> tuple:
        """
        Get prompt improvement history
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            user_id: Optional user ID to filter by
            
        Returns:
            Tuple of (history_items, total_count)
        """
        try:
            # Create a new database session
            db = SessionLocal()
            
            try:
                # Create base query
                query = db.query(PromptHistory)
                
                # Filter by user_id if provided
                if user_id is not None:
                    query = query.filter(PromptHistory.user_id == user_id)
                
                # Get total count
                total = query.count()
                
                # Get history items
                history = query.order_by(
                    PromptHistory.created_at.desc()
                ).offset(skip).limit(limit).all()
                
                return history, total
            finally:
                # Close the database session
                db.close()
        except Exception as e:
            logger.error(f"Error getting history: {str(e)}")
            raise

# Create a singleton instance
prompt_improvement_service = PromptImprovementService()

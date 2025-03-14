/**
 * Types for prompt history in the application
 */

/**
 * Prompt history item interface
 */
export interface PromptHistoryItem {
  id: string;
  title: string;
  description: string;
  original_prompt: string;
  improved_prompt: string;
  url: string;
  created_at: string;
  user_id?: string;
}

/**
 * Prompt history list response interface
 */
export interface PromptHistoryListResponse {
  items: PromptHistoryItem[];
  total: number;
}

/**
 * Types for prompts in the application
 */

/**
 * Base prompt interface
 */
export interface BasePrompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

/**
 * User prompt interface
 */
export interface UserPrompt extends BasePrompt {
  copiedFrom?: string; // ID of the shared prompt if copied
}

/**
 * Shared prompt interface
 */
export interface SharedPrompt extends BasePrompt {
  author?: string;
}

/**
 * Prompt variable interface
 */
export interface PromptVariable {
  name: string;
  defaultValue?: string;
  description?: string;
}

/**
 * Prompt context state interface
 */
export interface PromptContextState {
  userPrompts: UserPrompt[];
  sharedPrompts: SharedPrompt[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Prompt context actions interface
 */
export interface PromptContextActions {
  loadPrompts: () => Promise<void>;
  addPrompt: (prompt: Omit<UserPrompt, 'id' | 'createdAt'>) => Promise<UserPrompt>;
  updatePrompt: (id: string, updatedPrompt: Partial<UserPrompt>) => Promise<UserPrompt | undefined>;
  deletePrompt: (id: string) => Promise<void>;
  copySharedPrompt: (id: string) => Promise<UserPrompt>;
  improvePrompt: (promptText: string) => Promise<string>;
}

/**
 * Prompt context interface
 */
export interface PromptContextType extends PromptContextState, PromptContextActions {}

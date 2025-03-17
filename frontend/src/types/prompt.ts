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
  createdAt: string;
}

/**
 * User prompt interface
 */
export interface UserPrompt extends BasePrompt {
  description?: string;
  variables?: PromptVariable[];
  iconId?: string; // ID иконки из availableIcons
  colorId?: string; // ID цвета из availableColors
  copiedFrom?: string; // Legacy field: ID of the shared prompt if copied
}

/**
 * Shared prompt interface
 */
export interface SharedPrompt extends BasePrompt {
  author?: string;
  tags?: string[];
}

/**
 * Prompt variable interface
 */
export interface PromptVariable {
  name: string;
  value?: string; // Текущее значение переменной
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

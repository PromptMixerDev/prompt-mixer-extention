import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPrompt, SharedPrompt, PromptContextType } from '../types/prompt';
import { libraryApi } from '../services/api/library';

/**
 * Context for managing prompts in the application
 */
const PromptContext = createContext<PromptContextType | undefined>(undefined);

/**
 * Provider component for the PromptContext
 */
interface PromptProviderProps {
  children: ReactNode;
}

export function PromptProvider({ children }: PromptProviderProps) {
  // State for user prompts
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);

  // State for shared prompts
  const [sharedPrompts, setSharedPrompts] = useState<SharedPrompt[]>([]);

  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State for error messages
  const [error, setError] = useState<string | null>(null);

  // Load prompts when the component mounts
  useEffect(() => {
    loadPrompts();
  }, []);

  /**
   * Load prompts from API
   */
  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load user prompts from API
      const { items } = await libraryApi.getLibraryItems();
      setUserPrompts(items);

      // Simulate loading shared prompts from an API
      // In a real implementation, this would be an API call
      setTimeout(() => {
        setSharedPrompts([
          {
            id: 'shared-1',
            title: 'SEO Optimization',
            content: 'Optimize the following content for SEO: {{content}}',
            createdAt: new Date().toISOString(),
            tags: ['SEO', 'Content Writing']
          },
          {
            id: 'shared-2',
            title: 'Code Review',
            content: 'Review the following code and suggest improvements: ```{{code}}```',
            createdAt: new Date().toISOString(),
            tags: ['Programming', 'Development']
          },
        ]);

        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error loading prompts:', err);
      setError('Failed to load prompts. Please try again.');
      setIsLoading(false);
    }
  };

  /**
   * Add a new prompt to the user's library
   */
  const addPrompt = async (prompt: Omit<UserPrompt, 'id' | 'createdAt'>) => {
    try {
      // Create prompt via API
      const newPrompt = await libraryApi.createLibraryItem(prompt);
      
      // Update local state
      setUserPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      
      return newPrompt;
    } catch (err) {
      console.error('Error adding prompt:', err);
      setError('Failed to add prompt. Please try again.');
      throw err;
    }
  };

  /**
   * Update an existing prompt
   */
  const updatePrompt = async (id: string, updatedPrompt: Partial<UserPrompt>) => {
    try {
      // Update prompt via API
      const updated = await libraryApi.updateLibraryItem(id, updatedPrompt);
      
      // Update local state
      setUserPrompts(prevPrompts => {
        const newPrompts = prevPrompts.map(prompt => prompt.id === id ? updated : prompt);
        return newPrompts;
      });
      
      return updated;
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError('Failed to update prompt. Please try again.');
      throw err;
    }
  };

  /**
   * Delete a prompt
   */
  const deletePrompt = async (id: string) => {
    try {
      // Delete prompt via API
      await libraryApi.deleteLibraryItem(id);
      
      // Update local state
      setUserPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== id));
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt. Please try again.');
      throw err;
    }
  };

  /**
   * Copy a shared prompt to the user's library
   */
  const copySharedPrompt = async (id: string) => {
    try {
      const sharedPrompt = sharedPrompts.find(prompt => prompt.id === id);

      if (!sharedPrompt) {
        throw new Error('Shared prompt not found');
      }

      // Create new prompt via API
      const newPrompt = await libraryApi.createLibraryItem({
        title: sharedPrompt.title,
        content: sharedPrompt.content
      });
      
      // Update local state
      setUserPrompts(prevPrompts => [...prevPrompts, newPrompt]);

      return newPrompt;
    } catch (err) {
      console.error('Error copying shared prompt:', err);
      setError('Failed to copy shared prompt. Please try again.');
      throw err;
    }
  };

  /**
   * Improve a prompt using the backend API
   */
  const improvePrompt = async (promptText: string) => {
    try {
      // Call the backend API to improve the prompt
      const response = await fetch('http://localhost:8000/api/v1/prompts/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: promptText })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to improve prompt: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.improved_prompt;
    } catch (err) {
      console.error('Error improving prompt:', err);
      setError('Failed to improve prompt. Please try again.');
      throw err;
    }
  };

  // Context value
  const value: PromptContextType = {
    userPrompts,
    sharedPrompts,
    isLoading,
    error,
    loadPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    copySharedPrompt,
    improvePrompt,
  };

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
}

/**
 * Custom hook for using the PromptContext
 *
 * @returns The PromptContext value
 */
export function usePrompts(): PromptContextType {
  const context = useContext(PromptContext);

  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider');
  }

  return context;
}

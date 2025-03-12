import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserPrompt, 
  SharedPrompt, 
  PromptContextType 
} from '../types/prompt';

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
   * Load prompts from storage or API
   */
  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load user prompts from Chrome storage
      chrome.storage.local.get(['userPrompts'], (result: { userPrompts?: UserPrompt[] }) => {
        setUserPrompts(result.userPrompts || []);
        
        // Simulate loading shared prompts from an API
        // In a real implementation, this would be an API call
        setTimeout(() => {
          setSharedPrompts([
            {
              id: 'shared-1',
              title: 'SEO Optimization',
              content: 'Optimize the following content for SEO: {{content}}',
              tags: ['seo', 'marketing'],
              createdAt: new Date().toISOString(),
            },
            {
              id: 'shared-2',
              title: 'Code Review',
              content: 'Review the following code and suggest improvements: ```{{code}}```',
              tags: ['programming', 'review'],
              createdAt: new Date().toISOString(),
            },
          ]);
          
          setIsLoading(false);
        }, 1000);
      });
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
      const newPrompt = {
        ...prompt,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      const updatedPrompts = [...userPrompts, newPrompt];
      setUserPrompts(updatedPrompts);
      
      // Save to Chrome storage
      chrome.storage.local.set({ userPrompts: updatedPrompts });
      
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
      const updatedPrompts = userPrompts.map((prompt) => 
        prompt.id === id ? { ...prompt, ...updatedPrompt } : prompt
      );
      
      setUserPrompts(updatedPrompts);
      
      // Save to Chrome storage
      chrome.storage.local.set({ userPrompts: updatedPrompts });
      
      return updatedPrompts.find((prompt) => prompt.id === id);
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
      const updatedPrompts = userPrompts.filter((prompt) => prompt.id !== id);
      setUserPrompts(updatedPrompts);
      
      // Save to Chrome storage
      chrome.storage.local.set({ userPrompts: updatedPrompts });
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
      const sharedPrompt = sharedPrompts.find((prompt) => prompt.id === id);
      
      if (!sharedPrompt) {
        throw new Error('Shared prompt not found');
      }
      
      const newPrompt = {
        ...sharedPrompt,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        copiedFrom: id,
      };
      
      const updatedPrompts = [...userPrompts, newPrompt];
      setUserPrompts(updatedPrompts);
      
      // Save to Chrome storage
      chrome.storage.local.set({ userPrompts: updatedPrompts });
      
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
      // In a real implementation, this would call the backend API
      // For now, we'll just simulate a response
      return new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(`Improved: ${promptText}`);
        }, 1000);
      });
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

  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  );
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

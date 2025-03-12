import { authApi } from '@services/api/auth';

/**
 * User type
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Auth data stored in chrome.storage
 */
interface AuthData {
  user: User;
  token: string;
}

/**
 * Authentication service
 */
export const authService = {
  /**
   * Get current user from chrome.storage
   */
  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['auth'], (result) => {
        resolve(result.auth?.user || null);
      });
    });
  },
  
  /**
   * Get auth token from chrome.storage
   */
  getAuthToken: async (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['auth'], (result) => {
        resolve(result.auth?.token || null);
      });
    });
  },
  
  /**
   * Sign in with Google using chrome.identity and backend API
   */
  signInWithGoogle: async (): Promise<User | null> => {
    try {
      // Authenticate with Google through our API
      const authData = await authApi.authenticateWithGoogle();
      
      // Store auth data in chrome.storage
      const authStorage: AuthData = {
        user: authData.user,
        token: authData.token
      };
      
      chrome.storage.local.set({ 'auth': authStorage });
      
      return authData.user;
    } catch (error) {
      console.error("Error signing in with Google", error);
      return null;
    }
  },
  
  /**
   * Sign out
   */
  signOut: async (): Promise<void> => {
    try {
      // Get current token
      const token = await new Promise<string | undefined>((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          resolve(token);
        });
      });
      
      // If there's a token, revoke it
      if (token) {
        await new Promise<void>((resolve, reject) => {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve();
          });
        });
      }
      
      // Remove auth data from chrome.storage
      chrome.storage.local.remove(['auth']);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  }
};

/**
 * Service for prompts collection
 */
export const promptsService = {
  /**
   * Get user prompts
   */
  getUserPrompts: async (userId: string): Promise<any[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        resolve(prompts.filter((prompt: any) => prompt.userId === userId));
      });
    });
  },
  
  /**
   * Create a new prompt
   */
  createPrompt: async (userId: string, promptData: any): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        const newPrompt = {
          id: Date.now().toString(),
          ...promptData,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        prompts.push(newPrompt);
        
        chrome.storage.local.set({ 'prompts': prompts }, () => {
          resolve(newPrompt.id);
        });
      });
    });
  },
  
  /**
   * Update a prompt
   */
  updatePrompt: async (promptId: string, promptData: any): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        const promptIndex = prompts.findIndex((p: any) => p.id === promptId);
        
        if (promptIndex !== -1) {
          prompts[promptIndex] = {
            ...prompts[promptIndex],
            ...promptData,
            updatedAt: new Date().toISOString()
          };
          
          chrome.storage.local.set({ 'prompts': prompts }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  },
  
  /**
   * Delete a prompt
   */
  deletePrompt: async (promptId: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        const newPrompts = prompts.filter((p: any) => p.id !== promptId);
        
        chrome.storage.local.set({ 'prompts': newPrompts }, () => {
          resolve();
        });
      });
    });
  },
  
  /**
   * Get shared prompts
   */
  getSharedPrompts: async (): Promise<any[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['prompts'], (result) => {
        const prompts = result.prompts || [];
        resolve(prompts.filter((prompt: any) => prompt.isShared === true));
      });
    });
  }
};

export default { authService, promptsService };

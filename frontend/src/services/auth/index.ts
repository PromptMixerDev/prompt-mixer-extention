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
    console.log('authService.getCurrentUser: Getting user from chrome.storage.local');
    return new Promise(resolve => {
      chrome.storage.local.get(['auth'], result => {
        console.log('authService.getCurrentUser: Auth data from storage:', result);
        const user = result.auth?.user || null;
        console.log('authService.getCurrentUser: Extracted user:', user);
        resolve(user);
      });
    });
  },

  /**
   * Get auth token from chrome.storage
   */
  getAuthToken: async (): Promise<string | null> => {
    console.log('authService.getAuthToken: Getting auth token from chrome.storage.local');
    return new Promise(resolve => {
      chrome.storage.local.get(['auth'], result => {
        console.log('authService.getAuthToken: Auth data from storage:', result);
        const token = result.auth?.token || null;
        console.log('authService.getAuthToken: Extracted token:', token ? `${token.substring(0, 10)}...` : 'null');
        resolve(token);
      });
    });
  },

  /**
   * Sign in with Google using chrome.identity and backend API
   */
  signInWithGoogle: async (): Promise<User | null> => {
    try {
      console.log('Starting signInWithGoogle process');
      
      // Authenticate with Google through our API
      const authData = await authApi.authenticateWithGoogle();
      console.log('Received auth data from API:', {
        ...authData,
        token: authData.token ? authData.token.substring(0, 10) + '...' : null
      });

      // Store auth data in chrome.storage
      const authStorage: AuthData = {
        user: authData.user,
        token: authData.token,
      };
      
      console.log('Storing auth data in chrome.storage.local:', {
        ...authStorage,
        token: authStorage.token ? authStorage.token.substring(0, 10) + '...' : null
      });

      chrome.storage.local.set({ auth: authStorage }, () => {
        console.log('Auth data stored in chrome.storage.local');
        
        // Verify that the data was stored correctly
        chrome.storage.local.get(['auth'], result => {
          console.log('Verification - Auth data from storage:', {
            ...result.auth,
            token: result.auth?.token ? result.auth.token.substring(0, 10) + '...' : null
          });
        });
      });

      return authData.user;
    } catch (error) {
      console.error('Error signing in with Google', error);
      return null;
    }
  },

  /**
   * Sign out
   */
  signOut: async (): Promise<void> => {
    try {
      console.log('authService.signOut: Starting sign out process');
      
      // Get current token
      console.log('authService.signOut: Getting token from chrome.identity');
      const token = await new Promise<string | undefined>(resolve => {
        chrome.identity.getAuthToken({ interactive: false }, token => {
          console.log('authService.signOut: Token from chrome.identity:', token ? `${token.substring(0, 10)}...` : 'undefined');
          resolve(token);
        });
      });

      // If there's a token, revoke it
      if (token) {
        console.log('authService.signOut: Revoking token');
        await new Promise<void>((resolve, reject) => {
          chrome.identity.removeCachedAuthToken({ token }, () => {
            if (chrome.runtime.lastError) {
              console.error('authService.signOut: Error revoking token:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            console.log('authService.signOut: Token revoked successfully');
            resolve();
          });
        });
      } else {
        console.log('authService.signOut: No token to revoke');
      }

      // Remove auth data from chrome.storage
      console.log('authService.signOut: Removing auth data from chrome.storage.local');
      chrome.storage.local.remove(['auth'], () => {
        console.log('authService.signOut: Auth data removed from chrome.storage.local');
        
        // Verify that the data was removed correctly
        chrome.storage.local.get(['auth'], result => {
          console.log('authService.signOut: Verification - Auth data after removal:', result);
        });
      });
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  },
};

/**
 * Service for prompts collection
 */
export const promptsService = {
  /**
   * Get user prompts
   */
  getUserPrompts: async (userId: string): Promise<any[]> => {
    return new Promise(resolve => {
      chrome.storage.local.get(['prompts'], result => {
        const prompts = result.prompts || [];
        resolve(prompts.filter((prompt: any) => prompt.userId === userId));
      });
    });
  },

  /**
   * Create a new prompt
   */
  createPrompt: async (userId: string, promptData: any): Promise<string> => {
    return new Promise(resolve => {
      chrome.storage.local.get(['prompts'], result => {
        const prompts = result.prompts || [];
        const newPrompt = {
          id: Date.now().toString(),
          ...promptData,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        prompts.push(newPrompt);

        chrome.storage.local.set({ prompts: prompts }, () => {
          resolve(newPrompt.id);
        });
      });
    });
  },

  /**
   * Update a prompt
   */
  updatePrompt: async (promptId: string, promptData: any): Promise<void> => {
    return new Promise(resolve => {
      chrome.storage.local.get(['prompts'], result => {
        const prompts = result.prompts || [];
        const promptIndex = prompts.findIndex((p: any) => p.id === promptId);

        if (promptIndex !== -1) {
          prompts[promptIndex] = {
            ...prompts[promptIndex],
            ...promptData,
            updatedAt: new Date().toISOString(),
          };

          chrome.storage.local.set({ prompts: prompts }, () => {
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
    return new Promise(resolve => {
      chrome.storage.local.get(['prompts'], result => {
        const prompts = result.prompts || [];
        const newPrompts = prompts.filter((p: any) => p.id !== promptId);

        chrome.storage.local.set({ prompts: newPrompts }, () => {
          resolve();
        });
      });
    });
  },

  /**
   * Get shared prompts
   */
  getSharedPrompts: async (): Promise<any[]> => {
    return new Promise(resolve => {
      chrome.storage.local.get(['prompts'], result => {
        const prompts = result.prompts || [];
        resolve(prompts.filter((prompt: any) => prompt.isShared === true));
      });
    });
  },
};

export default { authService, promptsService };

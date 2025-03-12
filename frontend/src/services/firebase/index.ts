import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK-ipj3JSGDilHh4GCTNc7zzioxvmSv7c",
  authDomain: "prompt-mixer-extention.firebaseapp.com",
  projectId: "prompt-mixer-extention",
  storageBucket: "prompt-mixer-extention.firebasestorage.app",
  messagingSenderId: "460821214562",
  appId: "1:460821214562:web:419aef402e05beb478683b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * User type
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Service for Authentication
 */
export const authService = {
  /**
   * Get current user from chrome.storage
   */
  getCurrentUser: async (): Promise<AppUser | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['user'], (result) => {
        resolve(result.user || null);
      });
    });
  },
  
  /**
   * Sign in with Google using chrome.identity
   */
  signInWithGoogle: async (): Promise<AppUser> => {
    try {
      // Use chrome.identity to get auth token
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!token) {
            reject(new Error('Failed to get auth token'));
            return;
          }
          resolve(token);
        });
      });
      
      // Get user info from Google
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }
      
      const userInfo = await response.json();
      
      // Create user object
      const user: AppUser = {
        uid: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name,
        photoURL: userInfo.picture
      };
      
      // Store user info in chrome.storage
      chrome.storage.local.set({ 'user': user });
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
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
      
      // Remove user info from chrome.storage
      chrome.storage.local.remove(['user']);
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

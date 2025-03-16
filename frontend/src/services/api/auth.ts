import { User } from '@services/auth';
import { getApiUrl } from '@utils/config';

/**
 * Get auth token from chrome.storage
 */
const getAuthToken = async (): Promise<string | null> => {
  return new Promise(resolve => {
    chrome.storage.local.get(['auth'], result => {
      resolve(result.auth?.token || null);
    });
  });
};

/**
 * Create headers with auth token
 */
export const createAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Auth API service
 */
export const authApi = {
  /**
   * Authenticate with Google
   */
  async authenticateWithGoogle(): Promise<{ token: string; user: User }> {
    try {
      // Получить токен от chrome.identity
      const googleToken = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, token => {
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

      // Отправить токен на бэкенд
      const response = await fetch(getApiUrl('auth/google'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();

      return {
        token: authData.access_token,
        user: authData.user,
      };
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      throw error;
    }
  },

  /**
   * Get user info from token
   */
  async getUserInfo(): Promise<User> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl('users/me'), {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  },
};

/**
 * API client for prompts
 */
export const promptsApi = {
  /**
   * Get user prompts
   */
  async getUserPrompts(): Promise<any[]> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl('prompts'), {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to get prompts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting prompts:', error);
      return [];
    }
  },

  /**
   * Create a new prompt
   */
  async createPrompt(promptData: any): Promise<any> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl('prompts'), {
        method: 'POST',
        headers,
        body: JSON.stringify(promptData),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to create prompt: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  },

  /**
   * Update a prompt
   */
  async updatePrompt(promptId: string, promptData: any): Promise<any> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl(`prompts/${promptId}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify(promptData),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  },

  /**
   * Delete a prompt
   */
  async deletePrompt(promptId: string): Promise<void> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl(`prompts/${promptId}`), {
        method: 'DELETE',
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete prompt: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      throw error;
    }
  },

  /**
   * Get shared prompts
   */
  async getSharedPrompts(): Promise<any[]> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl('prompts/shared'), {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Failed to get shared prompts: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting shared prompts:', error);
      return [];
    }
  },
};

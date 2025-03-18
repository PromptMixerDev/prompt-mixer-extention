import { User } from '@services/auth';
import { getApiUrl } from '@utils/config';

/**
 * Get auth token from chrome.storage
 */
const getAuthToken = async (): Promise<string | null> => {
  console.log('Getting auth token from chrome.storage.local');
  return new Promise(resolve => {
    chrome.storage.local.get(['auth'], result => {
      console.log('Auth data from storage:', result);
      const token = result.auth?.token || null;
      console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'null');
      resolve(token);
    });
  });
};

/**
 * Create headers with auth token
 */
export const createAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken();
  console.log('Auth token from storage:', token);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header:', headers['Authorization']);
  } else {
    console.warn('No auth token found in storage');
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
      console.log('Starting Google authentication process');
      
      // Получить токен от chrome.identity
      const googleToken = await new Promise<string>((resolve, reject) => {
        console.log('Requesting token from chrome.identity');
        chrome.identity.getAuthToken({ interactive: true }, token => {
          if (chrome.runtime.lastError) {
            console.error('Chrome identity error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!token) {
            console.error('No token returned from chrome.identity');
            reject(new Error('Failed to get auth token'));
            return;
          }
          console.log('Received token from chrome.identity:', token.substring(0, 10) + '...');
          resolve(token);
        });
      });

      // Отправить токен на бэкенд
      console.log('Sending token to backend');
      const url = getApiUrl('auth/google');
      console.log('Auth URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
        redirect: 'follow'
      });

      console.log('Auth response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Auth error response:', errorText);
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData = await response.json();
      console.log('Auth response data:', {
        ...authData,
        access_token: authData.access_token ? authData.access_token.substring(0, 10) + '...' : null
      });

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

import { createAuthHeaders } from './auth';
import { getApiUrl } from '@utils/config';

/**
 * Interface for user limits response from the API
 */
export interface UserLimitsResponse {
  isPaidUser: boolean;
  promptsCount: number;
  improvementsCount: number;
  maxFreePrompts: number;
  maxFreeImprovements: number;
  promptsLeft: number;
  improvementsLeft: number;
  hasReachedPromptsLimit: boolean;
  hasReachedImprovementsLimit: boolean;
}

/**
 * API client for user limits
 */
export const limitsApi = {
  /**
   * Get user limits from the backend
   * 
   * @returns User limits information
   */
  async getUserLimits(): Promise<UserLimitsResponse> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(getApiUrl('users/limits'), {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        // Check for authentication errors
        if (response.status === 401 || response.status === 307) {
          console.error('Authentication error, redirecting to login');
          // Return default values for unauthenticated users
          return {
            isPaidUser: false,
            promptsCount: 0,
            improvementsCount: 0,
            maxFreePrompts: 10,
            maxFreeImprovements: 3,
            promptsLeft: 10,
            improvementsLeft: 3,
            hasReachedPromptsLimit: false,
            hasReachedImprovementsLimit: false
          };
        }
        
        throw new Error(`Failed to get user limits: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user limits:', error);
      // Return default values in case of error
      return {
        isPaidUser: false,
        promptsCount: 0,
        improvementsCount: 0,
        maxFreePrompts: 10,
        maxFreeImprovements: 3,
        promptsLeft: 10,
        improvementsLeft: 3,
        hasReachedPromptsLimit: false,
        hasReachedImprovementsLimit: false
      };
    }
  }
};

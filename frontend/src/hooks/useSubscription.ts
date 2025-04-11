import { useAuth } from '@context/AuthContext';
import { useState, useEffect } from 'react';
import { limitsApi, UserLimitsResponse } from '@services/api/limits';

// Export constants for backward compatibility
export const MAX_FREE_PROMPTS = 10;
export const MAX_FREE_IMPROVEMENTS = 3;

/**
 * Hook for managing subscription and usage limits
 * 
 * Provides information about subscription status, limits, and current usage
 * by fetching data from the backend API
 */
export function useSubscription() {
  const { currentUser } = useAuth();
  
  const [limits, setLimits] = useState<UserLimitsResponse>({
    isPaidUser: false,
    promptsCount: 0,
    improvementsCount: 0,
    maxFreePrompts: MAX_FREE_PROMPTS,
    maxFreeImprovements: MAX_FREE_IMPROVEMENTS,
    promptsLeft: MAX_FREE_PROMPTS,
    improvementsLeft: MAX_FREE_IMPROVEMENTS,
    hasReachedPromptsLimit: false,
    hasReachedImprovementsLimit: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Fetches the latest limits data from the backend API
   * This function can be called after any action that changes the limits
   * such as improving a prompt or adding a prompt to the library
   */
  const refreshLimits = async () => {
    if (!currentUser) {
      return;
    }
    
    console.log('useSubscription: Refreshing limits from backend');
    setIsLoading(true);
    
    try {
      const response = await limitsApi.getUserLimits();
      console.log('useSubscription: Received refreshed limits from backend', response);
      setLimits(response);
    } catch (error) {
      console.error('Error refreshing user limits:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Log initial state
  useEffect(() => {
    console.log('useSubscription: Initial state', {
      currentUser: currentUser?.email
    });
  }, []);
  
  // Load limits from backend when user changes
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    console.log('useSubscription: Loading limits from backend');
    setIsLoading(true);
    
    limitsApi.getUserLimits()
      .then(response => {
        console.log('useSubscription: Received limits from backend', response);
        setLimits(response);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user limits:', error);
        setIsLoading(false);
      });
  }, [currentUser]);
  
  // Convert -1 to Infinity for frontend display
  const promptsLeft = limits.promptsLeft === -1 ? Infinity : limits.promptsLeft;
  const improvementsLeft = limits.improvementsLeft === -1 ? Infinity : limits.improvementsLeft;
  
  return {
    // Subscription status
    isPaidUser: limits.isPaidUser,
    isLoading,
    
    // Limits
    maxFreePrompts: limits.maxFreePrompts,
    maxFreeImprovements: limits.maxFreeImprovements,
    
    // Current usage
    promptsCount: limits.promptsCount,
    improvementsCount: limits.improvementsCount,
    
    // Remaining resources
    promptsLeft,
    improvementsLeft,
    
    // Limit check methods
    hasReachedPromptsLimit: limits.hasReachedPromptsLimit,
    hasReachedImprovementsLimit: limits.hasReachedImprovementsLimit,
    
    // Method to refresh limits data
    refreshLimits
  };
}

/**
 * Application configuration
 * 
 * This file centralizes access to environment variables and other configuration settings.
 * It provides type-safe access to environment variables with fallback values.
 */

/**
 * API configuration
 */
export const API_CONFIG = {
  /**
   * Base URL for API requests
   * Uses the VITE_API_URL environment variable with a fallback to localhost
   */
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
};

/**
 * Get the full API URL with the given endpoint
 * 
 * @param endpoint - The API endpoint path
 * @returns The full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Remove trailing slash from base URL if present
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/')
    ? API_CONFIG.BASE_URL.slice(0, -1)
    : API_CONFIG.BASE_URL;
  
  return `${baseUrl}/${cleanEndpoint}`;
};

import { createAuthHeaders } from './auth';

/**
 * API URL
 */
const API_URL = 'http://localhost:8000/api/v1';

/**
 * API client for prompt history
 */
export const historyApi = {
  /**
   * Get prompt improvement history
   */
  async getHistory(skip = 0, limit = 100): Promise<any> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/prompts/history?skip=${skip}&limit=${limit}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting history:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * Get history item details
   */
  async getHistoryItem(id: string): Promise<any> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/prompts/history/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get history item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting history item:', error);
      throw error;
    }
  }
};

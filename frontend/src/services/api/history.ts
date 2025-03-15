import { createAuthHeaders } from './auth';
import { PromptHistoryItem, PromptHistoryListResponse } from '../../types/history';

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
  async getHistory(skip = 0, limit = 100): Promise<PromptHistoryListResponse> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/prompts/history?skip=${skip}&limit=${limit}`, {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        // Проверка на ошибки аутентификации
        if (response.status === 401 || response.status === 307) {
          console.error('Authentication error, redirecting to login');
          // Здесь можно добавить логику перенаправления на страницу входа
          // или вызов метода повторной аутентификации
          return { items: [], total: 0 };
        }
        throw new Error(`Failed to get history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting history:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * Get history item by ID
   */
  async getHistoryItem(id: string): Promise<PromptHistoryItem> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/prompts/history/${id}`, {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        // Проверка на ошибки аутентификации
        if (response.status === 401 || response.status === 307) {
          console.error('Authentication error, redirecting to login');
          // Здесь можно добавить логику перенаправления на страницу входа
          // или вызов метода повторной аутентификации
          throw new Error('Authentication error');
        }
        throw new Error(`Failed to get history item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting history item:', error);
      throw error;
    }
  }
};

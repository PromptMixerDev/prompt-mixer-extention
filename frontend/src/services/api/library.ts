import { createAuthHeaders } from './auth';
import { UserPrompt } from '../../types/prompt';
import { PromptVariable } from '../../types/prompt';

/**
 * API URL
 */
const API_URL = 'http://localhost:8000/api/v1';

/**
 * Interface for library item creation
 */
interface LibraryItemCreate {
  title: string;
  description?: string;
  content: string;
  variables?: PromptVariable[];
}

/**
 * Interface for library item update
 */
interface LibraryItemUpdate {
  title?: string;
  description?: string;
  content?: string;
  variables?: PromptVariable[];
}

/**
 * Interface for library item response
 */
interface LibraryItem {
  id: number;
  title: string;
  description: string | null;
  content: string;
  variables: PromptVariable[] | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

/**
 * Interface for library list response
 */
interface LibraryListResponse {
  items: LibraryItem[];
  total: number;
}

/**
 * Convert API library item to UserPrompt
 */
const convertToUserPrompt = (item: LibraryItem): UserPrompt => {
  return {
    id: item.id.toString(),
    title: item.title,
    content: item.content,
    createdAt: item.created_at,
    variables: item.variables || [],
    description: item.description || undefined
  };
};

/**
 * API client for user library
 */
export const libraryApi = {
  /**
   * Get user library items
   */
  async getLibraryItems(skip = 0, limit = 100): Promise<{ items: UserPrompt[], total: number }> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/library?skip=${skip}&limit=${limit}`, {
        headers,
        redirect: 'follow' // Автоматически следовать перенаправлениям
      });

      if (!response.ok) {
        // Проверка на ошибки аутентификации
        if (response.status === 401 || response.status === 307) {
          console.error('Authentication error, redirecting to login');
          // Здесь можно добавить логику перенаправления на страницу входа
          // или вызов метода повторной аутентификации
          return { items: [], total: 0 };
        }
        throw new Error(`Failed to get library items: ${response.statusText}`);
      }

      const data: LibraryListResponse = await response.json();
      
      // Convert API items to UserPrompt format
      const items = data.items.map(convertToUserPrompt);
      
      return { items, total: data.total };
    } catch (error) {
      console.error('Error getting library items:', error);
      return { items: [], total: 0 };
    }
  },

  /**
   * Get library item by ID
   */
  async getLibraryItem(id: string): Promise<UserPrompt> {
    try {
      const headers = await createAuthHeaders();
      const response = await fetch(`${API_URL}/library/${id}`, {
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
        throw new Error(`Failed to get library item: ${response.statusText}`);
      }

      const item: LibraryItem = await response.json();
      return convertToUserPrompt(item);
    } catch (error) {
      console.error('Error getting library item:', error);
      throw error;
    }
  },

  /**
   * Create a new library item
   */
  async createLibraryItem(prompt: Omit<UserPrompt, 'id' | 'createdAt'>): Promise<UserPrompt> {
    try {
      const authHeaders = await createAuthHeaders();
      const headers = {
        ...authHeaders,
        'Content-Type': 'application/json'
      };
      
      // Convert UserPrompt to API format
      const data: LibraryItemCreate = {
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        variables: prompt.variables
      };
      
      const response = await fetch(`${API_URL}/library`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
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
        throw new Error(`Failed to create library item: ${response.statusText}`);
      }

      const item: LibraryItem = await response.json();
      return convertToUserPrompt(item);
    } catch (error) {
      console.error('Error creating library item:', error);
      throw error;
    }
  },

  /**
   * Update a library item
   */
  async updateLibraryItem(id: string, prompt: Partial<UserPrompt>): Promise<UserPrompt> {
    try {
      const authHeaders = await createAuthHeaders();
      const headers = {
        ...authHeaders,
        'Content-Type': 'application/json'
      };
      
      // Convert UserPrompt to API format
      const data: LibraryItemUpdate = {};
      
      if (prompt.title !== undefined) data.title = prompt.title;
      if (prompt.description !== undefined) data.description = prompt.description;
      if (prompt.content !== undefined) data.content = prompt.content;
      if (prompt.variables !== undefined) data.variables = prompt.variables;
      
      const response = await fetch(`${API_URL}/library/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
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
        throw new Error(`Failed to update library item: ${response.statusText}`);
      }

      const item: LibraryItem = await response.json();
      return convertToUserPrompt(item);
    } catch (error) {
      console.error('Error updating library item:', error);
      throw error;
    }
  },

  /**
   * Delete a library item
   */
  async deleteLibraryItem(id: string): Promise<void> {
    try {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_URL}/library/${id}`, {
        method: 'DELETE',
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
        throw new Error(`Failed to delete library item: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting library item:', error);
      throw error;
    }
  },

  /**
   * Create a library item from history
   */
  async createFromHistory(historyId: string): Promise<UserPrompt> {
    try {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_URL}/library/from-history/${historyId}`, {
        method: 'POST',
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
        throw new Error(`Failed to create library item from history: ${response.statusText}`);
      }

      const item: LibraryItem = await response.json();
      return convertToUserPrompt(item);
    } catch (error) {
      console.error('Error creating library item from history:', error);
      throw error;
    }
  }
};

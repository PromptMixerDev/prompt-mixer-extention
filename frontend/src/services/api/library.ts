import { createAuthHeaders } from './auth';
import { UserPrompt } from '../../types/prompt';
import { PromptVariable } from '../../types/prompt';
import { getApiUrl } from '@utils/config';

/**
 * Interface for library item creation
 */
interface LibraryItemCreate {
  title: string;
  description?: string;
  content: string;
  variables?: PromptVariable[];
  iconId?: string;
  colorId?: string;
}

/**
 * Interface for library item update
 */
interface LibraryItemUpdate {
  title?: string;
  description?: string;
  content?: string;
  variables?: PromptVariable[];
  iconId?: string;
  colorId?: string;
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
  icon_id?: string;
  color_id?: string;
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
  const result = {
    id: item.id.toString(),
    title: item.title,
    content: item.content,
    createdAt: item.created_at,
    variables: item.variables || [],
    description: item.description || undefined,
    iconId: item.icon_id || undefined,
    colorId: item.color_id || undefined
  };
  
  return result;
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
      console.log(`libraryApi.getLibraryItems: Fetching library items: skip=${skip}, limit=${limit}`);
      const headers = await createAuthHeaders();
      console.log('libraryApi.getLibraryItems: Request headers:', headers);
      
      const url = getApiUrl(`library?skip=${skip}&limit=${limit}`);
      console.log('libraryApi.getLibraryItems: Request URL:', url);
      
      const response = await fetch(url, {
        headers,
        redirect: 'follow' // Автоматически следовать перенаправлениям
      });

      console.log('libraryApi.getLibraryItems: Response status:', response.status, response.statusText);
      console.log('libraryApi.getLibraryItems: Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        // Проверка на ошибки аутентификации
        if (response.status === 401 || response.status === 307) {
          console.error('Authentication error, redirecting to login');
          
          // Попытка получить текст ошибки
          try {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
          } catch (e) {
            console.error('Could not read error response body');
          }
          
          // Здесь можно добавить логику перенаправления на страницу входа
          // или вызов метода повторной аутентификации
          return { items: [], total: 0 };
        }
        
        // Проверка на ошибку валидации (422 Unprocessable Entity)
        if (response.status === 422) {
          console.error('Validation error in library request:', response.statusText);
          return { items: [], total: 0 };
        }
        
        throw new Error(`Failed to get library items: ${response.statusText}`);
      }

      const data: LibraryListResponse = await response.json();
      console.log('libraryApi.getLibraryItems: Response data:', data);
      
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
      const response = await fetch(getApiUrl(`library/${id}`), {
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
        variables: prompt.variables,
        iconId: prompt.iconId,
        colorId: prompt.colorId
      };
      
      const response = await fetch(getApiUrl('library'), {
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
      if (prompt.iconId !== undefined) data.iconId = prompt.iconId;
      if (prompt.colorId !== undefined) data.colorId = prompt.colorId;
      
      const apiUrl = getApiUrl(`library/${id}`);
      
      const response = await fetch(apiUrl, {
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
        
        // Пытаемся получить текст ошибки
        const errorText = await response.text();
        console.error('Error updating library item:', errorText);
        
        throw new Error(`Failed to update library item: ${response.statusText}`);
      }

      const item: LibraryItem = await response.json();
      
      // Если сервер не возвращает iconId и colorId, добавляем их из запроса
      if (data.iconId && !item.icon_id) {
        item.icon_id = data.iconId;
      }
      if (data.colorId && !item.color_id) {
        item.color_id = data.colorId;
      }
      
      const convertedItem = convertToUserPrompt(item);
      return convertedItem;
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
      
      const response = await fetch(getApiUrl(`library/${id}`), {
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
      
      const response = await fetch(getApiUrl(`library/from-history/${historyId}`), {
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

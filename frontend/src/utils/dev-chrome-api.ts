/**
 * Временная замена для Chrome API в режиме разработки
 * Этот файл используется только в режиме разработки и не включается в финальную сборку
 */

// Определяем, находимся ли мы в режиме разработки
export const isDev = process.env.NODE_ENV === 'development';

// Временная замена для chrome API в режиме разработки
if (isDev && typeof window !== 'undefined') {
  console.log('Initializing Chrome API mock for development');
  
  // Создаем объект chrome, если он не существует
  if (!window.chrome) {
    window.chrome = {} as any;
  }
  
  // Создаем объект storage, если он не существует
  if (!window.chrome.storage) {
    window.chrome.storage = {} as any;
  }
  
  // Создаем массив слушателей для эмуляции onChanged
  const storageListeners: Array<(changes: any, areaName: string) => void> = [];
  
  // Создаем объект onChanged для эмуляции событий изменения хранилища
  if (!window.chrome.storage.onChanged) {
    window.chrome.storage.onChanged = {
      addListener: (callback: (changes: any, areaName: string) => void) => {
        console.log('DEV: chrome.storage.onChanged.addListener');
        storageListeners.push(callback);
      },
      removeListener: (callback: (changes: any, areaName: string) => void) => {
        console.log('DEV: chrome.storage.onChanged.removeListener');
        const index = storageListeners.indexOf(callback);
        if (index !== -1) {
          storageListeners.splice(index, 1);
        }
      }
    };
  }
  
  // Создаем объект local, если он не существует
  if (!window.chrome.storage.local) {
    window.chrome.storage.local = {
      // Реализация get с использованием localStorage
      get: (keys: string | string[] | object, callback: (items: any) => void) => {
        console.log('DEV: chrome.storage.local.get', keys);
        
        const result: any = {};
        
        if (typeof keys === 'string') {
          // Если keys - строка, получаем значение по этому ключу
          const value = localStorage.getItem(`chrome-storage-${keys}`);
          result[keys] = value ? JSON.parse(value) : undefined;
        } else if (Array.isArray(keys)) {
          // Если keys - массив, получаем значения по всем ключам
          keys.forEach(key => {
            const value = localStorage.getItem(`chrome-storage-${key}`);
            result[key] = value ? JSON.parse(value) : undefined;
          });
        } else {
          // Если keys - объект, используем его как значения по умолчанию
          Object.keys(keys).forEach(key => {
            const value = localStorage.getItem(`chrome-storage-${key}`);
            result[key] = value ? JSON.parse(value) : (keys as any)[key];
          });
        }
        
        // Вызываем callback с результатом
        setTimeout(() => callback(result), 0);
      },
      
      // Реализация set с использованием localStorage
      set: (items: object, callback?: () => void) => {
        console.log('DEV: chrome.storage.local.set', items);
        
        // Подготавливаем объект изменений для слушателей
        const changes: Record<string, { oldValue?: any; newValue: any }> = {};
        
        // Сохраняем все значения в localStorage и формируем объект изменений
        Object.entries(items).forEach(([key, value]) => {
          // Получаем старое значение
          const oldValueStr = localStorage.getItem(`chrome-storage-${key}`);
          const oldValue = oldValueStr ? JSON.parse(oldValueStr) : undefined;
          
          // Сохраняем новое значение
          localStorage.setItem(`chrome-storage-${key}`, JSON.stringify(value));
          
          // Добавляем в объект изменений
          changes[key] = { oldValue, newValue: value };
        });
        
        // Вызываем всех слушателей
        if (Object.keys(changes).length > 0) {
          console.log('DEV: Notifying storage listeners about changes', changes);
          setTimeout(() => {
            storageListeners.forEach(listener => {
              try {
                listener(changes, 'local');
              } catch (error) {
                console.error('Error in storage listener:', error);
              }
            });
          }, 0);
        }
        
        // Вызываем callback, если он предоставлен
        if (callback) {
          setTimeout(callback, 0);
        }
      },
      
      // Реализация remove с использованием localStorage
      remove: (keys: string | string[], callback?: () => void) => {
        console.log('DEV: chrome.storage.local.remove', keys);
        
        // Подготавливаем объект изменений для слушателей
        const changes: Record<string, { oldValue?: any; newValue?: any }> = {};
        
        if (typeof keys === 'string') {
          // Если keys - строка, удаляем значение по этому ключу
          const oldValueStr = localStorage.getItem(`chrome-storage-${keys}`);
          if (oldValueStr) {
            changes[keys] = { oldValue: JSON.parse(oldValueStr) };
            localStorage.removeItem(`chrome-storage-${keys}`);
          }
        } else if (Array.isArray(keys)) {
          // Если keys - массив, удаляем значения по всем ключам
          keys.forEach(key => {
            const oldValueStr = localStorage.getItem(`chrome-storage-${key}`);
            if (oldValueStr) {
              changes[key] = { oldValue: JSON.parse(oldValueStr) };
              localStorage.removeItem(`chrome-storage-${key}`);
            }
          });
        }
        
        // Вызываем всех слушателей
        if (Object.keys(changes).length > 0) {
          console.log('DEV: Notifying storage listeners about removals', changes);
          setTimeout(() => {
            storageListeners.forEach(listener => {
              try {
                listener(changes, 'local');
              } catch (error) {
                console.error('Error in storage listener:', error);
              }
            });
          }, 0);
        }
        
        // Вызываем callback, если он предоставлен
        if (callback) {
          setTimeout(callback, 0);
        }
      }
    };
  }
  
  // Создаем объект identity, если он не существует
  if (!window.chrome.identity) {
    window.chrome.identity = {
      // Реализация getAuthToken для режима разработки
      getAuthToken: (details: any, callback: (token?: string) => void) => {
        console.log('DEV: chrome.identity.getAuthToken', details);
        
        // Получаем токен из chrome.storage.local
        chrome.storage.local.get(['auth'], result => {
          const token = result.auth?.token;
          
          if (token) {
            callback(token);
          } else {
            // Если токена нет, показываем диалог для ввода токена
            const newToken = prompt('Введите токен для разработки:');
            if (newToken) {
              // Сохраняем токен в chrome.storage.local
              chrome.storage.local.set({
                auth: {
                  token: newToken,
                  user: {
                    id: '1',
                    email: 'dev@example.com',
                    displayName: 'Dev User'
                  }
                }
              }, () => {
                callback(newToken);
              });
            } else {
              callback();
            }
          }
        });
      },
      
      // Реализация removeCachedAuthToken для режима разработки
      removeCachedAuthToken: (details: any, callback?: () => void) => {
        console.log('DEV: chrome.identity.removeCachedAuthToken', details);
        
        // Получаем текущие данные авторизации
        chrome.storage.local.get(['auth'], result => {
          if (result.auth && result.auth.token === details.token) {
            // Создаем копию данных без токена
            const newAuthData = { ...result.auth };
            delete newAuthData.token;
            
            // Обновляем данные в хранилище
            chrome.storage.local.set({ auth: newAuthData }, () => {
              console.log('DEV: Token removed successfully');
              if (callback) {
                callback();
              }
            });
          } else {
            if (callback) {
              setTimeout(callback, 0);
            }
          }
        });
      }
    };
  }
  
  // Создаем объект runtime, если он не существует
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      // Реализация lastError для режима разработки
      lastError: null,
      
      // Реализация sendMessage для режима разработки
      sendMessage: (message: any, callback?: (response: any) => void) => {
        console.log('DEV: chrome.runtime.sendMessage', message);
        
        // В режиме разработки просто логируем сообщение
        if (callback) {
          setTimeout(() => callback({}), 0);
        }
      }
    };
  }
}

// Добавляем кнопку для установки токена в режиме разработки
if (isDev && typeof document !== 'undefined') {
  // Ждем, пока DOM будет готов
  document.addEventListener('DOMContentLoaded', () => {
    // Создаем кнопку
    const button = document.createElement('button');
    button.textContent = 'Установить токен для разработки';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.left = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '5px 10px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Добавляем обработчик клика
    button.addEventListener('click', () => {
      const token = prompt('Введите токен для разработки:');
      if (token) {
        // Используем chrome.storage.local.set вместо прямого доступа к localStorage
        // Это вызовет слушателей и обновит UI
        chrome.storage.local.set({
          auth: {
            token,
            user: {
              id: '1',
              email: 'dev@example.com',
              displayName: 'Dev User'
            }
          }
        });
        
        // Выводим сообщение об успешной установке токена
        console.log('DEV: Token set successfully');
        
        // Обновление страницы больше не требуется, так как UI обновится автоматически
        // благодаря слушателям chrome.storage.onChanged
      }
    });
    
    // Добавляем кнопку на страницу
    document.body.appendChild(button);
  });
}

// Экспортируем типы для TypeScript
declare global {
  interface Window {
    chrome: any;
  }
}

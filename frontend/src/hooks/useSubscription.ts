import { useAuth } from '@context/AuthContext';
import { usePrompts } from '@context/PromptContext';
import { historyApi } from '@services/api/history';
import { useState, useEffect } from 'react';

// Константы для лимитов
export const MAX_FREE_PROMPTS = 10;
export const MAX_FREE_IMPROVEMENTS = 3;

/**
 * Хук для управления подпиской и лимитами
 * 
 * Предоставляет информацию о статусе подписки, лимитах и текущем использовании
 */
export function useSubscription() {
  const { currentUser } = useAuth();
  const { userPrompts, isLoading: promptsLoading, loadPrompts } = usePrompts();
  
  const [improvementsCount, setImprovementsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTriedLoadingHistory, setHasTriedLoadingHistory] = useState(false);
  
  // Логируем только при первом рендеринге и при изменении данных
  useEffect(() => {
    console.log('useSubscription: Initial state', {
      userPrompts: userPrompts.length,
      promptsLoading,
      currentUser: currentUser?.email
    });
  }, []);
  
  // Определяем статус подписки
  const isPaidUser = currentUser?.payment_status === 'paid';
  
  // Убираем принудительную загрузку промптов, так как она уже происходит в PromptContext
  // useEffect(() => {
  //   console.log('useSubscription: Loading prompts');
  //   loadPrompts();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  
  // Загружаем данные об использованных улучшениях
  useEffect(() => {
    if (!currentUser || isPaidUser || hasTriedLoadingHistory) {
      setIsLoading(false);
      return;
    }
    
    // Отмечаем, что попытка загрузки была сделана
    setHasTriedLoadingHistory(true);
    
    // Используем limit=1 вместо limit=0, чтобы избежать ошибки 422
    historyApi.getHistory(0, 1)
      .then(response => {
        setImprovementsCount(response.total);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching improvements count:', error);
        // Устанавливаем значение по умолчанию при ошибке
        setImprovementsCount(0);
        setIsLoading(false);
      });
  }, [currentUser, isPaidUser, hasTriedLoadingHistory]);
  
  // Вычисляем оставшиеся лимиты
  const promptsLeft = isPaidUser ? Infinity : Math.max(0, MAX_FREE_PROMPTS - userPrompts.length);
  const improvementsLeft = isPaidUser ? Infinity : Math.max(0, MAX_FREE_IMPROVEMENTS - improvementsCount);
  
  // Проверяем, достигнуты ли лимиты
  const hasReachedPromptsLimit = !isPaidUser && userPrompts.length >= MAX_FREE_PROMPTS;
  const hasReachedImprovementsLimit = !isPaidUser && improvementsCount >= MAX_FREE_IMPROVEMENTS;
  
  return {
    // Статус подписки
    isPaidUser,
    isLoading,
    
    // Лимиты
    maxFreePrompts: MAX_FREE_PROMPTS,
    maxFreeImprovements: MAX_FREE_IMPROVEMENTS,
    
    // Текущее использование
    promptsCount: userPrompts.length,
    improvementsCount,
    
    // Оставшиеся ресурсы
    promptsLeft,
    improvementsLeft,
    
    // Методы проверки лимитов
    hasReachedPromptsLimit,
    hasReachedImprovementsLimit
  };
}

import React, { useState, useEffect } from 'react';
import './history-list.css';
import HistoryCard from '@components/ui/history-card/history-card';
import TimeDivider from '@components/ui/time-divider/time-divider';
import { historyApi } from '@services/api/history';
import { PromptHistoryItem } from '../../../../../types/history';
import EmptyState from '@components/ui/empty-state/empty-state';

// Function to determine model type from URL
const getModelTypeFromUrl = (url: string): 'chat-gpt' | 'claude' | 'deep-seek' | 'open-ai' | 'base-logo' => {
  // OpenAI URLs (не ChatGPT)
  if (url.includes('openai.com') && !url.includes('chat.openai.com')) {
    return 'open-ai';
  }
  
  // ChatGPT URLs
  if (url.includes('chat.openai.com') || 
      url.includes('chatgpt.com')) {
    return 'chat-gpt';
  }
  
  // Claude URLs
  if (url.includes('claude.ai')) {
    return 'claude';
  }
  
  // DeepSeek URLs
  if (url.includes('deepseek.com')) {
    return 'deep-seek';
  }
  
  return 'base-logo';
};

/**
 * History list component
 * Displays a list of prompt improvement historyf h
 */
const HistoryList: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<PromptHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const result = await historyApi.getHistory();
        setHistoryItems(result.items);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history');
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /**
   * Handle history item selection
   */
  const handleHistorySelect = (id: string) => {
    // Dispatch event to notify content area to show history detail
    const event = new CustomEvent('itemSelect', { detail: { id } });
    window.dispatchEvent(event);
  };

  return (
    <div className="history-list">
      <h2>Improvement history</h2>
      
      {isLoading ? (
        <div className="history-items">
          <TimeDivider date={new Date()} isLoading={true} />
          {Array(5).fill(0).map((_, index) => (
            <HistoryCard
              key={index}
              url=""
              date=""
              isLoading={true}
            />
          ))}
        </div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : historyItems.length === 0 ? (
        <EmptyState 
          message="Looks like there aren't any history items yet!"
          buttonText="Go to Library"
          onButtonClick={() => {
            // Dispatch event to navigate to library
            const event = new CustomEvent('navigate', { detail: { screen: 'prompts' } });
            window.dispatchEvent(event);
          }}
        />
      ) : (
        <div className="history-items">
          {/* Группировка элементов по дате */}
          {(() => {
            // Создаем объект для группировки элементов по дате
            const groupedItems: Record<string, { date: Date; items: PromptHistoryItem[] }> = {};
            
            // Группируем элементы по дате (без учета времени)
            historyItems.forEach(item => {
              const date = new Date(item.created_at);
              // Создаем ключ только из даты (без времени)
              const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
              
              if (!groupedItems[dateKey]) {
                groupedItems[dateKey] = {
                  date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                  items: []
                };
              }
              
              groupedItems[dateKey].items.push(item);
            });
            
            // Сортируем группы по дате (от новых к старым)
            const sortedGroups = Object.values(groupedItems).sort((a, b) => 
              b.date.getTime() - a.date.getTime()
            );
            
            // Отображаем группы с разделителями
            return sortedGroups.map(group => (
              <React.Fragment key={group.date.toISOString()}>
                <TimeDivider date={group.date} />
                {group.items.map(item => {
                  // Форматирование времени с учетом "сейчас"
                  const formatTime = (dateString: string): string => {
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMinutes = Math.floor(diffMs / 60000);
                    
                    // Если прошло менее минуты
                    if (diffMinutes < 1) {
                      return 'Now';
                    }
                    
                    // Иначе возвращаем время в формате часы:минуты
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  };

                  return (
                    <HistoryCard
                      key={item.id}
                      title={item.title || 'Untitled Prompt'}
                      url={item.url || 'No URL'}
                      date={formatTime(item.created_at)}
                      modelType={getModelTypeFromUrl(item.url || '')}
                      onClick={() => handleHistorySelect(item.id)}
                    />
                  );
                })}
              </React.Fragment>
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default HistoryList;

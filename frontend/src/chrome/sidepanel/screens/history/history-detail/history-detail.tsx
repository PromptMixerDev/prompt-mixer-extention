import React, { useState, useEffect } from 'react';
import './history-detail.css';
import InputBlock from '@components/ui/input-block/input-block';
import LogoImage from '@components/ui/logo-image/logo-image';
import Skeleton from 'react-loading-skeleton';
import { historyApi } from '@services/api/history';
import { libraryApi } from '@services/api/library';
import { PromptHistoryItem } from '../../../../../types/history';
import { getRandomIconId, getRandomColorId } from '@components/ui/library-icon/icon-options';
import { usePrompts } from '@context/PromptContext';
import { toast } from '@components/tech/toast/toast';

interface HistoryDetailProps {
  id?: string | null;
}

/**
 * History detail component
 */
const HistoryDetail: React.FC<HistoryDetailProps> = ({ id }) => {
  // Получаем функцию addPrompt из контекста
  const { addPrompt } = usePrompts();
  
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [improvedPrompt, setImprovedPrompt] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [modelType, setModelType] = useState<'chat-gpt' | 'claude' | 'deep-seek' | 'open-ai' | 'base-logo'>('base-logo');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Determine model type from URL
   */
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
   * Load history item data
   */
  useEffect(() => {
    const loadHistoryItem = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const historyItem = await historyApi.getHistoryItem(id);
        setOriginalPrompt(historyItem.original_prompt || '');
        setImprovedPrompt(historyItem.improved_prompt || '');
        setTitle(historyItem.title || 'Untitled Prompt');
        setDescription(historyItem.description || 'No description');
        setUrl(historyItem.url || '');
        setModelType(getModelTypeFromUrl(historyItem.url || ''));
      } catch (err) {
        console.error('Error loading history item:', err);
        setError('Failed to load history item');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoryItem();
  }, [id]);

  /**
   * Handle original prompt change
   */
  const handleOriginalPromptChange = (value: string) => {
    setOriginalPrompt(value);
  };

  /**
   * Handle improved prompt change
   */
  const handleImprovedPromptChange = (value: string) => {
    setImprovedPrompt(value);
  };

  return (
    <div className="history-detail">
      {isLoading ? (
        <div className="history-detail-meta">
          <LogoImage isLoading={true} size="large" />
          <div className="history-detail-meta-info">
            <Skeleton width={200} height={20} />
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      ) : error ? null : (
        <div className="history-detail-meta">
          <LogoImage logoName={modelType} size="xlarge" />
          <div className="history-detail-meta-info">
            <div className="history-detail-meta-title">{title}</div>
            <div className="history-detail-meta-description">{description}</div>
            {url && <div className="history-detail-meta-url">{url}</div>}
          </div>
        </div>
      )}
      
      <div className="history-detail-container">
        {isLoading ? (
          <>
            <InputBlock 
              variant="history-original"
              label="Original Prompt" 
              isLoading={true}
            />
            <InputBlock 
              variant="history-improved"
              label="Improved Prompt" 
              isLoading={true}
            />
          </>
        ) : error ? (
          <div className="history-detail-error">{error}</div>
        ) : (
          <>
            <InputBlock 
              variant="history-original"
              label="Original Prompt" 
              value={originalPrompt}
              placeholder="Original prompt will appear here..."
            />
            <InputBlock 
              variant="history-improved"
              label="Improved Prompt" 
              value={improvedPrompt}
              placeholder="Improved prompt will appear here..."
              onRightButtonClick={async () => {
                try {
                  // Получаем данные истории промпта
                  const historyItem = await historyApi.getHistoryItem(id || '');
                  
                  // Выбираем случайную иконку и цвет
                  const randomIconId = getRandomIconId();
                  const randomColorId = getRandomColorId();
                  
                  // Используем addPrompt вместо libraryApi.createLibraryItem
                  await addPrompt({
                    title: historyItem.title || 'Untitled Prompt',
                    description: historyItem.description || '',
                    content: historyItem.improved_prompt || '',
                    variables: [], // Можно добавить парсинг переменных, если нужно
                    iconId: randomIconId,
                    colorId: randomColorId
                  });
                  
                  // Показываем уведомление об успешном добавлении
                  toast.success('Промпт успешно добавлен в библиотеку');
                  
                  // Логируем успешное добавление в консоль
                  console.log('Prompt added to library successfully');
                } catch (err) {
                  // Показываем уведомление об ошибке
                  toast.error('Ошибка при добавлении промпта в библиотеку');
                  console.error('Error adding prompt to library:', err);
                }
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryDetail;

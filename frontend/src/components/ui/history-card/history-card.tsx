import React from 'react';
import './history-card.css';
import LogoImage from '@components/ui/logo-image/logo-image';
import Skeleton from 'react-loading-skeleton';

/**
 * HistoryCard component props interface
 */
interface HistoryCardProps {
  // Basic properties
  title?: string;
  url: string;
  date: string;
  modelType?: 'chat-gpt' | 'claude' | 'deep-seek' | 'open-ai' | 'base-logo'; // Type of AI model
  className?: string;
  onClick?: () => void;
  // Loading state
  isLoading?: boolean;
}

/**
 * HistoryCard component
 * 
 * Renders a horizontal card with logo, URL and date
 * 
 * @example
 * // Basic history card
 * <HistoryCard url="https://example.com" date="2025-03-14" />
 * 
 * // History card with specific model type
 * <HistoryCard url="https://chat.openai.com" date="2025-03-14" modelType="chat-gpt" />
 * 
 * // History card with custom class
 * <HistoryCard url="https://example.com" date="2025-03-14" className="custom-card" />
 * 
 * // History card in loading state (skeleton)
 * <HistoryCard url="" date="" isLoading={true} />
 */
const HistoryCard: React.FC<HistoryCardProps> = ({
  title,
  url,
  date,
  modelType,
  className = '',
  onClick,
  isLoading = false,
  ...rest
}) => {
  // Determine model type based on URL if not explicitly provided
  const determineModelType = (): 'chat-gpt' | 'claude' | 'deep-seek' | 'open-ai' | 'base-logo' => {
    if (modelType) return modelType;
    
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
    
    // If no model type could be determined, use the default icon
    return 'base-logo';
  };

  // Determine model type for logo
  const logoType = determineModelType();

  // Generate card classes
  const cardClasses = [
    'history-card',
    className
  ].filter(Boolean).join(' ');

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="history-card-left">
          <Skeleton circle width={32} height={32} /> {/* Скелетон для логотипа */}
          <Skeleton width={200} /> {/* Скелетон для URL/заголовка */}
        </div>
        <div className="history-card-right">
          <Skeleton width={50} /> {/* Скелетон для даты */}
        </div>
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      {...rest}
    >
      <div className="history-card-left">
        <LogoImage 
          logoName={logoType} 
          size="medium"
        />
        <div className="url text-default text-medium text-primary">{title || 'Untitled Prompt'}</div>
      </div>
      <div className="history-card-right">
        <div className="date text-small text-regular text-tertiary">{date}</div>
      </div>
    </div>
  );
};

export default HistoryCard;

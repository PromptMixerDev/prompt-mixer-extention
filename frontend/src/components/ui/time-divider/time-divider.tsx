import React from 'react';
import './time-divider.css';
import Skeleton from 'react-loading-skeleton';

/**
 * TimeDivider component props interface
 */
interface TimeDividerProps {
  // Date to display
  date: Date;
  // Format for displaying the date (optional)
  format?: string;
  // Additional CSS class (optional)
  className?: string;
  // Loading state
  isLoading?: boolean;
}

/**
 * TimeDivider component
 * 
 * Displays a date divider with special formatting for today and yesterday
 * 
 * @example
 * // Basic usage with current date (displays "Today, March 14")
 * <TimeDivider date={new Date()} />
 * 
 * // With yesterday's date (displays "Yesterday, March 13")
 * const yesterday = new Date();
 * yesterday.setDate(yesterday.getDate() - 1);
 * <TimeDivider date={yesterday} />
 * 
 * // With custom class
 * <TimeDivider date={new Date()} className="custom-divider" />
 * 
 * // Time divider in loading state (skeleton)
 * <TimeDivider date={new Date()} isLoading={true} />
 */
const TimeDivider: React.FC<TimeDividerProps> = ({
  date,
  className = '',
  isLoading = false,
}) => {
  // Форматирование даты с учетом "сегодня" и "вчера"
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Проверяем, является ли дата сегодняшней
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    
    // Проверяем, является ли дата вчерашней
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
    
    // Для остальных дат используем обычный формат
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    return (
      <div className={`time-divider ${className}`}>
        <Skeleton width={150} height={20} />
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <div className={`time-divider ${className}`}>
      <div className="text-small text-medium text-secondary">{formatDate(date)}</div>
    </div>
  );
};

export default TimeDivider;

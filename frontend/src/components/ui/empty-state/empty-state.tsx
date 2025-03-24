import React, { useState, useEffect } from 'react';
import './empty-state.css';
import Button from '@components/ui/button/button';

/**
 * EmptyState component props interface
 */
interface EmptyStateProps {
  // Текст сообщения (с возможностью переопределения)
  message?: string;
  // Текст кнопки (с возможностью переопределения)
  buttonText?: string;
  // Обработчик клика по кнопке
  onButtonClick?: () => void;
  // Дополнительные классы
  className?: string;
}

/**
 * EmptyState component
 * 
 * Displays an empty state with illustration, message and action button
 * 
 * @example
 * // Basic usage
 * <EmptyState onButtonClick={() => navigate('/prompts/new')} />
 * 
 * // With custom message and button text
 * <EmptyState 
 *   message="No history items found" 
 *   buttonText="Go to Library"
 *   onButtonClick={() => navigate('/prompts')} 
 * />
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message = "Looks like there aren't any prompts here yet!",
  buttonText = "Create prompt",
  onButtonClick,
  className = '',
  ...rest
}) => {
  // Generate classes
  const stateClasses = [
    'empty-state',
    className
  ].filter(Boolean).join(' ');

  const [iconSvg, setIconSvg] = useState<string | null>(null);

  // Load SVG icon when component mounts
  useEffect(() => {
    const loadIcon = async () => {
      try {
        // Use dynamic import with ?raw suffix
        const importedIcon = await import('@assets/illustration/empty-state.svg?raw');
        setIconSvg(importedIcon.default);
      } catch (error) {
        console.error('Failed to load empty state icon:', error);
        setIconSvg(null);
      }
    };

    loadIcon();
  }, []);

  return (
    <div className={stateClasses} {...rest}>
      <div className="empty-state__illustration">
        {iconSvg ? (
          <span 
            className="empty-state__icon" 
            dangerouslySetInnerHTML={{ __html: iconSvg }}
          />
        ) : (
          <div className="empty-state__icon-placeholder" />
        )}
      </div>
      <p className="empty-state__message text-tertiary">{message}</p>
      {onButtonClick && (
        <Button 
          variant="candy" 
          size="medium" 
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

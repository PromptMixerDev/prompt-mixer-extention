import React from 'react';
import './library-card.css';
import LibraryIcon from '@components/ui/library-icon/library-icon';
import Button from '@components/ui/button/button';
import Skeleton from 'react-loading-skeleton';
import { PromptMenuPopup } from '@components/ui/popups/prompt-menu-popup/prompt-menu-popup';

/**
 * LibraryCard component props interface
 */
interface LibraryCardProps {
  // Basic properties
  id?: string;
  title: string;
  iconName?: string;
  iconId?: string;
  colorId?: string;
  rightIconName?: string;
  className?: string;
  onClick?: () => void;
  onRightButtonClick?: (id?: string) => void;
  onRemove?: (id?: string) => void;
  // Loading state
  isLoading?: boolean;
  // Popup state
  isPopupActive?: boolean;
  onPopupOpenChange?: (isOpen: boolean) => void;
  onMouseEnter?: () => void;
}

/**
 * LibraryCard component
 * 
 * Renders a horizontal card with icon, title and action button
 * 
 * @example
 * // Basic library card
 * <LibraryCard title="My Prompt" iconName="prompt-line" />
 * 
 * // Library card with custom right icon and click handlers
 * <LibraryCard 
 *   title="SEO Optimization" 
 *   iconName="prompt-line" 
 *   rightIconName="menu-line"
 *   onClick={() => handleCardClick()}
 *   onRightButtonClick={() => handleMenuClick()}
 * />
 * 
 * // Library card with custom class
 * <LibraryCard title="Code Review" className="custom-card" />
 * 
 * // Library card in loading state (skeleton)
 * <LibraryCard title="" isLoading={true} />
 */
const LibraryCard: React.FC<LibraryCardProps> = ({
  id,
  title,
  iconName = 'prompt-line',
  iconId,
  colorId,
  rightIconName = 'more-line',
  className = '',
  onClick,
  onRightButtonClick,
  onRemove,
  isLoading = false,
  isPopupActive,
  onPopupOpenChange,
  onMouseEnter,
  ...rest
}) => {
  // Generate card classes
  const cardClasses = [
    'library-card',
    className
  ].filter(Boolean).join(' ');

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    return (
      <div className={cardClasses}>
        <div className="library-card-left">
          <Skeleton width={32} height={32} borderRadius="var(--border-radius-md)" /> {/* Скелетон для иконки */}
          <Skeleton width={200} /> {/* Скелетон для заголовка */}
        </div>
        <div className="library-card-right">
          <Skeleton width={24} height={24} borderRadius="var(--border-radius-md)" /> {/* Скелетон для кнопки */}
        </div>
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      {...rest}
    >
      <div className="library-card-left">
        <LibraryIcon 
          iconName={iconName}
          iconId={iconId}
          colorId={colorId}
          size="medium"
        />
        <div className="title text-default text-medium text-primary">{title}</div>
      </div>
      <div className="library-card-right">
        <PromptMenuPopup
          trigger={
            <Button
              kind="glyph"
              variant="tertiary"
              size="small"
              icon={rightIconName}
            />
          }
          promptId={id || ''}
          onEdit={(promptId) => onRightButtonClick && onRightButtonClick(promptId)}
          onRemove={(promptId) => onRemove && onRemove(promptId)}
          isActive={isPopupActive}
          onOpenChange={onPopupOpenChange}
        />
      </div>
    </div>
  );
};

export default LibraryCard;

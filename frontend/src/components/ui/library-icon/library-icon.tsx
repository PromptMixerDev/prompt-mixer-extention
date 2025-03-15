import React, { useState, useEffect } from 'react';
import './library-icon.css';
import Skeleton from 'react-loading-skeleton';

/**
 * LibraryIcon component props interface
 */
interface LibraryIconProps {
  // Size variants
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  // Icon name without .svg extension
  iconName?: string;
  // Additional CSS class
  className?: string;
  // Loading state
  isLoading?: boolean;
}

/**
 * LibraryIcon component
 * 
 * Renders an icon with different size options
 * 
 * @example
 * // Basic icon with default size (medium)
 * <LibraryIcon iconName="prompt-line" />
 * 
 * // Small sized icon
 * <LibraryIcon size="small" iconName="braces-line" />
 * 
 * // Extra large icon with custom class
 * <LibraryIcon size="xlarge" iconName="chat-smile" className="custom-icon" />
 * 
 * // Default icon
 * <LibraryIcon iconName="base-icon" />
 * 
 * // Icon in loading state (skeleton)
 * <LibraryIcon isLoading={true} />
 */
const LibraryIcon: React.FC<LibraryIconProps> = ({
  size = 'medium',
  iconName = 'base-icon',
  className = '',
  isLoading = false,
}) => {
  const [iconSvg, setIconSvg] = useState<string | null>(null);

  // Load SVG icon when component mounts or when iconName changes
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const importedIcon = await import(`@assets/icons/general/${iconName}.svg?raw`);
        setIconSvg(importedIcon.default);
      } catch (error) {
        console.error(`Failed to load icon: ${iconName}`, error);
        setIconSvg(null);
      }
    };

    loadIcon();
  }, [iconName]);

  // Generate icon classes
  const iconClasses = [
    'library-icon',
    `library-icon-${size}`,
    className
  ].filter(Boolean).join(' ');

  // Определяем размеры скелетона в зависимости от размера иконки
  const getSkeletonSize = (): { width: number; height: number } => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24 };
      case 'medium':
        return { width: 28, height: 28 };
      case 'large':
        return { width: 32, height: 32 };
      case 'xlarge':
        return { width: 44, height: 44 };
      default:
        return { width: 28, height: 28 };
    }
  };

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    const { width, height } = getSkeletonSize();
    return (
      <div className={iconClasses}>
        <Skeleton 
          width={width} 
          height={height} 
          borderRadius="var(--border-radius-md)" 
        />
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <div className={iconClasses}>
      {iconSvg && (
        <span 
          className="library-icon-svg" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      )}
    </div>
  );
};

export default LibraryIcon;

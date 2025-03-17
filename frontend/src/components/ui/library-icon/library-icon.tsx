import React from 'react';
import './library-icon.css';
import Skeleton from 'react-loading-skeleton';
import { 
  getIconById, 
  getColorById, 
  defaultIconId, 
  defaultColorId, 
  generalIcons
} from './icon-options';

/**
 * LibraryIcon component props interface
 */
interface LibraryIconProps {
  // Size variants
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  // Icon name without .svg extension (legacy)
  iconName?: string;
  // Icon ID from availableIcons
  iconId?: string;
  // Color ID from availableColors
  colorId?: string;
  // Additional CSS class
  className?: string;
  // Loading state
  isLoading?: boolean;
  // Is icon editable (clickable)
  editable?: boolean;
  // Click handler
  onClick?: () => void;
  // Custom icon size (overrides default size based on container)
  iconSize?: number;
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
 * // Small sized icon with color
 * <LibraryIcon size="small" iconId="aliens-fill" colorId="cobalt" />
 * 
 * // Extra large icon with custom class
 * <LibraryIcon size="xlarge" iconId="bear-smile-fill" colorId="crimson" className="custom-icon" />
 * 
 * // Editable icon that opens a popup when clicked
 * <LibraryIcon iconId="lightbulb-fill" colorId="amber" editable={true} onClick={handleIconClick} />
 * 
 * // Icon with custom icon size
 * <LibraryIcon iconId="settings-fill" colorId="emerald" iconSize={24} />
 * 
 * // Icon in loading state (skeleton)
 * <LibraryIcon isLoading={true} />
 */
const LibraryIcon: React.FC<LibraryIconProps> = ({
  size = 'medium',
  iconName,
  iconId,
  colorId,
  className = '',
  isLoading = false,
  editable = false,
  onClick,
  iconSize,
}) => {
  // Получаем SVG контент для иконки
  const getIconSvg = (): string | null => {
    let result: string | null = null;
    
    // Если указан iconId, используем его
    if (iconId) {
      const icon = getIconById(iconId);
      
      if (icon?.svg) {
        result = icon.svg;
      }
    }
    
    // Иначе используем старый способ с iconName
    if (!result) {
      const name = iconName || 'base-icon';
      result = generalIcons[name as keyof typeof generalIcons] || null;
    }
    
    return result;
  };
  
  // Получаем SVG контент
  const iconSvg = getIconSvg();
  
  // Получаем цвет из ID
  const getColorStyle = (): React.CSSProperties => {
    if (!colorId) {
      return {};
    }
    
    const color = getColorById(colorId);
    const isSmallIcon = size === 'small' || size === 'medium';
    
    let result: React.CSSProperties = {};
    
    if (isSmallIcon) {
      // Для маленьких иконок: цветной фон
      result = { backgroundColor: color?.value };
    } else {
      // Для больших иконок: цветная иконка
      result = { '--icon-color': color?.value } as React.CSSProperties;
    }
    
    return result;
  };
  
  // Получаем стили цвета
  const colorStyle = getColorStyle();

  // Generate icon classes
  const iconClasses = [
    'library-icon',
    `library-icon-${size}`,
    colorId ? 'colored-icon' : '',
    editable ? 'editable' : '',
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
    <div 
      className={iconClasses}
      style={colorStyle}
      onClick={editable ? onClick : undefined}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
    >
      {iconSvg && (
        <span 
          className="library-icon-svg" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
          style={iconSize ? { '--custom-icon-size': `${iconSize}px` } as React.CSSProperties : {}}
        />
      )}
    </div>
  );
};

export default LibraryIcon;

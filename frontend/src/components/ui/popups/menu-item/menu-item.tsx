import React from 'react';
import './menu-item.css';

interface MenuItemProps {
  /**
   * Содержимое элемента меню
   */
  children: React.ReactNode;
  
  /**
   * Обработчик клика по элементу меню
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Название иконки (без расширения .svg)
   */
  icon?: string;
  
  /**
   * Вариант элемента меню
   */
  variant?: 'default' | 'danger' | 'secondary';
  
  /**
   * Отключает элемент меню
   */
  disabled?: boolean;
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент элемента меню для использования внутри MenuPopup
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  icon,
  variant = 'default',
  disabled = false,
  className = '',
}) => {
  const [iconSvg, setIconSvg] = React.useState<string | null>(null);
  
  // Загружаем SVG иконку при монтировании компонента
  React.useEffect(() => {
    if (!icon) return;
    
    const loadIcon = async () => {
      try {
        // Используем динамический импорт с суффиксом ?raw
        const importedIcon = await import(`@assets/icons/general/${icon}.svg?raw`);
        setIconSvg(importedIcon.default);
      } catch (error) {
        console.error(`Failed to load icon: ${icon}`, error);
        setIconSvg(null);
      }
    };
    
    loadIcon();
  }, [icon]);
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
  };
  
  const itemClasses = [
    'menu-item',
    `menu-item--${variant}`,
    disabled ? 'menu-item--disabled' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={itemClasses}
      onClick={handleClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
    >
      {icon && iconSvg && (
        <span 
          className="menu-item__icon" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      )}
      <span className="menu-item__text">{children}</span>
    </div>
  );
};

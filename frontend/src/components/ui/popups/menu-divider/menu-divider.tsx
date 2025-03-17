import React from 'react';
import './menu-divider.css';

interface MenuDividerProps {
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент разделителя для использования внутри MenuPopup
 */
export const MenuDivider: React.FC<MenuDividerProps> = ({
  className = '',
}) => {
  const dividerClasses = [
    'menu-divider',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={dividerClasses}
      role="separator"
    />
  );
};

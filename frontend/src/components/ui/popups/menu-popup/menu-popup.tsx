import React from 'react';
import Popover, { PopoverAlign } from '@/components/tech/popover/popover';
import { MenuItem } from '@/components/ui/popups/menu-item/menu-item';
import { MenuDivider } from '@/components/ui/popups/menu-divider/menu-divider';
import './menu-popup.css';

export interface MenuPopupItem {
  id: string | number;
  label?: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
}

interface MenuPopupProps {
  /**
   * Элемент, который будет триггером для открытия меню
   */
  trigger: React.ReactNode;
  
  /**
   * Элементы меню
   */
  items?: MenuPopupItem[];
  
  /**
   * Дочерние элементы (альтернатива items)
   */
  children?: React.ReactNode;
  
  /**
   * Выравнивание меню относительно триггера
   * @default 'right'
   */
  align?: PopoverAlign;
  
  /**
   * Контролируемое состояние открытия
   */
  isOpen?: boolean;
  
  /**
   * Обработчик изменения состояния открытия
   */
  onOpenChange?: (isOpen: boolean) => void;
  
  /**
   * Дополнительные CSS классы
   */
  className?: string;
}

/**
 * Компонент выпадающего меню
 * 
 * @example
 * // С использованием массива items
 * <MenuPopup
 *   trigger={<Button icon="menu-line" kind="glyph" />}
 *   items={[
 *     { id: 1, label: 'Редактировать', icon: 'edit-line', onClick: handleEdit },
 *     { id: 2, label: 'Копировать', icon: 'copy-line', onClick: handleCopy },
 *     { id: 3, divider: true },
 *     { id: 4, label: 'Удалить', icon: 'delete-line', variant: 'danger', onClick: handleDelete }
 *   ]}
 * />
 * 
 * // С использованием дочерних элементов
 * <MenuPopup trigger={<Button icon="menu-line" kind="glyph" />}>
 *   <MenuItem icon="edit-line" onClick={handleEdit}>Редактировать</MenuItem>
 *   <MenuItem icon="copy-line" onClick={handleCopy}>Копировать</MenuItem>
 *   <MenuDivider />
 *   <MenuItem icon="delete-line" variant="danger" onClick={handleDelete}>Удалить</MenuItem>
 * </MenuPopup>
 */
export const MenuPopup: React.FC<MenuPopupProps> = ({
  trigger,
  items,
  children,
  align = 'right',
  isOpen,
  onOpenChange,
  className = '',
}) => {
  // Генерируем содержимое меню из массива items, если он предоставлен
  const menuContent = items ? (
    <div className="menu-popup">
      {items.map((item) => {
        if (item.divider) {
          return <MenuDivider key={item.id} />;
        }
        
        // Проверяем наличие label
        if (item.label === undefined) return null;
        
        return (
          <MenuItem
            key={item.id}
            icon={item.icon}
            onClick={item.onClick}
            variant={item.variant}
            disabled={item.disabled}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </div>
  ) : (
    <div className="menu-popup">
      {children}
    </div>
  );
  
  const popoverClasses = [
    'menu-popup-wrapper',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={(newIsOpen) => {
        console.log('MenuPopup: onOpenChange', { newIsOpen });
        onOpenChange?.(newIsOpen);
      }}
      align={align}
      className={popoverClasses}
    >
      <Popover.Trigger>
        {trigger}
      </Popover.Trigger>
      <Popover.Content>
        <div onClick={(e) => {
          console.log('MenuPopup: content onClick');
          e.stopPropagation();
        }}>
          {menuContent}
        </div>
      </Popover.Content>
    </Popover>
  );
};

// Экспортируем подкомпоненты для удобства использования
export { MenuItem, MenuDivider };

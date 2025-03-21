import React, { useState } from 'react';
import './prompt-menu-popup.css';
import { MenuPopup } from '@components/ui/popups/menu-popup/menu-popup';
import { MenuItem } from '@components/ui/popups/menu-item/menu-item';

interface PromptMenuPopupProps {
  /**
   * Элемент, который будет триггером для открытия меню
   */
  trigger: React.ReactNode;
  
  /**
   * ID промпта
   */
  promptId: string;
  
  /**
   * Обработчик редактирования промпта
   */
  onEdit?: (promptId: string) => void;
  
  /**
   * Обработчик удаления промпта
   */
  onRemove?: (promptId: string) => void;
  
  /**
   * Флаг активности попапа (контролируемый извне)
   */
  isActive?: boolean;
  
  /**
   * Обработчик изменения состояния открытия
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Компонент выпадающего меню для промптов
 */
export const PromptMenuPopup: React.FC<PromptMenuPopupProps> = ({ 
  trigger, 
  promptId,
  onEdit,
  onRemove,
  isActive,
  onOpenChange
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  // Используем внешнее состояние, если оно предоставлено
  const isOpen = isActive !== undefined ? isActive : isOpenInternal;
  const setIsOpen = (newIsOpen: boolean) => {
    setIsOpenInternal(newIsOpen);
    onOpenChange?.(newIsOpen);
  };
  
  const handleEdit = () => {
    onEdit?.(promptId);
    setIsOpen(false);
  };
  
  const handleRemove = () => {
    onRemove?.(promptId);
    setIsOpen(false);
  };
  
  return (
    <MenuPopup 
      trigger={trigger} 
      align="bottom-right"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <MenuItem icon="edit-line" onClick={handleEdit}>
        Edit prompt
      </MenuItem>
      <MenuItem icon="bin-line" variant="danger" onClick={handleRemove}>
        Remove prompt
      </MenuItem>
    </MenuPopup>
  );
};

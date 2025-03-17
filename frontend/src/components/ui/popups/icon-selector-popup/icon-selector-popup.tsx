import React, { useState } from 'react';
import { MenuPopup } from '@components/ui/popups/menu-popup/menu-popup';
import LibraryIcon from '@components/ui/library-icon/library-icon';
import { availableIcons, availableColors, defaultIconId, defaultColorId } from '@components/ui/library-icon/icon-options';
import './icon-selector-popup.css';

interface IconSelectorPopupProps {
  /**
   * Элемент, который будет триггером для открытия попапа
   */
  trigger: React.ReactNode;
  
  /**
   * Текущий ID иконки
   */
  currentIconId?: string;
  
  /**
   * Текущий ID цвета
   */
  currentColorId?: string;
  
  /**
   * Обработчик выбора иконки и цвета
   */
  onSelect: (iconId: string, colorId: string) => void;
}

/**
 * Компонент попапа для выбора иконки и цвета
 */
export const IconSelectorPopup: React.FC<IconSelectorPopupProps> = ({
  trigger,
  currentIconId = defaultIconId,
  currentColorId = defaultColorId,
  onSelect,
}) => {
  // Локальное состояние для открытия/закрытия попапа
  const [isOpen, setIsOpen] = useState(false);
  
  // Обработчик выбора иконки
  const handleIconSelect = (iconId: string) => {
    try {
      onSelect(iconId, currentColorId);
    } catch (error) {
      console.error('Ошибка при выборе иконки:', error);
    }
    // Не закрываем попап после выбора
  };
  
  // Обработчик выбора цвета
  const handleColorSelect = (colorId: string) => {
    try {
      onSelect(currentIconId, colorId);
    } catch (error) {
      console.error('Ошибка при выборе цвета:', error);
    }
    // Не закрываем попап после выбора
  };
  
  return (
    <MenuPopup 
      trigger={trigger} 
      align="bottom-left"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="icon-selector-popup">
        {/* Секция выбора цвета */}
        <div className="icon-selector-popup__section">
          <div className="icon-selector-popup__section-title">Выберите цвет</div>
          <div className="icon-selector-popup__colors">
            {availableColors.map(color => (
              <div
                key={color.id}
                className={`icon-selector-popup__color ${currentColorId === color.id ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleColorSelect(color.id);
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        
        {/* Секция выбора иконки */}
        <div className="icon-selector-popup__section">
          <div className="icon-selector-popup__section-title">Выберите иконку</div>
          <div className="icon-selector-popup__icons">
            {availableIcons.map(icon => (
              <div
                key={icon.id}
                className={`icon-selector-popup__icon-wrapper ${currentIconId === icon.id ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleIconSelect(icon.id);
                }}
                title={icon.name}
              >
                <LibraryIcon
                  key={`${icon.id}-${currentColorId}`}
                  size="medium"
                  iconId={icon.id}
                  colorId={currentColorId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </MenuPopup>
  );
};

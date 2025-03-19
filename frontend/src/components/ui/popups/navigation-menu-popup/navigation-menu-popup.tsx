import React from 'react';
import { MenuPopup } from '@components/ui/popups/menu-popup/menu-popup';
import { MenuItem } from '@components/ui/popups/menu-item/menu-item';
import { MenuDivider } from '@components/ui/popups/menu-divider/menu-divider';
import { useAuth } from '@context/AuthContext';
import './navigation-menu-popup.css';

interface NavigationMenuPopupProps {
  /**
   * Элемент, который будет триггером для открытия меню
   */
  trigger: React.ReactNode;
}

/**
 * Компонент выпадающего меню для навигации
 */
export const NavigationMenuPopup: React.FC<NavigationMenuPopupProps> = ({ trigger }) => {
  // Получаем функцию signOut из контекста аутентификации
  const { signOut } = useAuth();
  
  /**
   * Обработчики для элементов меню
   */
  const handleSettings = () => {
    console.log('Settings clicked');
    // Здесь будет логика для открытия настроек
  };

  const handleHelp = () => {
    console.log('Help clicked');
    // Здесь будет логика для открытия справки
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    try {
      await signOut(); // Вызываем функцию signOut из AuthContext
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <MenuPopup trigger={trigger} align="bottom-right">
      <MenuItem icon="base-icon" onClick={handleSettings}>
        Настройки
      </MenuItem>
      <MenuItem icon="base-icon" onClick={handleHelp}>
        Справка
      </MenuItem>
      <MenuDivider />
      <MenuItem icon="base-icon" variant="danger" onClick={handleLogout}>
        Выйти
      </MenuItem>
    </MenuPopup>
  );
};

import React, { useState } from 'react';
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
  // Состояние для контроля открытия/закрытия меню
  const [isOpen, setIsOpen] = useState(false);
  
  // Получаем функцию signOut из контекста аутентификации
  const { signOut } = useAuth();
  
  /**
   * Обработчики для элементов меню
   */
  const handleSettings = () => {
    console.log('Profile clicked');
    // Генерируем событие tabChange для переключения на вкладку profile
    const event = new CustomEvent('tabChange', { detail: { tab: 'profile' } });
    window.dispatchEvent(event);
    // Закрываем меню
    setIsOpen(false);
  };

  const handleHelp = () => {
    console.log('Help clicked');
    // Здесь будет логика для открытия справки
    // Закрываем меню
    setIsOpen(false);
  };

  // Обработчики для новых пунктов меню
  const handleTermsOfService = () => {
    console.log('Terms of Service clicked');
    // Здесь будет логика для открытия Terms of Service
    // Закрываем меню
    setIsOpen(false);
  };

  const handlePrivacy = () => {
    console.log('Privacy clicked');
    // Здесь будет логика для открытия Privacy
    // Закрываем меню
    setIsOpen(false);
  };

  const handleRefundPolicy = () => {
    console.log('Refund Policy clicked');
    // Здесь будет логика для открытия Refund Policy
    // Закрываем меню
    setIsOpen(false);
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    try {
      await signOut(); // Вызываем функцию signOut из AuthContext
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
    }
    // Закрываем меню
    setIsOpen(false);
  };

  return (
    <MenuPopup 
      trigger={trigger} 
      align="bottom-right"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <MenuItem icon="base-icon" onClick={handleSettings}>
        My profile
      </MenuItem>
      <MenuItem icon="base-icon" onClick={handleHelp}>
        Upgrade
      </MenuItem>
      <MenuDivider />
      <MenuItem variant="secondary" onClick={handleTermsOfService}>
        Terms of Service
      </MenuItem>
      <MenuItem variant="secondary" onClick={handlePrivacy}>
        Privacy
      </MenuItem>
      <MenuItem variant="secondary" onClick={handleRefundPolicy}>
        Refund Policy
      </MenuItem>
      <MenuItem variant="secondary" onClick={handleLogout}>
        Logout
      </MenuItem>
    </MenuPopup>
  );
};

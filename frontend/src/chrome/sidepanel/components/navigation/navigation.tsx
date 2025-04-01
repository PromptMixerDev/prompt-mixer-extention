import React, { useState } from 'react';
import './navigation.css';
import Button from '@components/ui/button/button';
import { Tooltip } from '@components/tech/tooltip/tooltip';
import { NavigationMenuPopup } from '@components/ui/popups/navigation-menu-popup/navigation-menu-popup';
import { useAuth } from '@context/AuthContext';

/**
 * Navigation component for the side panel
 */
const Navigation: React.FC = () => {
  // Используем activeTab для визуального отображения активной вкладки
  const [activeTab, setActiveTab] = useState('prompt');
  const { currentUser } = useAuth();
  
  // Проверяем, является ли пользователь бесплатным
  const isUnpaidUser = currentUser && currentUser.payment_status !== 'paid';

  /**
   * Handle tab click
   */
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // Here we would dispatch an event or update a context to change the content area
    const event = new CustomEvent('tabChange', { detail: { tab } });
    window.dispatchEvent(event);
  };
  
  /**
   * Handle upgrade button click
   */
  const handleUpgradeClick = () => {
    // Перенаправление на страницу профиля, где пользователь может обновить подписку
    const event = new CustomEvent('tabChange', { detail: { tab: 'profile' } });
    window.dispatchEvent(event);
  };


  return (
    <div className="navigation">
      <div className="navigation-left">
        <Tooltip content="My library" position="bottom">
          <Button 
            kind="glyph" 
            size="medium" 
            variant="tertiary" 
            icon="prompt-line"
            onClick={() => handleTabClick('prompt')} 
          />
        </Tooltip>
        
        <Tooltip content="Improvement history" position="bottom">
          <Button 
            kind="glyph" 
            size="medium" 
            variant="tertiary" 
            icon="history-line"
            onClick={() => handleTabClick('history')} 
          />
        </Tooltip>
        
        <div style={{ display: 'none' }}>
          <Tooltip content="Search prompts" position="bottom-center">
            <Button 
              kind="glyph" 
              size="medium" 
              variant="tertiary" 
              icon="search-line"
              onClick={() => handleTabClick('marketplace')} 
            />
          </Tooltip>
        </div>
      </div>
      <div className="navigation-right">
        {isUnpaidUser && (
          <Tooltip content="Upgrade to Pro" position="bottom-right">
            <Button 
              kind="glyph-text" 
              size="medium" 
              variant="candy" 
              icon="flashlight-fill"
              onClick={handleUpgradeClick}
            >
              Go to Pro
            </Button>
          </Tooltip>
        )}
        
        <NavigationMenuPopup
          trigger={
            <Tooltip content="Open menu" position="bottom-right">
              <Button 
                kind="glyph" 
                size="medium" 
                variant="tertiary" 
                icon="menu-line"
              />
            </Tooltip>
          }
        />
      </div>
    </div>
  );
};

export default Navigation;

import React, { useState, useEffect } from 'react';
import PromptList from '../../screens/prompts/prompt-list/prompt-list';
import PromptDetail from '../../screens/prompts/prompt-detail/prompt-detail';
import HistoryList from '../../screens/history/history-list/history-list';
import HistoryDetail from '../../screens/history/history-detail/history-detail';
import Marketplace from '../../screens/marketplace/marketplace';
import Profile from '../../screens/profile/profile';
import BackHeader from '@components/ui/back-header/back-header';
import './content-area.css';

/**
 * Content area component
 * Displays different screens based on the active tab
 */
const ContentArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prompt');
  const [activeScreen, setActiveScreen] = useState('list'); // 'list' or 'detail'
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for tab change events
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail.tab);
      setActiveScreen('list'); // Reset to list view when changing tabs
      setSelectedItemId(null);
    };

    // Listen for item selection events
    const handleItemSelect = (event: CustomEvent) => {
      setSelectedItemId(event.detail.id);
      setActiveScreen('detail');
    };

    // Listen for back to list events
    const handleBackToList = () => {
      setActiveScreen('list');
      setSelectedItemId(null);
    };

    // Add event listeners
    window.addEventListener('tabChange', handleTabChange as EventListener);
    window.addEventListener('itemSelect', handleItemSelect as EventListener);
    window.addEventListener('backToList', handleBackToList);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener);
      window.removeEventListener('itemSelect', handleItemSelect as EventListener);
      window.removeEventListener('backToList', handleBackToList);
    };
  }, []);

  // Обработчик кнопки "назад"
  const handleBack = () => {
    if (activeTab === 'profile') {
      // Для страницы профиля переключаемся на вкладку prompt
      const event = new CustomEvent('tabChange', { detail: { tab: 'prompt' } });
      window.dispatchEvent(event);
    } else {
      // Для других страниц возвращаемся к списку
      setActiveScreen('list');
      setSelectedItemId(null);
    }
  };

  // Получить заголовок для кнопки "назад"
  const getBackTitle = () => {
    switch (activeTab) {
      case 'prompt':
        return 'Back to prompts';
      case 'history':
        return 'Back to history';
      case 'profile':
        return 'Profile'; // Возвращаемся к промптам при нажатии "назад" на странице профиля
      default:
        return 'Back';
    }
  };

  // Render the appropriate screen based on the active tab and screen
  const renderContent = () => {
    switch (activeTab) {
      case 'prompt':
        return activeScreen === 'list' ? (
          <PromptList />
        ) : (
          <PromptDetail id={selectedItemId} />
        );
      case 'history':
        return activeScreen === 'list' ? (
          <HistoryList />
        ) : (
          <HistoryDetail id={selectedItemId} />
        );
      case 'marketplace':
        return <Marketplace />;
      case 'profile':
        return <Profile />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div className="content-area">
      {(activeScreen === 'detail' || activeTab === 'profile') && (
        <BackHeader 
          onClick={handleBack} 
          title={getBackTitle()} 
        />
      )}
      {renderContent()}
    </div>
  );
};

export default ContentArea;

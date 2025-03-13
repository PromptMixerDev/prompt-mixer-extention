import React, { useState } from 'react';
import './navigation.css';

/**
 * Navigation tabs for the side panel
 */
const Navigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prompt');

  /**
   * Handle tab click
   */
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // Here we would dispatch an event or update a context to change the content area
    const event = new CustomEvent('tabChange', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <div className="navigation">
      <div 
        className={`nav-tab ${activeTab === 'prompt' ? 'active' : ''}`}
        onClick={() => handleTabClick('prompt')}
      >
        Prompts
      </div>
      <div 
        className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => handleTabClick('history')}
      >
        History
      </div>
      <div 
        className={`nav-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
        onClick={() => handleTabClick('marketplace')}
      >
        Marketplace
      </div>
    </div>
  );
};

export default Navigation;

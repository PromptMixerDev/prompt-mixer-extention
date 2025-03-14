import React, { useState } from 'react';
import './navigation.css';
import Button from '@components/ui/button/button';

/**
 * Navigation component for the side panel
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
      <div className="navigation-left">
        <Button 
          kind="glyph" 
          size="medium" 
          variant="tertiary" 
          icon="prompt-line"
          onClick={() => handleTabClick('prompt')} 
        />
        <Button 
          kind="glyph" 
          size="medium" 
          variant="tertiary" 
          icon="history-line"
          onClick={() => handleTabClick('history')} 
        />
        <Button 
          kind="glyph" 
          size="medium" 
          variant="tertiary" 
          icon="search-line"
          onClick={() => handleTabClick('marketplace')} 
        />
      </div>
      <div className="navigation-right">
        <Button 
          kind="glyph" 
          size="medium" 
          variant="tertiary" 
          icon="menu-line"
          onClick={() => {/* действие меню */}} 
        />
      </div>
    </div>
  );
};

export default Navigation;

import React, { useState } from 'react';
import './navigation.css';
import Button from '@components/ui/button/button';
import { Tooltip } from '@components/tech/tooltip/tooltip';

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
        <Tooltip content="My library" position="bottom">
          <Button 
            kind="glyph" 
            size="medium" 
            variant="tertiary" 
            icon="prompt-line"
            onClick={() => handleTabClick('prompt')} 
          />
        </Tooltip>
        
        <Tooltip content="Improvment history" position="bottom">
          <Button 
            kind="glyph" 
            size="medium" 
            variant="tertiary" 
            icon="history-line"
            onClick={() => handleTabClick('history')} 
          />
        </Tooltip>
        
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
      <div className="navigation-right">
        <Tooltip content="Open menu" position="bottom-right">
          <Button 
            kind="glyph" 
            size="medium" 
            variant="tertiary" 
            icon="menu-line"
            onClick={() => {/* действие меню */}} 
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default Navigation;

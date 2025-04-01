import React from 'react';
import './usage-limits.css';
import Button from '@components/ui/button/button';

interface UsageLimitsProps {
  /**
   * Number of free improvements left
   */
  improvementsLeft: number;
  
  /**
   * Number of free prompts left in library
   */
  promptsLeft: number;
  
  /**
   * Handler for Go to Pro button click
   */
  onGoToProClick: () => void;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * UsageLimits component
 * Displays information about usage limits for free users
 * and a button to upgrade to Pro
 */
const UsageLimits: React.FC<UsageLimitsProps> = ({
  improvementsLeft,
  promptsLeft,
  onGoToProClick,
  className = ''
}) => {
  return (
    <div className={`usage-limits ${className}`}>
      <div className="usage-limits-info">
        <div className="usage-limits-item">
          <span className="usage-limits-count">{improvementsLeft}</span> free improvements left
        </div>
        <div className="usage-limits-item">
          <span className="usage-limits-count">{promptsLeft}</span> free prompts left in library
        </div>
      </div>
      <div className="usage-limits-action">
        <Button 
          kind="glyph-text" 
          size="medium" 
          variant="primary" 
          icon="flashlight-fill"
          onClick={onGoToProClick}
        >
          Go to Pro
        </Button>
      </div>
    </div>
  );
};

export default UsageLimits;

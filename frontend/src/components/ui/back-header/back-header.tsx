import React from 'react';
import './back-header.css';
import Button from '@components/ui/button/button';
import Skeleton from 'react-loading-skeleton';

/**
 * BackHeader component props
 */
interface BackHeaderProps {
  /**
   * Function to call when back button is clicked
   */
  onClick: () => void;
  
  /**
   * Text to display on the back button
   * @default "Back"
   */
  title?: string;
  
  /**
   * Whether the component is in loading state
   */
  isLoading?: boolean;

  /**
   * Content to display in the right section (e.g., user email)
   */
  rightContent?: React.ReactNode;
  
  /**
   * Whether to show the right section
   * @default false
   */
  showRightContent?: boolean;
}

/**
 * BackHeader component
 * 
 * A reusable header with a back button and optional right content
 */
const BackHeader: React.FC<BackHeaderProps> = ({ 
  onClick, 
  title = "Back",
  isLoading = false,
  rightContent,
  showRightContent = false
}) => {
  // If component is in loading state, display skeleton
  if (isLoading) {
    return (
      <div className="back-header">
        <div className="back-header-left">
          <Skeleton width={100} height={32} />
        </div>
        {showRightContent && (
          <div className="back-header-right">
            <Skeleton width={150} height={24} />
          </div>
        )}
      </div>
    );
  }
  
  // Normal render
  return (
    <div className="back-header">
      <div className="back-header-left">
        <Button 
          onClick={onClick} 
          size="medium" 
          kind="glyph" 
          variant="tertiary"
          icon="arrow-left"
        />
        {title && <span className="back-header-title">{title}</span>}
      </div>
      
      {showRightContent && rightContent && (
        <div className="back-header-right">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default BackHeader;

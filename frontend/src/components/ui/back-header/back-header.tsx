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
}

/**
 * BackHeader component
 * 
 * A reusable header with a back button
 */
const BackHeader: React.FC<BackHeaderProps> = ({ 
  onClick, 
  title = "Back",
  isLoading = false
}) => {
  // If component is in loading state, display skeleton
  if (isLoading) {
    return (
      <div className="back-header">
        <Skeleton width={100} height={32} />
      </div>
    );
  }
  
  // Normal render
  return (
    <div className="back-header">
      <Button 
        onClick={onClick} 
        size="small" 
        kind="glyph-text" 
        variant="tertiary"
        icon="arrow-left"
      >
        {title}
      </Button>
    </div>
  );
};

export default BackHeader;

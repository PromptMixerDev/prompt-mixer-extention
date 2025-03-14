import React from 'react';
import './input-block-label.css';
import Button from '@components/ui/button/button';

interface InputBlockLabelProps {
  children?: React.ReactNode;
  rightButtonText?: string;
  rightButtonIcon?: string;
  onRightButtonClick?: () => void;
}

export const InputBlockLabel: React.FC<InputBlockLabelProps> = ({ 
  children, 
  rightButtonText, 
  rightButtonIcon,
  onRightButtonClick 
}) => {
  return (
    <div className="input-block-label">
      <div className="input-block-label-left">{children}</div>
      {(rightButtonText || rightButtonIcon) && (
        <div className="input-block-label-right">
          <Button 
            size="small" 
            variant="tertiary" 
            kind={rightButtonText ? "glyph-text" : "glyph"}
            icon={rightButtonIcon}
            onClick={onRightButtonClick}
          >
            {rightButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InputBlockLabel;

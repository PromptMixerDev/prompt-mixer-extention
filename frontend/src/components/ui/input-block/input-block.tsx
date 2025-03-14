import React from 'react';
import './input-block.css';
import InputBlockLabel from '@components/ui/input-block/components/input-block-label/input-block-label';
import InputBlockContent from '@components/ui/input-block/components/input-block-content/input-block-content';
import Skeleton from 'react-loading-skeleton';

/**
 * Available variants for InputBlock
 */
export type InputBlockVariant = 'prompt' | 'variable' | 'history-original' | 'history-improved';

interface InputBlockProps {
  /**
   * Predefined variant of the input block
   */
  variant?: InputBlockVariant;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Input value
   */
  value?: string;
  
  /**
   * Callback when value changes
   */
  onChange?: (value: string) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Text for the right button (overrides variant's default)
   */
  rightButtonText?: string;
  
  /**
   * Icon for the right button (overrides variant's default)
   */
  rightButtonIcon?: string;
  
  /**
   * Callback when right button is clicked
   */
  onRightButtonClick?: () => void;
  
  /**
   * Whether the input is read-only (overrides variant's default)
   */
  readOnly?: boolean;
  
  /**
   * Whether the component is in loading state
   */
  isLoading?: boolean;
}

/**
 * Configuration for input block variants
 */
interface InputBlockConfig {
  text: string;       // Button text
  icon: string;       // Button icon
  readOnly: boolean;  // Whether the input is read-only
}

/**
 * Get configuration based on variant
 */
const getInputBlockConfig = (variant?: InputBlockVariant): InputBlockConfig => {
  switch (variant) {
    case 'prompt':
      return { text: 'Add to chat', icon: 'chat-smile', readOnly: false };
    case 'history-improved':
      return { text: 'Add to library', icon: 'prompt-line', readOnly: true };
    case 'history-original':
      return { text: '', icon: '', readOnly: true };
    case 'variable':
    default:
      return { text: '', icon: '', readOnly: false }; // No button, editable
  }
};

/**
 * InputBlock component
 * A "dumb" component that displays a label and content area for text input
 * with support for variables in {{variable}} format
 */
export const InputBlock: React.FC<InputBlockProps> = ({ 
  variant,
  label, 
  value = '',
  onChange,
  placeholder,
  rightButtonText, 
  rightButtonIcon, 
  onRightButtonClick,
  readOnly,
  isLoading = false
}) => {
  // Get configuration based on variant
  const config = getInputBlockConfig(variant);
  
  // Use custom settings if provided, otherwise use variant defaults
  const finalButtonText = rightButtonText !== undefined ? rightButtonText : config.text;
  const finalButtonIcon = rightButtonIcon !== undefined ? rightButtonIcon : config.icon;
  const finalReadOnly = readOnly !== undefined ? readOnly : config.readOnly;
  
  // If component is in loading state, display skeleton
  if (isLoading) {
    return (
      <div className="input-block">
        <div className="input-block-label">
          <div className="input-block-label-left">
            <Skeleton width={100} height={16} />
          </div>
          {(finalButtonText || finalButtonIcon) && (
            <div className="input-block-label-right">
              <Skeleton width={80} height={24} />
            </div>
          )}
        </div>
        <div className="input-block-content">
          <Skeleton height={100} />
        </div>
      </div>
    );
  }
  
  // Normal render
  return (
    <div className="input-block">
      <InputBlockLabel 
        rightButtonText={finalButtonText}
        rightButtonIcon={finalButtonIcon}
        onRightButtonClick={onRightButtonClick}
      >
        {label}
      </InputBlockLabel>
      <InputBlockContent 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={finalReadOnly}
      />
    </div>
  );
};

export default InputBlock;

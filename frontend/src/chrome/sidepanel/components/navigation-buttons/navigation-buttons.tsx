import React from 'react';
import Button from '@components/ui/button/button';
import './navigation-buttons.css';

interface NavigationButtonsProps {
  onNext: () => void;
  onPrev: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
}

/**
 * Компонент кнопок навигации для слайдера
 */
const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onPrev,
  isFirstSlide,
  isLastSlide
}) => {
  return (
    <div className="navigation-buttons">
      <Button
        onClick={onPrev}
        disabled={isFirstSlide}
        variant="tertiary"
        kind="glyph"
        size="medium"
        icon="arrow-left"
        aria-label="Previous slide"
      />
      <Button
        onClick={onNext}
        disabled={isLastSlide}
        variant="tertiary"
        kind="glyph"
        size="medium"
        icon="arrow-right"
        aria-label="Next slide"
      />
    </div>
  );
};

export default NavigationButtons;

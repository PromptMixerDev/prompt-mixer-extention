import React from 'react';
import './slide-indicators.css';

interface SlideIndicatorsProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

/**
 * Компонент индикаторов слайдов
 */
const SlideIndicators: React.FC<SlideIndicatorsProps> = ({ 
  totalSlides, 
  currentSlide, 
  onSlideChange 
}) => {
  return (
    <div className="slide-indicators">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={`indicator-${index}`}
          className={`indicator ${index === currentSlide ? 'active' : ''}`}
          onClick={() => onSlideChange(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SlideIndicators;

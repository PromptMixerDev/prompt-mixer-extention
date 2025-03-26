import React, { useState } from 'react';
import Slide from '../slide/slide';
import SlideIndicators from '../slide-indicators/slide-indicators';
import NavigationButtons from '../navigation-buttons/navigation-buttons';
import { slidesData } from './slides-data';
import './auth-slider.css';

interface AuthSliderProps {
  onSignIn: () => Promise<void>;
}

/**
 * Компонент слайдера для страницы аутентификации
 */
const AuthSlider: React.FC<AuthSliderProps> = ({ onSignIn }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Переход к следующему слайду
  const handleNextSlide = () => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  // Переход к предыдущему слайду
  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  // Переход к конкретному слайду
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slidesData.length) {
      setCurrentSlide(index);
    }
  };
  
  return (
    <div className="auth-slider">
      <div className="slides-container">
        {slidesData.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide-wrapper ${index === currentSlide ? 'active' : ''}`}
          >
            <Slide
              color={slide.color}
              title={slide.title}
              description={slide.description}
              illustration={slide.illustration}
              isVisible={index === currentSlide} // Передаем флаг видимости
              onSignIn={onSignIn}
            />
          </div>
        ))}
      </div>
      
      <SlideIndicators
        totalSlides={slidesData.length}
        currentSlide={currentSlide}
        onSlideChange={goToSlide}
      />
      
      <NavigationButtons
        onNext={handleNextSlide}
        onPrev={handlePrevSlide}
        isFirstSlide={currentSlide === 0}
        isLastSlide={currentSlide === slidesData.length - 1}
      />
    </div>
  );
};

export default AuthSlider;

import React, { useRef, useEffect } from 'react';
import './slide.css';
// Импортируем логотип Google как модуль
// @ts-ignore
import GoogleLogo from '../../../../assets/illustration/Google_logo.svg';

interface SlideProps {
  color: string;
  title: string;
  description: string;
  illustration?: string; // Путь к иллюстрации
  isVisible?: boolean; // Флаг видимости слайда
  onSignIn: () => Promise<void>;
}

/**
 * Компонент отдельного слайда
 */
const Slide: React.FC<SlideProps> = ({ color, title, description, illustration, isVisible = false, onSignIn }) => {
  const illustrationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible) {
      // Сначала удаляем класс, чтобы сбросить анимацию
      if (illustrationRef.current) {
        illustrationRef.current.classList.remove('zoomed');
      }
      
      // Затем добавляем класс через небольшую задержку
      timer = setTimeout(() => {
        if (illustrationRef.current) {
          illustrationRef.current.classList.add('zoomed');
        }
      }, 50); // Небольшая задержка для сброса стилей
    } else {
      // Когда слайд не виден, сбрасываем анимацию
      if (illustrationRef.current) {
        illustrationRef.current.classList.remove('zoomed');
      }
    }
    
    return () => clearTimeout(timer);
  }, [isVisible]); // Зависимость от isVisible
  
  return (
    <div 
      className="slide"
      style={{ backgroundColor: color }}
    >
      {illustration && (
        <div 
          ref={illustrationRef}
          className="slide-illustration" 
          style={{ backgroundImage: `url(${illustration})` }}
        />
      )}
      <div className="slide-overlay"></div>
      <div className="slide-content">
        <div className="slide-text-container">
          <h3 dangerouslySetInnerHTML={{ __html: title }}></h3>
          <p>{description}</p>
        </div>
        <button 
          className="sign-in-button"
          onClick={onSignIn}
        >
          <img 
            src={GoogleLogo} 
            alt="Google logo" 
            className="google-logo" 
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Slide;

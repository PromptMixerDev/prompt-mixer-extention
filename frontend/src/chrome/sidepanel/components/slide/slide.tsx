import React from 'react';
import './slide.css';
// Импортируем логотип Google как модуль
// @ts-ignore
import GoogleLogo from '../../../../assets/illustration/Google_logo.svg';

interface SlideProps {
  color: string;
  title: string;
  description: string;
  onSignIn: () => Promise<void>;
}

/**
 * Компонент отдельного слайда
 */
const Slide: React.FC<SlideProps> = ({ color, title, description, onSignIn }) => {
  return (
    <div 
      className="slide"
      style={{ backgroundColor: color }}
    >
      <div className="slide-content">
        <h3>{title}</h3>
        <p>{description}</p>
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

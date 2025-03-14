import React, { useState, useEffect } from 'react';
import './logo-image.css';
import Skeleton from 'react-loading-skeleton';

/**
 * LogoImage component props interface
 */
interface LogoImageProps {
  // Size variants
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  // Logo name without .svg extension
  logoName?: 'chat-gpt' | 'claude' | 'deep-seek' | 'open-ai' | 'base-logo';
  // Additional CSS class
  className?: string;
  // Loading state
  isLoading?: boolean;
}

/**
 * LogoImage component
 * 
 * Renders a logo image with different size options
 * 
 * @example
 * // Basic logo with default size (medium)
 * <LogoImage logoName="chat-gpt" />
 * 
 * // Small sized Claude logo
 * <LogoImage size="small" logoName="claude" />
 * 
 * // Extra large logo with custom class
 * <LogoImage size="xlarge" logoName="deep-seek" className="custom-logo" />
 * 
 * // OpenAI logo (different from ChatGPT)
 * <LogoImage logoName="open-ai" size="large" />
 * 
 * // Default logo
 * <LogoImage logoName="base-logo" />
 * 
 * // Logo in loading state (skeleton)
 * <LogoImage isLoading={true} />
 */
const LogoImage: React.FC<LogoImageProps> = ({
  size = 'medium',
  logoName = 'base-logo',
  className = '',
  isLoading = false,
}) => {
  const [iconSvg, setIconSvg] = useState<string | null>(null);

  // Load SVG icon when component mounts or when logoName changes
  useEffect(() => {
    const loadIcon = async () => {
      try {
        const importedIcon = await import(`@assets/models-logos/${logoName}.svg?raw`);
        setIconSvg(importedIcon.default);
      } catch (error) {
        console.error(`Failed to load logo: ${logoName}`, error);
        setIconSvg(null);
      }
    };

    loadIcon();
  }, [logoName]);

  // Generate logo classes
  const logoClasses = [
    'logo-image',
    `logo-image-${size}`,
    className
  ].filter(Boolean).join(' ');

  // Определяем размеры скелетона в зависимости от размера логотипа
  const getSkeletonSize = (): { width: number; height: number } => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24 };
      case 'medium':
        return { width: 32, height: 32 };
      case 'large':
        return { width: 40, height: 40 };
      case 'xlarge':
        return { width: 48, height: 48 };
      default:
        return { width: 32, height: 32 };
    }
  };

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    const { width, height } = getSkeletonSize();
    return (
      <div className={logoClasses}>
        <Skeleton 
          width={width} 
          height={height} 
          borderRadius="var(--border-radius-md)" 
        />
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <div className={logoClasses}>
      {iconSvg && (
        <span 
          className="logo-icon" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      )}
    </div>
  );
};

export default LogoImage;

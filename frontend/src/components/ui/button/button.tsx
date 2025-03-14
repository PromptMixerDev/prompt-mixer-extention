import React, { useState, useEffect } from 'react';
import './button.css';
import Skeleton from 'react-loading-skeleton';

/**
 * Button component props interface
 */
interface ButtonProps {
  // Basic properties
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  
  // Specific properties for our design
  size?: 'small' | 'medium' | 'large';  // sizes: 24px, 28px, 32px
  variant?: 'primary' | 'secondary' | 'tertiary';  // styles: with background, with outline, transparent
  kind?: 'text' | 'glyph-text' | 'glyph';  // types: text, icon+text, icon
  icon?: string;  // icon name (without .svg extension), defaults to 'base-icon' for glyph and glyph-text kinds
  
  // Loading state
  isLoading?: boolean;
}

/**
 * Button component
 * 
 * Renders a button with various styles, sizes, and optional icon
 * 
 * @example
 * // Text button (primary)
 * <Button variant="primary" size="medium">Click me</Button>
 * 
 * // Button with icon and text (secondary)
 * <Button variant="secondary" size="large" kind="glyph-text" icon="arrow-left">Back</Button>
 * 
 * // Icon only (tertiary)
 * <Button variant="tertiary" size="small" kind="glyph" icon="search-line" />
 * 
 * // Button in loading state (skeleton)
 * <Button isLoading={true}>Loading Button</Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  size = 'medium',
  variant = 'primary',
  kind = 'text',
  icon,
  isLoading = false,
  ...rest
}) => {
  const [iconSvg, setIconSvg] = useState<string | null>(null);

  // Load SVG icon when component mounts or icon changes
  useEffect(() => {
    // If kind is glyph or glyph-text and no icon is provided, use base-icon as default
    const iconName = (kind === 'glyph' || kind === 'glyph-text') 
      ? (icon || 'base-icon') 
      : icon;
    
    if (!iconName) return;

    const loadIcon = async () => {
      try {
        // Use dynamic import with ?raw suffix
        const importedIcon = await import(`@assets/icons/general/${iconName}.svg?raw`);
        setIconSvg(importedIcon.default);
      } catch (error) {
        console.error(`Failed to load icon: ${iconName}`, error);
        setIconSvg(null);
      }
    };

    loadIcon();
  }, [icon, kind]);

  // Определяем размеры скелетона в зависимости от размера и типа кнопки
  const getSkeletonDimensions = (): { width: number; height: number } => {
    // Высота в зависимости от размера
    let height = 28; // medium по умолчанию
    if (size === 'small') height = 24;
    if (size === 'large') height = 32;
    
    // Ширина в зависимости от типа
    let width = 100; // text по умолчанию
    if (kind === 'glyph') width = height; // квадратная для иконок
    if (kind === 'glyph-text') width = 120; // для иконки с текстом
    
    return { width, height };
  };

  // Generate button classes
  const buttonClasses = [
    'button',
    `button--${size}`,
    `button--${variant}`,
    `button--${kind}`,
    disabled ? 'button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  // Если компонент в состоянии загрузки, отображаем скелетон
  if (isLoading) {
    const { width, height } = getSkeletonDimensions();
    return (
      <div className={buttonClasses} style={{ display: 'inline-block' }}>
        <Skeleton width={width} height={height} borderRadius={4} />
      </div>
    );
  }

  // Обычный рендер компонента
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {kind !== 'text' && iconSvg && (
        <span 
          className="button__icon" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
        />
      )}
      {(kind !== 'glyph' || !children) && (
        <span className="button__text">{children}</span>
      )}
    </button>
  );
};

export default Button;

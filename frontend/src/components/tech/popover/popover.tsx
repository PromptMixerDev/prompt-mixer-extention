import React, { useState, useEffect, useRef } from 'react';
import { PopoverContext, usePopoverContext } from './popover-context';
import './popover.css';

export type PopoverAlign = 'left' | 'right' | 'bottom-left' | 'bottom-right';

interface PopoverProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  align?: PopoverAlign;
  className?: string;
}

interface TriggerProps {
  children: React.ReactNode;
}

interface ContentProps {
  children: React.ReactNode;
}

const Trigger: React.FC<TriggerProps> = ({ children }) => {
  const { setIsOpen, isOpen } = usePopoverContext();

  return (
    <div 
      className="popover__trigger"
      onClick={(e) => {
        console.log('Popover.Trigger: onClick');
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      {children}
    </div>
  );
};

const Content: React.FC<ContentProps> = ({ children }) => {
  const { isOpen, setIsOpen } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState({});

  // Функция для расчета позиции контента
  const calculatePosition = () => {
    if (!contentRef.current || !contentRef.current.parentElement) return;
    
    // Находим родительский элемент (popover__wrapper)
    const wrapperElement = contentRef.current.parentElement;
    
    // Находим триггер внутри wrapper
    const triggerElement = wrapperElement.querySelector('.popover__trigger');
    if (!triggerElement) return;
    
    const triggerRect = triggerElement.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    
    // Получаем align из атрибута data-align
    const align = wrapperElement.getAttribute('data-align') as PopoverAlign || 'right';
    
    // Базовые значения для позиционирования
    let top = 0;
    let left = 0;
    
    // Расчет позиции в зависимости от выбранного положения
    switch (align) {
      case 'left':
        top = (triggerRect.height - contentRect.height) / 2;
        left = -contentRect.width - 8;
        break;
      case 'right':
        top = (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.width + 8;
        break;
      case 'bottom-left':
        top = triggerRect.height + 12; // Увеличиваем отступ
        left = 0;
        break;
      case 'bottom-right':
        top = triggerRect.height + 12; // Увеличиваем отступ
        left = triggerRect.width - contentRect.width;
        break;
      default:
        top = triggerRect.height + 8;
        left = 0;
    }
    
    // Проверяем, не выходит ли контент за пределы экрана
    const wrapperRect = wrapperElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Проверка по горизонтали
    if (wrapperRect.left + left < 10) {
      // Если выходит за левый край
      left = -wrapperRect.left + 10;
    } else if (wrapperRect.left + left + contentRect.width > viewportWidth - 10) {
      // Если выходит за правый край
      left = viewportWidth - wrapperRect.left - contentRect.width - 10;
    }
    
    // Проверка по вертикали
    if (wrapperRect.top + top < 10) {
      // Если выходит за верхний край
      top = -wrapperRect.top + 10;
    } else if (wrapperRect.top + top + contentRect.height > viewportHeight - 10) {
      // Если выходит за нижний край, показываем над триггером
      if (align === 'bottom-left' || align === 'bottom-right') {
        top = -contentRect.height - 8;
      } else {
        top = viewportHeight - wrapperRect.top - contentRect.height - 10;
      }
    }
    
    setTooltipStyle({ top, left });
  };

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // Проверяем, что клик был не по контенту и не по триггеру
      const wrapperElement = contentRef.current?.parentElement;
      if (
        wrapperElement && 
        !wrapperElement.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      calculatePosition();
    };

    if (isOpen) {
      // Рассчитываем позицию при открытии
      setTimeout(calculatePosition, 0);

      // Добавляем обработчики
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);

      return () => {
        document.removeEventListener('click', handleGlobalClick);
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="popover__content"
      ref={contentRef}
      onClick={(e) => {
        console.log('Popover.Content: onClick');
        e.stopPropagation();
      }}
      style={tooltipStyle}
    >
      {children}
    </div>
  );
};

const Popover = ({ children, isOpen: controlledIsOpen, onOpenChange, align = 'right', className = '' }: PopoverProps) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  
  const setIsOpen = (newIsOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newIsOpen);
    } else {
      setUncontrolledIsOpen(newIsOpen);
    }
  };

  const popoverClasses = [
    'popover__wrapper',
    className
  ].filter(Boolean).join(' ');

  return (
    <PopoverContext.Provider value={{ 
      isOpen, 
      setIsOpen
    }}>
      <div 
        className={popoverClasses} 
        data-align={align}
        data-disable-tooltip={isOpen ? "true" : "false"}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

Popover.Trigger = Trigger;
Popover.Content = Content;

export default Popover;

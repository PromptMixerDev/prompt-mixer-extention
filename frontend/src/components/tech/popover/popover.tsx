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
    const triggerElement = wrapperElement.querySelector('.popover__trigger') as HTMLElement;
    if (!triggerElement) return;
    
    // Получаем align из атрибута data-align
    const align = wrapperElement.getAttribute('data-align') as PopoverAlign || 'right';
    
    // Базовые значения для позиционирования
    let top = 0;
    let left = 0;
    
    // Расчет позиции в зависимости от выбранного положения
    switch (align) {
      case 'left':
        top = 0; // Выравнивание по верхнему краю триггера
        left = -(contentRef.current as HTMLElement).offsetWidth - 8; // Слева от триггера с отступом
        break;
      case 'right':
        top = 0; // Выравнивание по верхнему краю триггера
        left = triggerElement.offsetWidth + 4; // Справа от триггера с отступом
        break;
      case 'bottom-left':
        top = triggerElement.offsetHeight + 4; // Под триггером с отступом
        left = 0; // Выравнивание по левому краю триггера
        break;
      case 'bottom-right':
        top = triggerElement.offsetHeight + 4; // Под триггером с отступом
        left = triggerElement.offsetWidth - (contentRef.current as HTMLElement).offsetWidth; // Выравнивание по правому краю
        break;
      default:
        top = triggerElement.offsetHeight + 4;
        left = 0;
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

  // Используем useLayoutEffect для расчета позиции до отрисовки
  React.useLayoutEffect(() => {
    if (isOpen && contentRef.current) {
      calculatePosition();
    }
  }, [isOpen]);

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

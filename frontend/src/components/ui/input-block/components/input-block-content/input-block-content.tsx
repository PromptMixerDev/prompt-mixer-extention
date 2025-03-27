import React, { useState, useEffect, useRef, useCallback } from 'react';
import './input-block-content.css';

// Функция для дебаунсинга
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface InputBlockContentProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void; // Callback when content gets focus
  onBlur?: () => void; // Callback when content loses focus
}

export const InputBlockContent: React.FC<InputBlockContentProps> = ({ 
  value = '',
  onChange,
  className = '',
  placeholder = 'Enter text...',
  readOnly = false,
  autoFocus = false,
  onFocus,
  onBlur,
}) => {
  const [text, setText] = useState(value);
  const [htmlContent, setHtmlContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  // Ref для отслеживания источника изменений (пользовательский ввод или внешнее обновление)
  const isInternalChangeRef = useRef(false);
  
  // Toggle expanded state when clicked in read-only mode
  const handleClick = () => {
    if (readOnly) {
      setIsExpanded(!isExpanded);
    }
  };
  
  // Function to highlight variables in the text with special styling
  const highlightVariables = useCallback((content: string): string => {
    if (!content) return '';
    
    // Replace {{variable}} with <span class="variable">{{variable}}</span> for visual highlighting
    return content.replace(/\{\{(.*?)\}\}/g, '<span class="variable">{{$1}}</span>');
  }, []);
  
  // Function to extract variable names from text content
  const extractVariables = useCallback((content: string): string[] => {
    if (!content) return [];
    
    const variables: string[] = [];
    // Use regex to find text within double curly braces {{variable}}
    const regex = /\{\{(.*?)\}\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Add variable name to the array, trimming any extra whitespace
      const variableName = match[1].trim();
      if (variableName) {
        variables.push(variableName);
      }
    }
    
    // Remove duplicate variable names using Set
    return [...new Set(variables)];
  }, []);
  
  // Save cursor position before modifying content
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && contentRef.current) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(contentRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      
      selectionRef.current = {
        start,
        end: start + range.toString().length
      };
    }
  };
  
  // Restore cursor position after content has been modified
  const restoreSelection = () => {
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        
        let charIndex = 0;
        let foundStart = false;
        let foundEnd = false;
        
        const traverseNodes = (node: Node) => {
          if (foundStart && foundEnd) return;
          
          if (node.nodeType === Node.TEXT_NODE) {
            const nextCharIndex = charIndex + node.textContent!.length;
            
            if (!foundStart && selectionRef.current.start >= charIndex && selectionRef.current.start <= nextCharIndex) {
              range.setStart(node, selectionRef.current.start - charIndex);
              foundStart = true;
            }
            
            if (!foundEnd && selectionRef.current.end >= charIndex && selectionRef.current.end <= nextCharIndex) {
              range.setEnd(node, selectionRef.current.end - charIndex);
              foundEnd = true;
            }
            
            charIndex = nextCharIndex;
          } else {
            const childNodes = node.childNodes;
            for (let i = 0; i < childNodes.length; i++) {
              traverseNodes(childNodes[i]);
            }
          }
        };
        
        traverseNodes(contentRef.current);
        
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };
  
  // Handle input changes in the editable content
  const handleInput = () => {
    if (contentRef.current) {
      // Save cursor position before making changes
      saveSelection();
      
      // Get raw text without HTML markup
      const rawText = contentRef.current.innerText || '';
      
      // Отмечаем, что изменение произошло от пользователя
      isInternalChangeRef.current = true;
      
      // Update text state with content
      setText(rawText);
      
      // Notify parent component about changes
      if (onChange) {
        onChange(rawText);
      }
    }
  };
  
  // Handle keyboard events in the editable content
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default Enter behavior (which would create a new paragraph)
      e.preventDefault();
      
      // Use execCommand to insert a line break instead
      document.execCommand('insertLineBreak');
      
      // Update text and HTML content after inserting the line break
      handleInput();
    }
  };
  
  // Update text state when value prop changes externally
  useEffect(() => {
    // Если изменение от пользователя, игнорируем обновление value
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    
    // Иначе обновляем текст из value
    if (value !== text) {
      setText(value);
    }
  }, [value, text]);
  
  // Update HTML content whenever text changes to apply variable highlighting
  useEffect(() => {
    setHtmlContent(highlightVariables(text));
  }, [text, highlightVariables]);
  
  // Restore cursor position after HTML content has been updated
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = htmlContent;
      restoreSelection();
    }
  }, [htmlContent]);
  
  // Handle autoFocus - полностью отключаем автофокус
  useEffect(() => {
    // Не устанавливаем фокус автоматически вообще
    // Пользователь должен сам кликнуть для фокуса
  }, []);
  
  // Handle blur event - show placeholder if content is empty
  const handleBlur = () => {
    if (contentRef.current) {
      if (!contentRef.current.textContent?.trim()) {
        contentRef.current.classList.add('empty');
      }
    }
    // Call the onBlur callback if provided
    if (onBlur) {
      onBlur();
    }
  };
  
  const handleFocus = () => {
    if (contentRef.current) {
      contentRef.current.classList.remove('empty');
    }
    // Call the onFocus callback if provided
    if (onFocus) {
      onFocus();
    }
  };
  
  return (
    <div 
      ref={contentRef}
      className={`input-block-content ${!text ? 'empty' : ''} ${readOnly ? 'read-only' : ''} ${isExpanded ? 'expanded' : ''} ${className}`}
      contentEditable={!readOnly}
      onInput={!readOnly ? handleInput : undefined}
      onKeyDown={!readOnly ? handleKeyDown : undefined}
      onClick={handleClick}
      onBlur={handleBlur}
      onFocus={handleFocus}
      data-placeholder={placeholder}
      spellCheck={false}
    />
  );
};

export default InputBlockContent;

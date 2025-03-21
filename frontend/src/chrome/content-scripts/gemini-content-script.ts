/**
 * Gemini-specific content script
 * 
 * This script contains all the logic needed to add the "Improve Prompt" button
 * to Gemini (gemini.google.com) and handle prompt improvement functionality.
 */

// Wrap everything in an IIFE to avoid variable name conflicts with other content scripts
(function() {
  // SVG icon for the button
  const GEMINI_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_102_2005)"><path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/></g><defs><clipPath id="clip0_102_2005"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`;

  // Button ID for easy reference
  const BUTTON_ID = 'improve-prompt-button-gemini';

  // Точный селектор для поля ввода Gemini
  const GEMINI_INPUT_SELECTOR = '.ql-editor.textarea.new-input-ui';
  
  // Селектор для контейнера поля ввода
  const INPUT_CONTAINER_SELECTOR = '.text-input-field_textarea-wrapper';

  /**
   * Initialize the content script
   */
  function initialize(): void {
    console.log('Gemini content script initializing');
    
    // Check if we're on a Gemini page
    if (!isGeminiPage()) {
      console.log('Not a Gemini page, exiting');
      return;
    }
    
    console.log('Gemini page detected, adding button');
    
    // Try to find the input field
    findInputFieldAndAddButton();
    
    // Set up observer to handle dynamic DOM changes
    setupObserver();
    
    // Set up navigation handler for SPA
    setupNavigationHandler();
  }

  /**
   * Check if the current page is a Gemini page
   */
  function isGeminiPage(): boolean {
    return window.location.href.includes('gemini.google.com');
  }

  /**
   * Find the input field and add the button
   */
  function findInputFieldAndAddButton(): void {
    console.log('Finding input field for Gemini');
    
    // Ищем поле ввода по точному селектору
    const inputField = document.querySelector(GEMINI_INPUT_SELECTOR);
    
    if (inputField) {
      console.log('Input field found, adding button');
      addButtonToPage(inputField);
    } else {
      console.log('Input field not found. Retrying after delay...');
      
      // Отложенная повторная попытка найти поле ввода
      setTimeout(() => {
        findInputFieldAndAddButton();
      }, 2000);
    }
  }

  /**
   * Add the "Improve Prompt" button to the page
   */
  function addButtonToPage(inputField: Element): void {
    console.log('Adding button to page');
    
    // Check if button already exists
    if (document.getElementById(BUTTON_ID)) {
      console.log('Button already exists, skipping');
      return;
    }
    
    // Create button directly without container for simplicity
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.innerHTML = GEMINI_ICON;
    button.title = 'Improve Prompt';
    
    // Стиль кнопки
    Object.assign(button.style, {
      backgroundColor: 'rgb(0, 0, 0)', // Черный фон
      color: 'white',
      borderRadius: '999px',
      width: '40px',
      height: '40px',
      position: 'fixed', // Используем fixed для позиционирования относительно viewport
      zIndex: '999999', // Максимальный z-index
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
      padding: '0'
    });
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = 'rgb(77, 77, 77)'; // Darker on hover
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = 'rgb(0, 0, 0)';
    });
    
    // Add click handler
    button.addEventListener('click', () => {
      handleImprovePromptClick(inputField);
    });
    
    // Добавляем кнопку в body
    document.body.appendChild(button);
    
    // Позиционируем кнопку относительно поля ввода
    positionButtonRelativeToInput(button, inputField);
    
    // Добавляем обработчик изменения размера окна для обновления позиции кнопки
    window.addEventListener('resize', () => {
      positionButtonRelativeToInput(button, inputField);
    });
    
    // Добавляем обработчик прокрутки для обновления позиции кнопки
    window.addEventListener('scroll', () => {
      positionButtonRelativeToInput(button, inputField);
    });
    
    console.log('Button added successfully');
  }

  /**
   * Position the button relative to the input field
   */
  function positionButtonRelativeToInput(button: HTMLElement, inputField: Element): void {
    // Получаем размеры и позицию поля ввода
    const inputRect = inputField.getBoundingClientRect();
    
    // Находим родительский контейнер поля ввода
    let inputContainer = inputField.closest(INPUT_CONTAINER_SELECTOR);
    
    // Если нашли контейнер, используем его размеры
    if (inputContainer) {
      const containerRect = inputContainer.getBoundingClientRect();
      
      // Позиционируем кнопку в правом верхнем углу контейнера
      button.style.top = `${containerRect.top + 10}px`;
      button.style.right = `${window.innerWidth - containerRect.right + 10}px`;
      
      console.log('Positioned button relative to input container:', 
                 `top: ${button.style.top}, right: ${button.style.right}`);
    } else {
      // Если контейнер не найден, позиционируем относительно поля ввода
      button.style.top = `${inputRect.top + 10}px`;
      button.style.right = `${window.innerWidth - inputRect.right + 10}px`;
      
      console.log('Positioned button relative to input field:', 
                 `top: ${button.style.top}, right: ${button.style.right}`);
    }
  }

  /**
   * Get prompt text from input field
   */
  function getPromptText(inputField: Element): string {
    console.log('Getting prompt text from input field');
    
    // Ищем параграфы внутри поля ввода
    const paragraphs = inputField.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const text = Array.from(paragraphs)
        .map(p => p.textContent || '')
        .join('\n');
      
      console.log('Found text in paragraphs:', text);
      return text;
    }
    
    // Если параграфов нет, возвращаем textContent
    const textContent = inputField.textContent || '';
    console.log('No paragraphs found, using textContent:', textContent);
    return textContent;
  }

  /**
   * Set prompt text in input field
   */
  function setPromptText(inputField: Element, text: string): void {
    console.log('Setting prompt text:', text);
    
    // Ищем параграфы внутри поля ввода
    const paragraphs = inputField.querySelectorAll('p');
    
    if (paragraphs.length > 0) {
      // Установить текст в первый параграф
      paragraphs[0].textContent = text;
      
      // Удалить остальные параграфы, если они есть
      for (let i = 1; i < paragraphs.length; i++) {
        paragraphs[i].remove();
      }
      
      console.log('Set text in existing paragraph');
    } else {
      // Если параграфов нет, создаем новый
      const p = document.createElement('p');
      p.textContent = text;
      
      // Очищаем поле ввода и добавляем параграф
      inputField.innerHTML = '';
      inputField.appendChild(p);
      
      console.log('Created new paragraph with text');
    }
    
    // Trigger input event
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Handle click on the "Improve Prompt" button
   */
  function handleImprovePromptClick(inputField: Element): void {
    console.log('Improve Prompt button clicked');
    
    // Get the prompt text
    const promptText = getPromptText(inputField);
    console.log('Prompt text to improve:', promptText);
    
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Show loading state
    const button = document.getElementById(BUTTON_ID) as HTMLButtonElement;
    if (button) {
      showLoadingState(button);
    }
    
    // Send message to background script
    chrome.runtime.sendMessage(
      {
        type: 'IMPROVE_PROMPT',
        data: {
          prompt: promptText,
          url: window.location.href,
        },
      },
      (response) => {
        if (response && response.type === 'IMPROVED_PROMPT') {
          console.log('Received improved prompt:', response.data.improvedPrompt);
          
          // Set the improved prompt
          setPromptText(inputField, response.data.improvedPrompt);
          
          // Reset button state
          if (button) {
            resetButtonState(button);
          }
        } else {
          console.error('Error improving prompt:', response);
          
          // Show error state
          if (button) {
            showErrorState(button);
            
            // Reset after 2 seconds
            setTimeout(() => {
              resetButtonState(button);
            }, 2000);
          }
        }
      }
    );
  }

  /**
   * Show loading state on the button
   */
  function showLoadingState(button: HTMLButtonElement): void {
    const loadingIcon = `<svg class="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.773 4.22703L12.7123 5.28769C11.7622 4.33763 10.4497 3.75 9 3.75C6.10051 3.75 3.75 6.10051 3.75 9C3.75 11.8995 6.10051 14.25 9 14.25C11.8995 14.25 14.25 11.8995 14.25 9H15.75C15.75 12.728 12.728 15.75 9 15.75C5.27208 15.75 2.25 12.728 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C10.864 2.25 12.5515 3.00552 13.773 4.22703Z" fill="white"/></svg>`;
    
    button.innerHTML = loadingIcon;
    button.disabled = true;
    
    // Add spinner animation
    const styleId = 'improve-button-animation-style';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinner {
          animation: spin 1.5s linear infinite;
          transform-origin: center;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  /**
   * Show error state on the button
   */
  function showErrorState(button: HTMLButtonElement): void {
    const errorIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>`;
    
    button.innerHTML = errorIcon;
    button.disabled = true;
  }

  /**
   * Reset button state
   */
  function resetButtonState(button: HTMLButtonElement): void {
    button.innerHTML = GEMINI_ICON;
    button.disabled = false;
  }

  /**
   * Set up observer to handle dynamic DOM changes
   */
  function setupObserver(): void {
    console.log('Setting up observer');
    
    const observer = new MutationObserver(() => {
      // Проверяем, существует ли кнопка
      const button = document.getElementById(BUTTON_ID);
      
      // Ищем поле ввода
      const inputField = document.querySelector(GEMINI_INPUT_SELECTOR);
      
      if (!button && inputField) {
        // Если кнопка не существует, но поле ввода найдено, добавляем кнопку
        addButtonToPage(inputField);
      } else if (button && inputField) {
        // Если кнопка существует и поле ввода найдено, обновляем позицию кнопки
        positionButtonRelativeToInput(button as HTMLElement, inputField);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  /**
   * Set up handler for navigation events in SPA
   */
  function setupNavigationHandler(): void {
    console.log('Setting up navigation handler');
    
    // Track URL changes
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        console.log(`URL changed from ${lastUrl} to ${location.href}`);
        lastUrl = location.href;
        
        // Wait for DOM to update
        setTimeout(() => {
          findInputFieldAndAddButton();
        }, 1000);
      }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    // Handle popstate event (browser back/forward)
    window.addEventListener('popstate', () => {
      console.log('Popstate event detected');
      
      // Wait for DOM to update
      setTimeout(() => {
        findInputFieldAndAddButton();
      }, 1000);
    });
  }

  // Start initialization when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

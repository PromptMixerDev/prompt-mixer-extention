/**
 * ChatGPT-specific content script with fallback mechanism
 * 
 * This script contains all the logic needed to add the "Improve Prompt" button
 * to ChatGPT site (chatgpt.com) and handle prompt improvement functionality.
 * 
 * This version includes a fallback mechanism that works even if Chrome APIs are not available.
 */

// Wrap everything in an IIFE to avoid variable name conflicts with other content scripts
(function() {
  // SVG icon for the button
  const CHATGPT_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_102_2005)"><path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/></g><defs><clipPath id="clip0_102_2005"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`;

  // Button ID for easy reference
  const BUTTON_ID = 'improve-prompt-button-chatgpt';
  const BUTTON_CONTAINER_ID = 'improve-prompt-button-container-chatgpt';

  // ChatGPT-specific selectors for finding the input field
  const CHATGPT_INPUT_SELECTORS = [
    // ChatGPT-specific selectors (2025 updated)
    '#prompt-textarea',
    // Selector from user feedback
    'form > div.flex.w-full.cursor-text.flex-col.items-center.justify-center.rounded-\\[28px\\] textarea',
    // Previous selectors
    '.ProseMirror[data-virtualkeyboard="true"]',
    '[data-virtualkeyboard="true"]',
    'div.ProseMirror',
    'textarea.block.h-10.w-full.resize-none',
    'form textarea',
    'textarea.resize-none',
    'label textarea',
    '[data-gtm-form-interact-field-id]',
    '.chatgpt-textarea',
    '.chat-input-container textarea',
    '.chat-input-container [contenteditable="true"]',
    // Generic fallbacks
    'textarea',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    '[data-testid="text-input"]',
    '[data-testid="chat-input"]'
  ];

  // ChatGPT-specific selectors for finding the container for the button
  const CHATGPT_CONTAINER_SELECTORS = [
    // ChatGPT-specific selectors (2025 updated)
    // Container from user feedback
    '.absolute.bottom-1.right-3.flex.items-center.gap-2',
    '.flex.w-full.cursor-text.flex-col.items-center.justify-center.rounded-\\[28px\\]',
    // Previous selectors
    '#composer-background',
    '.flex.w-full.cursor-text.flex-col.rounded-3xl',
    '.flex.flex-col.justify-start',
    '.flex.min-h-\\[44px\\].items-start',
    '.min-w-0.max-w-full.flex-1',
    'form.relative',
    'label.relative',
    '.absolute.bottom-3.right-3',
    'form',
    'label'
  ];

  // Button styling
  const BUTTON_STYLES = {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(77, 77, 77)',
    borderRadius: '999px',
    width: '36px',
    height: '36px'
  };

  // Button positioning
  const BUTTON_POSITION = {
    absoluteTop: '0px',
    absoluteRight: '45px'
  };

  // Flag to track if Chrome APIs are available
  let chromeAPIAvailable = false;

  /**
   * Check if Chrome APIs are available
   */
  function checkChromeAPIAvailability(): boolean {
    try {
      return typeof chrome !== 'undefined' && 
             chrome !== null && 
             typeof chrome.runtime !== 'undefined' && 
             chrome.runtime !== null && 
             typeof chrome.runtime.sendMessage === 'function';
    } catch (e) {
      console.error('Error checking Chrome API availability:', e);
      return false;
    }
  }

  /**
   * Initialize the content script
   */
  function initialize(): void {
    console.log('ChatGPT content script initializing');
    
    // Check if Chrome APIs are available
    chromeAPIAvailable = checkChromeAPIAvailability();
    console.log('Chrome API available:', chromeAPIAvailable);
    
    // Check if we're on a ChatGPT page
    if (!isChatGPTPage()) {
      console.log('Not a ChatGPT page, exiting');
      return;
    }
    
    console.log('ChatGPT page detected, adding button');
    
    // First try the direct approach to find the exact location specified by the user
    if (tryDirectButtonPlacement()) {
      console.log('Successfully placed button using direct DOM query on initialization');
    } else {
      // If direct placement fails, fall back to the standard approach
      console.log('Direct placement failed, falling back to standard approach');
      findInputFieldAndAddButton();
    }
    
    // Set up observer to handle dynamic DOM changes
    setupObserver();
    
    // Set up navigation handler for SPA
    setupNavigationHandler();
  }

  /**
   * Check if the current page is a ChatGPT page
   */
  function isChatGPTPage(): boolean {
    return window.location.href.includes('chatgpt.com');
  }

  /**
   * Try to place the button directly at the location specified by the user
   * This is a more targeted approach that doesn't rely on finding the input field first
   * 
   * @returns boolean - Whether the button was successfully placed
   */
  function tryDirectButtonPlacement(): boolean {
    // Try to find the exact container specified by the user
    const targetContainer = document.querySelector('.absolute.bottom-1.right-3.flex.items-center.gap-2');
    
    if (!targetContainer) {
      console.log('Target container not found for direct placement');
      return false;
    }
    
    console.log('Found target container for direct placement');
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = BUTTON_CONTAINER_ID;
    buttonContainer.style.position = 'relative';
    buttonContainer.style.zIndex = '9999';
    buttonContainer.style.display = 'block'; // Make it visible by default
    
    // Create button
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.innerHTML = CHATGPT_ICON;
    button.title = 'Improve Prompt';
    
    // Style the button
    Object.assign(button.style, {
      backgroundColor: BUTTON_STYLES.backgroundColor,
      color: 'white',
      borderRadius: BUTTON_STYLES.borderRadius,
      width: BUTTON_STYLES.width,
      height: BUTTON_STYLES.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      border: 'none',
      outline: 'none',
      padding: '0',
      marginRight: '8px' // Add some spacing from other buttons
    });
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = BUTTON_STYLES.hoverBackgroundColor;
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = BUTTON_STYLES.backgroundColor;
    });
    
    // Find the input field for when the button is clicked
    let inputField: Element | null = null;
    for (const selector of CHATGPT_INPUT_SELECTORS) {
      inputField = document.querySelector(selector);
      if (inputField) break;
    }
    
    if (!inputField) {
      console.log('Input field not found for direct placement');
      return false;
    }
    
    // Add click handler
    button.addEventListener('click', () => {
      handleImprovePromptClick(inputField as Element, button);
    });
    
    // Add button to container
    buttonContainer.appendChild(button);
    
    // Add container to the target location
    targetContainer.insertBefore(buttonContainer, targetContainer.firstChild);
    
    console.log('Button added successfully via direct placement');
    return true;
  }

  /**
   * Find the input field and add the button
   */
  function findInputFieldAndAddButton(): void {
    console.log('Finding input field for ChatGPT');
    
    // Try each selector until we find an input field
    let inputField: Element | null = null;
    
    for (const selector of CHATGPT_INPUT_SELECTORS) {
      console.log(`Trying selector: ${selector}`);
      inputField = document.querySelector(selector);
      
      if (inputField) {
        console.log(`Found input field with selector: ${selector}`);
        break;
      }
    }
    
    if (inputField) {
      console.log('Input field found, adding button');
      addButtonToPage(inputField);
    } else {
      console.log('Input field not found. Dumping all available elements for debugging:');
      
      // Additional debugging information
      console.log('Available textareas:', document.querySelectorAll('textarea').length);
      console.log('Available contenteditable elements:', document.querySelectorAll('[contenteditable="true"]').length);
      console.log('Available elements with role="textbox":', document.querySelectorAll('div[role="textbox"]').length);
      
      // Try to find elements with similar attributes
      const virtualKeyboardElements = document.querySelectorAll('[data-virtualkeyboard]');
      console.log('Elements with data-virtualkeyboard attribute:', virtualKeyboardElements.length);
      
      // Delayed retry to find the input field
      setTimeout(() => {
        console.log('Retrying to find input field after delay...');
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
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = BUTTON_CONTAINER_ID;
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.zIndex = '9999';
    buttonContainer.style.display = 'none'; // Initially hidden
    
    // Create button
    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.innerHTML = CHATGPT_ICON;
    button.title = 'Improve Prompt';
    
    // Style the button to match ChatGPT's design
    Object.assign(button.style, {
      backgroundColor: BUTTON_STYLES.backgroundColor,
      color: 'white',
      borderRadius: BUTTON_STYLES.borderRadius,
      width: BUTTON_STYLES.width,
      height: BUTTON_STYLES.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      border: 'none',
      outline: 'none',
      padding: '0'
    });
    
    // Add hover effect
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = BUTTON_STYLES.hoverBackgroundColor;
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = BUTTON_STYLES.backgroundColor;
    });
    
    // Add click handler
    button.addEventListener('click', () => {
      handleImprovePromptClick(inputField, button);
    });
    
    // Add button to container
    buttonContainer.appendChild(button);
    
    // Add container to the page
    addButtonToContainer(inputField, buttonContainer);
    
    // Position the button
    positionButton(inputField, buttonContainer);
    
    // Set up input listeners
    setupInputListeners(inputField, buttonContainer);
    
    // Check initial visibility
    updateButtonVisibility(buttonContainer, inputField);
    
    console.log('Button added successfully');
  }

  /**
   * Add the button container to the appropriate parent element
   */
  function addButtonToContainer(inputField: Element, buttonContainer: HTMLElement): void {
    // Try to find the specific container mentioned in user feedback
    const specificContainer = document.querySelector('.absolute.bottom-1.right-3.flex.items-center.gap-2');
    
    if (specificContainer && specificContainer instanceof HTMLElement) {
      console.log('Found specific container from user feedback');
      specificContainer.style.position = 'relative'; // For proper positioning
      specificContainer.appendChild(buttonContainer);
      return;
    }
    
    // If specific container not found, try the standard approach
    let container: Element | null = null;
    
    for (const selector of CHATGPT_CONTAINER_SELECTORS) {
      container = inputField.closest(selector);
      if (container) {
        console.log(`Found container with selector: ${selector}`);
        break;
      }
    }
    
    if (container && container instanceof HTMLElement) {
      container.style.position = 'relative'; // For proper positioning
      container.appendChild(buttonContainer);
    } else {
      // If no container found, add to body with fixed positioning
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.bottom = '20px';
      buttonContainer.style.right = '20px';
      document.body.appendChild(buttonContainer);
    }
  }

  /**
   * Position the button relative to the input field
   */
  function positionButton(inputField: Element, buttonContainer: HTMLElement): void {
    if (!inputField || !buttonContainer) return;
    
    const position = buttonContainer.style.position;
    
    if (position === 'absolute') {
      // For the specific container from user feedback
      if (buttonContainer.parentElement?.classList.contains('absolute') && 
          buttonContainer.parentElement?.classList.contains('bottom-1') &&
          buttonContainer.parentElement?.classList.contains('right-3')) {
        buttonContainer.style.top = '0px';
        buttonContainer.style.right = '0px';
      } else {
        // Use platform-specific positioning
        buttonContainer.style.top = BUTTON_POSITION.absoluteTop;
        buttonContainer.style.right = BUTTON_POSITION.absoluteRight;
      }
    } else if (position === 'fixed') {
      const rect = inputField.getBoundingClientRect();
      buttonContainer.style.top = `${rect.top + 10}px`;
      buttonContainer.style.right = '20px';
    }
  }

  /**
   * Set up input field event listeners
   */
  function setupInputListeners(inputField: Element, buttonContainer: HTMLElement): void {
    // Add event listeners for input changes
    inputField.addEventListener('input', () => {
      updateButtonVisibility(buttonContainer, inputField);
    });
    
    inputField.addEventListener('keyup', () => {
      updateButtonVisibility(buttonContainer, inputField);
    });
    
    inputField.addEventListener('paste', () => {
      updateButtonVisibility(buttonContainer, inputField);
    });
    
    inputField.addEventListener('cut', () => {
      updateButtonVisibility(buttonContainer, inputField);
    });
    
    // Add window resize handler
    window.addEventListener('resize', () => {
      positionButton(inputField, buttonContainer);
    });
  }

  /**
   * Update button visibility based on input field content
   */
  function updateButtonVisibility(buttonContainer: HTMLElement, inputField: Element): void {
    const promptText = getPromptText(inputField);
    const isEmpty = !promptText || promptText.trim() === '';
    buttonContainer.style.display = isEmpty ? 'none' : 'block';
  }

  /**
   * Get prompt text from input field
   */
  function getPromptText(inputField: Element): string {
    if (inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement) {
      return inputField.value;
    } else {
      return inputField.textContent || '';
    }
  }

  /**
   * Set prompt text in input field
   */
  function setPromptText(inputField: Element, text: string): void {
    if (inputField instanceof HTMLInputElement || inputField instanceof HTMLTextAreaElement) {
      inputField.value = text;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (inputField.getAttribute('contenteditable') === 'true' || inputField.getAttribute('role') === 'textbox') {
      // Clear the element
      inputField.innerHTML = '';
      
      // Create a new range for text insertion
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (sel) {
        // Set the range to the beginning of the element
        range.setStart(inputField, 0);
        range.collapse(true);
        
        // Clear current selection and add the new range
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Insert text with formatting preserved
        document.execCommand('insertText', false, text);
      } else {
        // Fallback if getSelection() returned null
        inputField.textContent = text;
      }
      
      // Trigger input event
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Simple prompt improvement function that works without Chrome APIs
   * This is a fallback when chrome.runtime.sendMessage is not available
   */
  function fallbackImprovePrompt(prompt: string): string {
    // This is a very simple improvement that just adds some structure
    // In a real implementation, this would be more sophisticated
    const improved = `${prompt}\n\nPlease provide a detailed, step-by-step response with examples where appropriate.`;
    return improved;
  }

  /**
   * Handle click on the "Improve Prompt" button
   */
  function handleImprovePromptClick(inputField: Element, buttonElement: HTMLButtonElement): void {
    console.log('Improve Prompt button clicked');
    
    // Get the prompt text
    const promptText = getPromptText(inputField);
    
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Show loading state
    showLoadingState(buttonElement);
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, using fallback');
      // Use fallback if loading takes too long
      const improvedPrompt = fallbackImprovePrompt(promptText);
      setPromptText(inputField, improvedPrompt);
      resetButtonState(buttonElement);
    }, 5000); // 5 second timeout
    
    try {
      // Check if Chrome APIs are available
      if (chromeAPIAvailable) {
        // Try to use Chrome APIs
        chrome.runtime.sendMessage(
          {
            type: 'IMPROVE_PROMPT',
            data: {
              prompt: promptText,
              url: window.location.href,
            },
          },
          (response) => {
            // Clear the timeout since we got a response
            clearTimeout(loadingTimeout);
            
            if (response && response.type === 'IMPROVED_PROMPT') {
              // Set the improved prompt
              setPromptText(inputField, response.data.improvedPrompt);
            } else {
              // Use fallback if response is invalid
              console.log('Invalid response from background script, using fallback');
              const improvedPrompt = fallbackImprovePrompt(promptText);
              setPromptText(inputField, improvedPrompt);
            }
            
            // Reset button state
            resetButtonState(buttonElement);
          }
        );
      } else {
        // Use fallback immediately if Chrome APIs are not available
        console.log('Chrome APIs not available, using fallback immediately');
        setTimeout(() => {
          clearTimeout(loadingTimeout);
          const improvedPrompt = fallbackImprovePrompt(promptText);
          setPromptText(inputField, improvedPrompt);
          resetButtonState(buttonElement);
        }, 1000); // Small delay to show loading state
      }
    } catch (error) {
      // Handle any errors
      console.error('Error in handleImprovePromptClick:', error);
      clearTimeout(loadingTimeout);
      
      // Use fallback
      const improvedPrompt = fallbackImprovePrompt(promptText);
      setPromptText(inputField, improvedPrompt);
      
      // Reset button state
      resetButtonState(buttonElement);
    }
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
    button.innerHTML = CHATGPT_ICON;
    button.disabled = false;
  }

  /**
   * Set up observer to handle dynamic DOM changes
   */
  function setupObserver(): void {
    console.log('Setting up observer for ChatGPT');
    
    const observer = new MutationObserver(() => {
      // Check if the button exists
      const button = document.getElementById(BUTTON_ID);
      
      if (!button) {
        console.log('Button not found, attempting to add it');
        
        // First try the direct approach to find the exact location specified by the user
        if (tryDirectButtonPlacement()) {
          console.log('Successfully placed button using direct DOM query');
        } else {
          // If direct placement fails, fall back to the standard approach
          findInputFieldAndAddButton();
        }
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

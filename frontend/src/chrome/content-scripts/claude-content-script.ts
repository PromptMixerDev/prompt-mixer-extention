/**
 * Claude-specific content script
 * 
 * This script contains all the logic needed to add the "Improve Prompt" button
 * to Claude.ai and handle prompt improvement functionality.
 * 
 * This is a self-contained version that doesn't rely on external imports.
 */

// Wrap everything in an IIFE to avoid variable name conflicts with other content scripts
(function() {
  // SVG icon for the button
  const CLAUDE_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_102_2005)"><path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/></g><defs><clipPath id="clip0_102_2005"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`;

  // Button ID for easy reference
  const BUTTON_ID = 'improve-prompt-button-claude';
  const BUTTON_CONTAINER_ID = 'improve-prompt-button-container-claude';

  // Claude-specific selectors for finding the input field
  const CLAUDE_INPUT_SELECTORS = [
    // Primary selectors
    '.ProseMirror',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    // Claude-specific selectors
    'textarea.claude-textarea',
    '.claude-input-container textarea',
    '.claude-input-container [contenteditable="true"]',
    // New Claude selectors (2025)
    '.cl-textarea',
    '.cl-textfield',
    '.cl-textfield__textarea',
    '.cl-editor',
    '.cl-editor-container [contenteditable="true"]',
    '.cl-chat-input',
    '.cl-chat-input-container textarea',
    '.cl-chat-input-container [contenteditable="true"]',
    // Generic fallbacks
    'textarea',
    'div.editor',
    '[data-testid="text-input"]',
    '[data-testid="chat-input"]'
  ];

  // Claude-specific selectors for finding the container for the button
  const CLAUDE_CONTAINER_SELECTORS = [
    'fieldset',
    '.cl-chat-input-container',
    '.cl-editor-container',
    'form',
    '.cl-textfield',
    '.cl-textarea'
  ];

  // Button styling
  const BUTTON_STYLES = {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(50, 50, 50)',
    borderRadius: '12px',
    width: '32px',
    height: '32px'
  };

  // Button positioning
  const BUTTON_POSITION = {
    absoluteTop: '48px',
    absoluteRight: '10px'
  };

  /**
   * Initialize the content script
   */
  function initialize(): void {
    console.log('Claude content script initializing');
    
    // Check if we're on a Claude page
    if (!isClaudePage()) {
      console.log('Not a Claude page, exiting');
      return;
    }
    
    console.log('Claude page detected, adding button');
    
    // Try to find the input field
    findInputFieldAndAddButton();
    
    // Set up observer to handle dynamic DOM changes
    setupObserver();
    
    // Set up navigation handler for SPA
    setupNavigationHandler();
  }

  /**
   * Check if the current page is a Claude page
   */
  function isClaudePage(): boolean {
    return window.location.href.includes('claude.ai') || 
           window.location.href.includes('anthropic.com');
  }

  /**
   * Find the input field and add the button
   */
  function findInputFieldAndAddButton(): void {
    console.log('Finding input field');
    
    // Try each selector until we find an input field
    let inputField: Element | null = null;
    
    for (const selector of CLAUDE_INPUT_SELECTORS) {
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
      console.log('Input field not found');
      
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
    button.innerHTML = CLAUDE_ICON;
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
      handleImprovePromptClick(inputField);
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
    // Try to find a suitable container
    let container: Element | null = null;
    
    for (const selector of CLAUDE_CONTAINER_SELECTORS) {
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
      // Use platform-specific positioning
      buttonContainer.style.top = BUTTON_POSITION.absoluteTop;
      buttonContainer.style.right = BUTTON_POSITION.absoluteRight;
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
   * Handle click on the "Improve Prompt" button
   */
  function handleImprovePromptClick(inputField: Element): void {
    console.log('Improve Prompt button clicked');
    
    // Get the prompt text
    const promptText = getPromptText(inputField);
    
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
          // Set the improved prompt
          setPromptText(inputField, response.data.improvedPrompt);
          
          // Reset button state
          if (button) {
            resetButtonState(button);
          }
        } else {
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
    button.innerHTML = CLAUDE_ICON;
    button.disabled = false;
  }

  /**
   * Set up observer to handle dynamic DOM changes
   */
  function setupObserver(): void {
    console.log('Setting up observer');
    
    const observer = new MutationObserver(() => {
      if (!document.getElementById(BUTTON_ID)) {
        findInputFieldAndAddButton();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
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

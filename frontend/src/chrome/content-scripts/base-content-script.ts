/**
 * Base Content Script
 * 
 * This class contains all the common functionality shared across different platform-specific
 * content scripts. It provides methods for adding buttons, handling events, and managing
 * the prompt improvement flow.
 */

import { PlatformConfig } from './types';

/**
 * Base class for all content scripts
 */
export class BaseContentScript {
  protected config: PlatformConfig;
  protected inputField: Element | null = null;
  protected buttonContainer: HTMLElement | null = null;
  protected button: HTMLButtonElement | null = null;

  /**
   * Create a new BaseContentScript instance
   * 
   * @param config - Platform-specific configuration
   */
  constructor(config: PlatformConfig) {
    this.config = config;
  }

  /**
   * Initialize the content script
   */
  public initialize(): void {
    console.log(`${this.config.name} content script initializing`);
    
    // Check if we're on the correct page
    if (!this.isPlatformPage()) {
      console.log(`Not a ${this.config.name} page, exiting`);
      return;
    }
    
    console.log(`${this.config.name} page detected, adding button`);
    
    // Try to find the input field
    this.findInputFieldAndAddButton();
    
    // Set up observer to handle dynamic DOM changes
    this.setupObserver();
    
    // Set up navigation handler for SPA
    this.setupNavigationHandler();
  }

  /**
   * Check if the current page is for this platform
   */
  protected isPlatformPage(): boolean {
    return this.config.hostnames.some(hostname => 
      window.location.href.includes(hostname)
    );
  }

  /**
   * Find the input field and add the button
   */
  protected findInputFieldAndAddButton(): void {
    console.log(`Finding input field for ${this.config.name}`);
    
    // Try each selector until we find an input field
    for (const selector of this.config.inputSelectors) {
      console.log(`Trying selector: ${selector}`);
      this.inputField = document.querySelector(selector);
      
      if (this.inputField) {
        console.log(`Found input field with selector: ${selector}`);
        break;
      }
    }
    
    if (this.inputField) {
      console.log('Input field found, adding button');
      this.addButtonToPage();
    } else {
      console.log('Input field not found. Retrying after delay...');
      
      // Delayed retry to find the input field
      setTimeout(() => {
        this.findInputFieldAndAddButton();
      }, 2000);
    }
  }

  /**
   * Add the "Improve Prompt" button to the page
   */
  protected addButtonToPage(): void {
    if (!this.inputField) return;
    
    console.log('Adding button to page');
    
    // Check if button already exists
    if (document.getElementById(this.config.buttonId)) {
      console.log('Button already exists, skipping');
      return;
    }
    
    // Create button container
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.id = this.config.buttonContainerId;
    this.buttonContainer.style.position = 'absolute';
    this.buttonContainer.style.zIndex = '9999';
    this.buttonContainer.style.display = 'none'; // Initially hidden
    
    // Create button
    this.button = document.createElement('button');
    this.button.id = this.config.buttonId;
    this.button.innerHTML = this.config.icon;
    this.button.title = 'Improve Prompt';
    
    // Style the button
    Object.assign(this.button.style, {
      backgroundColor: this.config.buttonStyles.backgroundColor,
      color: 'white',
      borderRadius: this.config.buttonStyles.borderRadius,
      width: this.config.buttonStyles.width,
      height: this.config.buttonStyles.height,
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
    this.button.addEventListener('mouseover', () => {
      if (this.button) {
        this.button.style.backgroundColor = this.config.buttonStyles.hoverBackgroundColor;
      }
    });
    
    this.button.addEventListener('mouseout', () => {
      if (this.button) {
        this.button.style.backgroundColor = this.config.buttonStyles.backgroundColor;
      }
    });
    
    // Add click handler
    this.button.addEventListener('click', () => {
      if (this.inputField) {
        this.handleImprovePromptClick();
      }
    });
    
    // Add button to container
    this.buttonContainer.appendChild(this.button);
    
    // Add container to the page
    this.addButtonToContainer();
    
    // Position the button
    this.positionButton();
    
    // Set up input listeners
    this.setupInputListeners();
    
    // Check initial visibility
    this.updateButtonVisibility();
    
    console.log('Button added successfully');
  }

  /**
   * Add the button container to the appropriate parent element
   */
  protected addButtonToContainer(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    // Try to find a suitable container
    let container: Element | null = null;
    
    for (const selector of this.config.containerSelectors) {
      container = this.inputField.closest(selector);
      if (container) {
        console.log(`Found container with selector: ${selector}`);
        break;
      }
    }
    
    if (container && container instanceof HTMLElement) {
      container.style.position = 'relative'; // For proper positioning
      container.appendChild(this.buttonContainer);
    } else {
      // If no container found, add to body with fixed positioning
      this.buttonContainer.style.position = 'fixed';
      this.buttonContainer.style.bottom = '20px';
      this.buttonContainer.style.right = '20px';
      document.body.appendChild(this.buttonContainer);
    }
  }

  /**
   * Position the button relative to the input field
   */
  protected positionButton(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    const position = this.buttonContainer.style.position;
    
    if (position === 'absolute') {
      // Use platform-specific positioning
      if (this.config.buttonPosition.absoluteTop) {
        this.buttonContainer.style.top = this.config.buttonPosition.absoluteTop;
      }
      
      if (this.config.buttonPosition.absoluteRight) {
        this.buttonContainer.style.right = this.config.buttonPosition.absoluteRight;
      }
    } else if (position === 'fixed') {
      const rect = this.inputField.getBoundingClientRect();
      this.buttonContainer.style.top = `${rect.top + 10}px`;
      this.buttonContainer.style.right = '20px';
    }
  }

  /**
   * Set up input field event listeners
   */
  protected setupInputListeners(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    // Add event listeners for input changes
    this.inputField.addEventListener('input', () => {
      this.updateButtonVisibility();
    });
    
    this.inputField.addEventListener('keyup', () => {
      this.updateButtonVisibility();
    });
    
    this.inputField.addEventListener('paste', () => {
      this.updateButtonVisibility();
    });
    
    this.inputField.addEventListener('cut', () => {
      this.updateButtonVisibility();
    });
    
    // Add window resize handler
    window.addEventListener('resize', () => {
      this.positionButton();
    });
  }

  /**
   * Update button visibility based on input field content
   */
  protected updateButtonVisibility(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    const promptText = this.getPromptText();
    const isEmpty = !promptText || promptText.trim() === '';
    this.buttonContainer.style.display = isEmpty ? 'none' : 'block';
  }

  /**
   * Get prompt text from input field
   */
  protected getPromptText(): string {
    if (!this.inputField) return '';
    
    if (this.inputField instanceof HTMLInputElement || this.inputField instanceof HTMLTextAreaElement) {
      return this.inputField.value;
    } else {
      return this.inputField.textContent || '';
    }
  }

  /**
   * Set prompt text in input field
   */
  protected setPromptText(text: string): void {
    if (!this.inputField) return;
    
    if (this.inputField instanceof HTMLInputElement || this.inputField instanceof HTMLTextAreaElement) {
      this.inputField.value = text;
      this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (this.inputField.getAttribute('contenteditable') === 'true' || this.inputField.getAttribute('role') === 'textbox') {
      // Clear the element
      this.inputField.innerHTML = '';
      
      // Create a new range for text insertion
      const range = document.createRange();
      const sel = window.getSelection();
      
      if (sel) {
        // Set the range to the beginning of the element
        range.setStart(this.inputField, 0);
        range.collapse(true);
        
        // Clear current selection and add the new range
        sel.removeAllRanges();
        sel.addRange(range);
        
        // Insert text with formatting preserved
        document.execCommand('insertText', false, text);
      } else {
        // Fallback if getSelection() returned null
        this.inputField.textContent = text;
      }
      
      // Trigger input event
      this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Handle click on the "Improve Prompt" button
   */
  protected handleImprovePromptClick(): void {
    console.log('Improve Prompt button clicked');
    
    // Get the prompt text
    const promptText = this.getPromptText();
    
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Show loading state
    if (this.button) {
      this.showLoadingState();
    }
    
    // Check if chrome.runtime is defined before using it
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
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
            this.setPromptText(response.data.improvedPrompt);
            
            // Reset button state
            if (this.button) {
              this.resetButtonState();
            }
          } else if (response && response.type === 'ERROR') {
            // Check if this is a limit reached error
            if (response.data.isLimitReached) {
              // Show limit reached message
              this.showLimitReachedMessage(response.data.message);
            } else {
              // Show generic error message
              alert(response.data.message || 'An error occurred while improving the prompt.');
            }
            
            // Show error state
            if (this.button) {
              this.showErrorState();
              
              // Reset after 2 seconds
              setTimeout(() => {
                this.resetButtonState();
              }, 2000);
            }
          } else {
            // Show error state
            if (this.button) {
              this.showErrorState();
              
              // Reset after 2 seconds
              setTimeout(() => {
                this.resetButtonState();
              }, 2000);
            }
          }
        }
      );
    } else {
      // Handle case where chrome.runtime is not available
      console.error('Chrome runtime not available. This extension requires Chrome APIs to function properly.');
      
      // Show error state
      if (this.button) {
        this.showErrorState();
        
        // Reset after 2 seconds
        setTimeout(() => {
          this.resetButtonState();
        }, 2000);
      }
    }
  }
  
  /**
   * Show a message when the user has reached their limit
   */
  protected showLimitReachedMessage(message: string): void {
    // Show a simple alert with the message
    alert(`${message}\n\nPlease open the extension to see your usage limits and upgrade options.`);
    
    // Open the side panel
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
  }

  /**
   * Show loading state on the button
   */
  protected showLoadingState(): void {
    if (!this.button) return;
    
    const loadingIcon = `<svg class="spinner" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.773 4.22703L12.7123 5.28769C11.7622 4.33763 10.4497 3.75 9 3.75C6.10051 3.75 3.75 6.10051 3.75 9C3.75 11.8995 6.10051 14.25 9 14.25C11.8995 14.25 14.25 11.8995 14.25 9H15.75C15.75 12.728 12.728 15.75 9 15.75C5.27208 15.75 2.25 12.728 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C10.864 2.25 12.5515 3.00552 13.773 4.22703Z" fill="white"/></svg>`;
    
    this.button.innerHTML = loadingIcon;
    this.button.disabled = true;
    
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
  protected showErrorState(): void {
    if (!this.button) return;
    
    const errorIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/></svg>`;
    
    this.button.innerHTML = errorIcon;
    this.button.disabled = true;
  }

  /**
   * Reset button state
   */
  protected resetButtonState(): void {
    if (!this.button) return;
    
    this.button.innerHTML = this.config.icon;
    this.button.disabled = false;
  }

  /**
   * Set up observer to handle dynamic DOM changes
   */
  protected setupObserver(): void {
    console.log('Setting up observer');
    
    const observer = new MutationObserver(() => {
      if (!document.getElementById(this.config.buttonId)) {
        this.findInputFieldAndAddButton();
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
  protected setupNavigationHandler(): void {
    console.log('Setting up navigation handler');
    
    // Track URL changes
    let lastUrl = location.href;
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        console.log(`URL changed from ${lastUrl} to ${location.href}`);
        lastUrl = location.href;
        
        // Wait for DOM to update
        setTimeout(() => {
          this.findInputFieldAndAddButton();
        }, 1000);
      }
    });
    
    urlObserver.observe(document, { subtree: true, childList: true });
    
    // Handle popstate event (browser back/forward)
    window.addEventListener('popstate', () => {
      console.log('Popstate event detected');
      
      // Wait for DOM to update
      setTimeout(() => {
        this.findInputFieldAndAddButton();
      }, 1000);
    });
  }
}

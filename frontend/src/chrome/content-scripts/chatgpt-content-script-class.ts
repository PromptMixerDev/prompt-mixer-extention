/**
 * ChatGPT-specific content script class
 * 
 * This class extends the BaseContentScript class to provide ChatGPT-specific
 * functionality for handling button positioning and container selection.
 */

import { BaseContentScript } from './base-content-script';

/**
 * ChatGPT content script class
 */
export class ChatGPTContentScript extends BaseContentScript {
  /**
   * Override the initialize method to try direct button placement first
   */
  public initialize(): void {
    console.log(`${this.config.name} content script initializing`);
    
    // Check if we're on a ChatGPT page
    if (!this.isPlatformPage()) {
      console.log(`Not a ${this.config.name} page, exiting`);
      return;
    }
    
    console.log(`${this.config.name} page detected, adding button`);
    
    // First try the direct approach to find the exact location specified by the user
    if (this.tryDirectButtonPlacement()) {
      console.log('Successfully placed button using direct DOM query on initialization');
    } else {
      // If direct placement fails, fall back to the standard approach
      console.log('Direct placement failed, falling back to standard approach');
      this.findInputFieldAndAddButton();
    }
    
    // Set up observer to handle dynamic DOM changes
    this.setupObserver();
    
    // Set up navigation handler for SPA
    this.setupNavigationHandler();
  }
  /**
   * Override the add button to container method to handle ChatGPT's specific DOM structure
   */
  protected addButtonToContainer(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    console.log('Adding button to container for ChatGPT');
    
    // Try to find the specific container mentioned in user feedback
    const specificContainer = document.querySelector('.absolute.bottom-1.right-3.flex.items-center.gap-2');
    
    if (specificContainer && specificContainer instanceof HTMLElement) {
      console.log('Found specific container from user feedback');
      specificContainer.style.position = 'relative'; // For proper positioning
      specificContainer.appendChild(this.buttonContainer);
      return;
    }
    
    // If specific container not found, try the standard approach
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
   * Override the position button method to handle ChatGPT's specific positioning
   */
  protected positionButton(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    const position = this.buttonContainer.style.position;
    
    if (position === 'absolute') {
      // For the specific container from user feedback
      if (this.buttonContainer.parentElement?.classList.contains('absolute') && 
          this.buttonContainer.parentElement?.classList.contains('bottom-1') &&
          this.buttonContainer.parentElement?.classList.contains('right-3')) {
        this.buttonContainer.style.top = '0px';
        this.buttonContainer.style.right = '0px';
      } else {
        // Use platform-specific positioning
        if (this.config.buttonPosition.absoluteTop) {
          this.buttonContainer.style.top = this.config.buttonPosition.absoluteTop;
        }
        
        if (this.config.buttonPosition.absoluteRight) {
          this.buttonContainer.style.right = this.config.buttonPosition.absoluteRight;
        }
      }
    } else if (position === 'fixed') {
      const rect = this.inputField.getBoundingClientRect();
      this.buttonContainer.style.top = `${rect.top + 10}px`;
      this.buttonContainer.style.right = '20px';
    }
  }

  /**
   * Override setup observer to handle ChatGPT's dynamic DOM changes
   */
  protected setupObserver(): void {
    console.log('Setting up observer for ChatGPT');
    
    const observer = new MutationObserver(() => {
      // Check if the button exists
      const button = document.getElementById(this.config.buttonId);
      
      if (!button) {
        console.log('Button not found, attempting to add it');
        
        // First try the direct approach to find the exact location specified by the user
        if (this.tryDirectButtonPlacement()) {
          console.log('Successfully placed button using direct DOM query');
        } else {
          // If direct placement fails, fall back to the standard approach
          this.findInputFieldAndAddButton();
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
   * Try to place the button directly at the location specified by the user
   * This is a more targeted approach that doesn't rely on finding the input field first
   * 
   * @returns boolean - Whether the button was successfully placed
   */
  protected tryDirectButtonPlacement(): boolean {
    // Try to find the exact container specified by the user
    const targetContainer = document.querySelector('.absolute.bottom-1.right-3.flex.items-center.gap-2');
    
    if (!targetContainer) {
      console.log('Target container not found for direct placement');
      return false;
    }
    
    console.log('Found target container for direct placement');
    
    // Create button container
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.id = this.config.buttonContainerId;
    this.buttonContainer.style.position = 'relative';
    this.buttonContainer.style.zIndex = '9999';
    this.buttonContainer.style.display = 'block'; // Make it visible by default
    
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
      padding: '0',
      marginRight: '8px' // Add some spacing from other buttons
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
    
    // Find the input field for when the button is clicked
    for (const selector of this.config.inputSelectors) {
      this.inputField = document.querySelector(selector);
      if (this.inputField) break;
    }
    
    if (!this.inputField) {
      console.log('Input field not found for direct placement');
      return false;
    }
    
    // Add click handler
    this.button.addEventListener('click', () => {
      this.handleImprovePromptClick();
    });
    
    // Add button to container
    this.buttonContainer.appendChild(this.button);
    
    // Add container to the target location
    targetContainer.insertBefore(this.buttonContainer, targetContainer.firstChild);
    
    console.log('Button added successfully via direct placement');
    return true;
  }

  /**
   * Override find input field and add button to provide more debugging for ChatGPT
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
        this.findInputFieldAndAddButton();
      }, 2000);
    }
  }
}

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

    // Try to find the container with buttons
    let specificContainer = null;
    
    // Try different selectors for the container
    const containerSelectors = [
      '.absolute.bottom-0.right-3.flex.items-center.gap-2', // Current send button container
      '.absolute.bottom-1.right-3.flex.items-center.gap-2', // Alternative send button container
      '.flex.items-center.gap-2', // Generic version for flexibility
      'form div[role="presentation"]' // For newer ChatGPT versions
    ];
    
    for (const selector of containerSelectors) {
      const container = document.querySelector(selector);
      if (container && container instanceof HTMLElement) {
        specificContainer = container;
        console.log(`Found specific container with selector: ${selector}`);
        break;
      }
    }
    
    if (specificContainer && specificContainer instanceof HTMLElement) {
      console.log('Found specific container for button placement');
      specificContainer.style.position = 'relative'; // For proper positioning
      
      // Find the send button
      let sendButton = document.querySelector('#composer-submit-button');
      
      if (!sendButton) {
        // Try to find the send button by its appearance
        const possibleSendButtons = document.querySelectorAll('button');
        for (const btn of possibleSendButtons) {
          // Look for a button that might be the send button (circular button at the bottom right)
          if (btn.closest('.flex.items-center.gap-2') || 
              btn.closest('form div[role="presentation"]')) {
            sendButton = btn;
            console.log('Found potential send button by context');
            break;
          }
        }
      }
      
      if (sendButton && sendButton.parentElement === specificContainer) {
        // Insert the button before the send button
        specificContainer.insertBefore(this.buttonContainer, sendButton);
      } else {
        // Fallback to inserting at the beginning of the container
        specificContainer.insertBefore(this.buttonContainer, specificContainer.firstChild);
      }
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
      // Try to find the send button
      const sendButton = document.querySelector('#composer-submit-button');

      // For the specific container from user feedback
      if (this.buttonContainer.parentElement?.classList.contains('absolute') &&
        this.buttonContainer.parentElement?.classList.contains('bottom-1') &&
        this.buttonContainer.parentElement?.classList.contains('right-3')) {

        // If we found the send button and we're in the same container
        if (sendButton && sendButton.parentElement === this.buttonContainer.parentElement) {
          // Position is handled by DOM order (button is inserted before send button)
          this.buttonContainer.style.top = '0px';
          this.buttonContainer.style.right = 'auto'; // Clear any right positioning
        } else {
          // Fallback to original positioning
          this.buttonContainer.style.top = '0px';
          this.buttonContainer.style.right = '0px';
        }
      } else {
        // Use platform-specific positioning
        if (this.config.buttonPosition.absoluteTop) {
          this.buttonContainer.style.top = this.config.buttonPosition.absoluteTop;
        }

        // If we found the send button, position relative to it
        if (sendButton && sendButton instanceof HTMLElement) {
          // Position to the left of the send button
          const sendButtonRect = sendButton.getBoundingClientRect();
          const buttonContainerRect = this.buttonContainer.getBoundingClientRect();

          // Calculate the distance from the right edge to the send button
          const distanceFromRight = window.innerWidth - sendButtonRect.right;

          // Position the button to the left of the send button
          this.buttonContainer.style.right = `${distanceFromRight + sendButtonRect.width + 5}px`;
        } else {
          // Fallback to the configured right position
          if (this.config.buttonPosition.absoluteRight) {
            this.buttonContainer.style.right = this.config.buttonPosition.absoluteRight;
          }
        }
      }
    } else if (position === 'fixed') {
      const rect = this.inputField.getBoundingClientRect();
      this.buttonContainer.style.top = `${rect.top + 10}px`;

      // Try to find the send button
      const sendButton = document.querySelector('#composer-submit-button');

      if (sendButton && sendButton instanceof HTMLElement) {
        // Position to the left of the send button
        const sendButtonRect = sendButton.getBoundingClientRect();

        // Calculate the distance from the right edge to the send button
        const distanceFromRight = window.innerWidth - sendButtonRect.right;

        // Position the button to the left of the send button
        this.buttonContainer.style.right = `${distanceFromRight + sendButtonRect.width + 5}px`;
      } else {
        // Fallback position
        this.buttonContainer.style.right = '20px';
      }
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
    console.log('Trying direct button placement');
    
    // Based on the HTML structure, look for the send button directly
    const sendButton = document.querySelector('#composer-submit-button');
    
    // Find its container
    const sendButtonContainer = sendButton ? sendButton.closest('.absolute.bottom-0.right-3.flex.items-center.gap-2') : null;
    
    if (!sendButtonContainer) {
      console.log('Send button container not found by direct selector');
      
      // Try alternative selectors
      const altContainer = document.querySelector('.ml-auto.flex.items-center.gap-1\\.5');
      
      if (altContainer) {
        console.log('Found alternative container for send button');
        
        // Find the speech button within this container
        const speechButton = altContainer.querySelector('button[data-testid="composer-speech-button"]');
        
        if (sendButton) {
          console.log('Found send button in alternative container');
          
          // Create button container
          this.buttonContainer = document.createElement('div');
          this.buttonContainer.id = this.config.buttonContainerId;
          this.buttonContainer.style.position = 'relative';
          this.buttonContainer.style.zIndex = '9999';
          this.buttonContainer.style.display = 'flex';
          this.buttonContainer.style.alignItems = 'center';
          
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
            marginRight: '8px',
            flexShrink: '0'
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
          
          // Find the input field
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
          
          // Insert the button container before the send button
          altContainer.insertBefore(this.buttonContainer, sendButton);
          
          console.log('Button added successfully via alternative placement');
          return true;
        }
      }
      
      console.log('Alternative placement failed, trying fallback methods');
      return false;
    }
    
    console.log('Found send button container:', sendButtonContainer);
    
    // We already have the sendButton from earlier, no need to query again
    // Just make sure it's in the container
    if (!sendButton || sendButton.parentElement !== sendButtonContainer) {
      // If not, try to find it within the container
      const containerSendButton = sendButtonContainer.querySelector('button');
      if (!containerSendButton) {
        console.log('Send button not found within container');
        return false;
      }
      console.log('Found send button within container');
    }
    
    if (!sendButton) {
      console.log('Send button not found within container');
      return false;
    }
    
    console.log('Found send button:', sendButton);
    
    // Use the container as the target
    const targetContainer = sendButtonContainer;
    
    console.log('Found target container for direct placement');
    
    // Create button container
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.id = this.config.buttonContainerId;
    this.buttonContainer.style.position = 'relative';
    this.buttonContainer.style.zIndex = '9999';
    this.buttonContainer.style.display = 'flex'; // Use flex for better alignment
    this.buttonContainer.style.alignItems = 'center'; // Center items vertically
    
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
      marginRight: '8px', // Add some spacing from other buttons
      flexShrink: '0' // Prevent button from shrinking
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
    
    // Insert the button container before the send button
    // This ensures it's always to the left of the send button
    targetContainer.insertBefore(this.buttonContainer, sendButton);
    
    console.log('Button added successfully via direct placement');
    return true;
  }

  /**
   * Override update button visibility to handle ChatGPT's specific behavior
   */
  protected updateButtonVisibility(): void {
    if (!this.buttonContainer) return;
    
    // Always show the button, regardless of input field content
    this.buttonContainer.style.display = 'flex';
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

/**
 * Claude-specific content script class
 * 
 * This class extends the BaseContentScript class to provide Claude-specific
 * functionality for handling button positioning and container selection.
 */

import { BaseContentScript } from './base-content-script';

/**
 * Claude content script class
 */
export class ClaudeContentScript extends BaseContentScript {
  /**
   * Override the initialize method to try direct button placement first
   */
  public initialize(): void {
    console.log(`${this.config.name} content script initializing`);
    
    // Check if we're on a Claude page
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
   * Try to place the button directly at the location specified by the user
   * This is a more targeted approach that doesn't rely on finding the input field first
   * 
   * @returns boolean - Whether the button was successfully placed
   */
  protected tryDirectButtonPlacement(): boolean {
    // Try to find the send button using the selector provided by the user
    let sendButton = document.querySelector('body > div.flex.min-h-screen.w-full > div.min-h-full.w-full.min-w-0.flex-1 > div > div.h-screen.flex.flex-col.overflow-hidden > div > div > div.sticky.bottom-0.mx-auto.w-full.pt-6.z-\\[5\\] > fieldset > div.flex.flex-col.bg-bg-000.border-0\\.5.border-border-300.mx-2.md\\:mx-0.items-stretch.transition-all.duration-200.relative.shadow-\\[0_0\\.25rem_1\\.25rem_hsl\\(var\\(--always-black\\)\\/3\\.5\\%\\)\\].focus-within\\:shadow-\\[0_0\\.25rem_1\\.25rem_hsl\\(var\\(--always-black\\)\\/7\\.5\\%\\)\\].hover\\:border-border-200.focus-within\\:border-border-200.cursor-text.z-10.rounded-2xl > div.flex.flex-col.gap-3\\.5.m-3\\.5 > div.flex.gap-2\\.5.w-full.items-center > div:nth-child(3) > div > button');
    
    // If the send button is not found, try using XPath
    if (!sendButton) {
      const xpathResult = document.evaluate(
        '/html/body/div[2]/div[2]/div/div[1]/div/div/div[2]/fieldset/div[2]/div[1]/div[2]/div[3]/div/button',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      
      if (xpathResult.singleNodeValue) {
        sendButton = xpathResult.singleNodeValue as Element;
      }
    }
    
    // Try additional selectors if the button is still not found
    if (!sendButton) {
      // Try to find any button that might be the send button
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        // Look for buttons with specific attributes or content that might indicate it's the send button
        if (button.innerHTML.includes('send') || 
            button.getAttribute('aria-label')?.toLowerCase().includes('send') ||
            button.classList.contains('cl-send-button')) {
          sendButton = button;
          console.log('Found potential send button via fallback method');
          break;
        }
      }
    }
    
    if (!sendButton) {
      console.log('Send button not found for direct placement');
      return false;
    }
    
    console.log('Found send button for direct placement');
    
    // Find the parent container of the send button (div:nth-child(3) > div)
    const sendButtonContainer = sendButton.parentElement?.parentElement;
    
    if (!sendButtonContainer) {
      console.log('Send button container not found for direct placement');
      return false;
    }
    
    // Find the parent of the send button container (div.flex.gap-2\.5.w-full.items-center)
    const actionsContainer = sendButtonContainer.parentElement;
    
    if (!actionsContainer) {
      console.log('Actions container not found for direct placement');
      return false;
    }
    
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
    
    // Insert the button container before the send button container
    actionsContainer.insertBefore(this.buttonContainer, sendButtonContainer);
    
    console.log('Button added successfully via direct placement');
    return true;
  }

  // Flag to prevent multiple concurrent operations
  private isProcessingButtonPlacement = false;

  /**
   * Override setup observer to handle Claude's dynamic DOM changes
   */
  protected setupObserver(): void {
    console.log('Setting up observer for Claude');
    
    // Create a more focused observer that only triggers on significant changes
    const observer = new MutationObserver((mutations) => {
      // Don't process if we're already handling a placement
      if (this.isProcessingButtonPlacement) return;
      
      // Check if the button exists
      const button = document.getElementById(this.config.buttonId);
      
      // Check if any of the mutations affected the chat interface
      // Only consider childList and direct fieldset changes to reduce noise
      const relevantMutation = mutations.some(mutation => {
        if (mutation.type !== 'childList') return false;
        
        // Only consider mutations to fieldset or its direct children
        const target = mutation.target as Element;
        return target.tagName === 'FIELDSET' || 
               target.parentElement?.tagName === 'FIELDSET' ||
               target.classList.contains('cl-chat-input-container');
      });
      
      // If the button doesn't exist or a relevant mutation occurred, try to add/reposition the button
      if (!button || relevantMutation) {
        console.log('Button not found or chat interface changed, attempting to add/reposition button');
        
        this.isProcessingButtonPlacement = true;
        
        // First try the direct approach to find the exact location specified by the user
        if (this.tryDirectButtonPlacement()) {
          console.log('Successfully placed button using direct DOM query');
        } else {
          // If direct placement fails, fall back to the standard approach
          this.findInputFieldAndAddButton();
        }
        
        this.isProcessingButtonPlacement = false;
      }
    });
    
    // Observe the document with a more focused configuration
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // Don't observe all attribute changes
      characterData: false // Don't observe text changes
    });
    
    // Set up a less frequent periodic check
    const checkInterval = setInterval(() => {
      // Don't process if we're already handling a placement
      if (this.isProcessingButtonPlacement) return;
      
      const button = document.getElementById(this.config.buttonId);
      if (!button) {
        console.log('Periodic check: Button not found, attempting to add it');
        
        this.isProcessingButtonPlacement = true;
        
        if (this.tryDirectButtonPlacement()) {
          console.log('Successfully placed button using direct DOM query');
        } else {
          this.findInputFieldAndAddButton();
        }
        
        this.isProcessingButtonPlacement = false;
      }
    }, 10000); // Check every 10 seconds
    
    // Clean up interval on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  }

  /**
   * Override the update button visibility method to handle Claude's specific behavior
   */
  protected updateButtonVisibility(): void {
    if (!this.inputField || !this.buttonContainer) return;
    
    const promptText = this.getPromptText();
    const isEmpty = !promptText || promptText.trim() === '';
    
    // For direct placement, we want the button to always be visible
    // Only hide it if we're using the standard approach
    if (this.buttonContainer.parentElement?.classList.contains('flex') && 
        this.buttonContainer.parentElement?.classList.contains('gap-2.5')) {
      // This is direct placement, always show the button
      this.buttonContainer.style.display = 'block';
    } else {
      // Standard approach, hide when empty
      this.buttonContainer.style.display = isEmpty ? 'none' : 'block';
    }
  }
  
  /**
   * Flag to prevent multiple concurrent improve prompt operations
   */
  private isProcessingImprovePrompt = false;
  
  /**
   * Override handle improve prompt click to fix infinite loading state
   */
  protected handleImprovePromptClick(): void {
    console.log('Improve Prompt button clicked');
    
    // Prevent multiple concurrent operations
    if (this.isProcessingImprovePrompt) {
      console.log('Already processing an improve prompt request, ignoring');
      return;
    }
    
    // Get the prompt text
    const promptText = this.getPromptText();
    
    if (!promptText.trim()) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Set processing flag
    this.isProcessingImprovePrompt = true;
    
    // Show loading state
    if (this.button) {
      this.showLoadingState();
    }
    
    // Send message to background script with timeout
    const timeoutId = setTimeout(() => {
      // If it takes too long, reset the button
      console.log('Improve prompt request timed out');
      if (this.button) {
        this.resetButtonState();
      }
      this.isProcessingImprovePrompt = false;
    }, 15000); // 15 second timeout
    
    chrome.runtime.sendMessage(
      {
        type: 'IMPROVE_PROMPT',
        data: {
          prompt: promptText,
          url: window.location.href,
        },
      },
      (response) => {
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (response && response.type === 'IMPROVED_PROMPT') {
          // Set the improved prompt
          this.setPromptText(response.data.improvedPrompt);
          
          // Reset button state
          if (this.button) {
            this.resetButtonState();
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
        
        // Reset processing flag
        this.isProcessingImprovePrompt = false;
      }
    );
  }
}

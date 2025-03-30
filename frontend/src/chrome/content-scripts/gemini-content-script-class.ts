/**
 * Gemini-specific content script class
 * 
 * This class extends the BaseContentScript class to provide Gemini-specific
 * functionality for handling prompt text and positioning.
 */

import { BaseContentScript } from './base-content-script';

/**
 * Gemini content script class
 */
export class GeminiContentScript extends BaseContentScript {
  /**
   * Override the position button method to handle Gemini-specific positioning
   * Positions the button to the right of the plus button
   */
  protected positionButtonRelativeToInput(): void {
    if (!this.inputField || !this.button) return;
    
    // Try to find the plus button using the selector
    const plusButtonSelector = 'div.leading-actions-wrapper > div > uploader > div > div > button';
    const plusButton = document.querySelector(plusButtonSelector);
    
    if (plusButton) {
      // Get the dimensions and position of the plus button
      const plusButtonRect = plusButton.getBoundingClientRect();
      
      // Position our button to the right of the plus button
      this.button.style.top = `${plusButtonRect.top}px`;
      this.button.style.left = `${plusButtonRect.right + 10}px`; // 10px spacing
      this.button.style.right = 'auto'; // Clear right positioning
      
      console.log('Positioned button to the right of plus button:', 
                 `top: ${this.button.style.top}, left: ${this.button.style.left}`);
      return;
    }
    
    // Fallback to original positioning if plus button not found
    // Get the dimensions and position of the input field
    const inputRect = this.inputField.getBoundingClientRect();
    
    // Find the parent container of the input field
    const inputContainer = this.inputField.closest('.text-input-field_textarea-wrapper');
    
    // If we found the container, use its dimensions
    if (inputContainer) {
      const containerRect = inputContainer.getBoundingClientRect();
      
      // Position the button in the top right corner of the container
      this.button.style.top = `${containerRect.top + 10}px`;
      this.button.style.right = `${window.innerWidth - containerRect.right + 10}px`;
      this.button.style.left = 'auto'; // Clear left positioning
      
      console.log('Positioned button relative to input container (fallback):', 
                 `top: ${this.button.style.top}, right: ${this.button.style.right}`);
    } else {
      // If container not found, position relative to the input field
      this.button.style.top = `${inputRect.top + 10}px`;
      this.button.style.right = `${window.innerWidth - inputRect.right + 10}px`;
      this.button.style.left = 'auto'; // Clear left positioning
      
      console.log('Positioned button relative to input field (fallback):', 
                 `top: ${this.button.style.top}, right: ${this.button.style.right}`);
    }
  }

  /**
   * Override the add button to page method to use fixed positioning for Gemini
   */
  protected addButtonToPage(): void {
    if (!this.inputField) return;
    
    console.log('Adding button to page for Gemini');
    
    // Check if button already exists
    if (document.getElementById(this.config.buttonId)) {
      console.log('Button already exists, skipping');
      return;
    }
    
    // Create button directly without container for Gemini
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
      position: 'fixed', // Use fixed for positioning relative to viewport
      zIndex: '999999', // Maximum z-index
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: 'none',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
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
      this.handleImprovePromptClick();
    });
    
    // Add button to body
    document.body.appendChild(this.button);
    
    // Position the button relative to the input
    this.positionButtonRelativeToInput();
    
    // Add window resize and scroll handlers
    window.addEventListener('resize', () => {
      this.positionButtonRelativeToInput();
    });
    
    window.addEventListener('scroll', () => {
      this.positionButtonRelativeToInput();
    });
    
    console.log('Button added successfully for Gemini');
  }

  /**
   * Override get prompt text for Gemini's specific DOM structure
   */
  protected getPromptText(): string {
    if (!this.inputField) return '';
    
    console.log('Getting prompt text from Gemini input field');
    
    // Look for paragraphs within the input field
    const paragraphs = this.inputField.querySelectorAll('p');
    if (paragraphs.length > 0) {
      const text = Array.from(paragraphs)
        .map(p => p.textContent || '')
        .join('\n');
      
      console.log('Found text in paragraphs:', text);
      return text;
    }
    
    // If no paragraphs, return textContent
    const textContent = this.inputField.textContent || '';
    console.log('No paragraphs found, using textContent:', textContent);
    return textContent;
  }

  /**
   * Override set prompt text for Gemini's specific DOM structure
   */
  protected setPromptText(text: string): void {
    if (!this.inputField) return;
    
    console.log('Setting prompt text for Gemini:', text);
    
    // Look for paragraphs within the input field
    const paragraphs = this.inputField.querySelectorAll('p');
    
    if (paragraphs.length > 0) {
      // Set text in the first paragraph
      paragraphs[0].textContent = text;
      
      // Remove any additional paragraphs
      for (let i = 1; i < paragraphs.length; i++) {
        paragraphs[i].remove();
      }
      
      console.log('Set text in existing paragraph');
    } else {
      // If no paragraphs, create a new one
      const p = document.createElement('p');
      p.textContent = text;
      
      // Clear the input field and add the paragraph
      this.inputField.innerHTML = '';
      this.inputField.appendChild(p);
      
      console.log('Created new paragraph with text');
    }
    
    // Trigger input and change events
    this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
    this.inputField.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Override setup observer to handle Gemini's dynamic DOM changes
   */
  protected setupObserver(): void {
    console.log('Setting up observer for Gemini');
    
    const observer = new MutationObserver(() => {
      // Check if the button exists
      const button = document.getElementById(this.config.buttonId);
      
      // Find the input field
      const inputField = document.querySelector(this.config.inputSelectors[0]);
      
      if (!button && inputField) {
        // If button doesn't exist but input field is found, add the button
        this.inputField = inputField;
        this.addButtonToPage();
      } else if (button && inputField && this.button) {
        // If button exists and input field is found, update the button position
        this.inputField = inputField;
        this.positionButtonRelativeToInput();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
}

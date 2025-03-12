/**
 * Content script for injecting the "Improve Prompt" button on ChatGPT pages
 * 
 * This script adds a button next to the input field on ChatGPT that allows
 * users to send their prompt to the backend for improvement.
 */

// Configuration
const BUTTON_TEXT = 'Improve Prompt';
const BUTTON_CLASS = 'prompt-mixer-improve-button';
const INPUT_SELECTOR = 'textarea[data-id="root"]'; // ChatGPT input field selector

/**
 * Creates the "Improve Prompt" button
 * @returns {HTMLButtonElement} The created button
 */
function createImproveButton() {
  const button = document.createElement('button');
  button.textContent = BUTTON_TEXT;
  button.className = BUTTON_CLASS;
  button.style.cssText = `
    background-color: #10a37f;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
    transition: background-color 0.3s;
  `;
  
  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#0d8a6f';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#10a37f';
  });
  
  return button;
}

/**
 * Injects the "Improve Prompt" button next to the input field
 */
function injectImproveButton() {
  // Find the input field
  const inputField = document.querySelector(INPUT_SELECTOR);
  if (!inputField) {
    console.log('Input field not found, will retry later');
    return false;
  }
  
  // Check if button already exists
  if (document.querySelector(`.${BUTTON_CLASS}`)) {
    return true;
  }
  
  // Find the parent element to inject the button
  const parentElement = inputField.parentElement.parentElement;
  if (!parentElement) {
    console.log('Parent element not found, will retry later');
    return false;
  }
  
  // Create the button
  const improveButton = createImproveButton();
  
  // Add click event listener
  improveButton.addEventListener('click', () => {
    const promptText = inputField.value.trim();
    if (!promptText) {
      alert('Please enter a prompt first');
      return;
    }
    
    // Send the prompt to the background script for improvement
    improveButton.textContent = 'Improving...';
    improveButton.disabled = true;
    
    chrome.runtime.sendMessage(
      {
        type: 'IMPROVE_PROMPT',
        data: { prompt: promptText }
      },
      (response) => {
        if (response && response.type === 'IMPROVED_PROMPT') {
          // Update the input field with the improved prompt
          inputField.value = response.data.improvedPrompt;
          
          // Trigger an input event to make ChatGPT recognize the change
          inputField.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Reset the button
          improveButton.textContent = BUTTON_TEXT;
          improveButton.disabled = false;
        } else {
          // Handle error
          improveButton.textContent = 'Error';
          setTimeout(() => {
            improveButton.textContent = BUTTON_TEXT;
            improveButton.disabled = false;
          }, 2000);
        }
      }
    );
  });
  
  // Insert the button before the input field's parent
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.alignItems = 'center';
  buttonContainer.style.marginBottom = '8px';
  buttonContainer.appendChild(improveButton);
  
  parentElement.insertBefore(buttonContainer, parentElement.firstChild);
  
  console.log('Improve Prompt button injected');
  return true;
}

/**
 * Main initialization function
 */
function initialize() {
  console.log('GPT Injector: Initializing');
  
  // Try to inject the button immediately
  if (injectImproveButton()) {
    console.log('Button injected successfully');
  } else {
    // If not successful, set up a mutation observer to wait for the input field
    console.log('Setting up mutation observer');
    
    const observer = new MutationObserver((mutations) => {
      if (injectImproveButton()) {
        console.log('Button injected after DOM change');
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Set a timeout to stop the observer after 30 seconds
    setTimeout(() => {
      observer.disconnect();
      console.log('Mutation observer disconnected after timeout');
    }, 30000);
  }
}

// Start the initialization process
initialize();

/**
 * Background script for the Prompt Mixer Extension
 *
 * This script handles communication between content scripts and the side panel,
 * manages extension state, and interacts with the backend API.
 */

// Import Chrome types and services
import type { ChromeMessage, ChromeMessageSender } from '../../types/chrome';
import { authService } from '../../services/auth';
import { getApiUrl } from '../../utils/config';

// Initialize the side panel when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Register the side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({
      path: 'index.html',
      enabled: true,
    });
  }
});

// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener(tab => {
  // Toggle the side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, sender: ChromeMessageSender, sendResponse) => {
    // Log the received message for debugging
    console.log('Background script received message:', message);

    // Handle different message types
    switch (message.type) {
      case 'ADD_TO_CHAT':
        // Get active tab
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs[0]?.id) {
            try {
              console.log('Background script: executing script to add text to chat');
              
              // Use executeScript to inject and run code in the page
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id as number },
                func: (text: string) => {
                  console.log('Executing script to insert text:', text);
                  
                  // Find active element
                  const activeElement = document.activeElement;
                  console.log('Active element:', activeElement);
                  
                  if (!activeElement) {
                    console.error('No active element found');
                    return false;
                  }
                  
                  // If it's an input field, set text
                  if (activeElement instanceof HTMLInputElement || 
                      activeElement instanceof HTMLTextAreaElement) {
                    console.log('Active element is input or textarea');
                    
                    // Get current value
                    const currentValue = activeElement.value;
                    
                    // Get cursor position
                    const cursorPos = activeElement.selectionStart || 0;
                    
                    // Insert text at cursor position
                    const newValue = currentValue.substring(0, cursorPos) + 
                                    text + 
                                    currentValue.substring(cursorPos);
                    
                    // Set new value
                    activeElement.value = newValue;
                    
                    // Set cursor position after inserted text
                    activeElement.selectionStart = activeElement.selectionEnd = cursorPos + text.length;
                    
                    // Trigger input event
                    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    console.log('Text inserted successfully in input/textarea');
                    return true;
                  } else if (activeElement.getAttribute('contenteditable') === 'true' || 
                            activeElement.getAttribute('role') === 'textbox') {
                    console.log('Active element is contenteditable');
                    
                    // Insert text at current position
                    document.execCommand('insertText', false, text);
                    
                    console.log('Text inserted successfully in contenteditable');
                    return true;
                  } else {
                    console.error('Active element is not a valid input field:', activeElement);
                    return false;
                  }
                },
                args: [message.data.text]
              }).then(results => {
                console.log('executeScript results:', results);
                if (results && results.length > 0 && results[0].result) {
                  sendResponse({ success: true, message: 'Text added to chat' });
                } else {
                  sendResponse({ success: false, message: 'Failed to add text to chat' });
                }
              }).catch(error => {
                console.error('executeScript error:', error);
                sendResponse({ success: false, message: 'Error executing script: ' + error.message });
              });
            } catch (error) {
              console.error('Error sending message to tab:', error);
              sendResponse({ success: false, message: 'Error: ' + (error as Error).message });
            }
          } else {
            sendResponse({ success: false, message: 'No active tab found' });
          }
        });
        break;
      case 'IMPROVE_PROMPT':
        // Get auth token and then make the API call
        authService.getAuthToken().then(token => {
          // Prepare headers
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          // Add Authorization header if token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('Sending request to:', getApiUrl('prompts/improve'));
          
          // Call the backend API to improve the prompt
          fetch(getApiUrl('prompts/improve'), {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: message.data.prompt,
              url: message.data.url,
            }),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              sendResponse({
                type: 'IMPROVED_PROMPT',
                data: {
                  improvedPrompt: data.improved_prompt,
                },
              });
            })
            .catch(error => {
              console.error('Error improving prompt:', error);
              const errorMessage = error.message.includes('Failed to fetch') 
                ? 'Network error: Could not connect to the API server. Please check your internet connection.'
                : `Error improving prompt: ${error.message}`;
              
              sendResponse({
                type: 'ERROR',
                data: {
                  message: errorMessage,
                },
              });
            });
        });
        break;

      case 'GET_USER_PROMPTS':
        // Fetch user prompts from storage
        chrome.storage.local.get(['prompts'], result => {
          sendResponse({
            type: 'USER_PROMPTS',
            data: result.prompts || [],
          });
        });
        break;

      case 'CHECK_AUTH':
        // Проверяем, авторизован ли пользователь
        authService.getCurrentUser().then(user => {
          sendResponse({
            type: 'AUTH_STATUS',
            data: {
              isAuthenticated: !!user,
            },
          });
        });
        break;

      case 'AUTH_STATE_CHANGED':
        // Broadcast auth state change to all extension pages
        chrome.runtime.sendMessage(message);

        // Также отправляем сообщение во все content scripts
        chrome.tabs.query({}, tabs => {
          tabs.forEach(tab => {
            if (tab.id) {
              try {
                chrome.tabs.sendMessage(tab.id, message, {}, () => {
                  // Игнорируем ошибки, если content script не загружен на странице
                  if (chrome.runtime.lastError) {
                    console.log(
                      `Error sending message to tab ${tab.id}: ${chrome.runtime.lastError.message}`
                    );
                  }
                });
              } catch (error) {
                console.log(`Error sending message to tab ${tab.id}: ${error}`);
              }
            }
          });
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
        sendResponse({ error: 'Unknown message type' });
    }

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
);

// Listen for side panel connections
chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'sidePanel') {
    console.log('Side panel connected');

    port.onMessage.addListener((message: ChromeMessage) => {
      console.log('Message from side panel:', message);

      // Handle side panel messages
      // ...
    });

    port.onDisconnect.addListener(() => {
      console.log('Side panel disconnected');
    });
  }
});

console.log('Background script loaded');

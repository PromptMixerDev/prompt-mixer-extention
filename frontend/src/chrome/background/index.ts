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
chrome.action.onClicked.addListener((tab) => {
  // Toggle the side panel
  if (chrome.sidePanel) {
    try {
      // We need to provide either tabId or windowId
      // Since we have the tab from the event, we can use its windowId
      if (tab && tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
        console.log('Side panel opened from extension icon click');
      } else {
        console.error('No window ID available from tab');
      }
    } catch (error) {
      console.error('Error opening side panel:', error);
    }
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
        // Use activeTab permission to get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs[0]?.id) {
            try {
              console.log('Background script: executing script to add text to chat');
              
              // Use executeScript to inject and run code in the page
              // This works with activeTab permission
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
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
            .then(async response => {
              if (!response.ok) {
                // Check for limit reached error (403 Forbidden)
                if (response.status === 403) {
                  const errorData = await response.json();
                  throw new Error(`LIMIT_REACHED: ${errorData.detail || 'You have reached your free improvement limit. Please upgrade to a paid plan to continue.'}`);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              // Notify all extension pages that limits have changed
              chrome.runtime.sendMessage({
                type: 'LIMITS_CHANGED'
              });
              
              sendResponse({
                type: 'IMPROVED_PROMPT',
                data: {
                  improvedPrompt: data.improved_prompt,
                },
              });
            })
            .catch(error => {
              console.error('Error improving prompt:', error);
              
              // Check if this is a limit reached error
              const isLimitReached = error.message.includes('LIMIT_REACHED');
              
              const errorMessage = error.message.includes('Failed to fetch') 
                ? 'Network error: Could not connect to the API server. Please check your internet connection.'
                : isLimitReached
                  ? error.message.replace('LIMIT_REACHED: ', '')
                  : `Error improving prompt: ${error.message}`;
              
              sendResponse({
                type: 'ERROR',
                data: {
                  message: errorMessage,
                  isLimitReached: isLimitReached
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

        // We no longer broadcast to all tabs since we don't have the "tabs" permission
        // Instead, we'll rely on the activeTab permission when needed
        
        // If we have a sender tab ID, we can send a message to that specific tab
        if (sender.tab?.id) {
          try {
            chrome.tabs.sendMessage(sender.tab.id, message, {}, () => {
              // Ignore errors if content script is not loaded on the page
              if (chrome.runtime.lastError) {
                console.log(
                  `Error sending message to tab ${sender.tab?.id}: ${chrome.runtime.lastError.message}`
                );
              }
            });
          } catch (error) {
            console.log(`Error sending message to tab ${sender.tab?.id}: ${error}`);
          }
        }
        break;
        
      case 'OPEN_SIDE_PANEL':
        // Open the side panel when requested from content script
        console.log('Opening side panel from content script request');
        if (chrome.sidePanel) {
          try {
            // We need to provide either tabId or windowId
            // If we have sender tab info, we can use its windowId
            if (sender.tab && sender.tab.windowId) {
              chrome.sidePanel.open({ windowId: sender.tab.windowId });
              console.log('Side panel opened from content script request with windowId:', sender.tab.windowId);
              sendResponse({ success: true });
            } else {
              // If we don't have sender tab info, we need to query for the active tab
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.windowId && chrome.sidePanel) {
                  chrome.sidePanel.open({ windowId: tabs[0].windowId });
                  console.log('Side panel opened from content script request with queried windowId:', tabs[0].windowId);
                  sendResponse({ success: true });
                } else {
                  console.error('No window ID available from active tab query or sidePanel API not available');
                  sendResponse({ success: false, message: 'No window ID available or sidePanel API not available' });
                }
              });
            }
          } catch (error) {
            console.error('Error opening side panel:', error);
            sendResponse({ success: false, message: 'Error opening side panel: ' + (error as Error).message });
          }
        } else {
          console.error('Side panel API not available');
          sendResponse({ success: false, message: 'Side panel API not available' });
        }
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

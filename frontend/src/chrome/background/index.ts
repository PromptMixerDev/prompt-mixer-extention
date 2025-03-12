/**
 * Background script for the Prompt Mixer Extension
 * 
 * This script handles communication between content scripts and the side panel,
 * manages extension state, and interacts with the backend API.
 */

// Import Chrome types
import type { ChromeMessage, ChromeMessageSender, ChromeWindow } from '../../types/chrome';

// Initialize the side panel when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Register the side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({
      path: 'index.html',
      enabled: true
    });
  }
});

// Open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  // Toggle the side panel
  if (chrome.sidePanel) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message: ChromeMessage, sender: ChromeMessageSender, sendResponse) => {
  // Log the received message for debugging
  console.log('Background script received message:', message);

  // Handle different message types
  switch (message.type) {
    case 'IMPROVE_PROMPT':
      // In a real implementation, this would call the backend API
      // For now, we'll just simulate a response
      setTimeout(() => {
        sendResponse({
          type: 'IMPROVED_PROMPT',
          data: {
            originalPrompt: message.data.prompt,
            improvedPrompt: `Improved: ${message.data.prompt}`
          }
        });
      }, 1000);
      break;

    case 'GET_USER_PROMPTS':
      // Fetch user prompts from storage
      chrome.storage.local.get(['prompts'], (result) => {
        sendResponse({
          type: 'USER_PROMPTS',
          data: result.prompts || []
        });
      });
      break;
      
    case 'AUTH_STATE_CHANGED':
      // Broadcast auth state change to all extension pages
      chrome.runtime.sendMessage(message);
      break;

    default:
      console.log('Unknown message type:', message.type);
      sendResponse({ error: 'Unknown message type' });
  }

  // Return true to indicate that the response will be sent asynchronously
  return true;
});

// Listen for side panel connections
chrome.runtime.onConnect.addListener((port) => {
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

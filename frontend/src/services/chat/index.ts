/**
 * Chat service
 * Provides functions for interacting with chat interfaces
 */

/**
 * Replace variables in text with their values
 * @param text Text with variables in {{variable_name}} format
 * @param variables Object with variable values
 * @returns Text with variables replaced
 */
export const replaceVariables = (text: string, variables: Record<string, string>): string => {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    return variables[variableName] || match; // If value not found, keep variable as is
  });
};

/**
 * Add text to active chat input
 * @param text Text to add
 */
export const addToChat = (text: string): void => {
  console.log('Chat service: addToChat called with text:', text);
  
  // Send message to background script
  chrome.runtime.sendMessage({
    type: 'ADD_TO_CHAT',
    data: {
      text
    }
  }, (response) => {
    if (response) {
      console.log('Chat service: received response from background script:', response);
    } else if (chrome.runtime.lastError) {
      console.error('Chat service: error sending message:', chrome.runtime.lastError);
    }
  });
};

/**
 * Process prompt and add to chat
 * @param promptText Prompt text with variables
 * @param variables Variable values
 */
export const processAndAddToChat = (
  promptText: string, 
  variables: Record<string, string> = {}
): void => {
  // Replace variables with their values
  const processedText = replaceVariables(promptText, variables);
  
  // Add to chat
  addToChat(processedText);
};

export default {
  replaceVariables,
  addToChat,
  processAndAddToChat
};

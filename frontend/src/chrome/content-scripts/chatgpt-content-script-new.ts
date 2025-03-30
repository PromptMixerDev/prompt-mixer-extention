/**
 * ChatGPT-specific content script
 * 
 * This script initializes the ChatGPT content script class to add the "Improve Prompt" button
 * to ChatGPT.com and handle prompt improvement functionality.
 */

import { ChatGPTContentScript } from './chatgpt-content-script-class';
import { chatGptConfig } from './platform-configs';

// Initialize the ChatGPT content script
const chatGptContentScript = new ChatGPTContentScript(chatGptConfig);
chatGptContentScript.initialize();

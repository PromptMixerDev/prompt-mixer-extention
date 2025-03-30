/**
 * Claude-specific content script
 * 
 * This script initializes the Claude content script class to add the "Improve Prompt" button
 * to Claude.ai and handle prompt improvement functionality.
 */

import { ClaudeContentScript } from './claude-content-script-class';
import { claudeConfig } from './platform-configs';

// Initialize the Claude content script
const claudeContentScript = new ClaudeContentScript(claudeConfig);
claudeContentScript.initialize();

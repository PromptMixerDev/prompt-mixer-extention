/**
 * Platform-specific configurations
 * 
 * This file contains configuration objects for each supported platform.
 * These configurations are used by the platform-specific content scripts.
 */

import { PlatformConfig } from './types';

/**
 * Common SVG icon used by all platforms
 */
const COMMON_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_102_2005)"><path d="M12.7505 0.90625L13.7396 2.76087L15.5942 3.75L13.7396 4.73913L12.7505 6.59375L11.7613 4.73913L9.90675 3.75L11.7613 2.76087L12.7505 0.90625ZM6.00049 3.25L8.00048 7L11.7505 8.99999L8.00048 11L6.00049 14.75L4.00049 11L0.250488 8.99999L4.00049 7L6.00049 3.25ZM14.7505 12.25L13.5005 9.90629L12.2505 12.25L9.90675 13.5L12.2505 14.75L13.5005 17.0938L14.7505 14.75L17.0942 13.5L14.7505 12.25Z" fill="white"/></g><defs><clipPath id="clip0_102_2005"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>`;

/**
 * ChatGPT platform configuration
 */
export const chatGptConfig: PlatformConfig = {
  name: 'chatgpt',
  icon: COMMON_ICON,
  buttonId: 'improve-prompt-button-chatgpt',
  buttonContainerId: 'improve-prompt-button-container-chatgpt',
  hostnames: ['chatgpt.com'],
  inputSelectors: [
    // Primary selector for current ChatGPT (2025)
    '#prompt-textarea',
    // Minimal set of fallbacks for robustness
    'div.ProseMirror[data-virtualkeyboard="true"]',
    '[contenteditable="true"]',
    'div[role="textbox"]'
  ],
  containerSelectors: [
    // Primary selectors for current ChatGPT versions (2025)
    '.absolute.bottom-0.right-3.flex.items-center.gap-2', // Exact selector from the HTML
    'div.absolute.bottom-0.right-3.flex.items-center.gap-2', // With div prefix
    '.flex.items-center.gap-2', // More generic version
    // Fallbacks
    'form div[role="presentation"]',
    'form.w-full',
    'form'
  ],
  buttonStyles: {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(77, 77, 77)',
    borderRadius: '999px',
    width: '36px',
    height: '36px'
  },
  buttonPosition: {
    absoluteTop: '0px',
    absoluteRight: '0px' // Not used in direct placement, but kept as fallback
  }
};

/**
 * Claude platform configuration
 */
export const claudeConfig: PlatformConfig = {
  name: 'claude',
  icon: COMMON_ICON,
  buttonId: 'improve-prompt-button-claude',
  buttonContainerId: 'improve-prompt-button-container-claude',
  hostnames: ['claude.ai', 'anthropic.com'],
  inputSelectors: [
    // Primary selectors
    '.ProseMirror',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    // Claude-specific selectors (2025)
    '.cl-textarea',
    '.cl-textfield__textarea',
    '.cl-editor',
    '.cl-editor-container [contenteditable="true"]',
    '.cl-chat-input',
    // Generic fallbacks
    'textarea'
  ],
  containerSelectors: [
    'fieldset',
    '.cl-chat-input-container',
    '.cl-editor-container'
  ],
  buttonStyles: {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(50, 50, 50)',
    borderRadius: '12px',
    width: '32px',
    height: '32px'
  },
  buttonPosition: {
    absoluteTop: '48px',
    absoluteRight: '10px'
  }
};

/**
 * Gemini platform configuration
 */
export const geminiConfig: PlatformConfig = {
  name: 'gemini',
  icon: COMMON_ICON,
  buttonId: 'improve-prompt-button-gemini',
  buttonContainerId: 'improve-prompt-button-container-gemini',
  hostnames: ['gemini.google.com'],
  inputSelectors: [
    // Gemini-specific selector
    '.ql-editor.textarea.new-input-ui',
    // Generic fallbacks
    'textarea',
    '[contenteditable="true"]',
    'div[role="textbox"]'
  ],
  containerSelectors: [
    '.text-input-field_textarea-wrapper',
    'form',
    'div.input-area'
  ],
  buttonStyles: {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(77, 77, 77)',
    borderRadius: '999px',
    width: '40px',
    height: '40px'
  },
  buttonPosition: {
    absoluteTop: '10px',
    absoluteRight: '10px'
  }
};

/**
 * OpenAI platform configuration
 */
export const openAiConfig: PlatformConfig = {
  name: 'openai',
  icon: COMMON_ICON,
  buttonId: 'improve-prompt-button-openai',
  buttonContainerId: 'improve-prompt-button-container-openai',
  hostnames: ['chat.openai.com', 'openai.com'],
  inputSelectors: [
    // Primary selectors based on the provided HTML
    'form textarea',
    'textarea.resize-none',
    'label textarea',
    '[data-gtm-form-interact-field-id]',
    // Generic fallbacks
    'textarea',
    '[contenteditable="true"]',
    'div[role="textbox"]',
    '[data-testid="text-input"]',
    '[data-testid="chat-input"]'
  ],
  containerSelectors: [
    'form.relative',
    'label.relative',
    '.absolute.bottom-3.right-3',
    'form',
    'label'
  ],
  buttonStyles: {
    backgroundColor: 'rgb(0, 0, 0)',
    hoverBackgroundColor: 'rgb(77, 77, 77)',
    borderRadius: '999px',
    width: '36px',
    height: '36px'
  },
  buttonPosition: {
    absoluteTop: '70px',
    absoluteRight: '55px'
  }
};

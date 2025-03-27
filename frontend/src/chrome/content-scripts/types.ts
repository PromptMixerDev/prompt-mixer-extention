/**
 * Shared types for content scripts
 * 
 * This file contains TypeScript interfaces and types used across all content scripts
 * to ensure type safety and consistency.
 */

/**
 * Configuration for a specific platform
 */
export interface PlatformConfig {
  /** Platform name (e.g., 'chatgpt', 'claude') */
  name: string;
  
  /** SVG icon for the button */
  icon: string;
  
  /** Button ID for easy reference */
  buttonId: string;
  
  /** Button container ID for easy reference */
  buttonContainerId: string;
  
  /** Hostnames that identify this platform */
  hostnames: string[];
  
  /** CSS selectors for finding the input field */
  inputSelectors: string[];
  
  /** CSS selectors for finding the container for the button */
  containerSelectors: string[];
  
  /** Button styling */
  buttonStyles: ButtonStyles;
  
  /** Button positioning */
  buttonPosition: {
    /** Top position when absolute */
    absoluteTop?: string;
    /** Right position when absolute */
    absoluteRight?: string;
  };
}

/**
 * Button styling properties
 */
export interface ButtonStyles {
  /** Background color */
  backgroundColor: string;
  
  /** Background color on hover */
  hoverBackgroundColor: string;
  
  /** Border radius */
  borderRadius: string;
  
  /** Button width */
  width: string;
  
  /** Button height */
  height: string;
}

/**
 * Response from the background script
 */
export interface ImprovePromptResponse {
  type: string;
  data: {
    improvedPrompt: string;
  };
}

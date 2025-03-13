import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './utils/dev-chrome-api'; // Import temporary replacement for Chrome API
import { AuthProvider } from '@context/AuthContext';
import { PromptProvider } from '@context/PromptContext';
import SidePanel from '@chrome/sidepanel/components/side-panel/side-panel';
import '@styles/tokens.css'; // Import design tokens
import './index.css';

/**
 * Development entry point for the sidepanel
 * This file is used only in development mode
 */

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create a root
createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <PromptProvider>
        <SidePanel />
      </PromptProvider>
    </AuthProvider>
  </StrictMode>
);

import './App.css';
import { PromptProvider } from '@context/PromptContext';
import { AuthProvider } from '@context/AuthContext';
import SidePanel from '@chrome/sidepanel/components/side-panel/side-panel';

/**
 * Main application component
 * Renders the SidePanel component
 */
function App() {
  return (
    <AuthProvider>
      <PromptProvider>
        <SidePanel />
      </PromptProvider>
    </AuthProvider>
  );
}

export default App;

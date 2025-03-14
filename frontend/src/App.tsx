import './App.css';
import './styles/skeleton.css';
import { PromptProvider } from '@context/PromptContext';
import { AuthProvider } from '@context/AuthContext';
import SidePanel from '@chrome/sidepanel/components/side-panel/side-panel';
import SkeletonProvider from '@components/ui/skeleton-provider/skeleton-provider';

/**
 * Main application component
 * Renders the SidePanel component with all necessary providers
 */
function App() {
  return (
    <SkeletonProvider>
      <AuthProvider>
        <PromptProvider>
          <SidePanel />
        </PromptProvider>
      </AuthProvider>
    </SkeletonProvider>
  );
}

export default App;

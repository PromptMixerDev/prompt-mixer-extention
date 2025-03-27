import './App.css';
import './styles/skeleton.css';
import { PromptProvider } from '@context/PromptContext';
import { AuthProvider } from '@context/AuthContext';
import SidePanel from '@chrome/sidepanel/components/side-panel/side-panel';
import SkeletonProvider from '@components/tech/skeleton-provider/skeleton-provider';
import { ToastProvider } from '@components/tech/toast/toast';

/**
 * Main application component
 * Renders the SidePanel component with all necessary providers
 */
function App() {
  return (
    <ToastProvider>
      <SkeletonProvider>
        <AuthProvider>
          <PromptProvider>
            <SidePanel />
          </PromptProvider>
        </AuthProvider>
      </SkeletonProvider>
    </ToastProvider>
  );
}

export default App;

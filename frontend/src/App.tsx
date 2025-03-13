import './App.css';
import { PromptProvider } from '@context/PromptContext';
import { AuthProvider } from '@context/AuthContext';
import AuthButton from '@components/ui/AuthButton';

/**
 * Main application component
 */
function App() {
  return (
    <AuthProvider>
      <PromptProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>Prompt Mixer</h1>
            <AuthButton />
          </header>
          <main className="app-content">
            <p>Welcome to Prompt Mixer Extension!</p>
            <p>This is a Chrome side panel extension for working with AI prompts.</p>
          </main>
        </div>
      </PromptProvider>
    </AuthProvider>
  );
}

export default App;

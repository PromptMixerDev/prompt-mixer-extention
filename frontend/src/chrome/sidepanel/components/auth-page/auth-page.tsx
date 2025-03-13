import React from 'react';
import { useAuth } from '@context/AuthContext';
import './auth-page.css';

/**
 * Authentication page component
 * Displays a sign in button for non-authenticated users
 */
const AuthPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  /**
   * Handle sign in with Google
   */
  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Welcome to Prompt Mixer</h2>
      <p>Please sign in to continue</p>
      <button
        onClick={handleSignIn}
        className="sign-in-button"
        disabled={isSigningIn}
      >
        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
};

export default AuthPage;

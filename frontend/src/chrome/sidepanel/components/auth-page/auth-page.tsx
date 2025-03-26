import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import AuthSlider from '../auth-slider/auth-slider';
import './auth-page.css';

/**
 * Authentication page component
 * Displays a slider with information and sign in button for non-authenticated users
 */
const AuthPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

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
      <AuthSlider onSignIn={handleSignIn} />
    </div>
  );
};

export default AuthPage;

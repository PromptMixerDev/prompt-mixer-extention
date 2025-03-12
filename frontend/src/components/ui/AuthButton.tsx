import React, { useState } from 'react';
import { useAuth } from '@context/AuthContext';

/**
 * Auth button component
 * 
 * Displays a sign in button if user is not authenticated,
 * or user info and sign out button if authenticated
 */
const AuthButton: React.FC = () => {
  const { currentUser, token, loading, signInWithGoogle, signOut } = useAuth();
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

  if (loading) {
    return <div className="auth-container loading">Loading...</div>;
  }

  return (
    <div className="auth-container">
      {currentUser ? (
        <div className="user-info">
          {currentUser.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="user-avatar"
            />
          )}
          <span className="user-name">{currentUser.displayName}</span>
          <button 
            onClick={signOut}
            className="sign-out-button"
            aria-label="Sign out"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignIn}
          className="sign-in-button"
          disabled={isSigningIn}
          aria-label="Sign in with Google"
        >
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </button>
      )}
    </div>
  );
};

export default AuthButton;

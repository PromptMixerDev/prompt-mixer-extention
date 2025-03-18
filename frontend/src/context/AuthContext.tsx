import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@services/auth';

/**
 * Auth context type definition
 */
interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

/**
 * Auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing auth context');
    
    // Check if there's a saved auth data in chrome.storage
    chrome.storage.local.get(['auth'], result => {
      console.log('AuthContext: Initial auth data from storage:', result);
      
      if (result.auth) {
        console.log('AuthContext: Setting initial user and token from storage');
        setCurrentUser(result.auth.user as User);
        setToken(result.auth.token as string);
      } else {
        console.log('AuthContext: No auth data found in storage');
      }
      
      setLoading(false);
    });

    // Listen for changes in chrome.storage
    const storageListener = (changes: { [key: string]: { oldValue?: any; newValue?: any } }) => {
      console.log('AuthContext: Storage changes detected:', changes);
      
      if (changes.auth) {
        console.log('AuthContext: Auth data changed in storage');
        console.log('AuthContext: Old value:', changes.auth.oldValue);
        console.log('AuthContext: New value:', changes.auth.newValue);
        
        setCurrentUser(changes.auth.newValue?.user || null);
        setToken(changes.auth.newValue?.token || null);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    console.log('AuthContext: Added storage change listener');

    return () => {
      console.log('AuthContext: Removing storage change listener');
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    console.log('AuthContext.signInWithGoogle: Starting Google sign in process');
    try {
      const user = await authService.signInWithGoogle();
      console.log('AuthContext.signInWithGoogle: Sign in successful, user:', user);
      return user;
    } catch (error) {
      console.error('AuthContext.signInWithGoogle: Error in signInWithGoogle', error);
      return null;
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    console.log('AuthContext.signOut: Starting sign out process');
    try {
      await authService.signOut();
      console.log('AuthContext.signOut: Sign out successful, clearing user and token');
      setCurrentUser(null);
      setToken(null);
    } catch (error) {
      console.error('AuthContext.signOut: Error in signOut', error);
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook for using auth context
 */
export function useAuth(): AuthContextType {
  console.log('useAuth: Getting auth context');
  const context = useContext(AuthContext);

  if (context === undefined) {
    console.error('useAuth: Auth context is undefined, make sure to use within AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }

  console.log('useAuth: Auth context:', {
    currentUser: context.currentUser,
    token: context.token ? `${context.token.substring(0, 10)}...` : null,
    loading: context.loading
  });
  
  return context;
}

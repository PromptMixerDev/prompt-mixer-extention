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
    // Check if there's a saved auth data in chrome.storage
    chrome.storage.local.get(['auth'], (result) => {
      if (result.auth) {
        setCurrentUser(result.auth.user as User);
        setToken(result.auth.token as string);
      }
      setLoading(false);
    });

    // Listen for changes in chrome.storage
    const storageListener = (changes: { [key: string]: { oldValue?: any; newValue?: any } }) => {
      if (changes.auth) {
        setCurrentUser(changes.auth.newValue?.user || null);
        setToken(changes.auth.newValue?.token || null);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      return await authService.signInWithGoogle();
    } catch (error) {
      console.error("Error in signInWithGoogle", error);
      return null;
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      await authService.signOut();
      setCurrentUser(null);
      setToken(null);
    } catch (error) {
      console.error("Error in signOut", error);
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook for using auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

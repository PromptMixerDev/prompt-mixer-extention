import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * SkeletonProvider component props interface
 */
interface SkeletonProviderProps {
  children: React.ReactNode;
}

/**
 * SkeletonProvider component
 * 
 * Provides global configuration for all skeleton components
 * using CSS variables from tokens.css
 * 
 * @example
 * // Wrap your app with SkeletonProvider
 * <SkeletonProvider>
 *   <App />
 * </SkeletonProvider>
 */
const SkeletonProvider: React.FC<SkeletonProviderProps> = ({ children }) => {
  return (
    <SkeletonTheme
      baseColor="var(--skeleton-base-color)"
      highlightColor="var(--skeleton-highlight-color)"
      borderRadius="var(--skeleton-border-radius)"
      duration={1.5}
    >
      {children}
    </SkeletonTheme>
  );
};

export default SkeletonProvider;

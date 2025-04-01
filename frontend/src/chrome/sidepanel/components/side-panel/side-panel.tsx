import React, { useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import AuthPage from '../auth-page/auth-page';
import Navigation from '../navigation/navigation';
import ContentArea from '../content-area/content-area';
import UsageLimits from '@components/ui/usage-limits/usage-limits';
import { useSubscription } from '@hooks/useSubscription';
import './side-panel.css';

/**
 * Main side panel component
 * Shows auth page for non-authenticated users
 * Shows main interface with navigation for authenticated users
 */
const SidePanel: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const { isPaidUser, promptsLeft, improvementsLeft, isLoading: subscriptionLoading } = useSubscription();
  
  // Логируем только при первом рендеринге
  useEffect(() => {
    console.log('SidePanel: Initial state', {
      currentUser: currentUser?.email,
      isPaidUser,
      promptsLeft,
      improvementsLeft,
      subscriptionLoading
    });
  }, []);
  
  // Handler for Go to Pro button click
  const handleGoToProClick = () => {
    const event = new CustomEvent('tabChange', { detail: { tab: 'upgrade' } });
    window.dispatchEvent(event);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If user is not authenticated, show auth page
  if (!currentUser) {
    return <AuthPage />;
  }

  // If user is authenticated, show main interface
  return (
    <div className="side-panel">
      <Navigation />
      {currentUser && !isPaidUser && (
        <UsageLimits 
          improvementsLeft={improvementsLeft} 
          promptsLeft={promptsLeft} 
          onGoToProClick={handleGoToProClick} 
        />
      )}
      <ContentArea />
    </div>
  );
};

export default SidePanel;

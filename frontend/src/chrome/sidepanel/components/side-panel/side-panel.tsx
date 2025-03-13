import React from 'react';
import { useAuth } from '@context/AuthContext';
import AuthPage from '../auth-page/auth-page';
import Navigation from '../navigation/navigation';
import ContentArea from '../content-area/content-area';
import './side-panel.css';

/**
 * Main side panel component
 * Shows auth page for non-authenticated users
 * Shows main interface with navigation for authenticated users
 */
const SidePanel: React.FC = () => {
  const { currentUser, loading } = useAuth();

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
      <ContentArea />
    </div>
  );
};

export default SidePanel;

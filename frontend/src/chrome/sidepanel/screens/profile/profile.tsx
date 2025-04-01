import React from 'react';
import './profile.css';
import SubscriptionStatus from './components/subscription-status';

/**
 * Profile page component
 */
const Profile: React.FC = () => {
  // Removed automatic refresh to prevent infinite requests
  // This can be re-enabled once the token issue is fixed
  
  return (
    <div className="profile-page">
      <div className="profile-page-upgrade-container">
        <SubscriptionStatus />
      </div>
    </div>
  );
};

export default Profile;

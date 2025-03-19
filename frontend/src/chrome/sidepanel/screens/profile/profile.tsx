import React from 'react';
import './profile.css';
import UpgradeCard from '@components/ui/upgrade-card/upgrade-card';

/**
 * Profile page component
 */
const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="profile-page-upgrade-container">
        <UpgradeCard>
          {/* Содержимое карточки для апгрейда */}
        </UpgradeCard>
      </div>
    </div>
  );
};

export default Profile;

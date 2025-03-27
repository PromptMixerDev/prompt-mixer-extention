import React from 'react';
import './upgrade.css';
import UpgradeCard from '@components/ui/upgrade-card/upgrade-card';

/**
 * Upgrade page component
 */
const Upgrade: React.FC = () => {
  return (
    <div className="upgrade-page">
      <div className="upgrade-page-upgrade-container">
        <UpgradeCard>
          {/* Содержимое карточки для апгрейда */}
        </UpgradeCard>
      </div>
    </div>
  );
};

export default Upgrade;

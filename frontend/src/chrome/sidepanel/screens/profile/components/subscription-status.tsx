import React from 'react';
import './subscription-status.css';
import UpgradeCard from '@components/ui/upgrade-card/upgrade-card';
import Button from '@components/ui/button/button';
import { useSubscription } from '@hooks/useSubscription';

/**
 * SubscriptionStatus component
 * Displays different content based on user's subscription status
 */
const SubscriptionStatus: React.FC = () => {
  const { 
    isPaidUser, 
    promptsLeft, 
    improvementsLeft, 
    maxFreePrompts, 
    maxFreeImprovements 
  } = useSubscription();
  
  // Handler for Manage Subscription button
  const handleManageSubscription = () => {
    // URL for Stripe Customer Portal will be provided later
    // For now, use a placeholder URL
    window.open('https://billing.stripe.com/p/login/test', '_blank');
  };
  
  return (
    <div className="subscription-status">
      {!isPaidUser ? (
        // Free user content
        <>
          <div className="profile-page-upgrade-status">
            <h2 className="profile-page-upgrade-status-title text-large text-medium">Free account</h2>
            <p className="profile-page-upgrade-status-subtitle text-default text-secondary">
              The free version allows you to save up to {maxFreePrompts} prompts and make {maxFreeImprovements} prompt improvements.
              You have {promptsLeft} prompts and {improvementsLeft} improvements left.
            </p>
          </div>
          <UpgradeCard>
            {/* Содержимое карточки для апгрейда */}
          </UpgradeCard>
        </>
      ) : (
        // Paid user content
        <>
          <div className="profile-page-upgrade-status">
            <h2 className="profile-page-upgrade-status-title text-large text-medium">Pro account</h2>
            <p className="profile-page-upgrade-status-subtitle text-default text-secondary">
              You have unlimited access to all features. Thank you for supporting us!
            </p>
          </div>
          <div className="subscription-manage-container">
            <Button 
              variant="primary" 
              size="medium"
              onClick={handleManageSubscription}
              className="subscription-manage-button"
            >
              Manage Subscription
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionStatus;

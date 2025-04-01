import React from 'react';
import './subscription-status.css';
import UpgradeCard from '@components/ui/upgrade-card/upgrade-card';
import Button from '@components/ui/button/button';
import { useAuth } from '@context/AuthContext';

/**
 * SubscriptionStatus component
 * Displays different content based on user's subscription status
 */
const SubscriptionStatus: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Check if user has a paid subscription based on payment_status field
  const isPaidUser = currentUser?.payment_status === 'paid';
  
  // Log user data for debugging
  console.log('SubscriptionStatus: currentUser', currentUser);
  console.log('SubscriptionStatus: payment_status', currentUser?.payment_status);
  console.log('SubscriptionStatus: isPaidUser', isPaidUser);
  
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
              The free version allows you to save up to 10 prompts and make 3 prompt improvements.
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

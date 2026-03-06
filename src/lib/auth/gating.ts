import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '../constants/tiers';

export interface UserPremiumStatus {
  isPaid: boolean;
  subscriptionTier: string | null | SubscriptionTier;
}

export function hasFeatureAccess(user: UserPremiumStatus | null, feature: string): boolean {
  if (!user || !user.isPaid) return false;

  const { subscriptionTier } = user;

  switch (feature) {
    case 'full_audio':
    case 'contact_info':
      return (
        subscriptionTier === SUBSCRIPTION_TIERS.ARTIST_BIZ || 
        subscriptionTier === SUBSCRIPTION_TIERS.VENUE_COMMAND || 
        subscriptionTier === SUBSCRIPTION_TIERS.MAXIMIZER
      );
    default:
      return false;
  }
}

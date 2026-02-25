export interface UserPremiumStatus {
  isPaid: boolean;
  subscriptionTier: string | null;
}

export function hasFeatureAccess(user: UserPremiumStatus | null, feature: string): boolean {
  if (!user || !user.isPaid) return false;

  const { subscriptionTier } = user;

  switch (feature) {
    case 'full_audio':
    case 'contact_info':
      return subscriptionTier === 'ARTIST_BIZ' || subscriptionTier === 'VENUE_COMMAND' || subscriptionTier === 'MAXIMIZER';
    default:
      return false;
  }
}

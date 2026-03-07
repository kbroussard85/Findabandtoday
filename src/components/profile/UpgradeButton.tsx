'use client';

import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS, TIER_PRICE_IDS } from '@/lib/constants/tiers';

interface UpgradeButtonProps {
  role: 'BAND' | 'VENUE';
}

export function UpgradeButton({ role }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  // Map roles to Price IDs from centralized constants
  const priceIds = {
    BAND: TIER_PRICE_IDS[SUBSCRIPTION_TIERS.ARTIST_BIZ],
    VENUE: TIER_PRICE_IDS[SUBSCRIPTION_TIERS.VENUE_PRO],
  };

  const handleUpgrade = async () => {
    const activePriceId = priceIds[role];

    if (!activePriceId || activePriceId.includes('placeholder')) {
      alert(`Stripe Billing is not yet connected for ${role}s. Please add your Stripe Price IDs to Vercel.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: activePriceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Upgrade Error:', error);
      alert(`Checkout Error: ${error.message || 'Check Stripe configuration.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full py-2 lg:py-3 px-4 rounded-full font-black uppercase italic tracking-tighter text-[10px] lg:text-xs transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
        role === 'BAND' 
          ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-white`}
    >
      <span className="animate-pulse">⚡</span>
      {loading ? 'WAITING...' : `UPGRADE ${role}`}
    </button>
  );
}

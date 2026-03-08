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

    console.log(`[DEBUG] Initiating upgrade for role: ${role}, Price ID: ${activePriceId}`);

    if (!activePriceId || activePriceId.includes('placeholder')) {
      const missingVar = role === 'BAND'
        ? 'NEXT_PUBLIC_STRIPE_BAND_BIZ_PRICE_ID'
        : 'NEXT_PUBLIC_STRIPE_VENUE_PRO_PRICE_ID';

      alert(`Stripe Billing is not yet connected for ${role}s. 
Missing environment variable: ${missingVar}
Current Value: ${activePriceId || 'undefined'}

Please ensure this is set in Vercel and that you have triggered a NEW DEPLOYMENT after saving.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: activePriceId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Check Stripe configuration.';
      console.error('Upgrade Error:', error);
      alert(`Checkout Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }

  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full py-2 lg:py-3 px-4 rounded-full font-black uppercase italic tracking-tighter text-[10px] lg:text-xs transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${role === 'BAND'
        ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-white`}
    >
      <span className="animate-pulse">⚡</span>
      {loading ? 'WAITING...' : `UPGRADE ${role}`}
    </button>
  );
}

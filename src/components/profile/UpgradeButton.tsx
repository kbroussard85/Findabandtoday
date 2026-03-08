'use client';

import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS, TIER_PRICE_IDS } from '@/lib/constants/tiers';
import { CheckCircle2, Rocket, Zap } from 'lucide-react';

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

  const features = role === 'BAND' ? [
    'Unlimited Gig Discovery',
    'AI-Powered Contract Prep',
    'Automated I-9 Compliance',
    'Priority Artist Ranking'
  ] : [
    'Unlimited Artist Search',
    'Automated Performance Contracts',
    'Day-of-Show Payout Automation',
    'Verified Tech Riders'
  ];

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
    <div className="relative group w-full md:w-auto">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-black uppercase italic tracking-tighter text-xs transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3 bg-gradient-to-r ${
          role === 'BAND' 
            ? 'from-purple-600 to-blue-500 shadow-purple-900/40' 
            : 'from-blue-600 to-cyan-500 shadow-blue-900/40'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-white border border-white/10`}
      >
        <Rocket className={`w-4 h-4 ${loading ? 'animate-ping' : 'animate-pulse'}`} />
        {loading ? 'SYNCING...' : `UPGRADE TO ${role === 'BAND' ? 'ARTIST BIZ' : 'VENUE PRO'}`}
      </button>

      {/* UX Popover on Hover (Desktop) */}
      <div className="hidden md:group-hover:block absolute top-full right-0 mt-4 w-72 bg-zinc-900 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-6 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <h3 className="font-black uppercase italic tracking-tight text-sm">Unlock Pro Features</h3>
          </div>
          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span className="text-zinc-400 text-[10px] font-bold leading-tight uppercase tracking-tight">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
              {role === 'BAND' ? '$9.99' : '$19.99'} / MONTH • NO COMMITMENT
            </p>
          </div>
        </div>
        
        {/* Pointer triangle */}
        <div className="absolute -top-2 right-12 w-4 h-4 bg-zinc-900 border-t border-l border-zinc-800 rotate-45" />
      </div>
    </div>
  );
}

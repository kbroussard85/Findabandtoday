'use client';

import React, { useState } from 'react';

interface UpgradeButtonProps {
  role: 'BAND' | 'VENUE';
}

export function UpgradeButton({ role }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  // Map roles to Price IDs (you should replace these with your actual Stripe Price IDs)
  const priceIds = {
    BAND: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BAND || 'price_band_placeholder',
    VENUE: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_VENUE || 'price_venue_placeholder',
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: priceIds[role] }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade Error:', error);
      alert('Error initiating checkout. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-black uppercase italic tracking-widest text-xs transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
        role === 'BAND' 
          ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Processing...' : `Upgrade to ${role === 'BAND' ? 'Artist Biz' : 'Venue Command'}`}
    </button>
  );
}

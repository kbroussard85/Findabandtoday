'use client';

import React from 'react';

interface ArtistSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

export const ArtistSubNav = ({ activeTab, setActiveTab, pendingCount = 0 }: ArtistSubNavProps) => {
  const tabs = [
    { label: 'Profile', id: 'profile' },
    { label: 'Pending', id: 'pending', badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Confirmed', id: 'confirmed' },
    { label: 'Payment Info', id: 'payment_info' },
  ];

  return (
    <nav className="flex space-x-8 border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`${
            activeTab === tab.id 
              ? 'border-purple-500 text-purple-400' 
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          } pb-4 px-1 border-b-2 font-black uppercase italic text-xs tracking-widest transition-all whitespace-nowrap flex items-center gap-2`}
        >
          {tab.label}
          {tab.badge && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full not-italic font-bold animate-pulse">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

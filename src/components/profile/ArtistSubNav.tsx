'use client';

import React from 'react';

interface ArtistSubNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ArtistSubNav = ({ activeTab, setActiveTab }: ArtistSubNavProps) => {
  const tabs = [
    { label: 'Submissions', id: 'submissions' },
    { label: 'Requests', id: 'requests' },
    { label: 'Pending', id: 'pending' },
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
          } pb-4 px-1 border-b-2 font-black uppercase italic text-xs tracking-widest transition-all whitespace-nowrap`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

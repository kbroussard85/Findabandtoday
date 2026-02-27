'use client';
import React from 'react';
import { ArtistCard } from './ArtistCard';
import { Artist } from '@/types';

interface DiscoveryGridProps {
  items: Artist[];
  isPremium: boolean;
}

export function DiscoveryGrid({ items, isPremium }: DiscoveryGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 border-2 border-dashed border-zinc-800 rounded-3xl space-y-4">
        <span className="text-4xl opacity-20">🎸</span>
        <div className="text-center">
          <h3 className="text-zinc-500 font-black uppercase italic tracking-tighter text-2xl">No talent detected</h3>
          <p className="text-zinc-600 font-medium">Try expanding your search radius to capture more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <ArtistCard key={item.id} artist={item} isPremium={isPremium} />
      ))}
    </div>
  );
}

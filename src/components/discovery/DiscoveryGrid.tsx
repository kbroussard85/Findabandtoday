'use client';
import React from 'react';
import { ArtistCard } from './ArtistCard';

interface DiscoveryGridProps {
  items: any[];
  isPremium: boolean;
}

export function DiscoveryGrid({ items, isPremium }: DiscoveryGridProps) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
        No results found in this area. Try expanding your search radius.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    }}>
      {items.map((item) => (
        <ArtistCard key={item.id} artist={item} isPremium={isPremium} />
      ))}
    </div>
  );
}

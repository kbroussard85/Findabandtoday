'use client';
import React from 'react';
import { ArtistCard } from './ArtistCard';
import { Artist } from '@/types';

interface DiscoveryGridProps {
  items: Artist[];
  isPremium: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function DiscoveryGrid({ 
  items, 
  isPremium, 
  onLoadMore, 
  hasMore, 
  isLoadingMore 
}: DiscoveryGridProps) {
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
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map((item, idx) => (
          <ArtistCard 
            key={item.id} 
            artist={item} 
            isPremium={isPremium} 
            showRating={!!item.average_rating || isPremium} // Show rating UI if data exists or user is premium
            index={idx}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-8 border-t border-zinc-900">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-12 py-4 rounded-2xl text-xs font-black uppercase italic tracking-widest border border-zinc-800 transition-all disabled:opacity-50 flex items-center gap-4 group"
          >
            {isLoadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                FETCHING MORE...
              </>
            ) : (
              <>
                LOAD MORE TALENT
                <span className="text-purple-500 group-hover:translate-y-1 transition-transform">↓</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

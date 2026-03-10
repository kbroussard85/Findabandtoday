'use client';

import React, { useState } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DiscoveryGrid } from '@/components/discovery/DiscoveryGrid';
import { MapPin, Navigation, Loader2, Music } from 'lucide-react';

export function HomeDiscovery() {
  const { lat, lng, loading: geoLoading, getLocation } = useGeolocation();
  const [radius] = useState<number>(50);
  
  const { data, loading, loadingMore, error, loadMore, hasMore } = useDiscovery({ 
    lat, 
    lng, 
    radius, 
    role: 'BAND',
    limit: 16 
  });

  if (!lat || !lng) {
    return (
      <section className="py-24 bg-black border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">
              Discover <span className="text-purple-500">Local Talent</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Enable location to see the best artists and bands performing in your area right now.
            </p>
          </div>

          <button 
            onClick={getLocation}
            disabled={geoLoading}
            className="bg-white text-black px-8 py-4 rounded-2xl text-lg font-black uppercase italic tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center gap-4 mx-auto"
          >
            {geoLoading ? <Loader2 className="animate-spin" /> : <Navigation />}
            {geoLoading ? 'Locating...' : 'Find Bands Near Me'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-black border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-8 space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">
              Local <span className="text-purple-500">Spotlight</span>
            </h2>
            <p className="text-zinc-400 flex items-center gap-2 font-bold uppercase italic text-sm">
              <MapPin size={16} className="text-purple-500" />
              Showing top talent within {radius} miles of your location
            </p>
          </div>
          
          <button 
            onClick={getLocation}
            className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-purple-400 transition-colors flex items-center gap-2"
          >
            <Navigation size={12} /> Refresh Location
          </button>
        </div>

        <div className="min-h-[400px]">
          {loading && !loadingMore ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Syncing local scene...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center bg-red-900/10 border border-red-900/20 rounded-3xl">
              <p className="text-red-500 font-bold uppercase tracking-tighter italic text-xl">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center space-y-4 border border-zinc-800 rounded-3xl">
              <Music className="mx-auto text-zinc-800" size={60} />
              <h3 className="text-2xl font-black uppercase italic text-zinc-600">No artists found nearby</h3>
              <p className="text-zinc-500">We&apos;re expanding fast! Check back soon for more verified talent.</p>
            </div>
          ) : (
            <DiscoveryGrid 
              items={data} 
              isPremium={false} 
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={loadingMore}
            />
          )}
        </div>
      </div>
    </section>
  );
}

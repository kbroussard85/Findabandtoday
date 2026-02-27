'use client';
import React, { useState } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DiscoveryGrid } from '@/components/discovery/DiscoveryGrid';

export default function DirectoryPage() {
  // Nashville Coordinates
  const lat = 36.1627; 
  const lng = -86.7816;
  const [radius, setRadius] = useState<number>(50);
  const [role, setRole] = useState<'BAND' | 'VENUE'>('BAND');

  const { data, loading, error } = useDiscovery({ lat, lng, radius, role });

  // For demo purposes, assuming user is not premium to show the blurred UI
  const isPremium = false; 

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">
            Talent <span className="text-purple-500">Discovery</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl font-medium">
            Browse verified artists and venues within your radius. Use the filters below to refine your search.
          </p>
        </header>
        
        {/* Filters Bar */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 lg:p-8 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Search Radius</span>
              <span className="text-sm font-mono text-purple-400 font-bold">{radius} MILES</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="500" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))} 
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Category</span>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as 'BAND' | 'VENUE')}
              className="bg-zinc-800 border-none rounded-xl px-6 py-3 font-bold uppercase italic text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
            >
              <option value="BAND">Looking for Bands</option>
              <option value="VENUE">Looking for Venues</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className="min-h-[400px] relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-3xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Syncing Results...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-12 text-center bg-red-900/10 border border-red-900/20 rounded-3xl">
              <p className="text-red-500 font-bold uppercase tracking-tighter italic text-xl">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <DiscoveryGrid items={data} isPremium={isPremium} />
          )}
        </div>
      </div>
    </div>
  );
}

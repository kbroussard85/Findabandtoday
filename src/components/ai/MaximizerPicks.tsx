'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MaximizerPicksProps {
  lat: number;
  lng: number;
  radius: number;
}

interface PickItem {
  id: string;
  name: string;
  bio?: string | null;
}

export function MaximizerPicks({ lat, lng, radius }: MaximizerPicksProps) {
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPicks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/ai/maximizer?lat=${lat}&lng=${lng}&radius=${radius}`);
        const data = await res.json();
        if (data.data) setPicks(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPicks();
  }, [lat, lng, radius]);

  if (loading) return (
    <div className="animate-pulse bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-12">
      <div className="h-4 bg-zinc-800 w-1/4 mb-4 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-24 bg-zinc-800 rounded-2xl"></div>
        <div className="h-24 bg-zinc-800 rounded-2xl"></div>
        <div className="h-24 bg-zinc-800 rounded-2xl"></div>
      </div>
    </div>
  );

  if (picks.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border-2 border-purple-500/20 p-8 rounded-3xl mb-12 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
        <Sparkles size={120} className="text-purple-500" />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-purple-400" size={20} />
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 italic">The Maximizer: AI Top Picks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {picks.map((pick) => (
          <div key={pick.id} className="bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer">
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-2">{pick.name}</h3>
            <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{pick.bio || 'No bio available.'}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest italic">Match Score: 98%</span>
              <ArrowRight size={14} className="text-zinc-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

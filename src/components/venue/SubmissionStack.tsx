'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleSwipe } from '@/app/actions/venue-swipe';
import { Music, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface BandSubmission {
  id: string;
  band_name: string;
  logoUrl?: string;
  imageUrl?: string;
  stats: {
    followers: string;
    avg_draw: string;
    payout: string;
  };
  isMatch?: boolean; // New: indicate if it's a Maximizer match vs real submission
}

export const SubmissionStack = ({ initialSubmissions }: { initialSubmissions: BandSubmission[] }) => {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const onSwipe = async (id: string, direction: 'right' | 'left') => {
    const swipedItem = submissions.find(s => s.id === id);
    if (!swipedItem) return;

    // Move to history for loop potential
    setHistory(prev => [...prev, swipedItem]);
    
    // Optimistic UI update
    setSubmissions(prev => prev.filter(sub => sub.id !== id));
    
    // Trigger Server Action
    await handleSwipe(id, direction);
  };

  const handleReset = () => {
    setSubmissions(initialSubmissions);
    setHistory([]);
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-zinc-800 rounded-[2.5rem] text-zinc-500 bg-zinc-900/20 backdrop-blur-sm">
        <Music className="mb-4 text-zinc-700" size={48} />
        <span className="italic font-black uppercase tracking-[0.2em] text-[10px] mb-6 text-zinc-600 text-center px-8">
          Queue Exhausted. Reach the Singularity.
        </span>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Restart Loop
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[500px]">
      <AnimatePresence>
        {submissions.map((sub, i) => {
          // Show top 3 cards for performance and stack look
          if (i > 2) return null;
          
          return (
            <motion.div
              key={sub.id}
              drag="x"
              dragConstraints={{ left: -150, right: 150 }}
              onDragEnd={async (e, info) => {
                if (info.offset.x > 100) await onSwipe(sub.id, 'right');
                else if (info.offset.x < -100) await onSwipe(sub.id, 'left');
              }}
              className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl shadow-black/50 p-2 cursor-grab active:cursor-grabbing overflow-hidden"
              style={{ 
                zIndex: submissions.length - i,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1 - i * 0.05, 
                opacity: 1, 
                y: i * 12,
                rotate: i * 0.5
              }}
              exit={{ 
                x: 500, 
                opacity: 0, 
                scale: 0.5, 
                rotate: 20,
                transition: { duration: 0.3 } 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="relative h-full w-full bg-zinc-950 rounded-[2rem] overflow-hidden flex flex-col">
                {/* Band Main Image */}
                <div className="relative h-3/5 w-full bg-zinc-900">
                  {sub.imageUrl ? (
                    <Image 
                      src={sub.imageUrl} 
                      alt={`${sub.band_name} promotional`}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-black">
                      <Music className="text-white/5" size={80} />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

                  {/* Floating Logo */}
                  <div className="absolute -bottom-6 left-8 w-20 h-20 rounded-3xl bg-zinc-900 p-1 shadow-2xl border border-zinc-800">
                    <div className="w-full h-full rounded-2xl bg-zinc-950 overflow-hidden flex items-center justify-center relative">
                      {sub.logoUrl ? (
                        <Image 
                          src={sub.logoUrl} 
                          alt={`${sub.band_name} logo`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Music size={24} className="text-zinc-800" />
                      )}
                    </div>
                  </div>

                  {sub.isMatch && (
                    <div className="absolute top-6 right-6 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
                      Maximizer Match
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 pt-12 flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{sub.band_name}</h2>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">Verified Artist</span>
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Top Tier</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 py-6 border-y border-zinc-900 my-4">
                    <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 leading-none tracking-tighter">Reach</p>
                      <p className="text-xs font-black text-indigo-400 italic">{sub.stats.followers}</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 leading-none tracking-tighter">Draw</p>
                      <p className="text-xs font-black text-indigo-400 italic">{sub.stats.avg_draw}</p>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1 leading-none tracking-tighter">Payout</p>
                      <p className="text-xs font-black text-green-400 italic">{sub.stats.payout}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={() => onSwipe(sub.id, 'left')} 
                      className="text-zinc-600 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">←</span> Pass
                    </button>
                    <button 
                      onClick={() => onSwipe(sub.id, 'right')} 
                      className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                      Book Now <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
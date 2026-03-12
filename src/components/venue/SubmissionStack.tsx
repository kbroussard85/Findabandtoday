'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleSwipe } from '@/app/actions/venue-swipe';
import { Music } from 'lucide-react';

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
}

export const SubmissionStack = ({ initialSubmissions }: { initialSubmissions: BandSubmission[] }) => {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const onSwipe = async (id: string, direction: 'right' | 'left') => {
    // Optimistic UI update
    setSubmissions(prev => prev.filter(sub => sub.id !== id));
    // Trigger Server Action
    await handleSwipe(id, direction);
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 bg-gray-50/50">
        <Music className="mb-3 text-gray-300" size={40} />
        <span className="italic font-bold uppercase tracking-widest text-[10px]">No pending submissions</span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[500px]">
      <AnimatePresence>
        {submissions.map((sub, i) => {
          if (i > 2) return null;
          
          return (
            <motion.div
              key={sub.id}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={async (e, info) => {
                if (info.offset.x > 100) await onSwipe(sub.id, 'right');
                else if (info.offset.x < -100) await onSwipe(sub.id, 'left');
              }}
              className="absolute inset-0 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-2xl p-2 cursor-grab active:cursor-grabbing overflow-hidden"
              style={{ 
                zIndex: submissions.length - i,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1 - i * 0.05, 
                opacity: 1, 
                y: i * 15,
                rotate: i * 1
              }}
              exit={{ 
                x: 500, 
                opacity: 0, 
                scale: 0.5, 
                rotate: 20,
                transition: { duration: 0.3 } 
              }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="relative h-full w-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
                {/* Band Main Image */}
                <div className="relative h-3/5 w-full bg-zinc-100">
                  {sub.imageUrl ? (
                    <img src={sub.imageUrl} alt={sub.band_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Music className="text-white/20" size={64} />
                    </div>
                  )}
                  
                  {/* Floating Logo */}
                  <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                      {sub.logoUrl ? <img src={sub.logoUrl} className="w-full h-full object-cover" /> : <Music size={20} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 pt-10 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">{sub.band_name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest border border-indigo-100">Verified Artist</span>
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest border border-green-100">Top Match</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-4">
                    <div className="text-center p-2 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[8px] font-black uppercase text-gray-400 mb-1 leading-none">Reach</p>
                      <p className="text-xs font-black text-indigo-600">{sub.stats.followers}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[8px] font-black uppercase text-gray-400 mb-1 leading-none">Draw</p>
                      <p className="text-xs font-black text-indigo-600">{sub.stats.avg_draw}</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[8px] font-black uppercase text-gray-400 mb-1 leading-none">Payout</p>
                      <p className="text-xs font-black text-indigo-600">{sub.stats.payout}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center px-2 pt-2 border-t border-gray-50">
                    <button onClick={() => onSwipe(sub.id, 'left')} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">← Skip</button>
                    <button onClick={() => onSwipe(sub.id, 'right')} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:scale-110 transition-transform">Book Now →</button>
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
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleSwipe } from '@/app/actions/venue-swipe';
import { Music } from 'lucide-react';

interface BandSubmission {
  id: string;
  band_name: string;
  logoUrl?: string;
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
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
        <Music className="mb-2 text-gray-300" size={32} />
        <span className="italic font-medium">No pending submissions for this date.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[450px]">
      <AnimatePresence>
        {submissions.map((sub, i) => {
          // Only render the top 3 to save DOM nodes and keep the stack clean
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
              className="absolute inset-0 bg-white border-2 border-gray-100 rounded-3xl shadow-xl p-6 cursor-grab active:cursor-grabbing"
              style={{ 
                zIndex: submissions.length - i,
                transform: `translateY(${i * 12}px) scale(${1 - i * 0.05})`
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1 - i * 0.05, opacity: 1, y: i * 12 }}
              exit={{ x: 300, opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex flex-col h-full justify-between text-black">
                <div>
                  <div className="w-16 h-16 bg-indigo-100 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                    {sub.logoUrl ? <img src={sub.logoUrl} className="w-full h-full object-cover" /> : <Music className="text-indigo-400" />}
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">{sub.band_name}</h2>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Social Reach</span>
                    <span className="text-sm font-bold">{sub.stats.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Avg Draw</span>
                    <span className="text-sm font-bold">{sub.stats.avg_draw}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Est. Payout</span>
                    <span className="text-sm font-bold">{sub.stats.payout}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-red-500 font-bold text-sm uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform" onClick={() => onSwipe(sub.id, 'left')}>← Pass</span>
                  <span className="text-green-500 font-bold text-sm uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform" onClick={() => onSwipe(sub.id, 'right')}>Confirm →</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
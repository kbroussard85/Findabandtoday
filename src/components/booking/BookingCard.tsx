'use client';

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Artist } from '@/types';

interface BookingCardProps {
  artist: Artist;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function BookingCard({ artist, onSwipe }: BookingCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bgColor = useTransform(
    x,
    [-100, 0, 100],
    ['#ef4444', '#1a1a1a', '#22c55e']
  );

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, backgroundColor: bgColor }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-[400px] aspect-[3/4] rounded-3xl border border-zinc-800 p-8 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing shadow-2xl"
    >
      <div className="w-full text-center space-y-4">
        <span className="text-6xl">🎸</span>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
          {artist.name}
        </h2>
        <p className="text-zinc-400 font-medium line-clamp-4 leading-relaxed">
          {artist.bio || "No bio available."}
        </p>
      </div>

      <div className="w-full flex justify-between items-center pt-8 border-t border-white/10">
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Swipe Left</span>
          <span className="text-xs font-bold text-red-500 uppercase">PASS</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Swipe Right</span>
          <span className="text-xs font-bold text-green-500 uppercase">BOOK</span>
        </div>
      </div>
    </motion.div>
  );
}

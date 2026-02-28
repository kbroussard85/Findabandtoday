'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookingCard } from './BookingCard';
import { Artist } from '@/types';

interface SwipeToBookProps {
  artists: Artist[];
}

export function SwipeToBook({ artists }: SwipeToBookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on ${artists[currentIndex]?.name}`);
    
    if (direction === 'right') {
      // Trigger Offer Modal logic here in the future
      alert(`Initiating offer for ${artists[currentIndex]?.name}`);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const currentArtist = artists[currentIndex];

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {currentArtist ? (
          <BookingCard
            key={currentArtist.id}
            artist={currentArtist}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black uppercase italic text-zinc-500">No More Talent</h3>
            <p className="text-zinc-600">You've reached the end of the list for now.</p>
            <button 
              onClick={() => setCurrentIndex(0)}
              className="bg-purple-600 px-8 py-3 rounded-full font-bold uppercase text-xs"
            >
              Reload Deck
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

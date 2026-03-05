'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookingCard } from './BookingCard';
import { Artist } from '@/types';
import AgreementSandbox from './AgreementSandbox';
import { useProfile } from '@/hooks/useProfile';
import { X } from 'lucide-react';

interface SwipeToBookProps {
  artists: Artist[];
}

export function SwipeToBook({ artists }: SwipeToBookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { dbUser } = useProfile();

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setSelectedArtist(artists[currentIndex]);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBookingConfirmed = () => {
    setSelectedArtist(null);
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
            <p className="text-zinc-600">You&apos;ve reached the end of the list for now.</p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="bg-purple-600 px-8 py-3 rounded-full font-bold uppercase text-xs"
            >
              Reload Deck
            </button>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-7xl">
            <button
              onClick={() => setSelectedArtist(null)}
              className="absolute -top-12 right-0 text-white hover:text-purple-500 transition-colors flex items-center gap-2 font-black uppercase italic"
            >
              <X size={24} /> Close
            </button>
            <div className="bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <AgreementSandbox
                gigId={`temp-${selectedArtist.id}`}
                bandData={{
                  name: selectedArtist.name,
                  backlineInfo: selectedArtist.backlineInfo || undefined
                }}
                venueData={{
                  name: dbUser?.venueProfile?.name || "The Stage",
                  backlineInfo: dbUser?.venueProfile?.bio || undefined
                }}
                initialOffer={{
                  amount: selectedArtist.negotiationPrefs?.minRate || 350,
                  payoutType: 'CASH_DOS'
                }}
                onConfirm={handleBookingConfirmed}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

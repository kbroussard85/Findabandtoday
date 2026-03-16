'use client';

import React, { useState } from 'react';
import { PublicCalendarModal } from '../discovery/PublicCalendarModal';
import { GigOnboardingModal } from '../booking/GigOnboardingModal';

interface ProfileBookingBarProps {
  targetProfileId: string;
  targetProfileName: string;
  targetRole: 'BAND' | 'VENUE';
  variant?: 'floating' | 'full';
}

export function ProfileBookingBar({ targetProfileId, targetProfileName, targetRole, variant = 'floating' }: ProfileBookingBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  if (variant === 'full') {
    return (
      <>
        <button 
          onClick={() => setIsCalendarOpen(true)}
          className={`w-full py-4 rounded-xl font-black uppercase italic text-sm transition-all transform hover:scale-105 active:scale-95 shadow-xl ${targetRole === 'BAND' ? 'bg-purple-600 shadow-purple-900/20' : 'bg-blue-600 shadow-blue-900/20'}`}
        >
          Check Full Calendar
        </button>

        <PublicCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          targetProfileId={targetProfileId}
          targetProfileName={targetProfileName}
          targetRole={targetRole}
        />
      </>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOfferOpen(true)}
        className={`px-8 py-4 rounded-full font-black uppercase italic tracking-widest text-xs transition-all ${targetRole === 'BAND' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {targetRole === 'BAND' ? 'Book Now' : 'Request Booking'}
      </button>

      {/* If "Book Now" is clicked directly without selecting a date, we trigger GigOnboarding with "today" as fallback. The user can technically specify the date in the notes if needed, though they shouldn't formally offer without checking the calendar first. */}
      {isOfferOpen && (
        <GigOnboardingModal
          isOpen={isOfferOpen}
          onClose={() => setIsOfferOpen(false)}
          targetProfileId={targetProfileId}
          targetProfileName={targetProfileName}
          targetRole={targetRole}
          selectedDate={new Date()} // Fallback open offer date
          onOfferSent={() => setIsOfferOpen(false)}
        />
      )}
    </>
  );
}

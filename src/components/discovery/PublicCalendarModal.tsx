'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { X } from 'lucide-react';
import { logger } from '@/lib/logger';
import { GigOnboardingModal } from '@/components/booking/GigOnboardingModal';
import { useProfile } from '@/hooks/useProfile';

interface PublicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfileId: string;
  targetProfileName: string;
  targetRole: 'BAND' | 'VENUE';
}

interface DateStatus {
  eventDate: string;
  status: 'AVAILABLE' | 'BOOKED' | 'PAST' | 'CONFIRMED';
}

export function PublicCalendarModal({ isOpen, onClose, targetProfileId, targetProfileName, targetRole }: PublicCalendarModalProps) {
  const { dbUser } = useProfile();
  const [dates, setDates] = useState<DateStatus[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gig Onboarding State
  const [selectedDateForOffer, setSelectedDateForOffer] = useState<Date | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  useEffect(() => {
    if (!isOpen || !targetProfileId) return;

    async function fetchAvailabilities() {
      try {
        setLoading(true);
        // We will hit a new open endpoint or the existing profile endpoint depending on structure
        // Since we need just availability, let's fetch the public profile data which includes it
        const res = await fetch(`/api/profile/${targetProfileId}`);
        const data = await res.json();
        
        if (data && data.availabilities) {
          setDates(data.availabilities);
        } else {
          setDates([]); // No specific dates listed
        }
      } catch (err) {
        logger.error({ err }, 'Error fetching public dates');
      } finally {
        setLoading(false);
      }
    }

    fetchAvailabilities();
  }, [isOpen, targetProfileId]);

  // Derived modifier arrays
  const availableDates = dates.filter(d => d.status === 'AVAILABLE').map(d => new Date(d.eventDate));
  const bookedDates = dates.filter(d => ['BOOKED', 'CONFIRMED'].includes(d.status)).map(d => new Date(d.eventDate));

  const handleDayClick = (day: Date) => {
    // Only logged in PRO users can send offers
    if (!dbUser || !dbUser.isPaid) {
      alert("You need a Premium/Pro account to send direct booking offers from the calendar.");
      return;
    }

    // Only allow clicking future dates
    if (day < new Date(new Date().setHours(0,0,0,0))) {
      return;
    }

    // Prevent booking already BOOKED dates
    const dateStr = day.toISOString().split('T')[0];
    const isBooked = dates.some(d => d.eventDate.startsWith(dateStr) && ['BOOKED', 'CONFIRMED'].includes(d.status));
    
    if (isBooked) {
      alert("This date is already officially booked.");
      return;
    }

    // Launch Onboarding Model for the selected date
    setSelectedDateForOffer(day);
    setShowOfferModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showOfferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div className="pr-12">
                  <div className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 border ${targetRole === 'BAND' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                    Public Calendar
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none">
                    {targetProfileName}
                  </h2>
                  <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} /> Tap an open date to send offer
                  </p>
                </div>

                <div className="bg-zinc-900/50 rounded-3xl p-6 flex flex-col items-center border border-zinc-800/50 relative min-h-[350px]">
                  {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-500">
                      <Loader2 size={32} className="animate-spin text-purple-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Calendar...</span>
                    </div>
                  ) : (
                    <DayPicker 
                      mode="single"
                      onDayClick={handleDayClick}
                      modifiers={{
                        available: availableDates,
                        booked: bookedDates,
                      }}
                      modifiersClassNames={{
                        available: 'bg-green-500/10 text-green-400 font-black border border-green-500/30 rounded-full',
                        booked: 'bg-red-500/10 text-red-500/50 font-black border border-red-500/20 rounded-full cursor-not-allowed line-through',
                      }}
                      disabled={[{ before: new Date() }]}
                      className="text-zinc-400 public-calendar"
                      styles={{
                        day: { transition: 'all 0.2s', margin: '2px' },
                        head_cell: { color: '#52525b', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' },
                        caption: { color: 'white', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', marginBottom: '1rem' }
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest border-t border-zinc-800 pt-6">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 rounded-full bg-green-500" /> Available</span>
                    <span className="flex items-center gap-2 text-red-500/50"><div className="w-2 h-2 rounded-full bg-red-500/50" /> Booked</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .public-calendar .rdp-day:not(.rdp-day_disabled):hover {
          background-color: #a855f7 !important;
          color: white !important;
          transform: scale(1.1);
          z-index: 50;
          border-radius: 9999px;
        }
      `}</style>

      {/* Gig Onboarding Sub-Modal */}
      {selectedDateForOffer && (
        <GigOnboardingModal 
          isOpen={showOfferModal}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedDateForOffer(null);
          }}
          targetProfileId={targetProfileId}
          targetProfileName={targetProfileName}
          targetRole={targetRole}
          selectedDate={selectedDateForOffer}
          onOfferSent={() => {
            // Success handler
            setShowOfferModal(false);
            onClose(); // Close both modals
          }}
        />
      )}
    </>
  );
}

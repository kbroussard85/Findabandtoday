'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Music, CreditCard, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useProfile } from '@/hooks/useProfile';

interface GigOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfileId: string;
  targetProfileName: string;
  targetRole: 'BAND' | 'VENUE';
  selectedDate: Date;
  onOfferSent: () => void;
}

export function GigOnboardingModal({ 
  isOpen, 
  onClose, 
  targetProfileId, 
  targetProfileName, 
  targetRole, 
  selectedDate, 
  onOfferSent 
}: GigOnboardingModalProps) {
  const { dbUser } = useProfile();
  const [loadIn, setLoadIn] = useState('16:00');
  const [showtime, setShowtime] = useState('20:00');
  const [genre, setGenre] = useState('ROCK');
  const [payType, setPayType] = useState('GUARANTEE');
  const [guaranteeAmount, setGuaranteeAmount] = useState('500');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!dbUser) return;
    setIsSubmitting(true);

    try {
      // Determine the direction of the offer
      const venueId = targetRole === 'VENUE' ? targetProfileId : dbUser.venueProfile?.id;
      const bandId = targetRole === 'BAND' ? targetProfileId : dbUser.bandProfile?.id;

      if (!venueId || !bandId) {
        alert("Your profile configuration seems incomplete. Ensure you have the correct persona selected.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title: `Offer for ${targetProfileName} on ${selectedDate.toLocaleDateString()}`,
        description: description || `Automated Request. Load In: ${loadIn}, Showtime: ${showtime}, Genre/Vibe: ${genre}. Setup: ${payType}.`,
        date: selectedDate.toISOString(),
        venueId,
        bandId,
        totalAmount: Number(guaranteeAmount) || 0,
      };

      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to send offer');
      }

      alert(`Success! Offer sent to ${targetProfileName} for ${selectedDate.toLocaleDateString()}`);
      onOfferSent();
    } catch (err) {
      logger.error({ err }, 'Error sending Gig Request');
      alert("Failed to send booking offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all z-10 hover:bg-zinc-800"
            >
              <X size={24} />
            </button>

            <header className="mb-8 pr-16 space-y-4">
              <div className="bg-purple-600/10 text-purple-400 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                Official Booking Offer
              </div>
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                  {targetProfileName}
                </h2>
                <p className="text-zinc-400 text-sm font-bold mt-2 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-purple-500">{selectedDate.toLocaleDateString('default', { weekday: 'long' })}</span>
                  {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </header>

            <div className="space-y-8 flex-1">
              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Clock size={14} className="text-zinc-400" /> Start Load-In
                  </label>
                  <input 
                    type="time" 
                    value={loadIn} 
                    onChange={(e) => setLoadIn(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-bold uppercase transition-all outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Clock size={14} className="text-zinc-400" /> Showtime
                  </label>
                  <input 
                    type="time" 
                    value={showtime} 
                    onChange={(e) => setShowtime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-bold uppercase transition-all outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700" 
                  />
                </div>
              </div>

              {/* Vibe & Style */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Music size={14} className="text-zinc-400" /> Required Vibe / Genre
                </label>
                <div className="relative">
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-black uppercase italic tracking-widest transition-all outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700 appearance-none cursor-pointer"
                  >
                    <option value="ROCK">ROCK / INDIE</option>
                    <option value="JAZZ">JAZZ / BLUES</option>
                    <option value="ELECTRONIC">EDM / DJ</option>
                    <option value="COUNTRY">COUNTRY / FOLK</option>
                    <option value="METAL">METAL / PUNK</option>
                    <option value="OPEN_FORMAT">OPEN FORMAT</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-zinc-500 transform rotate-45" />
                </div>
              </div>

              {/* Payout Model block */}
              <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <CreditCard size={14} className="text-zinc-400" /> Deal Structure
                  </label>
                  <div className="relative">
                    <select 
                      value={payType}
                      onChange={(e) => setPayType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-black uppercase italic tracking-widest transition-all outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700 appearance-none cursor-pointer"
                    >
                      <option value="GUARANTEE">FLAT GUARANTEE ($)</option>
                      <option value="DOOR_SPLIT">DOOR SPLIT (%)</option>
                      <option value="NEGOTIABLE">OPEN FOR NEGOTIATION</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r-2 border-b-2 border-zinc-500 transform rotate-45" />
                  </div>
                </div>

                {payType === 'GUARANTEE' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Guarantee Amount</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                      <input 
                        type="number" 
                        value={guaranteeAmount} 
                        onChange={(e) => setGuaranteeAmount(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white font-mono font-bold text-lg outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700 transition-all" 
                        placeholder="0.00"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-3 pt-6 border-t border-zinc-800/50">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Personal Note / Direct Offer Specs (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Can you open for the headliner? We can provide drum breakables. 30 min set."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white text-sm font-medium outline-none focus:border-purple-500/50 focus:bg-black hover:border-zinc-700 transition-all min-h-[120px] resize-none"
                />
              </div>

              <div className="pt-8 mt-auto sticky bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pb-4">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Send Official Offer'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

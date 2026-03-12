'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Music, CreditCard } from 'lucide-react';

const MONTH_IMAGES = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000', // Jan: Mic
  'https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=1000', // Feb: Concert
  'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000', // Mar: Guitarist
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1000', // Apr: Singer
  'https://images.unsplash.com/photo-1459749411177-042180ceea73?q=80&w=1000', // May: Crowd
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000', // Jun: DJ
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000', // Jul: Outdoor
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=1000', // Aug: Jazz
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1000', // Sep: Indie
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000', // Oct: Piano
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000', // Nov: Bass
  'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?q=80&w=1000', // Dec: Stage
];

export function InventoryCalendar() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]); // Mock booked
  const [showModal, setShowModal] = useState(false);
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Modal Fields
  const [loadIn, setLoadIn] = useState('16:00');
  const [showtime, setShowtime] = useState('20:00');
  const [genre, setGenre] = useState('ROCK');
  const [payType, setPayType] = useState('GUARANTEE');
  const [guaranteeAmount, setGuaranteeAmount] = useState('500');

  const handleDayClick = (day: Date) => {
    setActiveDate(day);
    setShowModal(true);
  };

  const handleSaveDate = () => {
    if (activeDate) {
      const dateExists = selectedDates.some(d => d.getTime() === activeDate.getTime());
      if (!dateExists) {
        setSelectedDates([...selectedDates, activeDate]);
      }
    }
    setShowModal(false);
  };

  const footer = (
    <div className="mt-4 flex gap-4 text-[10px] font-black uppercase italic tracking-widest">
      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Open</span>
      <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Booked</span>
    </div>
  );

  return (
    <div className="relative group">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:scale-[1.01]">
        {/* Month Background Image */}
        <div className="h-32 w-full relative">
          <img 
            src={MONTH_IMAGES[currentMonth]} 
            alt="Venue Vibe" 
            className="w-full h-full object-cover opacity-40 transition-opacity group-hover:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
          <div className="absolute bottom-4 left-8">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Live Schedule</h3>
          </div>
        </div>

        <div className="p-8 pt-4 flex flex-col items-center">
          <DayPicker 
            mode="multiple"
            selected={selectedDates}
            onDayClick={handleDayClick}
            onMonthChange={(month) => setCurrentMonth(month.getMonth())}
            modifiers={{
              open: selectedDates,
              booked: bookedDates,
            }}
            modifiersClassNames={{
              open: 'bg-green-500/20 text-green-400 font-bold border border-green-500/50 rounded-lg',
              booked: 'bg-red-500/20 text-red-400 font-bold border border-red-500/50 rounded-lg'
            }}
            className="text-zinc-400 custom-calendar"
            styles={{
              day: { transition: 'all 0.2s', margin: '2px' },
              head_cell: { color: '#52525b', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' },
              caption: { color: 'white', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }
            }}
          />
          {footer}
        </div>
      </div>

      <style jsx global>{`
        .custom-calendar .rdp-day:hover {
          background-color: #3f3f46 !important;
          transform: scale(1.2);
          z-index: 50;
          border-radius: 8px;
        }
        .custom-calendar .rdp-day_selected {
          background-color: #4f46e5 !important;
          color: white !important;
        }
      `}</style>

      {/* Date Selection Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/10"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <header className="mb-8">
                <div className="bg-indigo-600/10 text-indigo-400 w-fit px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/20">
                  New Open Date
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  {activeDate?.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
              </header>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Clock size={12} /> Load-In
                    </label>
                    <input 
                      type="time" 
                      value={loadIn} 
                      onChange={(e) => setLoadIn(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Clock size={12} /> Showtime
                    </label>
                    <input 
                      type="time" 
                      value={showtime} 
                      onChange={(e) => setShowtime(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Music size={12} /> Preferred Genre
                  </label>
                  <select 
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50 appearance-none"
                  >
                    <option value="ROCK">ROCK / INDIE</option>
                    <option value="JAZZ">JAZZ / BLUES</option>
                    <option value="ELECTRONIC">EDM / DJ</option>
                    <option value="COUNTRY">COUNTRY / FOLK</option>
                    <option value="METAL">METAL / PUNK</option>
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <CreditCard size={12} /> Payout Model
                    </label>
                    <select 
                      value={payType}
                      onChange={(e) => setPayType(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50 appearance-none"
                    >
                      <option value="GUARANTEE">FLAT GUARANTEE</option>
                      <option value="DOOR_SPLIT">DOOR SPLIT</option>
                      <option value="NEGOTIABLE">NEGOTIABLE</option>
                    </select>
                  </div>

                  {payType === 'GUARANTEE' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Guarantee Amount ($)</label>
                      <input 
                        type="number" 
                        value={guaranteeAmount} 
                        onChange={(e) => setGuaranteeAmount(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-indigo-500/50" 
                      />
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handleSaveDate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter text-lg mt-4 transition-all shadow-xl shadow-indigo-900/40 active:scale-95"
                >
                  Confirm Open Date 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


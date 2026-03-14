/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';

interface Gig {
  id: string;
  title: string;
  date: string;
  status: string;
  venue: { 
    id: string; 
    name: string;
    media?: any;
  };
}

interface ConfirmedCalendarProps {
  gigs: Gig[];
}

export function ConfirmedCalendar({ gigs }: ConfirmedCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  const confirmedGigs = gigs.filter(g => 
    ['ACCEPTED', 'BOOKED', 'CONFIRMED', 'ESCROW_HOLD'].includes(g.status.toUpperCase())
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <CalendarIcon className="text-purple-500" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gig Calendar</h2>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Confirmed Bookings Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black uppercase italic tracking-widest min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="relative overflow-x-auto no-scrollbar rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        <div className="min-w-[800px]">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayGigs = confirmedGigs.filter(g => isSameDay(new Date(g.date), day));
              const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
              
              return (
                <div 
                  key={idx} 
                  className={`min-h-[140px] border-r border-b border-zinc-900 relative group transition-all duration-500 hover:bg-zinc-900/30 ${!isCurrentMonth ? 'opacity-20' : ''}`}
                >
                  <span className={`absolute top-3 right-4 text-xs font-black italic ${dayGigs.length > 0 ? 'text-purple-500' : 'text-zinc-700'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  {dayGigs.map(gig => {
                    const venueImage = Array.isArray(gig.venue.media) 
                      ? gig.venue.media.find((m: any) => m.type === 'image')?.url 
                      : null;

                    return (
                      <div key={gig.id} className="absolute inset-1 rounded-xl overflow-hidden shadow-lg border border-purple-500/30 group/item">
                        {venueImage ? (
                          <Image 
                            src={venueImage} 
                            alt={gig.venue.name} 
                            fill 
                            className="object-cover opacity-40 group-hover/item:opacity-70 transition-opacity duration-700 scale-110 group-hover/item:scale-100" 
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-black" />
                        )}
                        <div className="absolute inset-0 p-2 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                          <p className="text-[8px] font-black uppercase italic tracking-tighter text-white truncate leading-none mb-1">
                            {gig.title}
                          </p>
                          <div className="flex items-center gap-1 opacity-70">
                            <MapPin size={8} className="text-purple-400" />
                            <p className="text-[7px] font-bold uppercase tracking-widest text-zinc-300 truncate">
                              {gig.venue.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-6 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
        <p className="text-xs font-bold uppercase italic tracking-wide text-zinc-400">
          Scroll horizontally on mobile to view the full week. Venue images highlight your confirmed dates.
        </p>
      </div>
    </div>
  );
}

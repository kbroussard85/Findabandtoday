'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface EventBannerProps {
  gig: any;
}

export function EventBanner({ gig }: EventBannerProps) {
  const artistImage = Array.isArray(gig.band.media) 
    ? gig.band.media.find((m: any) => m.type === 'image')?.url 
    : null;
  
  const eventDate = new Date(gig.date);

  return (
    <div className="w-[728px] h-[90px] bg-black border border-zinc-800 rounded-lg overflow-hidden flex relative group hover:border-purple-500/50 transition-all shadow-2xl mx-auto mb-4">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* Artist Section (Left) */}
      <div className="w-[120px] h-full relative shrink-0">
        {artistImage ? (
          <Image src={artistImage} alt={gig.band.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase text-zinc-700">FABT</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black" />
      </div>

      {/* Content Section (Middle) */}
      <div className="flex-1 flex flex-col justify-center px-6 z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-purple-500">Live Performance</span>
          <div className="h-[1px] w-8 bg-zinc-800" />
        </div>
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white leading-none truncate">
          {gig.band.name}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1 flex items-center gap-2">
          <MapPin size={10} className="text-blue-500" /> {gig.venue.name} • {gig.venue.city || 'Nashville'}
        </p>
      </div>

      {/* Date/Time Section (Right) */}
      <div className="w-[180px] h-full bg-zinc-900/50 border-l border-zinc-800 flex flex-col items-center justify-center text-center shrink-0 z-10 px-4">
        <div className="flex items-center gap-2 text-white mb-1">
          <Calendar size={12} className="text-purple-400" />
          <span className="text-xs font-black uppercase italic tracking-tighter">
            {format(eventDate, 'EEE, MMM do')}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {format(eventDate, 'h:mm aa')}
          </span>
        </div>
      </div>

      {/* Call to Action (Far Right) */}
      <div className="w-[100px] h-full flex items-center justify-center shrink-0 z-10 pr-2">
        <button className="bg-white text-black text-[9px] font-black uppercase italic tracking-widest px-4 py-2 rounded-full hover:bg-purple-500 hover:text-white transition-all transform group-hover:scale-105 shadow-lg">
          Tickets
        </button>
      </div>
    </div>
  );
}

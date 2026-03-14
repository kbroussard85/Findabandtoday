'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Sparkles } from 'lucide-react';
import { EventBanner } from './EventBanner';

export function LocalTalentSection() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Check if location was already granted/stored
    const stored = localStorage.getItem('fabt_user_location');
    if (stored) {
      setUserLocation(JSON.parse(stored));
    } else {
      // Prompt for location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            localStorage.setItem('fabt_user_location', JSON.stringify(loc));
          },
          () => console.log('Location denied')
        );
      }
    }
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const url = new URL('/api/events/public', window.location.origin);
        if (query) url.searchParams.set('query', query);
        if (userLocation) {
          url.searchParams.set('lat', userLocation.lat.toString());
          url.searchParams.set('lng', userLocation.lng.toString());
        }
        
        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.data) setEvents(data.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [query, userLocation]);

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 rounded-full">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Live & Local</span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Local Talent</span>
          </h2>
          
          <div className="w-full max-w-2xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Artist, Venue, or City..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-6 pl-16 pr-8 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all font-bold placeholder:text-zinc-600 shadow-2xl"
            />
            {loading && <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-purple-500" size={20} />}
          </div>
        </div>

        <div className="space-y-4 min-h-[400px]">
          {events.length > 0 ? (
            events.map((gig) => (
              <EventBanner key={gig.id} gig={gig} />
            ))
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 border-2 border-dashed border-zinc-900 rounded-3xl">
              <MapPin size={48} className="mb-4 opacity-20" />
              <p className="font-black uppercase italic tracking-widest text-sm">No booked events found in this area</p>
              <button onClick={() => setQuery('')} className="mt-4 text-purple-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Clear Filters</button>
            </div>
          ) : null}
        </div>

        {/* Desktop Width Warning */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">728x90 Billboard Standard Format</p>
        </div>
      </div>
    </section>
  );
}

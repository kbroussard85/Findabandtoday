'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 antialiased">
      <Navbar />

      {/* Main Hero Section */}
      <main className="relative flex flex-col md:flex-row min-h-[calc(100vh-80px)]">

        {/* Left Side: BANDS */}
        <section className="relative flex-1 group overflow-hidden border-r border-zinc-800">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          <div className="relative h-full flex flex-col justify-end p-12 lg:p-20 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black uppercase italic leading-none">
              I Need <br /> <span className="text-purple-500">A Gig</span>
            </h2>
            <p className="text-zinc-300 text-lg max-w-md leading-relaxed">
              Book your next local gig or national tour today! We handle your I-9s, contracts, technical riders and payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/api/auth/login"
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 text-xl font-black uppercase italic transition-all transform hover:-translate-y-1 shadow-xl shadow-purple-900/20 text-center"
              >
                Book Your Next Gig
              </Link>
              <div className="flex flex-col justify-center">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Artist Tier</span>
                <span className="text-sm font-mono text-zinc-400">$9.99 / month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: VENUES */}
        <section className="relative flex-1 group overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/venue_stage_band.png')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          <div className="relative h-full flex flex-col justify-end p-12 lg:p-20 space-y-6">
            <h2 className="text-5xl lg:text-7xl font-black uppercase italic leading-none">
              I Need <br /> <span className="text-blue-500">A Band</span>
            </h2>
            <p className="text-zinc-300 text-lg max-w-md leading-relaxed">
              Fill your empty dates with matched talent. Zero paperwork. Verified stage plots. Day-of-show automated payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/api/auth/login"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-xl font-black uppercase italic transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-900/20 text-center"
              >
                Fill Your Calendar
              </Link>
              <div className="flex flex-col justify-center">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Venue Tier</span>
                <span className="text-sm font-mono text-zinc-400">$19.99 / month</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Trust Bar (IOTM Functionality) */}
      <div className="bg-zinc-900/50 py-12 px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <h4 className="text-purple-400 font-bold uppercase tracking-widest mb-2">Automated Compliance</h4>
          <p className="text-zinc-500 text-sm italic">&quot;Automated I-9 tax forms and performance contracts for every match.&quot;</p>
        </div>
        <div>
          <h4 className="text-blue-400 font-bold uppercase tracking-widest mb-2">Geospatial Routing</h4>
          <p className="text-zinc-500 text-sm italic">&quot;Local or National matching ensures your tour stays profitable.&quot;</p>
        </div>
        <div>
          <h4 className="text-white font-bold uppercase tracking-widest mb-2">Verified Tech Riders</h4>
          <p className="text-zinc-500 text-sm italic">&quot;Sync stage plots and backline requirements automatically before the load-in.&quot;</p>
        </div>
      </div>
    </div>
  );
}

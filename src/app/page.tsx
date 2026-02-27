import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 antialiased">
      <Navbar />

      {/* Main Hero Section */}
      <main className="relative flex flex-col md:flex-row min-h-[calc(100vh-80px)]">

        {/* Left Side: BANDS */}
        <section className="relative flex-1 group overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800 min-h-[50vh] md:min-h-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          <div className="relative h-full flex flex-col justify-end p-8 lg:p-20 space-y-6">
            <h2 className="text-4xl lg:text-7xl font-black uppercase italic leading-none">
              I Need <br /> <span className="text-purple-500 text-5xl lg:text-8xl">A Gig</span>
            </h2>
            <p className="text-zinc-300 text-base lg:text-lg max-w-md leading-relaxed">
              Book your next local gig or national tour today! We handle your I-9s, contracts, technical riders and payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/api/auth/login?returnTo=/onboarding/band"
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 lg:px-8 py-4 text-lg lg:text-xl font-black uppercase italic transition-all transform hover:-translate-y-1 shadow-xl shadow-purple-900/20 text-center"
              >
                Book Your Next Gig
              </Link>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-widest font-bold">Artist Tier</span>
                <span className="text-xs lg:text-sm font-mono text-zinc-400">$9.99 / month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: VENUES */}
        <section className="relative flex-1 group overflow-hidden min-h-[50vh] md:min-h-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253361-bee8718a340b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          <div className="relative h-full flex flex-col justify-end p-8 lg:p-20 space-y-6">
            <h2 className="text-4xl lg:text-7xl font-black uppercase italic leading-none">
              I Need <br /> <span className="text-blue-500 text-5xl lg:text-8xl">A Band</span>
            </h2>
            <p className="text-zinc-300 text-base lg:text-lg max-w-md leading-relaxed">
              Fill your empty dates with matched talent. Zero paperwork. Verified stage plots. Day-of-show automated payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/api/auth/login?returnTo=/onboarding/venue"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 lg:px-8 py-4 text-lg lg:text-xl font-black uppercase italic transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-900/20 text-center"
              >
                Fill Your Calendar
              </Link>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-widest font-bold">Venue Tier</span>
                <span className="text-xs lg:text-sm font-mono text-zinc-400">$19.99 / month</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Trust Bar (IOTM Functionality) */}
      <div className="bg-zinc-900/50 py-12 px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-2">
          <h4 className="text-purple-400 font-bold uppercase tracking-widest text-sm lg:text-base">Automated Compliance</h4>
          <p className="text-zinc-500 text-xs lg:text-sm italic">&quot;Automated I-9 tax forms and performance contracts for every match.&quot;</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-blue-400 font-bold uppercase tracking-widest text-sm lg:text-base">Geospatial Routing</h4>
          <p className="text-zinc-500 text-xs lg:text-sm italic">&quot;Local or National matching ensures your tour stays profitable.&quot;</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-widest text-sm lg:text-base">Verified Tech Riders</h4>
          <p className="text-zinc-500 text-xs lg:text-sm italic">&quot;Sync stage plots and backline requirements automatically before the load-in.&quot;</p>
        </div>
      </div>
    </div>
  );
}

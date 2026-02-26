'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Calendar, ShieldCheck } from 'lucide-react';

export default function VenueOnboarding() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="inline-block p-4 rounded-full bg-blue-900/30 border border-blue-500/50 mb-4 animate-pulse">
          <Building2 className="w-12 h-12 text-blue-400" />
        </div>

        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          Venue <span className="text-blue-500 text-6xl block mt-2 font-black">Verified</span>
        </h1>

        <p className="text-xl text-zinc-400 font-medium leading-relaxed">
          Welcome to the platform. You&apos;re now connected to a national directory of touring artists
          and local talent. Let&apos;s fill those empty dates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase italic">
              <Calendar className="w-5 h-5" /> Immediate
            </div>
            <h3 className="text-xl font-bold">List Open Dates</h3>
            <p className="text-zinc-500 text-sm">Post your cancellation fill-ins and start getting matches.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3 opacity-50">
            <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase italic">
              <ShieldCheck className="w-5 h-5" /> Next
            </div>
            <h3 className="text-xl font-bold text-zinc-600">Payment Setup</h3>
            <p className="text-zinc-600 text-sm">Coming soon: Automated payouts & tax handling.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/profile"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 text-xl font-black uppercase italic transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/40"
          >
            Manage Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Music, Star, CheckCircle } from 'lucide-react';

export default function ArtistOnboarding() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="inline-block p-4 rounded-full bg-purple-900/30 border border-purple-500/50 mb-4 animate-bounce">
          <Music className="w-12 h-12 text-purple-400" />
        </div>

        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          Welcome to the <span className="text-purple-500 text-6xl block mt-2 font-black">Inner Circle</span>
        </h1>

        <p className="text-xl text-zinc-400 font-medium leading-relaxed">
          Your account is confirmed. Let&apos;s get your profile ready to blow some doors off.
          Venues across the country are waiting for talent like yours.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase italic">
              <Star className="w-5 h-5" /> Step 1
            </div>
            <h3 className="text-xl font-bold">Build Your EPK</h3>
            <p className="text-zinc-500 text-sm">Upload your best tracks and high-res stage shots.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3 opacity-50">
            <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase italic">
              <CheckCircle className="w-5 h-5" /> Step 2
            </div>
            <h3 className="text-xl font-bold text-zinc-600">Sync Calendar</h3>
            <p className="text-zinc-600 text-sm">Coming soon: Automated scheduling.</p>
          </div>
        </div>

        <div className="pt-8">
          <Link
            href="/profile"
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 text-xl font-black uppercase italic transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-purple-900/40"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

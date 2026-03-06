'use client';

import React, { useState } from 'react';
import { Music, Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function RoleSelectionPage() {
  const [loading, setLoading] = useState<'BAND' | 'VENUE' | null>(null);

  const handleRoleSelect = async (role: 'BAND' | 'VENUE') => {
    setLoading(role);
    try {
      // Redirect to manual sync with the chosen role
      window.location.href = `/api/auth/sync/manual?role=${role}`;
    } catch (err) {
      console.error('Role selection error:', err);
      setLoading(null);
      alert('Failed to save role. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter">
            One Last <span className="text-purple-500">Step</span>
          </h1>
          <p className="text-zinc-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            To provide the right tools and dashboard, we need to know how you&apos;ll be using the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {/* Option 1: BANDS */}
          <button
            onClick={() => handleRoleSelect('BAND')}
            disabled={!!loading}
            className="relative group overflow-hidden bg-zinc-900/50 border-2 border-zinc-800 hover:border-purple-500 p-8 lg:p-12 rounded-[2.5rem] text-left transition-all transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Music size={120} className="text-purple-500" />
            </div>
            
            <div className="relative space-y-6">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                <Music className="text-purple-500" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tight">I&apos;m an Artist</h2>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Looking for gigs, managing tours, and automating my technical riders.
                </p>
              </div>
              <div className="flex items-center gap-2 text-purple-500 font-black uppercase italic text-sm tracking-widest pt-4">
                {loading === 'BAND' ? <Loader2 className="animate-spin" /> : <>Select Artist <ArrowRight size={16} /></>}
              </div>
            </div>
          </button>

          {/* Option 2: VENUES */}
          <button
            onClick={() => handleRoleSelect('VENUE')}
            disabled={!!loading}
            className="relative group overflow-hidden bg-zinc-900/50 border-2 border-zinc-800 hover:border-blue-500 p-8 lg:p-12 rounded-[2.5rem] text-left transition-all transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 size={120} className="text-blue-500" />
            </div>
            
            <div className="relative space-y-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Building2 className="text-blue-500" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tight">I&apos;m a Venue</h2>
                <p className="text-zinc-500 font-medium leading-relaxed">
                  Looking for talent, filling dates, and automating performance contracts.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase italic text-sm tracking-widest pt-4">
                {loading === 'VENUE' ? <Loader2 className="animate-spin" /> : <>Select Venue <ArrowRight size={16} /></>}
              </div>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-zinc-700 uppercase font-black tracking-[0.3em] pt-12">
          Your choice determines your default dashboard and search experience.
        </p>
      </div>
    </div>
  );
}

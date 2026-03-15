'use client';

import React, { useState } from 'react';
import { ProfileToggle } from '../profile/ProfileToggle';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { UpgradeButton } from '../profile/UpgradeButton';

interface VenueDashboardClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbUser: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  children: React.ReactNode;
}

export function VenueDashboardClient({ dbUser, profile, children }: VenueDashboardClientProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-zinc-800 pb-12">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white">
              Venue <span className="text-indigo-500">Command</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> 
              {profile?.name || dbUser.name}&apos;s Live Operations
            </p>
          </div>
          
          <div className="flex items-center gap-6 pt-4">
            <ProfileToggle isPreview={isPreview} setIsPreview={setIsPreview} />
            {isPreview && (
              <Link 
                href={`/profile/${dbUser.id}`}
                className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors"
              >
                <ExternalLink size={14} /> View Live URL
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8 bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800 shadow-2xl shadow-indigo-500/5">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Command Level</p>
            <p className={`text-sm font-black uppercase italic ${dbUser.isPaid ? 'text-indigo-400' : 'text-zinc-600'}`}>
              {dbUser.subscriptionTier?.replace('_', ' ') || 'Basic Hub'}
            </p>
          </div>
          {!dbUser.isPaid && <UpgradeButton role="VENUE" />}
          <div className={`w-4 h-4 rounded-full ${dbUser.isPaid ? 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.6)]' : 'bg-zinc-800'}`} />
        </div>
      </header>

      {isPreview ? (
        <div className="rounded-3xl border-2 border-zinc-800 overflow-hidden bg-zinc-950 min-h-[80vh] shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-500/30">
            <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Live Preview Mode</span>
          </div>
          <iframe 
            src={`/profile/${dbUser.id}`} 
            className="w-full h-full min-h-[80vh] border-0"
            title="Venue Profile Preview"
          />
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ProfileToggle } from './ProfileToggle';
import { ArtistSubNav } from './ArtistSubNav';
import { ProfileEditor } from './ProfileEditor';
import { GigDashboard } from './GigDashboard';
import { CalendarEditor } from './CalendarEditor';
import { UpgradeButton } from './UpgradeButton';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface DashboardCenterProps {
  dbUser: {
    id: string;
    auth0Id: string;
    role: 'BAND' | 'VENUE';
    name?: string;
    isPaid: boolean;
    subscriptionTier?: string;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    bandProfile?: any;
    venueProfile?: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };
}

export function DashboardCenter({ dbUser }: DashboardCenterProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('submissions');
  
  const isBand = dbUser.role === 'BAND';
  const profile = isBand ? dbUser.bandProfile : dbUser.venueProfile;
  
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const initialDates = profile?.availabilities?.map((a: any) => a.eventDate) || [];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const handleStripePortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal Error:', err);
      alert('Failed to load billing portal.');
    }
  };

  if (isPreview) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <ProfileToggle isPreview={isPreview} setIsPreview={setIsPreview} />
          <Link 
            href={`/profile/${dbUser.auth0Id}`}
            className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <ExternalLink size={14} /> View Live URL
          </Link>
        </div>
        
        <div className="rounded-3xl border-2 border-zinc-800 overflow-hidden bg-zinc-950 min-h-[80vh] shadow-2xl relative">
          <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/30">
            <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400">Live Preview Mode</span>
          </div>
          <iframe 
            src={`/profile/${dbUser.auth0Id}`} 
            className="w-full h-full min-h-[80vh] border-0"
            title="Profile Preview"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-zinc-800 pb-12">
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">
            Manage <span className={isBand ? 'text-purple-500' : 'text-blue-500'}>{isBand ? 'Artist' : 'Venue'}</span>
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Profile Command Center</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <ProfileToggle isPreview={isPreview} setIsPreview={setIsPreview} />
          <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-4 rounded-3xl backdrop-blur-sm flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subscription Status</p>
              <p className={`text-sm font-bold uppercase italic ${dbUser.isPaid ? 'text-green-500' : 'text-zinc-400'}`}>
                {dbUser.subscriptionTier?.replace('_', ' ') || 'Free Tier'}
              </p>
            </div>
            {!dbUser.isPaid && <UpgradeButton role={dbUser.role} />}
            <div className={`w-3 h-3 rounded-full animate-pulse ${dbUser.isPaid ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />
          </div>
        </div>
      </header>

      <ArtistSubNav activeTab={activeTab} setActiveTab={(tab) => {
        if (tab === 'payment_info') handleStripePortal();
        else setActiveTab(tab);
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-16">
          {activeTab === 'submissions' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">01</span>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">Public Identity</h2>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ProfileEditor initialData={profile as any} role={dbUser.role} userName={dbUser.name || ''} />
            </div>
          )}

          {(activeTab === 'requests' || activeTab === 'pending') && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">02</span>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">My Bookings</h2>
              </div>
              <GigDashboard />
            </div>
          )}
        </section>

        <aside className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">03</span>
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Availability</h2>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm">
            <CalendarEditor initialDates={initialDates} />
          </div>

          <div className="p-8 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-purple-500">Pro Tip</h4>
            <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">
              &quot;Keeping your calendar up to date increases your chances of getting accurate gig offers from top-tier venues.&quot;
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

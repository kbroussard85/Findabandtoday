/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { InventoryCalendar } from '@/components/venue/InventoryCalendar';
import { VenueProfileEditor } from '@/components/venue/VenueProfileEditor';
import { SubmissionStack } from '@/components/venue/SubmissionStack';
import { VenueSubNav } from '@/components/venue/VenueSubNav';
import { VenueDashboardClient } from '@/components/venue/VenueDashboardClient';
import { getMaximizerMatches } from '@/lib/maximizer';

interface MediaItem {
  url: string;
}

interface NegotiationPrefs {
  socialReach?: string;
  avgDraw?: string;
  minRate?: number;
}

export default async function VenueDashboardPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect('/api/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: user.sub },
    include: {
      venueProfile: {
        include: { 
          availabilities: true,
          agreements: true
        }
      },
    },
  });

  if (!dbUser || dbUser.role !== 'VENUE') {
    redirect('/profile');
  }

  const profile = dbUser.venueProfile;
  const isProfileIncomplete = !profile?.agreements || profile.agreements.length === 0;

  // 1. Fetch pending submissions for this venue
  const pendingSubmissions = await prisma.gig.findMany({
    where: {
      venueId: profile?.id,
      status: 'OFFER_SENT'
    },
    include: {
      band: true
    }
  });

  // 2. Fetch Maximizer Matches if the user is a subscriber
  let maximizerMatches: any[] = [];
  if (dbUser.isPaid) {
    maximizerMatches = await getMaximizerMatches(dbUser.auth0Id);
  }

  const formattedSubmissions = [
    ...pendingSubmissions.map(gig => {
      const bandMedia = gig.band.media as unknown as MediaItem[];
      const bandPrefs = gig.band.negotiationPrefs as unknown as NegotiationPrefs;
      
      return {
        id: gig.id,
        band_name: gig.band.name,
        logoUrl: bandMedia?.[0]?.url, 
        imageUrl: bandMedia?.[1]?.url,
        stats: {
          followers: bandPrefs?.socialReach || 'N/A',
          avg_draw: bandPrefs?.avgDraw || 'N/A',
          payout: `$${gig.totalAmount}`
        },
        isMatch: false
      };
    }),
    ...maximizerMatches.map(band => {
      const bandMedia = band.media as unknown as MediaItem[];
      const bandPrefs = band.negotiationPrefs as unknown as NegotiationPrefs;
      
      return {
        id: `match-${band.id}`,
        band_name: band.name,
        logoUrl: bandMedia?.[0]?.url,
        imageUrl: bandMedia?.[1]?.url,
        stats: {
          followers: bandPrefs?.socialReach || 'N/A',
          avg_draw: bandPrefs?.avgDraw || 'N/A',
          payout: bandPrefs?.minRate ? `$${bandPrefs.minRate}` : 'Negotiable'
        },
        isMatch: true
      };
    })
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500">
      <VenueSubNav isProfileIncomplete={isProfileIncomplete} />
      
      <VenueDashboardClient dbUser={dbUser} profile={profile}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black italic shadow-lg shadow-indigo-900/40">01</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Availability</h3>
              </div>
              <InventoryCalendar />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black italic shadow-lg shadow-indigo-900/40">02</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Profile Data</h3>
              </div>
              <VenueProfileEditor initialData={profile as any} userName={profile?.name || dbUser.name || 'New Venue'} />
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-16">
            <section className="bg-zinc-900/30 rounded-[3rem] border border-zinc-800/50 p-10 min-h-[600px] relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-8">
                  <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Submissions</h2>
                    <p className="text-zinc-500 font-bold text-xs mt-2 uppercase tracking-widest">Swipe to book the perfect act</p>
                  </div>
                  <div className="bg-zinc-800 text-indigo-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                    Live Queue
                  </div>
                </div>
                
                <SubmissionStack initialSubmissions={formattedSubmissions} />
              </div>
            </section>

            <section className="bg-zinc-900/20 rounded-[3rem] border border-zinc-800 p-10 space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black uppercase italic tracking-tight">Financial Intelligence</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">Historical Data</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 group hover:border-indigo-500/30 transition-colors">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Payouts</p>
                  <p className="text-4xl font-black italic text-white group-hover:text-indigo-400 transition-colors">$0.00</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 group hover:border-indigo-500/30 transition-colors">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Avg Draw</p>
                  <p className="text-4xl font-black italic text-white group-hover:text-indigo-400 transition-colors">0</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 group hover:border-indigo-500/30 transition-colors">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Events</p>
                  <p className="text-4xl font-black italic text-white group-hover:text-indigo-400 transition-colors">0</p>
                </div>
              </div>
              
              <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/50 group">
                <p className="text-zinc-600 text-sm font-black uppercase italic tracking-widest group-hover:text-zinc-400 transition-colors">
                  Data stream will activate after your first booking confirmation
                </p>
              </div>
            </section>
          </div>
        </div>
      </VenueDashboardClient>
    </div>
  );
}

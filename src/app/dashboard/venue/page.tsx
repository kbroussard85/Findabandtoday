import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { InventoryCalendar } from '@/components/venue/InventoryCalendar';
import { AgreementVault } from '@/components/venue/AgreementVault';
import { SubmissionStack } from '@/components/venue/SubmissionStack';
import { UpgradeButton } from '@/components/profile/UpgradeButton';

interface MediaItem {
  url: string;
}

interface NegotiationPrefs {
  socialReach?: string;
  avgDraw?: string;
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

  // Fetch pending submissions for this venue
  const pendingSubmissions = await prisma.gig.findMany({
    where: {
      venueId: profile?.id,
      status: 'OFFER_SENT'
    },
    include: {
      band: true
    }
  });

  const formattedSubmissions = pendingSubmissions.map(gig => {
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
      }
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-200 pb-10">
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-gray-900">
              Venue <span className="text-indigo-600">Command</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="text-indigo-600">●</span> {profile?.name || dbUser.name}&apos;s Dashboard
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Status</p>
              <p className={`text-sm font-bold uppercase italic ${dbUser.isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                {dbUser.subscriptionTier?.replace('_', ' ') || 'Free Tier'}
              </p>
            </div>
            {!dbUser.isPaid && <UpgradeButton role="VENUE" />}
            <div className={`w-3 h-3 rounded-full ${dbUser.isPaid ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black italic">01</div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Calendar Control</h3>
              </div>
              <InventoryCalendar />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black italic">02</div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Agreement Vault</h3>
              </div>
              <AgreementVault />
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-white rounded-3xl shadow-xl shadow-indigo-900/5 border border-gray-100 p-8 min-h-[500px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Pending Submissions</h2>
                    <p className="text-gray-400 font-medium text-sm mt-1 uppercase tracking-wider">Tinder-style Band Selection</p>
                  </div>
                  <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Live Queue
                  </div>
                </div>
                
                <SubmissionStack initialSubmissions={formattedSubmissions} />
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-6">Past Show Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Payouts</p>
                  <p className="text-2xl font-black italic">$0.00</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg Attendance</p>
                  <p className="text-2xl font-black italic">0</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Show Count</p>
                  <p className="text-2xl font-black italic">0</p>
                </div>
              </div>
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 text-sm font-bold uppercase italic tracking-widest">Historical data will populate after your first show</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { CalendarEditor } from '@/components/profile/CalendarEditor';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect('/api/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: user.sub },
    include: {
      bandProfile: true,
      venueProfile: true,
    },
  });

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-black uppercase italic text-zinc-500">Identity Sync Pending</h2>
          <p className="text-zinc-600">Please log out and back in to finalize your account registration.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <Link href="/api/auth/logout" className="inline-block bg-zinc-800 text-white px-8 py-3 rounded-full font-bold uppercase text-xs">Logout</Link>
        </div>
      </div>
    );
  }

  const profile = dbUser.role === 'BAND' ? dbUser.bandProfile : dbUser.venueProfile;
  const availability = profile?.availability as { bookedDates?: string[] } | null;

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-zinc-800 pb-12">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">
              Manage <span className={dbUser.role === 'BAND' ? 'text-purple-500' : 'text-blue-500'}>{dbUser.role === 'BAND' ? 'Artist' : 'Venue'}</span>
            </h1>
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Profile Command Center</p>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 px-6 py-4 rounded-3xl backdrop-blur-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subscription Status</p>
              <p className={`text-sm font-bold uppercase italic ${dbUser.isPaid ? 'text-green-500' : 'text-zinc-400'}`}>
                {dbUser.subscriptionTier?.replace('_', ' ') || 'Free Tier'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full animate-pulse ${dbUser.isPaid ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">01</span>
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Public Identity</h2>
            </div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ProfileEditor initialData={profile as any} role={dbUser.role} />
          </section>

          <aside className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black">02</span>
              <h2 className="text-2xl font-black uppercase italic tracking-tight">Availability</h2>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-3xl backdrop-blur-sm">
              <CalendarEditor initialDates={availability?.bookedDates || []} />
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
    </div>
  );
}

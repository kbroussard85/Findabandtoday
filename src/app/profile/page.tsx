import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { CalendarEditor } from '@/components/profile/CalendarEditor';
import { redirect } from 'next/navigation';

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
    // If user is not synced yet, we might want to redirect to onboarding or wait
    return <div style={{ padding: '2rem', textAlign: 'center' }}>User not found in database. Please try logging out and back in.</div>;
  }

  const profile = dbUser.role === 'BAND' ? dbUser.bandProfile : dbUser.venueProfile;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Manage Your {dbUser.role === 'BAND' ? 'Artist' : 'Venue'} Profile</h1>
        <p style={{ color: '#888' }}>Customize how you appear in the discovery directory.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <section>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Public Details</h2>
          <ProfileEditor initialData={profile} role={dbUser.role} />
        </section>

        <aside>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Availability</h2>
          <CalendarEditor initialDates={(profile as any)?.availability?.bookedDates || []} />
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
            <h4 style={{ margin: 0, color: '#A855F7' }}>Pro Tip</h4>
            <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
              Keeping your calendar up to date increases your chances of getting accurate gig offers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

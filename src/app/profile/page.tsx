import React from 'react';
import { getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import { DashboardCenter } from '@/components/profile/DashboardCenter';
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
      bandProfile: {
        include: { availabilities: true }
      },
      venueProfile: {
        include: { availabilities: true }
      },
    },
  });

  if (!dbUser) {
    const sessionRole = user.role || user['https://fabt.vercel.app/role'];
    if (sessionRole) {
      redirect(`/api/auth/sync/manual?role=${sessionRole}`);
    }
    redirect('/auth/role-selection');
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardCenter dbUser={dbUser} />
      </div>
    </div>
  );
}

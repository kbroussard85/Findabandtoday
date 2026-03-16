import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { MapPin, Instagram, Youtube, Music, Info, Calendar, Share2, Globe } from 'lucide-react';
import Image from 'next/image';
import { MediaItem } from '@/types';
import { logger } from '@/lib/logger';
import { ProfileBookingBar } from '@/components/profile/ProfileBookingBar';

interface PublicProfileProps {
  params: Promise<{ id: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const { id } = await params;
  
  // Decode the ID in case it was passed encoded
  const decodedId = decodeURIComponent(id);

  logger.info({ id: decodedId }, '[DEBUG] Loading Public Profile for ID:');

  // Search by either Auth0 ID OR internal Database ID for maximum reliability
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { auth0Id: decodedId },
        { id: decodedId },
        { bandProfile: { id: decodedId } },
        { venueProfile: { id: decodedId } }
      ]
    },
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
    logger.error({ id: decodedId }, '[DEBUG] User not found for ID:');
    return notFound();
  }

  const isBand = dbUser.role === 'BAND';
  const profile = isBand ? dbUser.bandProfile : dbUser.venueProfile;
  if (!profile) return notFound();

  // Social Links mapping
  const socialLinks = profile.socialLinks as Record<string, string> || {};
  
  // Media mapping
  const media = Array.isArray(profile.media) ? (profile.media as unknown as MediaItem[]) : [];
  
  // Safe access to audioUrlPreview (only exists on Band)
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const primaryAudio = (isBand ? (profile as any).audioUrlPreview : null) || (media.find(m => m.type === 'audio')?.url);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 antialiased">
      {/* Hero Header */}
      <header className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
        {media.find(m => m.type.includes('image')) && (
          <Image 
            src={media.find(m => m.type.includes('image'))!.url} 
            alt={profile.name} 
            fill 
            className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          />
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-8 lg:p-20 z-20 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${isBand ? 'bg-purple-600' : 'bg-blue-600'}`}>
                Verified {dbUser.role}
              </span>
              <h1 className="text-6xl lg:text-9xl font-black uppercase italic leading-none tracking-tighter">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase italic text-sm">
                <MapPin size={16} className={isBand ? 'text-purple-500' : 'text-blue-500'} />
                {profile.city || "Nashville, TN"}
              </div>
            </div>
            
            <div className="flex gap-4 pb-2">
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-zinc-500 transition-all">
                  <Globe size={24} />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-purple-500 transition-all">
                  <Instagram size={24} />
                </a>
              )}
              {socialLinks.spotify && (
                <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-green-500 transition-all">
                  <Music size={24} />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-red-500 transition-all">
                  <Youtube size={24} />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-pink-500 transition-all">
                  <Share2 size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-7xl mx-auto p-8 lg:p-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Info className={isBand ? 'text-purple-500' : 'text-blue-500'} size={24} />
              <h2 className="text-3xl font-black uppercase italic tracking-tight">The Story</h2>
            </div>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium">
              {profile.bio || "No bio available for this profile."}
            </p>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-3">
              {isBand ? <Music className="text-purple-500" size={24} /> : <Instagram className="text-blue-500" size={24} />}
              <h2 className="text-3xl font-black uppercase italic tracking-tight">{isBand ? 'Sonic Identity' : 'Venue Gallery'}</h2>
            </div>
            {isBand && (
              primaryAudio ? (
                <AudioPlayer src={primaryAudio} title={`${profile.name} - Performance Highlight`} />
              ) : (
                <div className="p-12 border border-zinc-800 rounded-3xl text-center">
                  <p className="text-zinc-600 font-black uppercase italic">No audio preview available.</p>
                </div>
              )
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.filter(m => m.type.includes('image')).slice(1, 4).map((img, i) => (
                <div key={i} className="aspect-square relative rounded-2xl overflow-hidden border border-zinc-800">
                  <Image src={img.url} alt="Gallery" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-12">
          <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl space-y-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Calendar className={isBand ? 'text-purple-500' : 'text-blue-500'} size={20} />
              <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-300">{isBand ? 'Availability' : 'Open Dates'}</h3>
            </div>
            <div className="space-y-3">
              {profile.availabilities?.slice(0, 5).map((avail, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0">
                  <span className="text-xs font-bold text-zinc-500">{new Date(avail.eventDate).toLocaleDateString()}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${avail.status === 'AVAILABLE' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    {avail.status}
                  </span>
                </div>
              ))}
              {(!profile.availabilities || profile.availabilities.length === 0) && (
                <p className="text-xs text-zinc-600 italic">No specific dates listed.</p>
              )}
            </div>
            <ProfileBookingBar 
              targetProfileId={dbUser.id} 
              targetProfileName={profile.name} 
              targetRole={isBand ? 'BAND' : 'VENUE'} 
              variant="full"
            />
          </section>

          <section className="p-8 border border-zinc-800 rounded-3xl space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Booking Terms</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs font-bold text-zinc-400">Min. Guarantee</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className="text-sm font-mono font-bold text-white">${(profile.negotiationPrefs as any)?.minRate || 0}+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-zinc-400">Negotiable</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span className={`text-[10px] font-black uppercase tracking-widest ${(profile.negotiationPrefs as any)?.openToNegotiate ? 'text-green-500' : 'text-zinc-600'}`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(profile.negotiationPrefs as any)?.openToNegotiate ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </section>

          {!isBand && socialLinks.hoursOfOperation && (
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl space-y-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Info className="text-blue-500" size={20} />
                <h3 className="text-xl font-black uppercase italic tracking-tight text-zinc-300">Operations</h3>
              </div>
              <p className="text-sm font-mono text-zinc-400 whitespace-pre-line leading-relaxed">
                {socialLinks.hoursOfOperation}
              </p>
            </section>
          )}
        </aside>
      </main>

      {/* Floating Social Sub-Nav */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all group">
              <Globe size={20} className="group-hover:scale-110 transition-transform" />
            </a>
          )}
          {socialLinks.spotify && (
            <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 hover:bg-[#1DB954]/20 rounded-full transition-all group">
              <Music size={20} className="text-[#1DB954] group-hover:scale-110 transition-transform" />
            </a>
          )}
          {socialLinks.youtube && (
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 hover:bg-[#FF0000]/20 rounded-full transition-all group">
              <Youtube size={20} className="text-[#FF0000] group-hover:scale-110 transition-transform" />
            </a>
          )}
          {socialLinks.tiktok && (
            <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 hover:bg-[#EE1D52]/20 rounded-full transition-all group">
              <Share2 size={20} className="text-[#EE1D52] group-hover:scale-110 transition-transform" />
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-zinc-900 hover:bg-[#E4405F]/20 rounded-full transition-all group">
              <Instagram size={20} className="text-[#E4405F] group-hover:scale-110 transition-transform" />
            </a>
          )}
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <ProfileBookingBar 
            targetProfileId={profile.id} 
            targetProfileName={profile.name} 
            targetRole={isBand ? 'BAND' : 'VENUE'} 
          />
        </div>
      </footer>
    </div>
  );
}

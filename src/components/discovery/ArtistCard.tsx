'use client';
import React, { useRef, useState, useEffect } from 'react';
import { BlurredField } from '../ui/BlurredField';
import { Artist } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Music, Star } from 'lucide-react';
import { logger } from '@/lib/logger';
import { PublicCalendarModal } from './PublicCalendarModal';

interface ArtistCardProps {
  artist: Artist;
  isPremium: boolean;
  showRating?: boolean;
  index?: number;
}

export function ArtistCard({ artist, isPremium, showRating, index }: ArtistCardProps) {
  const mediaRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleRate = async (stars: number) => {
    setIsRating(true);
    try {
      const res = await fetch(`/api/artist/${artist.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars })
      });
      if (res.ok) {
        setUserRating(stars);
        // Could refresh discovery here, but for now just update local state
      }
    } catch (err) {
      logger.error({ err: err }, 'Failed to rate:');
    } finally {
      setIsRating(false);
    }
  };
  
  // Find the best thumbnail (first image in media)
  const thumbnail = React.useMemo(() => {
    return artist.media?.find(m => m.type.includes('image'))?.url || null;
  }, [artist.media]);

  // Find the best audio preview
  const audioUrl = React.useMemo(() => {
    if (artist.audioUrlPreview) return artist.audioUrlPreview;
    return artist.media?.find(m => m.type === 'audio')?.url || null;
  }, [artist.audioUrlPreview, artist.media]);

  useEffect(() => {
    const audio = mediaRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isPremium && audio.currentTime >= 15) {
        audio.pause();
        audio.currentTime = 15;
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isPremium]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mediaRef.current) return;
    
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause all other audios could be implemented here if needed
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-5 group hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
      
      {/* Thumbnail Container */}
      <Link 
        href={`/profile/${artist.id || artist.userId!}`}
        className="relative block w-full aspect-[4/3] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-800 flex items-center justify-center group"
      >
        {thumbnail ? (
          <Image 
            src={thumbnail} 
            alt={artist.name} 
            fill 
            className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-800">
            <Music size={40} />
            <span className="text-[10px] font-black uppercase italic tracking-widest">No Image</span>
          </div>
        )}

        {/* Audio Toggle Overlay */}
        {audioUrl && (
          <button 
            onClick={togglePlay}
            className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transform active:scale-90 transition-all z-20"
          >
            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
          </button>
        )}

        {/* 15s Badge for free users */}
        {!isPremium && isPlaying && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 z-20 animate-in fade-in zoom-in duration-300">
            <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400">
              15s Preview
            </span>
          </div>
        )}

        {/* Top 10 Badge (Venue Only) */}
        {showRating && index !== undefined && index < 10 && (artist.average_rating || 0) > 0 && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-full z-20 shadow-xl border border-yellow-400">
            <span className="text-[10px] font-black uppercase tracking-tighter">
              TOP {index + 1} REGIONAL
            </span>
          </div>
        )}

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio 
            ref={mediaRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </Link>

      {/* Artist Info */}
      <div className="space-y-3">
        <Link href={`/profile/${artist.id || artist.userId}`} className="flex justify-between items-start group/link block">
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover/link:text-purple-400 transition-colors leading-none">
            {artist.name}
          </h3>
          <div className="flex gap-1">
            {artist.genres?.slice(0, 1).map(g => (
              <span key={g.id} className="text-[8px] font-black tracking-widest bg-zinc-800 px-2 py-1 rounded text-purple-400 border border-purple-500/20 uppercase">
                {g.name}
              </span>
            ))}
          </div>
        </Link>
        
        {artist.bio ? (
          <p className="text-zinc-500 text-xs font-bold line-clamp-2 leading-relaxed uppercase italic">
            {artist.bio}
          </p>
        ) : (
          <p className="text-zinc-700 text-xs font-bold uppercase italic italic">
            Artist profile currently being verified...
          </p>
        )}
      </div>

      {/* Booking Actions */}
      <div className="mt-auto">
        <BlurredField isPremium={isPremium}>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
              <span className="text-zinc-600">Booking Status</span>
              <span className="text-green-500">AVAILABLE</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsCalendarOpen(true); }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-[9px] font-black uppercase italic tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer z-30"
              >
                Calendar
              </button>
              <Link 
                href={`/profile/${artist.id || artist.userId}`}
                className="bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-xl py-2.5 text-[9px] font-black uppercase italic tracking-widest text-white transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center z-30"
              >
                Profile & Book
              </Link>
            </div>
          </div>
        </BlurredField>
      </div>

      <PublicCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        targetProfileId={artist.id || artist.userId!}
        targetProfileName={artist.name}
        targetRole={('capacity' in artist) ? 'VENUE' : 'BAND'}
      />

      {/* Hidden Rating Interface (VENUE ONLY) */}
      {showRating && (
        <div className="pt-4 mt-4 border-t border-zinc-800/50 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic">Industry Rating</span>
            <div className="flex items-center gap-1">
              <Star size={10} fill={ (artist.average_rating || 0) > 0 ? "white" : "none"} className={(artist.average_rating || 0) > 0 ? "text-white" : "text-zinc-700"} />
              <span className="text-[10px] font-black text-white">{artist.average_rating ? Number(artist.average_rating).toFixed(1) : 'N/A'}</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                disabled={isRating}
                onClick={() => handleRate(s)}
                className="hover:scale-110 transition-transform disabled:opacity-50"
              >
                <Star 
                  size={14} 
                  fill={s <= (userRating || 0) ? "#a855f7" : "none"} 
                  className={s <= (userRating || 0) ? "text-purple-500" : "text-zinc-800"} 
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

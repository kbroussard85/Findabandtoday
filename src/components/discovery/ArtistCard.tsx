'use client';
import React, { useRef, useState, useEffect } from 'react';
import { BlurredField } from '../ui/BlurredField';
import { Artist } from '@/types';
import Image from 'next/image';
import { Play, Pause, Music } from 'lucide-react';

interface ArtistCardProps {
  artist: Artist;
  isPremium: boolean;
}

export function ArtistCard({ artist, isPremium }: ArtistCardProps) {
  const mediaRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
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
      <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-800 flex items-center justify-center group">
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

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio 
            ref={mediaRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>

      {/* Artist Info */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-purple-400 transition-colors leading-none">
            {artist.name}
          </h3>
          <div className="flex gap-1">
            {artist.genres?.slice(0, 1).map(g => (
              <span key={g.id} className="text-[8px] font-black tracking-widest bg-zinc-800 px-2 py-1 rounded text-purple-400 border border-purple-500/20 uppercase">
                {g.name}
              </span>
            ))}
          </div>
        </div>
        
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
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-[9px] font-black uppercase italic tracking-widest text-zinc-400 hover:text-white transition-all">
                Calendar
              </button>
              <button 
                className="bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-xl py-2.5 text-[9px] font-black uppercase italic tracking-widest text-white transition-all shadow-lg shadow-purple-900/20"
              >
                Book Now
              </button>
            </div>
          </div>
        </BlurredField>
      </div>
    </div>
  );
}

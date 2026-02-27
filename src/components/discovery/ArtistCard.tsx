'use client';
import React, { useRef, useState, useEffect } from 'react';
import { BlurredField } from '../ui/BlurredField';

interface MediaItem {
  url: string;
  type: string;
  name?: string;
}

interface Artist {
  id: string;
  name: string;
  bio?: string;
  audioUrlPreview?: string | null;
  media?: MediaItem[] | null;
}

interface ArtistCardProps {
  artist: Artist;
  isPremium: boolean;
}

export function ArtistCard({ artist, isPremium }: ArtistCardProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const activeMedia = React.useMemo(() => {
    if (artist.audioUrlPreview) return { url: artist.audioUrlPreview, type: 'audio' };
    return artist.media?.[0] || null;
  }, [artist.audioUrlPreview, artist.media]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      // 15-second limit for non-premium users
      if (!isPremium && media.currentTime >= 15) {
        media.pause();
        media.currentTime = 15;
        setIsPlaying(false);
      }
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    return () => media.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isPremium, activeMedia]);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 flex flex-col gap-6 group hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-white group-hover:text-purple-400 transition-colors">
          {artist.name}
        </h3>
        {activeMedia?.type.includes('video') && (
          <span className="text-[10px] font-black tracking-widest bg-zinc-800 px-2 py-1 rounded text-zinc-400 border border-zinc-700">
            VIDEO
          </span>
        )}
      </div>
      
      {artist.bio && (
        <p className="text-zinc-400 text-sm font-medium line-clamp-2 leading-relaxed">
          {artist.bio}
        </p>
      )}

      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-zinc-800 flex items-center justify-center">
        {activeMedia ? (
          <>
            {activeMedia.type.includes('video') ? (
              <video 
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={activeMedia.url} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">🎵</span>
                <audio 
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={activeMedia.url} 
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
            
            <button 
              onClick={togglePlay}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl transform active:scale-90 transition-all z-20"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
              )}
            </button>

            {!isPremium && isPlaying && (
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30">
                <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400">
                  15s Preview
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="text-zinc-700 text-xs font-black uppercase tracking-widest italic">
            Content Unavailable
          </span>
        )}
      </div>

      <div className="mt-auto pt-2">
        <BlurredField isPremium={isPremium}>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
              <span className="text-zinc-500">Booking Status</span>
              <span className="text-green-500">AVAILABLE</span>
            </div>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-xs font-black uppercase italic tracking-widest text-white transition-all">
              View Calendar
            </button>
          </div>
        </BlurredField>
      </div>
    </div>
  );
}

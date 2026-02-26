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
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(
    artist.audioUrlPreview ? { url: artist.audioUrlPreview, type: 'audio' } : (artist.media?.[0] || null)
  );

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
    <div style={{
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      border: '1px solid #333',
      transition: 'transform 0.2s ease',
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ color: '#A855F7', margin: 0, fontSize: '1.2rem' }}>{artist.name}</h3>
        {activeMedia?.type.includes('video') && <span style={{ fontSize: '0.7rem', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>VIDEO</span>}
      </div>
      
      {artist.bio && <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{artist.bio}</p>}

      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {activeMedia ? (
          <>
            {activeMedia.type.includes('video') ? (
              <video 
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={activeMedia.url} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '3rem' }}>🎵</span>
                <audio 
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={activeMedia.url} 
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
            <button 
              onClick={togglePlay}
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(168, 85, 247, 0.9)',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            {!isPremium && isPlaying && (
              <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                PREVIEW MODE
              </div>
            )}
          </>
        ) : (
          <span style={{ color: '#444', fontSize: '0.8rem' }}>No Media Content</span>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <BlurredField isPremium={isPremium}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Contact</span>
              <span style={{ color: '#ccc' }}>Available</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Schedule</span>
              <span style={{ color: '#ccc' }}>View Calendar</span>
            </div>
          </div>
        </BlurredField>
      </div>
    </div>
  );
}

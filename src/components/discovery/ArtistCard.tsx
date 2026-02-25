'use client';
import React, { useRef, useState } from 'react';
import { BlurredField } from '../ui/BlurredField';

interface ArtistCardProps {
  artist: any;
  isPremium: boolean;
}

export function ArtistCard({ artist, isPremium }: ArtistCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div style={{
      background: 'var(--card-bg, #1a1a1a)',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      border: '1px solid #333'
    }}>
      <h3 style={{ color: 'var(--accent-band, #A855F7)', margin: 0 }}>{artist.name}</h3>
      
      {artist.audioUrlPreview ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <audio 
            ref={audioRef} 
            src={artist.audioUrlPreview} 
            onEnded={() => setIsPlaying(false)}
          />
          <button 
            onClick={togglePlay}
            style={{
              background: 'var(--accent-band, #A855F7)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.8rem'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Preview'}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '0.5rem',
          background: '#222',
          textAlign: 'center',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#888'
        }}>
          No Audio Preview
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <BlurredField isPremium={isPremium}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
            <p style={{ margin: 0 }}><strong>Contact:</strong> booking@{artist.name?.toLowerCase().replace(/\s+/g, '') || 'artist'}.com</p>
            <p style={{ margin: 0 }}><strong>Phone:</strong> (555) 012-3456</p>
          </div>
        </BlurredField>
      </div>
    </div>
  );
}

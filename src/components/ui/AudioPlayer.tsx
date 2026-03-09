'use client';

import React from 'react';
import { Play, Pause, Music } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export const AudioPlayer = ({ src, title }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Static heights to avoid impure Math.random during render/memo
  const barHeights = ['60%', '80%', '40%', '90%', '50%'];

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-purple-500/30 transition-all">
      <div 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
      >
        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-1" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
          <Music size={10} /> Preview Track
        </p>
        <p className="text-xs font-bold text-white truncate italic uppercase tracking-tight">
          {title || "Untitled Performance"}
        </p>
      </div>

      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
      
      <div className="flex gap-1 h-3 items-end">
        {barHeights.map((height, i) => (
          <div 
            key={i} 
            className={`w-1 bg-purple-500/40 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ 
              height: isPlaying ? height : '20%',
              animationDelay: `${i * 0.1}s` 
            }}
          />
        ))}
      </div>
    </div>
  );
};

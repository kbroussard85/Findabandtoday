'use client';

import React from 'react';
import { Eye, Edit3 } from 'lucide-react';

interface ProfileToggleProps {
  isPreview: boolean;
  setIsPreview: (value: boolean) => void;
}

export const ProfileToggle = ({ isPreview, setIsPreview }: ProfileToggleProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isPreview ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {isPreview ? <Eye size={18} /> : <Edit3 size={18} />}
        </div>
        <span className="text-xs font-black uppercase italic tracking-widest text-white">
          {isPreview ? "Preview Mode" : "Editor Mode"}
        </span>
      </div>
      
      <button
        onClick={() => setIsPreview(!isPreview)}
        className={`${
          isPreview ? 'bg-purple-600' : 'bg-zinc-700'
        } relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black`}
      >
        <span
          className={`${
            isPreview ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-lg`}
        />
      </button>
    </div>
  );
};

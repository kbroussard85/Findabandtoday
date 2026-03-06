import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="space-y-8 w-full max-w-md text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-t-4 border-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase italic tracking-tighter text-purple-500 animate-pulse">
            FABT
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-8 bg-zinc-900 rounded-full w-3/4 mx-auto animate-pulse"></div>
          <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.2em] italic animate-pulse">
            Syncing your profile...
          </p>
        </div>
      </div>
    </div>
  );
}

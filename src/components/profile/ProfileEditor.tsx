'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/lib/uploadthing';

interface MediaItem {
  url: string;
  type: string;
  name?: string;
}

interface ProfileData {
  bio?: string | null;
  negotiationPrefs?: {
    minRate?: number | string;
    openToNegotiate?: boolean;
  } | null;
  media?: MediaItem[] | null;
}

interface ProfileEditorProps {
  initialData: ProfileData | null;
  role: 'BAND' | 'VENUE';
}

export function ProfileEditor({ initialData, role }: ProfileEditorProps) {
  const [bio, setBio] = useState(initialData?.bio || '');
  const [minRate, setMinRate] = useState(initialData?.negotiationPrefs?.minRate || '');
  const [openToNegotiate, setOpenToNegotiate] = useState(initialData?.negotiationPrefs?.openToNegotiate ?? true);
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          negotiationPrefs: {
            minRate: Number(minRate),
            openToNegotiate,
          },
          media,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Bio / Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world about yourself..."
            className="w-full min-h-[180px] p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-white outline-none focus:border-purple-500/50 transition-all font-medium resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Minimum Rate ($)</label>
            <input
              type="number"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-mono font-bold"
            />
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
            <input
              type="checkbox"
              id="negotiate"
              checked={openToNegotiate}
              onChange={(e) => setOpenToNegotiate(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
            />
            <label htmlFor="negotiate" className="text-sm font-bold uppercase italic text-zinc-300 cursor-pointer">Open to Negotiation</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 rounded-full font-black uppercase italic tracking-tighter text-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${
            role === 'BAND' 
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Syncing...' : 'Save Profile Changes'}
        </button>
        {message && (
          <p className={`text-center font-bold uppercase italic text-sm tracking-tight ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>

      <div className="relative py-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black px-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Gallery & Media</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
          <UploadDropzone
            endpoint={role === 'BAND' ? "bandMedia" : "venueMedia"}
            onClientUploadComplete={(res) => {
              const newMedia = [...media, ...res.map(file => ({
                url: file.url,
                name: file.name,
                type: file.type
              }))];
              setMedia(newMedia);
            }}
            onUploadError={(error: Error) => {
              console.error(`Upload error: ${error.message}`);
            }}
            appearance={{
              container: { border: '2px dashed #27272a', background: 'transparent' },
              label: { color: '#71717a', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
              button: { background: role === 'BAND' ? '#A855F7' : '#3B82F6', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
          {media.map((item, idx) => (
            <div key={idx} className="group relative bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 aspect-square hover:border-zinc-700 transition-all">
              <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">
                {item.type.includes('video') ? '🎬' : '🎵'}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500 text-center line-clamp-1 w-full">{item.name}</p>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { UploadDropzone } from '@/lib/uploadthing';
import { Music, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AudioPlayer } from '../ui/AudioPlayer';

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
  audioUrlPreview?: string | null;
}

interface ProfileEditorProps {
  initialData: ProfileData | null;
  role: 'BAND' | 'VENUE';
  userName: string;
}

export function ProfileEditor({ initialData, role, userName }: ProfileEditorProps) {
  console.log('ProfileEditor debug - Initial Audio:', initialData?.audioUrlPreview);
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [minRate, setMinRate] = useState(initialData?.negotiationPrefs?.minRate || '');
  const [openToNegotiate, setOpenToNegotiate] = useState(initialData?.negotiationPrefs?.openToNegotiate ?? true);
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || []);
  const [audioUrlPreview, setAudioUrlPreview] = useState(initialData?.audioUrlPreview || '');

  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [message, setMessage] = useState('');
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negotiationPrefs: {
            minRate: Number(minRate),
            openToNegotiate,
          },
          media,
          name,
          bio,
          audioUrlPreview,
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

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/artist/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setAudioUrlPreview(data.url);
        // Add to media list if not already there
        const newMediaItem = { url: data.url, type: 'audio', name: file.name };
        setMedia(prev => [...prev, newMediaItem]);
        setMessage('Audio uploaded to Supabase!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Audio upload error:', err);
      setMessage(`Upload Error: ${err.message}`);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = (urlToDelete: string) => {
    setMedia(prev => prev.filter(item => item.url !== urlToDelete));
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Official Name..."
            className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold"
          />
        </div>

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
          className={`w-full py-4 rounded-full font-black uppercase italic tracking-tighter text-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${role === 'BAND'
            ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Syncing...' : 'Save Profile Changes'}
        </button>
        {message && (
          <div className={`flex items-center justify-center gap-2 font-bold uppercase italic text-sm tracking-tight ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message.includes('Error') ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {message}
          </div>
        )}
      </form>

      {/* Audio Upload Section (Supabase Integration) */}
      <div id="audio-showcase-section" className="space-y-6 pt-12 border-t border-zinc-800">
        <div className="flex items-center gap-4 mb-2">
          <Music className="text-purple-500" size={20} />
          <h2 className="text-xl font-black uppercase italic tracking-tight">Audio Showcase</h2>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm space-y-6">
          {audioUrlPreview && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Current Active Preview</span>
              <AudioPlayer src={audioUrlPreview} title={`${name} - Active Demo`} />
            </div>
          )}

          <div className="relative group">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              ref={audioInputRef}
              className="hidden"
            />
            <button
              onClick={() => audioInputRef.current?.click()}
              disabled={uploadingAudio}
              className="w-full py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                {uploadingAudio ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-zinc-400 group-hover:text-white" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase italic tracking-widest text-white">
                  {uploadingAudio ? 'Uploading to Supabase...' : 'Upload New Audio Demo'}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">MP3, WAV, or OGG up to 10MB</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black px-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Visual Gallery</span>
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
            <div key={idx} className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden aspect-square hover:border-zinc-700 transition-all">
              {item.type.includes('image') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.name || 'Gallery Image'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                  <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">
                    {item.type.includes('video') ? '🎬' : '🎵'}
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500 text-center line-clamp-1 w-full">{item.name}</p>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMedia(item.url);
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/40 hover:text-red-500 hover:bg-black transition-all opacity-0 group-hover:opacity-100"
              >
                <XCircle size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { Music, Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { AudioPlayer } from '../ui/AudioPlayer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';

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
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [minRate, setMinRate] = useState(initialData?.negotiationPrefs?.minRate || '');
  const [openToNegotiate, setOpenToNegotiate] = useState(initialData?.negotiationPrefs?.openToNegotiate ?? true);
  const [media, setMedia] = useState<MediaItem[]>(initialData?.media || []);
  const [audioUrlPreview, setAudioUrlPreview] = useState(initialData?.audioUrlPreview || '');
  
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, negotiationPrefs: { minRate: Number(minRate), openToNegotiate }, media }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!supabase) {
      setMessage('Error: Supabase client not initialized. Check your environment variables.');
      return;
    }

    setUploadingAudio(true);
    setMessage('');

    try {
      // 1. Direct Upload to Supabase Storage (Bypasses Vercel 4.5MB limit)
      const fileName = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (storageError) throw storageError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);

      // 3. Register the upload in our database (Small JSON payload, works on Vercel)
      const regRes = await fetch('/api/artist/register-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileType: 'audio', fileName: file.name }),
      });

      if (!regRes.ok) throw new Error('Failed to register file in database');

      setAudioUrlPreview(publicUrl);
      setMedia(prev => [...prev, { url: publicUrl, type: 'audio', name: file.name }]);
      setMessage('Audio uploaded directly to Supabase!');
    } catch (err: unknown) {
      console.error('Upload Error:', err);
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setMessage('');

    try {
      const fileName = `uploads/images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);

      const regRes = await fetch('/api/artist/register-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileType: 'image', fileName: file.name }),
      });

      if (!regRes.ok) throw new Error('Failed to register image');

      setMedia(prev => [...prev, { url: publicUrl, type: 'image', name: file.name }]);
      setMessage('Image uploaded successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-12">
      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Display Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Official Name..." className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Bio / Description</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world about yourself..." className="w-full min-h-[180px] p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-white outline-none focus:border-purple-500/50 transition-all font-medium resize-none leading-relaxed" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Minimum Rate ($)</label>
            <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)} className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-mono font-bold" />
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
            <input type="checkbox" id="negotiate" checked={openToNegotiate} onChange={(e) => setOpenToNegotiate(e.target.checked)} className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20" />
            <label htmlFor="negotiate" className="text-sm font-bold uppercase italic text-zinc-300 cursor-pointer">Open to Negotiation</label>
          </div>
        </div>

        <button type="submit" disabled={saving} className={`w-full py-4 rounded-full font-black uppercase italic tracking-tighter text-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl ${role === 'BAND' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {saving ? 'Syncing...' : 'Save Profile Changes'}
        </button>
        {message && (
          <div className={`flex items-center justify-center gap-2 font-bold uppercase italic text-sm tracking-tight ${message.includes('Error') || message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
            {message.includes('Error') || message.includes('failed') ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {message}
          </div>
        )}
      </form>

      {/* Audio Showcase Section */}
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
            <input type="file" accept="audio/*" onChange={handleAudioUpload} ref={audioInputRef} className="hidden" />
            <button onClick={() => audioInputRef.current?.click()} disabled={uploadingAudio} className="w-full py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                {uploadingAudio ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-zinc-400 group-hover:text-white" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase italic tracking-widest text-white">{uploadingAudio ? 'Uploading Directly...' : 'Upload New Audio Demo'}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Bypasses Vercel size limits</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Gallery Section */}
      <div className="space-y-6 pt-12 border-t border-zinc-800">
        <div className="flex items-center gap-4 mb-2">
          <ImageIcon className="text-blue-500" size={20} />
          <h2 className="text-xl font-black uppercase italic tracking-tight">Visual Gallery</h2>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm space-y-8">
          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={imageInputRef} className="hidden" />
            <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="w-full py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                {uploadingImage ? <Loader2 className="animate-spin text-white" /> : <Upload className="text-zinc-400 group-hover:text-white" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-black uppercase italic tracking-widest text-white">{uploadingImage ? 'Uploading Image...' : 'Upload New Photo'}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">PNG, JPG or WEBP</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.filter(m => m.type.includes('image')).map((item, idx) => (
              <div key={idx} className="group relative bg-black border border-zinc-800 rounded-2xl overflow-hidden aspect-square hover:border-zinc-600 transition-all shadow-xl">
                <Image src={item.url} alt="Gallery Item" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

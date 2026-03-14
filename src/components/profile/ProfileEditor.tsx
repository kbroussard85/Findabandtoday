'use client';

import React, { useState, useRef } from 'react';
import { Music, Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon, MapPin, Share2, Youtube, Globe, Instagram, X } from 'lucide-react';
import { AudioPlayer } from '../ui/AudioPlayer';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import { validateFile } from '@/lib/utils/file-validation';

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
  lat?: number | null;
  lng?: number | null;
  logoUrl?: string | null;
  socialLinks?: {
    spotify?: string;
    youtube?: string;
    tiktok?: string;
    instagram?: string;
    website?: string;
  } | null;
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
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [socialLinks, setSocialLinks] = useState({
    spotify: initialData?.socialLinks?.spotify || '',
    youtube: initialData?.socialLinks?.youtube || '',
    tiktok: initialData?.socialLinks?.tiktok || '',
    instagram: initialData?.socialLinks?.instagram || '',
    website: initialData?.socialLinks?.website || '',
  });
  
  // Geolocation state
  const [lat, setLat] = useState<number | null>(initialData?.lat || null);
  const [lng, setLng] = useState<number | null>(initialData?.lng || null);
  const [detecting, setDetecting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const detectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setDetecting(false);
        setMessage('Location detected! Save to finalize.');
      },
      () => {
        alert('Unable to retrieve your location');
        setDetecting(false);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          bio, 
          negotiationPrefs: { minRate: Number(minRate), openToNegotiate }, 
          media,
          lat, 
          lng,
          socialLinks,
          logoUrl
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      setMessage('Profile updated successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploadingLogo(true);
    setMessage('');

    try {
      if (file.type !== 'image/png') {
        throw new Error('Please upload a TRANSPARENT PNG format logo.');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Logo must be under 2MB.');
      }

      const fileName = `logos/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);
      setLogoUrl(publicUrl);
      setMessage('Logo uploaded! Save to finalize.');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploadingAudio(true);
    setMessage('');

    try {
      // Client-side Validation
      const validation = await validateFile(file, 'audio');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileName = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);

      const regRes = await fetch('/api/artist/register-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileType: 'audio' }),
      });

      if (!regRes.ok) throw new Error('Failed to register file');

      setAudioUrlPreview(publicUrl);
      setMedia(prev => [...prev, { url: publicUrl, type: 'audio', name: file.name }]);
      setMessage('Audio uploaded successfully!');
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;
    setUploadingImage(true);
    setMessage('');

    try {
      // Client-side Validation
      const validation = await validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileName = `uploads/images/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error: storageError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path);

      const regRes = await fetch('/api/artist/register-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileType: 'image' }),
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
        {/* Name & Location Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Display Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Official Name..." className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{role === 'BAND' ? 'Geospatial Sync' : 'Venue Profile'}</label>
            {role === 'BAND' ? (
              <button
                type="button"
                onClick={detectLocation}
                disabled={detecting}
                className={`w-full p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all font-bold uppercase italic text-xs tracking-widest ${lat && lng ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-purple-500/50 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  {detecting ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  {lat && lng ? 'Location Synced' : 'Set Current Location'}
                </div>
                {lat && lng && (
                  <span className="text-[9px] font-mono lowercase tracking-normal opacity-70">
                    ({lat.toFixed(4)}, {lng.toFixed(4)})
                  </span>
                )}
              </button>
            ) : (
              <div className="w-full p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-500 font-bold uppercase italic text-[10px] tracking-widest flex items-center gap-3">
                <CheckCircle size={16} className="text-blue-500" /> Professional Venue Account
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Bio / Description</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder={role === 'BAND' ? "Tell the world about yourself..." : "Describe your venue, atmosphere, and booking philosophy..."} 
            className="w-full min-h-[180px] p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-white outline-none focus:border-purple-500/50 transition-all font-medium resize-none leading-relaxed" 
          />
        </div>

        {/* Identity Logo Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Professional Identity Logo</span>
            <div className="h-[1px] flex-1 bg-zinc-800/50" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-32 h-32 shrink-0 relative group bg-black border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
              {logoUrl ? (
                <>
                  <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
                  <button 
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon size={24} className="mx-auto mb-2 text-zinc-700" />
                  <p className="text-[8px] font-black uppercase text-zinc-600">No Logo</p>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <h4 className="text-sm font-black uppercase italic tracking-widest text-white">Upload Your Logo</h4>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 leading-relaxed">
                  Required Format: <span className="text-purple-500">Transparent PNG</span><br />
                  Recommended Size: <span className="text-blue-500">512 x 512 PX</span> (Max 2MB)
                </p>
              </div>
              
              <input type="file" accept="image/png" onChange={handleLogoUpload} ref={logoInputRef} className="hidden" />
              <button 
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto md:mx-0"
              >
                {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploadingLogo ? 'Processing...' : 'Select File'}
              </button>
            </div>
          </div>
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

      {/* Audio Showcase Section - ONLY FOR BANDS */}
      {role === 'BAND' && (
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
      )}

      {/* Social Identity Section */}
      <div className="space-y-6 pt-12 border-t border-zinc-800">
        <div className="flex items-center gap-4 mb-2">
          <Share2 className="text-purple-500" size={20} />
          <h2 className="text-xl font-black uppercase italic tracking-tight">Social Identity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 flex items-center gap-2">
              <Music size={12} className="text-[#1DB954]" /> Spotify URL
            </label>
            <input 
              type="url" 
              value={socialLinks.spotify} 
              onChange={(e) => setSocialLinks(prev => ({ ...prev, spotify: e.target.value }))} 
              placeholder="https://open.spotify.com/artist/..." 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold text-xs" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 flex items-center gap-2">
              <Youtube size={12} className="text-[#FF0000]" /> YouTube URL
            </label>
            <input 
              type="url" 
              value={socialLinks.youtube} 
              onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))} 
              placeholder="https://youtube.com/@..." 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold text-xs" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 flex items-center gap-2">
              <Share2 size={12} className="text-[#EE1D52]" /> TikTok URL
            </label>
            <input 
              type="url" 
              value={socialLinks.tiktok} 
              onChange={(e) => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))} 
              placeholder="https://tiktok.com/@..." 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold text-xs" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 flex items-center gap-2">
              <Instagram size={12} className="text-[#E4405F]" /> Instagram URL
            </label>
            <input 
              type="url" 
              value={socialLinks.instagram} 
              onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))} 
              placeholder="https://instagram.com/..." 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold text-xs" 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2 flex items-center gap-2">
              <Globe size={12} className="text-blue-400" /> Official Website
            </label>
            <input 
              type="url" 
              value={socialLinks.website} 
              onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))} 
              placeholder="https://yourbandname.com" 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all font-bold text-xs" 
            />
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
            <button onClick={() => imageInputRef.current?.click()} disabled={uploadingImage} className="w-full py-12 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
            >
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

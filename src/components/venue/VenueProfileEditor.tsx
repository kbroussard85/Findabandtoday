'use client';

import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon, MapPin, X } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import { validateFile } from '@/lib/utils/file-validation';

interface ProfileData {
  bio?: string | null;
  lat?: number | null;
  lng?: number | null;
  logoUrl?: string | null;
  socialLinks?: {
    hoursOfOperation?: string;
  } | null;
}

interface VenueProfileEditorProps {
  initialData: ProfileData | null;
  userName: string;
}

export function VenueProfileEditor({ initialData, userName }: VenueProfileEditorProps) {
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [hoursOfOperation, setHoursOfOperation] = useState(initialData?.socialLinks?.hoursOfOperation || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  
  // Geolocation state
  const [lat, setLat] = useState<number | null>(initialData?.lat || null);
  const [lng, setLng] = useState<number | null>(initialData?.lng || null);
  const [detecting, setDetecting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  
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
        alert('Unable to retrieve your location. Please check browser permissions.');
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
          lat, 
          lng,
          logoUrl,
          socialLinks: {
            ...initialData?.socialLinks, // preserve any other social links they might have
            hoursOfOperation
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      setMessage('Venue profile Command Center updated successfully!');
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
      // Basic image validation (PNG, JPG, WEBP)
      const validation = await validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
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

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Name & Location Section */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Venue Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Official Venue Name..." 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-bold" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Geospatial Sync</label>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detecting}
              className={`w-full p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all font-bold uppercase italic text-xs tracking-widest ${lat && lng ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-indigo-500/50 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                {detecting ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                {lat && lng ? 'Coordinates Synced' : 'Set Physical Location'}
              </div>
              {lat && lng && (
                <span className="text-[9px] font-mono lowercase tracking-normal opacity-70">
                  ({lat.toFixed(4)}, {lng.toFixed(4)})
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Description / Vibe</label>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            placeholder="Describe your room, atmosphere, and what makes it special for performing artists..." 
            className="w-full min-h-[140px] p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-white outline-none focus:border-indigo-500/50 transition-all font-medium resize-none leading-relaxed" 
          />
        </div>

        {/* Identity Logo Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-4 pt-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Logomark & Operations</span>
            <div className="h-[1px] flex-1 bg-zinc-800/50" />
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 items-center bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm">
              <div className="w-32 h-32 shrink-0 relative group bg-black border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <>
                    <Image src={logoUrl} alt="Venue Logo" fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

              <div className="text-center space-y-4">
                <input type="file" accept="image/*" onChange={handleLogoUpload} ref={logoInputRef} className="hidden" />
                <button 
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto w-full"
                >
                  {uploadingLogo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {uploadingLogo ? 'Processing...' : 'Upload Logo'}
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm flex flex-col justify-center gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Hours of Operation</label>
               <textarea 
                value={hoursOfOperation} 
                onChange={(e) => setHoursOfOperation(e.target.value)} 
                placeholder="e.g. Mon-Wed: Closed&#10;Thu-Sat: 6PM - 2AM&#10;Sun: 12PM - 10PM" 
                className="w-full flex-1 p-6 bg-black border border-zinc-800 rounded-2xl text-white outline-none focus:border-indigo-500/50 transition-all font-mono text-sm resize-none leading-relaxed" 
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className={`w-full py-4 rounded-full font-black uppercase italic tracking-tighter text-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl bg-indigo-600 hover:bg-indigo-500 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {saving ? 'Syncing...' : 'Save Operations Data'}
        </button>
        
        {message && (
          <div className={`flex items-center justify-center gap-2 font-bold uppercase italic text-sm tracking-tight ${message.includes('Error') || message.includes('failed') ? 'text-rose-500' : 'text-emerald-500'}`}>
            {message.includes('Error') || message.includes('failed') ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/lib/uploadthing';

interface ProfileEditorProps {
  initialData: any;
  role: 'BAND' | 'VENUE';
}

export function ProfileEditor({ initialData, role }: ProfileEditorProps) {
  const [bio, setBio] = useState(initialData?.bio || '');
  const [minRate, setMinRate] = useState(initialData?.negotiationPrefs?.minRate || '');
  const [openToNegotiate, setOpenToNegotiate] = useState(initialData?.negotiationPrefs?.openToNegotiate ?? true);
  const [media, setMedia] = useState<any[]>(initialData?.media || []);
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
    } catch (err) {
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the world about yourself..."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '1rem',
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #333',
              borderRadius: '8px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Minimum Rate ($)</label>
            <input
              type="number"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1a1a1a',
                color: 'white',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <input
              type="checkbox"
              id="negotiate"
              checked={openToNegotiate}
              onChange={(e) => setOpenToNegotiate(e.target.checked)}
            />
            <label htmlFor="negotiate">Open to Negotiation</label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            background: role === 'BAND' ? '#A855F7' : '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {message && <p style={{ textAlign: 'center', color: message.includes('Error') ? '#ef4444' : '#22c55e' }}>{message}</p>}
      </form>

      <hr style={{ border: '0.5px solid #333', width: '100%' }} />

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Media Uploads ({role === 'BAND' ? 'Audio/Video' : 'Images/Video'})</h3>
        <UploadDropzone
          endpoint={role === 'BAND' ? "bandMedia" : "venueMedia"}
          onClientUploadComplete={(res) => {
            const newMedia = [...media, ...res.map(file => ({
              url: file.url,
              name: file.name,
              type: file.type
            }))];
            setMedia(newMedia);
            alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />

        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {media.map((item, idx) => (
            <div key={idx} style={{ background: '#1a1a1a', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { DiscoveryGrid } from '@/components/discovery/DiscoveryGrid';

export default function DirectoryPage() {
  // Defaulting to NYC for demonstration
  const lat = 40.7128; 
  const lng = -74.0060;
  const [radius, setRadius] = useState<number>(50);
  const [role, setRole] = useState<'BAND' | 'VENUE'>('BAND');

  const { data, loading, error } = useDiscovery({ lat, lng, radius, role });

  // For demo purposes, assuming user is not premium to show the blurred UI
  const isPremium = false; 

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Discovery Directory</h1>
      
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1.5rem', 
        alignItems: 'center',
        background: '#1a1a1a',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <label style={{ fontWeight: 'bold' }}>
            Radius: {radius} miles
          </label>
          <input 
            type="range" 
            min="5" 
            max="500" 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))} 
            style={{ flex: 1, minWidth: '150px' }}
          />
        </div>
        
        <div>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as 'BAND' | 'VENUE')}
            style={{
              padding: '0.5rem 1rem',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <option value="BAND">Looking for Bands</option>
            <option value="VENUE">Looking for Venues</option>
          </select>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading matches...</p>}
      {error && <p style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{error}</p>}
      
      {!loading && !error && (
        <DiscoveryGrid items={data} isPremium={isPremium} />
      )}
    </div>
  );
}

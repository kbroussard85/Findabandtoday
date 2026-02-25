// src/app/onboarding/band/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../globals.css';

export default function BandOnboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [searchRadius, setSearchRadius] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/band', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, searchRadius }),
      });

      if (res.ok) {
        router.push('/dashboard/band'); // Route to the band dashboard
      } else {
        console.error("Failed to complete onboarding.");
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <style jsx>{`
        .onboarding-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #121212;
          color: white;
          padding: 2rem;
        }
        form {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.8rem;
          color: var(--accent-band);
        }
        input, select {
          padding: 0.8rem;
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          font-family: inherit;
        }
        .skip-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 1rem;
        }
      `}</style>
      <h1>Artist Profile</h1>
      <p>Setting up your stage plot.</p>
      
      <form onSubmit={handleSubmit}>
        <label>
          Band Name
          <input 
            type="text" 
            placeholder="e.g., The Midnight Echo" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </label>
        
        <label>
          Search Radius (Miles)
          <input 
            type="range" 
            min="5" 
            max="500" 
            step="5" 
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
          />
          <span style={{ textAlign: 'center' }}>{searchRadius} miles</span>
        </label>

        <button type="submit" className="btn-band" disabled={loading}>
          {loading ? 'Creating...' : 'Enter the Show'}
        </button>
      </form>

      <button className="skip-btn" onClick={() => router.push('/dashboard/band')}>
        Skip for now (get me to the directory)
      </button>
    </div>
  );
}

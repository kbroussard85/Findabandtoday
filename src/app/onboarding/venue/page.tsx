// src/app/onboarding/venue/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../globals.css';

export default function VenueOnboarding() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, capacity }),
      });

      if (res.ok) {
        router.push('/dashboard/venue'); // Route to the venue dashboard
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
          color: var(--accent-venue);
        }
        input {
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
      <h1>Venue Profile</h1>
      <p>Configure your room stats.</p>
      
      <form onSubmit={handleSubmit}>
        <label>
          Venue Name
          <input 
            type="text" 
            placeholder="e.g., The Blue Note" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </label>
        
        <label>
          Capacity
          <input 
            type="number" 
            placeholder="e.g., 500" 
            value={capacity || ''}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required 
          />
        </label>

        <button type="submit" className="btn-venue" disabled={loading}>
          {loading ? 'Creating...' : 'Find Talent'}
        </button>
      </form>

      <button className="skip-btn" onClick={() => router.push('/dashboard/venue')}>
        Skip for now (browse talent)
      </button>
    </div>
  );
}

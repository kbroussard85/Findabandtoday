'use client';

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

interface CalendarEditorProps {
  initialDates: string[];
}

export function CalendarEditor({ initialDates }: CalendarEditorProps) {
  const [selectedDays, setSelectedDays] = useState<Date[]>(
    initialDates?.map(d => new Date(d)) || []
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const dates = selectedDays.map(d => d.toISOString());
      const response = await fetch('/api/profile/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookedDates: dates }),
      });

      if (!response.ok) throw new Error('Failed to save calendar');
      setMessage('Calendar updated!');
    } catch (err) {
      setMessage('Error saving calendar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #A855F7;
          --rdp-background-color: #333;
          margin: 0;
        }
        .rdp-day_selected { 
          background-color: var(--rdp-accent-color) !important; 
        }
      `}</style>
      
      <div style={{ background: '#111', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
        <DayPicker
          mode="multiple"
          selected={selectedDays}
          onSelect={(days) => setSelectedDays(days || [])}
          footer={
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
              {selectedDays.length > 0 
                ? `${selectedDays.length} dates marked as unavailable`
                : 'Select dates you are booked or unavailable'}
            </p>
          }
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: '#A855F7',
          color: 'white',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
      {message && <p style={{ color: message.includes('Error') ? '#ef4444' : '#22c55e' }}>{message}</p>}
    </div>
  );
}

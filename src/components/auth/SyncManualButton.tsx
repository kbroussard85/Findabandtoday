'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/logger';

export function SyncManualButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    try {
      // We use window.location for the redirect behavior of the GET route
      window.location.href = '/api/auth/sync/manual';
    } catch (err: unknown) {
      logger.error({ err: err }, 'Manual Sync Error:');
      setError('Connection issue. Please try again in a moment.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={handleSync}
        disabled={loading}
        className={`bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-black uppercase italic tracking-tighter text-lg transition-all transform hover:scale-105 flex items-center gap-3 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {loading ? 'SYNCING PROFILE...' : 'Finalize Registration'}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm font-bold uppercase italic animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}

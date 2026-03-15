'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface LocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  isGranted: boolean;
  loading: boolean;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [lat, setLat] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fabt_user_location');
      return stored ? JSON.parse(stored).lat : null;
    }
    return null;
  });
  const [lng, setLng] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fabt_user_location');
      return stored ? JSON.parse(stored).lng : null;
    }
    return null;
  });
  const [city] = useState<string | null>(null);
  const [isGranted, setIsGranted] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('fabt_user_location');
    }
    return false;
  });
  const [loading, setLoading] = useState(false);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setIsGranted(true);
        setLoading(false);
        localStorage.setItem('fabt_user_location', JSON.stringify({ lat: newLat, lng: newLng }));
      },
      (error) => {
        logger.warn({ err: error.message }, '[LOCATION_CONTEXT] Permission denied:');
        setLoading(false);
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ lat, lng, city, isGranted, loading, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

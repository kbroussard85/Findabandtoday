// src/hooks/useGeolocation.ts
import { useState, useEffect } from 'react';

interface LocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: PermissionState | 'prompt';
}

const STORAGE_KEY = 'fabt_last_location';

const getInitialLocation = () => {
  if (typeof window === 'undefined') return { lat: null, lng: null };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return { lat: null, lng: null };
};

export function useGeolocation() {
  const [state, setState] = useState<LocationState>(() => {
    const initial = getInitialLocation();
    return {
      lat: initial.lat,
      lng: initial.lng,
      error: null,
      loading: initial.lat === null,
      permissionStatus: 'prompt',
    };
  });

  useEffect(() => {
    // Check permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(result => {
        setState(prev => ({ ...prev, permissionStatus: result.state }));
        
        result.onchange = () => {
          setState(prev => ({ ...prev, permissionStatus: result.state }));
        };
      });
    }
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newState = { lat, lng, error: null, loading: false, permissionStatus: 'granted' as PermissionState };
        setState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
      },
      (error) => {
        setState(prev => ({ 
          ...prev, 
          error: error.message, 
          loading: false, 
          permissionStatus: 'denied' 
        }));
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const setManualLocation = (lat: number, lng: number) => {
    setState(prev => ({ ...prev, lat, lng, error: null, loading: false }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
  };

  return { ...state, getLocation, setManualLocation };
}

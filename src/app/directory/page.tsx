'use client';
import React, { useState, Suspense } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DiscoveryGrid } from '@/components/discovery/DiscoveryGrid';
import { useSearchParams } from 'next/navigation';
import { MaximizerPicks } from '@/components/ai/MaximizerPicks';
import { MapPin, Navigation, Search, Loader2, Music } from 'lucide-react';

const POPULAR_GENRES = [
  'Rock', 'Blues', 'Country', 'Jazz', 'Electronic', 'Indie', 'Metal', 'Pop', 'R&B', 'Folk'
];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const { lat, lng, loading: geoLoading, error: geoError, permissionStatus, getLocation, setManualLocation } = useGeolocation();
  const [radius, setRadius] = useState<number>(50);
  const [role, setRole] = useState<'BAND' | 'VENUE'>('BAND');
  const [genre, setGenre] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // FIXED: The hook now correctly handles missing lat/lng when a name query 'q' exists
  const { data, loading, loadingMore, error, loadMore, hasMore } = useDiscovery({ 
    lat, 
    lng, 
    radius, 
    role,
    genre: genre || undefined,
    query: q || undefined 
  });

  const isPremium = false; 

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch)}&limit=1`);
      const results = await response.json();
      
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setManualLocation(parseFloat(lat), parseFloat(lon));
      } else {
        alert('Location not found. Please try a different city or zip code.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      alert('Failed to search location. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // NEW: Only block the screen if there is NO location AND NO search query.
  // This allows people to search for "Ken Carl" even if they haven't shared their location.
  if (!lat && !lng && !q) {
    return (
      <div className="max-w-xl mx-auto py-20 px-8 text-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <MapPin className="text-purple-500" size={40} />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Locate Your <span className="text-purple-500">Scene</span></h1>
          <p className="text-zinc-400">Discovery requires your location to find the best local matches, or use the search bar above to find a specific artist.</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={getLocation}
            disabled={geoLoading}
            className="w-full bg-white text-black py-6 rounded-2xl text-xl font-black uppercase italic tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-4 group"
          >
            {geoLoading ? <Loader2 className="animate-spin" /> : <Navigation className="group-hover:animate-pulse" />}
            {geoLoading ? 'Detecting...' : 'Use My Current Location'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-4 text-zinc-600 font-black tracking-[0.2em]">or search manually</span></div>
          </div>

          <form onSubmit={handleCitySearch} className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="ENTER CITY OR ZIP..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-xl font-bold uppercase italic text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none pr-12 text-white"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            </div>
            <button 
              type="submit"
              disabled={isGeocoding || !citySearch.trim()}
              className="bg-zinc-800 text-white px-8 py-4 rounded-xl font-black uppercase italic text-xs hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {isGeocoding ? <Loader2 className="animate-spin" /> : 'Go'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">
            {q ? (
              <>Search: <span className="text-purple-500 font-black">&quot;{q}&quot;</span></>
            ) : (
              <>Talent <span className="text-purple-500">Discovery</span></>
            )}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl font-medium">
            {q ? `Showing results for "${q}" across the platform.` : 'Browse verified artists and venues within your radius.'}
          </p>
        </div>
        
        <button 
          onClick={getLocation}
          className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-purple-400 transition-colors bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800"
        >
          <Navigation size={12} /> Refresh Location
        </button>
      </header>

      {/* AI Section only shows if we have a location */}
      {lat && lng && <MaximizerPicks lat={lat} lng={lng} radius={radius} />}
      
      <div className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 lg:p-8 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col gap-4 w-full md:w-1/3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Search Radius</span>
              <span className="text-sm font-mono text-purple-400 font-bold">{radius} MILES</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="500" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))} 
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 text-center md:text-left">Category</span>
            <div className="flex bg-zinc-800 p-1 rounded-xl">
              <button 
                onClick={() => setRole('BAND')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${role === 'BAND' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Bands
              </button>
              <button 
                onClick={() => setRole('VENUE')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase italic transition-all ${role === 'VENUE' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Venues
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 text-center md:text-left">Filter by Genre</span>
            <select 
              value={genre} 
              onChange={(e) => setGenre(e.target.value)}
              className="bg-zinc-800 border-none rounded-xl px-6 py-3 font-bold uppercase italic text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none min-w-[180px] text-white"
            >
              <option value="">All Genres</option>
              {POPULAR_GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="min-h-[400px] relative">
        {(loading && !loadingMore) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Scanning local scene...</span>
            </div>
          </div>
        ) : (
          <>
            {data.length === 0 ? (
              <div className="p-20 text-center space-y-4 border border-zinc-800 rounded-3xl animate-in fade-in duration-500">
                <Music className="mx-auto text-zinc-800" size={60} />
                <h3 className="text-2xl font-black uppercase italic text-zinc-600">No matches found</h3>
                <p className="text-zinc-500">Try expanding your radius or searching for a different name.</p>
              </div>
            ) : (
              <DiscoveryGrid 
                items={data} 
                isPremium={isPremium} 
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={loadingMore}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-zinc-500 font-black uppercase italic text-2xl tracking-tighter">Initializing Grid...</div>
        </div>
      }>
        <DirectoryContent />
      </Suspense>
    </div>
  );
}

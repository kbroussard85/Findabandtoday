'use client';
import React, { useState, Suspense } from 'react';
import { useDiscovery } from '@/hooks/useDiscovery';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useProfile } from '@/hooks/useProfile';
import { DiscoveryGrid } from '@/components/discovery/DiscoveryGrid';
import { useSearchParams } from 'next/navigation';
import { MaximizerPicks } from '@/components/ai/MaximizerPicks';
import { Navigation, Search, Loader2, Music } from 'lucide-react';
import { logger } from '@/lib/logger';

const POPULAR_GENRES = [
  'Rock', 'Blues', 'Country', 'Jazz', 'Electronic', 'Indie', 'Metal', 'Pop', 'R&B', 'Folk'
];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const { lat, lng, loading: geoLoading, getLocation, setManualLocation } = useGeolocation();
  const { dbUser } = useProfile();
  const [radius, setRadius] = useState<number>(50);
  const [role, setRole] = useState<'BAND' | 'VENUE'>('BAND');
  const [genre, setGenre] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // FETCH IS NOW UNBLOCKED - Happens on mount even without GPS
  const { data, loading, loadingMore, loadMore, hasMore } = useDiscovery({ 
    lat, 
    lng, 
    radius, 
    role,
    genre: genre || undefined,
    query: q || undefined 
  });

  const isPremium = dbUser?.isPaid || false; 

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(citySearch)}&limit=1`);
      const results = await response.json();
      
      if (results && results.length > 0) {
        const { lat: newLat, lon: newLon } = results[0];
        setManualLocation(parseFloat(newLat), parseFloat(newLon));
      } else {
        alert('Location not found. Please try a different city or zip code.');
      }
    } catch (err) {
      logger.error({ err: err }, 'Geocoding error:');
      alert('Failed to search location. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

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
            {q ? `Showing results for "${q}" across the platform.` : 'Browse verified artists and venues. Share your location for local matching.'}
          </p>
        </div>
        
        <button 
          onClick={getLocation}
          disabled={geoLoading}
          className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-purple-400 transition-colors bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800"
        >
          {geoLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />} 
          {geoLoading ? 'Detecting...' : 'Sync Location'}
        </button>
      </header>

      {/* AI Section only shows if we have a location */}
      {lat && lng && <MaximizerPicks lat={lat} lng={lng} radius={radius} />}
      
      {/* Search and Filters */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <form onSubmit={handleCitySearch} className="lg:col-span-2 relative">
            <input 
              type="text"
              placeholder="ENTER CITY OR ZIP..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl font-bold uppercase italic text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none text-white pr-12"
            />
            <button type="submit" disabled={isGeocoding} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              {isGeocoding ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>

          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
            <button 
              onClick={() => setRole('BAND')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase italic transition-all ${role === 'BAND' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Bands
            </button>
            <button 
              onClick={() => setRole('VENUE')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase italic transition-all ${role === 'VENUE' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Venues
            </button>
          </div>

          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 font-bold uppercase italic text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none text-white appearance-none"
          >
            <option value="">All Genres</option>
            {POPULAR_GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Search Radius</span>
              <span className="text-xs font-mono text-purple-400 font-bold">{radius} MILES</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="500" 
              value={radius} 
              onChange={(e) => setRadius(Number(e.target.value))} 
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end flex-1">
            <button 
              onClick={() => setGenre('')}
              className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${genre === '' ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
            >
              All
            </button>
            {POPULAR_GENRES.slice(0, 4).map(g => (
              <button 
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${genre === g ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="min-h-[400px] relative">
        {(loading && !loadingMore) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Synchronizing local scene...</span>
          </div>
        ) : (
          <>
            {data.length === 0 ? (
              <div className="p-20 text-center space-y-4 border border-zinc-800 rounded-3xl animate-in fade-in duration-500">
                <Music className="mx-auto text-zinc-800" size={60} />
                <h3 className="text-2xl font-black uppercase italic text-zinc-600">No matches detected</h3>
                <p className="text-zinc-500 italic">Adjust your filters to see more verified talent.</p>
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

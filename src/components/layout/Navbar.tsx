'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Search, Menu, X, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, isLoading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 w-full font-sans">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="text-xl lg:text-2xl font-black tracking-tighter uppercase italic hover:scale-105 transition-transform">
            Find<span className="text-purple-500">A</span>Band<span className="text-purple-500">Today</span>
          </Link>

          {/* Nav Search - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full focus-within:border-purple-500/50 transition-all duration-300 w-64 group"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BANDS AND VENUES"
              className="bg-transparent border-none outline-none text-[10px] font-black italic uppercase tracking-widest w-full placeholder:text-zinc-700 text-white"
            />
            <button type="submit">
              <Search className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors cursor-pointer" />
            </button>
          </form>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase italic tracking-widest text-zinc-400 shrink-0">
          <Link href="/directory" className="hover:text-purple-400 transition-colors">Discover</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          {user && (
            <Link href="/profile" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4 border-l border-zinc-800 pl-8">
                <Link
                  href="/api/auth/logout"
                  className="bg-zinc-800 text-white px-6 py-2 text-[10px] font-black uppercase italic tracking-widest hover:bg-zinc-700 transition-all duration-300 rounded-full"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                href="/api/auth/login?role=BAND"
                className="bg-white text-black px-6 py-2 text-[10px] font-black uppercase italic tracking-widest hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg shadow-white/5 rounded-full"
              >
                Login
              </Link>
            )
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-6 py-8 space-y-8 animate-in slide-in-from-top duration-300">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex items-center bg-black border border-zinc-800 px-4 py-3 rounded-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BANDS AND VENUES"
              className="bg-transparent border-none outline-none text-xs font-black italic uppercase tracking-widest w-full text-white"
            />
            <Search className="w-5 h-5 text-purple-500" />
          </form>

          <div className="flex flex-col gap-6 text-sm font-black uppercase italic tracking-[0.2em] text-zinc-400">
            <Link href="/directory" className="hover:text-purple-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Discover</Link>
            <Link href="/about" className="hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link href="/contact" className="hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            {user && (
              <Link href="/profile" className="text-purple-400" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            )}
          </div>

          <div className="pt-8 border-t border-zinc-800">
            {!isLoading && (
              user ? (
                <Link
                  href="/api/auth/logout"
                  className="block w-full bg-zinc-800 text-white px-6 py-4 text-xs font-black uppercase italic tracking-widest text-center rounded-2xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logout
                </Link>
              ) : (
                <Link
                  href="/api/auth/login"
                  className="block w-full bg-white text-black px-6 py-4 text-xs font-black uppercase italic tracking-widest text-center rounded-2xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

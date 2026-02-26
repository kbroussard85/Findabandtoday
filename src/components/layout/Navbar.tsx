'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Search } from 'lucide-react';

import { Search, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, isLoading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between px-6 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 shrink-0">
          <Link href="/" className="text-xl lg:text-2xl font-black tracking-tighter uppercase italic hover:scale-105 transition-transform">
            Find<span className="text-purple-500">A</span>Band<span className="text-purple-500">Today</span>
          </Link>

          {/* Nav Search - Desktop */}
          <div className="hidden lg:flex items-center bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-full focus-within:border-purple-500/50 transition-all duration-300 w-64 group">
            <input
              type="text"
              placeholder="SEARCH BANDS AND VENUES"
              className="bg-transparent border-none outline-none text-[10px] font-black italic uppercase tracking-widest w-full placeholder:text-zinc-700 text-white"
            />
            <Search className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-zinc-400 shrink-0">
          <Link href="/directory" className="hover:text-purple-400 transition-colors">Discover</Link>
          <Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link>
          <Link href="/how" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="text-xs font-bold uppercase tracking-tighter text-zinc-400 hover:text-white transition-colors">
                  Profile
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="bg-zinc-800 text-white px-6 py-2 text-sm font-bold uppercase tracking-tighter hover:bg-zinc-700 transition-all duration-300"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                href="/api/auth/login"
                className="bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-tighter hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg shadow-white/5"
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
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-6 py-8 space-y-6">
          <div className="flex flex-col gap-6 text-sm font-medium uppercase tracking-widest text-zinc-400">
            <Link href="/directory" className="hover:text-purple-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Discover</Link>
            <Link href="/features" className="hover:text-blue-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link>
            <Link href="/how" className="hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>How it works</Link>
            <Link href="/pricing" className="hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          </div>
          <div className="pt-6 border-t border-zinc-800">
            {!isLoading && (
              user ? (
                <div className="flex flex-col gap-4">
                  <Link href="/profile" className="text-xs font-bold uppercase tracking-tighter text-zinc-400 hover:text-white transition-colors text-center" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link
                    href="/api/auth/logout"
                    className="bg-zinc-800 text-white px-6 py-3 text-sm font-bold uppercase tracking-tighter hover:bg-zinc-700 transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Logout
                  </Link>
                </div>
              ) : (
                <Link
                  href="/api/auth/login"
                  className="block bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-tighter hover:bg-purple-500 hover:text-white transition-all duration-300 shadow-lg shadow-white/5 text-center"
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

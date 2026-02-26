'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Search } from 'lucide-react';

export function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className="flex items-center px-8 py-6 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50 gap-12 w-full">
      <div className="flex items-center gap-8 shrink-0">
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic hover:scale-105 transition-transform">
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

      {/* Nav Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-zinc-400 shrink-0">
        <Link href="/directory" className="hover:text-purple-400 transition-colors">Discover</Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-4 ml-auto">
        {!isLoading && (
          user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-xs font-bold uppercase tracking-tighter text-zinc-400 hover:text-white transition-colors">
                Profile
              </Link>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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
    </nav>
  );
}

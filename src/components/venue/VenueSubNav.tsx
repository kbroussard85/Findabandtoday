'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, HelpCircle, LayoutDashboard, AlertTriangle } from 'lucide-react';

export function VenueSubNav({ isProfileIncomplete = false }: { isProfileIncomplete?: boolean }) {
  return (
    <nav className="flex items-center justify-between py-4 px-8 bg-zinc-950 border-b border-zinc-800">
      <div className="flex items-center gap-6">
        <Link href="/dashboard/venue" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-indigo-400 hover:text-white transition-colors">
          <LayoutDashboard size={14} /> Dashboard
        </Link>
        <Link href="/docs" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors">
          <FileText size={14} /> Docs
        </Link>
        <Link href="/help" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors">
          <HelpCircle size={14} /> Help
        </Link>
      </div>

      {isProfileIncomplete && (
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-1.5 rounded-full border border-orange-500/20 animate-pulse">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Profile Incomplete: Add Agreement</span>
          <Link href="/profile" className="ml-2 text-[10px] font-black underline hover:text-orange-400">Complete Now</Link>
        </div>
      )}
    </nav>
  );
}

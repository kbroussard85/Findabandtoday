'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, HelpCircle, LayoutDashboard } from 'lucide-react';

export function VenueSubNav() {
  return (
    <nav className="flex items-center gap-6 py-4 px-8 bg-zinc-950 border-b border-zinc-800">
      <Link href="/dashboard/venue" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-indigo-400 hover:text-white transition-colors">
        <LayoutDashboard size={14} /> Dashboard
      </Link>
      <Link href="/docs" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors">
        <FileText size={14} /> Docs
      </Link>
      <Link href="/help" className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-zinc-500 hover:text-white transition-colors">
        <HelpCircle size={14} /> Help
      </Link>
    </nav>
  );
}

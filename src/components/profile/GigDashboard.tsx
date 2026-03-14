'use client';

import React, { useEffect, useState } from 'react';
import { 
  Music, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Download,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { differenceInHours } from 'date-fns';
import Link from 'next/link';

interface Gig {
  id: string;
  title: string;
  date: string;
  status: string;
  totalAmount: number;
  payoutStatus: string;
  expiresAt?: string;
  band: { id: string; name: string };
  venue: { id: string; name: string };
  agreement?: {
    payoutType: string;
    setDuration: number;
  } | null;
}

interface GigDashboardProps {
  gigs: Gig[];
  role: 'BAND' | 'VENUE';
  loading?: boolean;
}

export function GigDashboard({ gigs, role, loading = false }: GigDashboardProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xs">Retrieving Booking Data...</p>
      </div>
    );
  }

  const sections = [
    { 
      title: 'Pending Offers', 
      status: ['OFFER_SENT', 'COUNTER_OFFER'],
      icon: <Clock className="text-yellow-500" size={18} />,
      empty: 'No pending offers at this time.'
    },
    { 
      title: 'Confirmed Gigs', 
      status: ['ACCEPTED', 'BOOKED', 'CONFIRMED', 'ESCROW_HOLD'],
      icon: <CheckCircle2 className="text-green-500" size={18} />,
      empty: 'No confirmed bookings on the horizon.'
    },
    { 
      title: 'Past Performances', 
      status: ['COMPLETED'],
      icon: <Music className="text-blue-500" size={18} />,
      empty: 'No completed gigs found in history.'
    },
    { 
      title: 'Cancelled / Rejected', 
      status: ['CANCELLED', 'REJECTED'],
      icon: <XCircle className="text-red-500" size={18} />,
      empty: ''
    }
  ];

  return (
    <div className="space-y-12">
      {sections.map((section) => {
        const filteredGigs = gigs.filter(g => section.status.includes(h(g.status)));
        if (filteredGigs.length === 0 && !section.empty) return null;

        return (
          <div key={section.title} className="space-y-6">
            <div className="flex items-center gap-3">
              {section.icon}
              <h3 className="text-xl font-black uppercase italic tracking-tighter">{section.title}</h3>
              <span className="bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded text-[10px] font-bold">{filteredGigs.length}</span>
            </div>

            {filteredGigs.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
                <p className="text-zinc-600 text-sm font-medium">{section.empty}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} role={role} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simple helper to normalize status comparison
function h(status: string) { return status.toUpperCase(); }

function GigCard({ gig, role }: { gig: Gig, role: 'BAND' | 'VENUE' }) {
  const isPending = ['OFFER_SENT', 'COUNTER_OFFER'].includes(h(gig.status));
  const isConfirmed = ['ACCEPTED', 'BOOKED', 'CONFIRMED', 'ESCROW_HOLD'].includes(h(gig.status));
  const isCompleted = h(gig.status) === 'COMPLETED';

  // Calculate if deadline is approaching (within 12 hours)
  const hoursRemaining = gig.expiresAt ? differenceInHours(new Date(gig.expiresAt), new Date()) : null;
  const isExpiringSoon = isPending && hoursRemaining !== null && hoursRemaining <= 12 && hoursRemaining >= 0;
  
  const partnerName = role === 'BAND' ? gig.venue.name : gig.band.name;
  const gigDate = new Date(gig.date);

  return (
    <div className={`bg-zinc-900/40 border ${isExpiringSoon ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-zinc-800'} p-6 rounded-3xl hover:border-zinc-700 transition-all group relative overflow-hidden`}>
      {isExpiringSoon && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[8px] font-black uppercase tracking-[0.2em] text-center py-1 animate-pulse">
          URGENT: DEADLINE APPROACHING - {hoursRemaining}H REMAINING TO CONFIRM
        </div>
      )}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isExpiringSoon ? 'mt-4' : ''}`}>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center shrink-0">
            <span className="text-[10px] font-black uppercase text-zinc-500">{gigDate.toLocaleString('default', { month: 'short' })}</span>
            <span className="text-2xl font-black italic line-height-none leading-none">{gigDate.getDate()}</span>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-lg font-black uppercase italic tracking-tight group-hover:text-purple-400 transition-colors">
              {gig.title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><MapPin size={12} className="text-purple-500" /> {partnerName}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-zinc-600" /> {gig.agreement?.setDuration || '--'} MINS</span>
              <span className="flex items-center gap-1.5 text-zinc-400 font-black"><CreditCard size={12} className="text-green-500" /> ${gig.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isPending && role === 'VENUE' && (
            <>
              <button className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest hover:bg-purple-500 hover:text-white transition-all">Accept</button>
              <button className="bg-zinc-800 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700">Counter</button>
              <button className="text-zinc-500 hover:text-red-500 p-2 transition-colors"><XCircle size={18} /></button>
            </>
          )}

          {isPending && role === 'BAND' && (
            <span className="text-[10px] font-black uppercase italic tracking-widest text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
              Awaiting Venue Response
            </span>
          )}

          {isConfirmed && (
            <Link 
              href={`/api/gigs/${gig.id}/contract`}
              target="_blank"
              className="flex items-center gap-2 bg-zinc-800 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <Download size={14} className="text-purple-500" /> Contract
            </Link>
          )}

          {isCompleted && (
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Payout Status</p>
              <p className="text-xs font-bold uppercase italic text-green-500">{gig.payoutStatus.replace(/_/g, ' ')}</p>
            </div>
          )}

          <Link href={`/gigs/${gig.id}`} className="text-zinc-700 group-hover:text-zinc-400 transition-colors ml-2 hidden md:block">
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

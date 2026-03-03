'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Shield, FileText, CheckCircle } from 'lucide-react';

interface AgreementSandboxProps {
  gigId: string;
  bandData: {
    name: string;
    stagePlotUrl?: string;
    backlineInfo?: string;
  };
  venueData: {
    name: string;
    backlineInfo?: string;
  };
  initialOffer: {
    amount?: number;
    payoutType?: 'CASH_DOS' | 'FABT_PAY';
  };
  onConfirm?: (gigId: string, data: { clientSecret?: string; error?: string }) => void;
}

export default function AgreementSandbox({ gigId, bandData, venueData, initialOffer, onConfirm }: AgreementSandboxProps) {
  const [loading, setLoading] = useState(false);
  const [deal, setDeal] = useState({
    amount: initialOffer.amount || 350,
    type: 'GUARANTEE',
    payoutMethod: initialOffer.payoutType || 'CASH_DOS',
    loadIn: '17:00',
    setStart: '21:00',
    duration: 90
  });

  const [validation, setValidation] = useState({
    techAcknowledged: false,
    termsAccepted: false
  });

  const isReady = validation.techAcknowledged && validation.termsAccepted && !loading;

  const handleConfirm = async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/gigs/${gigId}/escrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'HOLD', 
          amount: deal.amount,
          payoutType: deal.payoutMethod 
        }),
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (onConfirm) onConfirm(gigId, data);
      else {
        // Default behavior: show success or redirect
        alert('Booking Hold Secured! Redirecting...');
        window.location.href = `/profile`;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to secure hold. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      {/* Header Info */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center border-b border-zinc-800 pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase italic">
            Booking <span className="text-purple-500">Sandbox</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase">
            Drafting Agreement: {bandData.name} x {venueData.name}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <Shield className="text-purple-500" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Secured by FABT Escrow</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
        {/* LEFT: VENUE LOGISTICS */}
        <div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
          <h3 className="text-blue-500 font-black uppercase italic tracking-tighter text-xl">Venue Logistics</h3>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 rounded-lg">
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Load-In Time</label>
              <input 
                type="time" 
                value={deal.loadIn} 
                onChange={(e) => setDeal({...deal, loadIn: e.target.value})} 
                className="bg-transparent text-xl font-bold outline-none w-full text-white" 
              />
            </div>
            <div className="p-4 bg-zinc-900 rounded-lg">
              <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Set Start Time</label>
              <input 
                type="time" 
                value={deal.setStart} 
                onChange={(e) => setDeal({...deal, setStart: e.target.value})} 
                className="bg-transparent text-xl font-bold outline-none w-full text-white" 
              />
            </div>
            <div className="p-4 border border-zinc-800 rounded-lg text-sm text-zinc-400">
              <p className="font-bold text-white mb-2 uppercase text-xs">House Backline:</p>
              <p>{venueData.backlineInfo || "Standard 4-piece kit, 2 guitar cabs, full PA."}</p>
            </div>
          </div>
        </div>

        {/* CENTER: THE DEAL POINTS (Editable) */}
        <div className="space-y-6">
          <div className="bg-purple-900/10 border-2 border-purple-500/50 p-8 rounded-3xl space-y-8">
            <div className="text-center">
              <label className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2 block">The Payout Offer</label>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-black italic">$</span>
                <input 
                  type="number" 
                  value={deal.amount} 
                  onChange={(e) => setDeal({...deal, amount: parseInt(e.target.value)})}
                  className="bg-transparent text-6xl font-black italic outline-none w-48 text-center text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeal({...deal, payoutMethod: 'CASH_DOS'})}
                className={`py-3 rounded-xl text-xs font-black uppercase italic border-2 transition-all ${deal.payoutMethod === 'CASH_DOS' ? 'bg-purple-500 border-purple-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                Cash Day of Show
              </button>
              <button 
                onClick={() => setDeal({...deal, payoutMethod: 'FABT_PAY'})}
                className={`py-3 rounded-xl text-xs font-black uppercase italic border-2 transition-all ${deal.payoutMethod === 'FABT_PAY' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                FABT Digital Pay
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" onChange={(e) => setValidation({...validation, techAcknowledged: e.target.checked})} />
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${validation.techAcknowledged ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'}`}>
                  {validation.techAcknowledged && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-xs font-bold uppercase text-zinc-400 group-hover:text-white">I acknowledge the technical riders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" onChange={(e) => setValidation({...validation, termsAccepted: e.target.checked})} />
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${validation.termsAccepted ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'}`}>
                  {validation.termsAccepted && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-xs font-bold uppercase text-zinc-400 group-hover:text-white">I accept FABT Cancellation Policy</span>
              </label>
            </div>

            <button 
              disabled={!isReady}
              onClick={handleConfirm}
              className={`w-full py-6 rounded-2xl text-2xl font-black uppercase italic transition-all ${isReady ? 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl shadow-purple-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
              {loading ? 'Processing...' : (isReady ? 'Confirm & Book' : 'Complete Terms')}
            </button>
            <p className="text-[10px] text-center text-zinc-500 uppercase tracking-tighter">
              Clicking &quot;Confirm&quot; will place a $50.00 hold on your card via FABT Escrow.
            </p>
          </div>
        </div>

        {/* RIGHT: BAND TECHNICALS */}
        <div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
          <h3 className="text-purple-500 font-black uppercase italic tracking-tighter text-xl">Artist Technicals</h3>
          <div className="space-y-4">
            <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden relative">
               {bandData.stagePlotUrl ? (
                 <Image src={bandData.stagePlotUrl} alt="Stage Plot" fill className="opacity-50 hover:opacity-100 transition-opacity object-cover" />
               ) : (
                 <span className="text-zinc-700 font-black uppercase italic text-sm">No Plot Provided</span>
               )}
            </div>
            <div className="p-4 border border-zinc-800 rounded-lg">
              <p className="font-bold text-white mb-2 uppercase text-xs">Input List Highlights:</p>
              <ul className="text-xs text-zinc-500 space-y-1">
                <li>• 4x Vocal Mics (SM58 or equiv)</li>
                <li>• 1x Drum Shield Required</li>
                <li>• 3x DI Boxes for Keys/Bass</li>
              </ul>
            </div>
            <div className="flex gap-2">
               <button className="flex-1 bg-zinc-900 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-zinc-800 hover:border-zinc-600 transition-colors flex items-center justify-center gap-2 text-white">
                 <FileText size={14} /> Full Rider
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

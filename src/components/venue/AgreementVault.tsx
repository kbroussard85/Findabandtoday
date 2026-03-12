'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, Loader2 } from 'lucide-react';

export function AgreementVault() {
  const [templateText, setTemplateText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agreementTemplate: templateText,
        }),
      });

      if (!response.ok) throw new Error('Failed to save agreement');
      alert('Agreement Vault updated! Your AI Negotiator is now synced.');
    } catch (err) {
      console.error(err);
      alert('Error saving to Vault.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl space-y-6 group hover:border-indigo-500/30 transition-all">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Vault Brain</h3>
        </div>
        <FileText size={16} className="text-zinc-700 group-hover:text-indigo-500/50 transition-colors" />
      </header>

      <div className="space-y-4">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
          &quot;Add your payout structure, pre-sale info, venue clauses, or specific event info... anything the artist needs.&quot;
        </p>
        
        <textarea 
          className="w-full h-40 p-6 bg-black border border-zinc-800 rounded-3xl text-zinc-300 text-xs outline-none focus:border-indigo-500/50 transition-all font-medium resize-none leading-relaxed placeholder:text-zinc-800"
          placeholder="e.g. 70/30 door split after $200 production fee. Load-in at 4 PM. We provide backline but no drum breakables..."
          value={templateText}
          onChange={(e) => setTemplateText(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 group/btn active:scale-95"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Sync AI Brain ⚡'}
        </button>
        <button className="p-4 bg-zinc-800 border border-zinc-700 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95">
          <Upload size={18} />
        </button>
      </div>
    </div>
  );
}

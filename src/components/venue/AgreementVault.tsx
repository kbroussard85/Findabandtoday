'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { UploadButton } from '@/lib/uploadthing';

export function AgreementVault() {
  const [templateText, setTemplateText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update text template in Venue profile
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agreementTemplate: templateText,
        }),
      });

      if (!response.ok) throw new Error('Failed to save agreement');

      // 2. Sync to VaultAsset for AI Brain
      await fetch('/api/profile/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assetType: 'agreement_template',
          rawText: templateText,
        }),
      });

      alert('Agreement Vault updated! Your AI Negotiator is now synced.');
    } catch (err) {
      logger.error(err);
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

      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-[3] h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 group/btn active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Sync AI Brain ⚡'}
        </button>
        
        <div className="flex-1 h-14">
          <UploadButton
            endpoint="systemDocs"
            onUploadBegin={() => setUploadStatus('uploading')}
            onClientUploadComplete={async (res) => {
              const fileUrl = res[0].url;
              setUploadStatus('success');
              
              await fetch('/api/profile/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  assetType: 'agreement_template',
                  fileUrl,
                }),
              });
              
              alert('PDF Agreement Uploaded! AI Brain is now aware of your document.');
            }}
            onUploadError={(error: Error) => {
              setUploadStatus('error');
              alert(`ERROR! ${error.message}`);
            }}
            appearance={{
              button: "w-full h-14 bg-zinc-800 border border-zinc-700 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all active:scale-95 ut-ready:bg-zinc-800 ut-uploading:bg-indigo-600 after:hidden",
              allowedContent: "hidden",
              container: "w-full h-14",
            }}
            content={{
              button({ isUploading }) {
                if (isUploading) return <Loader2 size={18} className="animate-spin" />;
                if (uploadStatus === 'success') return <CheckCircle size={18} className="text-green-500" />;
                return <Upload size={18} />;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

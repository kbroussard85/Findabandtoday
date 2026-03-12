'use client';

import React, { useState } from 'react';

export function AgreementVault() {
  const [templateText, setTemplateText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Agreement saved!');
    }, 500);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-100 shadow-sm text-black">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Your Agreement</h3>
      <p className="text-sm text-gray-400 mb-4 italic">
        &quot;Add your payout structure, pre-sale info, venue clauses, or specific event info... anything the artist needs.&quot;
      </p>
      <textarea 
        className="w-full h-32 p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm text-black outline-none mb-4"
        placeholder="e.g. 70/30 door split after $200 production fee. Load-in at 4 PM..."
        value={templateText}
        onChange={(e) => setTemplateText(e.target.value)}
      />
      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Agreement Template'}
        </button>
        <button className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-bold transition-colors">
          📎 Upload PDF
        </button>
      </div>
    </div>
  );
}

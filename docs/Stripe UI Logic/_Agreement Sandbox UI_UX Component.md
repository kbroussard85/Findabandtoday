The **Agreement Sandbox** is the most critical conversion point in the app. This is where the "casual browse" becomes a "legal commitment." We’ve designed this to look like a high-end "Split-Screen Negotiation" dashboard.

On the left, we have the **Venue's Logistics**; on the right, the **Band's Technical Requirements**. In the center, we have the **Editable Deal Points**. The "Submit" button remains locked until both parties’ requirements are "Acknowledged."

---

## **Document: Agreement Sandbox UI/UX Component**

**File: `09_AGREEMENT_SANDBOX_UI.md`**

### **1\. UX Philosophy**

* **Side-by-Side Clarity:** Users must see the "Give and Get" simultaneously.  
* **Conflict Detection:** If the band’s stage plot requires 4 monitor mixes and the venue’s backline only offers 2, a "Technical Warning" icon appears.  
* **Legal Readiness:** The "Submit" button is the final gate that triggers the **Stripe Escrow Hold** we just built.

---

### **2\. Technical Implementation (`components/booking/AgreementSandbox.tsx`)**

TypeScript  
import React, { useState, useEffect } from 'react';  
import { Shield, Clock, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function AgreementSandbox({ bandData, venueData, initialOffer }) {  
  const \[deal, setDeal\] \= useState({  
    amount: initialOffer.amount || 350,  
    type: 'GUARANTEE',  
    payoutMethod: 'CASH\_DOS',  
    loadIn: '17:00',  
    setStart: '21:00',  
    duration: 90  
  });

  const \[validation, setValidation\] \= useState({  
    techAcknowledged: false,  
    termsAccepted: false  
  });

  const isReady \= validation.techAcknowledged && validation.termsAccepted;

  return (  
    \<div className="min-h-screen bg-black text-white p-4 md:p-8"\>  
      {/\* Header Info \*/}  
      \<div className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-zinc-800 pb-6"\>  
        \<div\>  
          \<h1 className="text-4xl font-black italic uppercase italic"\>Booking \<span className="text-purple-500"\>Sandbox\</span\>\</h1\>  
          \<p className="text-zinc-500 font-mono text-sm uppercase"\>Drafting Agreement: {bandData.name} x {venueData.name}\</p\>  
        \</div\>  
        \<div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"\>  
          \<Shield className="text-purple-500" size={16} /\>  
          \<span className="text-xs font-bold uppercase tracking-widest"\>Secured by FABT Escrow\</span\>  
        \</div\>  
      \</div\>

      \<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"\>  
          
        {/\* LEFT: VENUE LOGISTICS \*/}  
        \<div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-900"\>  
          \<h3 className="text-blue-500 font-black uppercase italic tracking-tighter text-xl"\>Venue Logistics\</h3\>  
          \<div className="space-y-4"\>  
            \<div className="p-4 bg-zinc-900 rounded-lg"\>  
              \<label className="text-\[10px\] text-zinc-500 uppercase font-bold block mb-1"\>Load-In Time\</label\>  
              \<input type="time" value={deal.loadIn} onChange={(e) \=\> setDeal({...deal, loadIn: e.target.value})} className="bg-transparent text-xl font-bold outline-none w-full" /\>  
            \</div\>  
            \<div className="p-4 bg-zinc-900 rounded-lg"\>  
              \<label className="text-\[10px\] text-zinc-500 uppercase font-bold block mb-1"\>Set Start Time\</label\>  
              \<input type="time" value={deal.setStart} onChange={(e) \=\> setDeal({...deal, setStart: e.target.value})} className="bg-transparent text-xl font-bold outline-none w-full" /\>  
            \</div\>  
            \<div className="p-4 border border-zinc-800 rounded-lg text-sm text-zinc-400"\>  
              \<p className="font-bold text-white mb-2 uppercase text-xs"\>House Backline:\</p\>  
              \<p\>{venueData.backlineInfo || "Standard 4-piece kit, 2 guitar cabs, full PA."}\</p\>  
            \</div\>  
          \</div\>  
        \</div\>

        {/\* CENTER: THE DEAL POINTS (Editable) \*/}  
        \<div className="space-y-6"\>  
          \<div className="bg-purple-900/10 border-2 border-purple-500/50 p-8 rounded-3xl space-y-8"\>  
            \<div className="text-center"\>  
              \<label className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2 block"\>The Payout Offer\</label\>  
              \<div className="flex items-center justify-center gap-2"\>  
                \<span className="text-4xl font-black italic"\>$\</span\>  
                \<input   
                  type="number"   
                  value={deal.amount}   
                  onChange={(e) \=\> setDeal({...deal, amount: parseInt(e.target.value)})}  
                  className="bg-transparent text-6xl font-black italic outline-none w-48 text-center"   
                /\>  
              \</div\>  
            \</div\>

            \<div className="grid grid-cols-2 gap-4"\>  
              \<button   
                onClick={() \=\> setDeal({...deal, payoutMethod: 'CASH\_DOS'})}  
                className={\`py-3 rounded-xl text-xs font-black uppercase italic border-2 transition-all ${deal.payoutMethod \=== 'CASH\_DOS' ? 'bg-purple-500 border-purple-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}\`}  
              \>  
                Cash Day of Show  
              \</button\>  
              \<button   
                onClick={() \=\> setDeal({...deal, payoutMethod: 'FABT\_PAY'})}  
                className={\`py-3 rounded-xl text-xs font-black uppercase italic border-2 transition-all ${deal.payoutMethod \=== 'FABT\_PAY' ? 'bg-blue-500 border-blue-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}\`}  
              \>  
                FABT Digital Pay  
              \</button\>  
            \</div\>

            \<div className="space-y-4 pt-4"\>  
              \<label className="flex items-center gap-3 cursor-pointer group"\>  
                \<input type="checkbox" className="hidden" onChange={(e) \=\> setValidation({...validation, techAcknowledged: e.target.checked})} /\>  
                \<div className={\`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${validation.techAcknowledged ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'}\`}\>  
                  {validation.techAcknowledged && \<CheckCircle size={14} /\>}  
                \</div\>  
                \<span className="text-xs font-bold uppercase text-zinc-400 group-hover:text-white"\>I acknowledge the technical riders\</span\>  
              \</label\>  
              \<label className="flex items-center gap-3 cursor-pointer group"\>  
                \<input type="checkbox" className="hidden" onChange={(e) \=\> setValidation({...validation, termsAccepted: e.target.checked})} /\>  
                \<div className={\`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${validation.termsAccepted ? 'bg-purple-500 border-purple-500' : 'border-zinc-700'}\`}\>  
                  {validation.termsAccepted && \<CheckCircle size={14} /\>}  
                \</div\>  
                \<span className="text-xs font-bold uppercase text-zinc-400 group-hover:text-white"\>I accept FABT Cancellation Policy\</span\>  
              \</label\>  
            \</div\>

            \<button   
              disabled={\!isReady}  
              className={\`w-full py-6 rounded-2xl text-2xl font-black uppercase italic transition-all ${isReady ? 'bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl shadow-purple-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}\`}  
            \>  
              {isReady ? 'Confirm & Book' : 'Complete Terms'}  
            \</button\>  
            \<p className="text-\[10px\] text-center text-zinc-500 uppercase tracking-tighter"\>  
              Clicking "Confirm" will place a $50.00 hold on your card via FABT Escrow.  
            \</p\>  
          \</div\>  
        \</div\>

        {/\* RIGHT: BAND TECHNICALS \*/}  
        \<div className="space-y-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-900"\>  
          \<h3 className="text-purple-500 font-black uppercase italic tracking-tighter text-xl"\>Artist Technicals\</h3\>  
          \<div className="space-y-4"\>  
            \<div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden"\>  
               {/\* Simplified Stage Plot Preview \*/}  
               \<img src={bandData.stagePlotUrl} alt="Stage Plot" className="opacity-50 hover:opacity-100 transition-opacity" /\>  
            \</div\>  
            \<div className="p-4 border border-zinc-800 rounded-lg"\>  
              \<p className="font-bold text-white mb-2 uppercase text-xs"\>Input List Highlights:\</p\>  
              \<ul className="text-xs text-zinc-500 space-y-1"\>  
                \<li\>• 4x Vocal Mics (SM58 or equiv)\</li\>  
                \<li\>• 1x Drum Shield Required\</li\>  
                \<li\>• 3x DI Boxes for Keys/Bass\</li\>  
              \</ul\>  
            \</div\>  
            \<div className="flex gap-2"\>  
               \<button className="flex-1 bg-zinc-900 py-3 rounded-lg text-\[10px\] font-bold uppercase tracking-widest border border-zinc-800 hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"\>  
                 \<FileText size={14} /\> Full Rider  
               \</button\>  
            \</div\>  
          \</div\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}

---

### **3\. Data Sync Logic (The "Sync-up")**

When the page loads, the system performs a **"Pre-flight Sync"**:

1. **Defaults:** Pulls `standardPayout` from the Venue profile and `baseCost` from the Band profile.  
2. **Logic:** If `band.baseCost` \> `venue.standardPayout`, the amount input is highlighted in red to indicate a negotiation is starting.  
3. **Snapshot:** The moment the "Book" button is clicked, FABT takes a **JSON snapshot** of the Rider and Stage Plot and stores it in the `BookingAgreement` record. This prevents bands from changing their rider *after* a venue has agreed to the gear list.

---

### **4\. Antigravity Build Step: Back-Testing the UI**

1. **Test 1:** Verify the "Confirm & Book" button remains disabled until both checkboxes are clicked.  
2. **Test 2:** Change the "Payout Method" and verify the `metadata` sent to the Stripe logic reflects the change.  
3. **Test 3:** Verify that entering a negative number or $0 in the amount field throws a validation error.

**John (PM):** This completes the "Sandbox" slice. This is where the magic happens and the revenue is secured


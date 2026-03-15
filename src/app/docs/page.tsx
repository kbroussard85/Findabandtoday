'use client';

import React, { useState } from 'react';
import { FileText, Shield, Image as ImageIcon, Users, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'agreement' | 'policy' | 'images' | 'contacts';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('agreement');

  const tabs = [
    { id: 'agreement', label: 'Agreement', icon: <FileText size={18} /> },
    { id: 'policy', label: 'Venue Policy', icon: <Shield size={18} /> },
    { id: 'images', label: 'Images', icon: <ImageIcon size={18} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={18} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 antialiased">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/venue" className="p-2 hover:bg-zinc-800 rounded-full transition-colors group">
              <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            </Link>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Venue Documents</h1>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Repository</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-800'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-8 md:p-12 min-h-[600px] backdrop-blur-sm relative overflow-hidden shadow-2xl shadow-indigo-500/5">
          <AnimatePresence mode="wait">
            {activeTab === 'agreement' && (
              <motion.div
                key="agreement"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Agreement Vault</h2>
                    <p className="text-zinc-500 font-medium mt-2 max-w-xl text-sm leading-relaxed">
                      Upload and manage the standard performance agreement and terms for your venue. This document trains the AI Negotiator.
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <FileText size={32} />
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-16 text-center bg-zinc-950/50 group hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-xl">
                    <Upload size={32} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Upload Agreement PDF</h3>
                  <p className="text-zinc-500 text-sm font-medium">Drag & drop your standard booking contract here</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'policy' && (
              <motion.div
                key="policy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Venue Policy</h2>
                    <p className="text-zinc-500 font-medium mt-2 max-w-xl text-sm leading-relaxed">
                      Maintain your technical specifications, backline lists, house rules, and hospitality guides for incoming acts.
                    </p>
                  </div>
                  <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                    <Shield size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['Technical Rider & Specs', 'House Rules & Curfew', 'Load-in / Parking Map'].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-black border border-zinc-800 rounded-3xl group hover:border-zinc-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-xl group-hover:bg-rose-500/10 transition-colors">
                          <FileText className="text-zinc-600 group-hover:text-rose-400 transition-colors" size={20} />
                        </div>
                        <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">{doc}</span>
                      </div>
                      <button className="px-4 py-2 rounded-full bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">Upload File</button>
                    </div>
                  ))}
                  <button className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-800 rounded-3xl hover:bg-zinc-900/50 hover:border-zinc-600 transition-all text-zinc-600 hover:text-white gap-3 min-h-[100px]">
                    <Upload size={24} />
                    <span className="font-black text-[10px] uppercase tracking-widest">Add Custom Policy Doc</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'images' && (
              <motion.div
                key="images"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Media Gallery</h2>
                    <p className="text-zinc-500 font-medium mt-2 max-w-xl text-sm leading-relaxed">
                      Upload high-resolution photos of your stage, room layout, and exterior. Visuals are crucial for booking top-tier talent.
                    </p>
                  </div>
                  <div className="p-4 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                    <ImageIcon size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden relative group">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon size={48} className="text-zinc-800" />
                      </div>
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-sm gap-2">
                        <button className="font-black text-[10px] uppercase tracking-widest text-white border border-white/20 px-6 py-2 rounded-full hover:bg-white transition-colors hover:text-black">Replace</button>
                        <button className="font-black text-[10px] uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors">Delete</button>
                      </div>
                    </div>
                  ))}
                  <button className="aspect-square border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-600 hover:text-white hover:border-sky-500/50 hover:bg-sky-500/5 transition-all gap-4 group">
                    <div className="p-4 bg-zinc-900 rounded-full group-hover:bg-sky-500/20 transition-colors">
                      <Upload size={24} className="group-hover:text-sky-400 transition-colors" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px]">Upload Photo</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Key Contacts</h2>
                    <p className="text-zinc-500 font-medium mt-2 max-w-xl text-sm leading-relaxed">
                      Maintain a directory of crucial venue personnel. Information provided here will be dynamically included in band advances.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Users size={32} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { role: 'Booking Manager', email: 'Not specified', phone: 'Not specified' },
                    { role: 'Production Manager / FOH', email: 'Not specified', phone: 'Not specified' },
                    { role: 'Marketing & Promo', email: 'Not specified', phone: 'Not specified' },
                  ].map((contact, i) => (
                    <div key={i} className="bg-black border border-zinc-800 rounded-[2rem] p-8 space-y-6 group hover:border-emerald-500/30 transition-colors relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Users size={64} className="text-emerald-500" />
                      </div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <h4 className="font-black uppercase tracking-widest text-xs text-emerald-400">{contact.role}</h4>
                        <button className="px-4 py-1.5 bg-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">Edit</button>
                      </div>
                      
                      <div className="space-y-3 relative z-10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Email</p>
                          <p className="text-white text-sm font-medium">{contact.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Phone</p>
                          <p className="text-white text-sm font-medium">{contact.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="border-2 border-dashed border-zinc-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-zinc-600 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all min-h-[220px] gap-4 cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                      <Users size={28} className="group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <span className="font-black uppercase tracking-widest text-[10px]">Add Custom Contact</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

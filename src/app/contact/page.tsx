'use client';

import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12 py-12">
        <header className="space-y-4">
          <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter">
            Get in <span className="text-blue-500 text-7xl lg:text-9xl block">Touch</span>
          </h1>
          <p className="text-zinc-400 text-xl font-medium max-w-2xl leading-relaxed">
            Have questions about the platform or need technical support? Drop us a line below.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Email</label>
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Role</label>
                <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-black uppercase italic text-sm">
                  <option>Artist / Band</option>
                  <option>Venue Owner</option>
                  <option>Press / Media</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2">Message</label>
                <textarea 
                  placeholder="How can we help?"
                  rows={6}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium resize-none"
                />
              </div>

              <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-4 rounded-full font-black uppercase italic tracking-tighter text-xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-900/20">
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Support Hours</h4>
              <p className="font-bold uppercase italic text-zinc-300">Mon — Fri <br/> 9AM — 6PM CST</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">Global HQ</h4>
              <p className="font-bold uppercase italic text-zinc-300 italic">Nashville, TN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

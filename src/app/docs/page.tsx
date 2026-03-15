import React from 'react';
import { FileText, Shield, Zap, Database, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const sections = [
    {
      title: "The Project Vision",
      icon: <Globe className="text-purple-500" />,
      content: "Disrupting the manual booking process with an Automated AI Talent Agency. Handling logistics (Contracts, Tax, Payments) so artists focus on music."
    },
    {
      title: "UI/UX Aesthetic",
      icon: <Zap className="text-yellow-500" />,
      content: "'LiveNation' style: Dark Mode (#000000), Electric Purple for Bands, Deep Sea Blue for Venues. Bold, high-octane concert poster typography."
    },
    {
      title: "Data Architecture",
      icon: <Database className="text-blue-500" />,
      content: "Prisma + PostgreSQL + PostGIS. Robust geospatial engine for 5-500 mile radius matching and automated tour routing."
    },
    {
      title: "The AI Liaison",
      icon: <Shield className="text-green-500" />,
      content: "Gemini 1.5 Pro powered negotiation. Automated contract drafting, rider management, and venue-matching logic."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 antialiased">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Documentation</h1>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">v0.1.0 Alpha</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-20 space-y-24">
        <section className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
            <Shield size={12} /> System Overview
          </div>
          <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Next Generation</span> of Touring
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Findabandtoday (FABT) is a high-fidelity bridge between artists and venues, 
            eliminating the friction of manual negotiation and administrative overhead.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((s, i) => (
            <div key={i} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] hover:border-zinc-700 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{s.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        <section className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FileText size={200} />
          </div>
          
          <div className="max-w-2xl space-y-6">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">API & Workflows</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-purple-500 rounded-full" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">Radius Matchmaking</h4>
                  <p className="text-zinc-500 text-xs">PostGIS ST_DWithin queries targeting 5–500 mile search perimeters.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-blue-500 rounded-full" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">AI Agentic Action</h4>
                  <p className="text-zinc-500 text-xs">Automated negotiation triggered by Venue Swipes via Google Gemini.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-green-500 rounded-full" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">Zero-Trust Identity</h4>
                  <p className="text-zinc-500 text-xs">Auth0 integration ensuring no PII is stored in the core application database.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-12 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">© 2026 Findabandtoday System Specs</p>
      </footer>
    </div>
  );
}

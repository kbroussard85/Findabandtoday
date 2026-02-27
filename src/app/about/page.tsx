import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-16 py-12">
        <header className="space-y-4">
          <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter">
            The <span className="text-purple-500 text-7xl lg:text-9xl block">Vision</span>
          </h1>
          <p className="text-zinc-400 text-xl font-medium max-w-2xl leading-relaxed">
            Disrupting the archaic manual booking process with high-fidelity automation and zero-knowledge identity.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-purple-400">Automated Agency</h3>
            <p className="text-zinc-500 leading-relaxed">
              We handle the &quot;Boring Logistics&quot; so you can focus on the performance. From I-9 tax compliance to legally binding contracts, FABT automates the heavy lifting of live music.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-blue-400">Geospatial Matching</h3>
            <p className="text-zinc-500 leading-relaxed">
              Our PostGIS-powered engine finds the perfect talent within your specific radius, ensuring every gig is geographically and financially viable.
            </p>
          </div>
        </section>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 lg:p-12 rounded-3xl space-y-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Zero-Knowledge Identity</h2>
          <p className="text-zinc-400 font-medium">
            We prioritize your privacy. By utilizing Auth0 &quot;Blinded Identity&quot; patterns, we never persist your sensitive PII in our local database. You own your data; we just facilitate the connection.
          </p>
        </div>

        <footer className="pt-12 border-t border-zinc-800 flex justify-between items-center">
          <span className="text-zinc-600 font-black uppercase tracking-widest text-xs">FindABandToday © 2026</span>
          <span className="text-purple-500 font-black uppercase italic tracking-tighter">Nashville, TN</span>
        </footer>
      </div>
    </div>
  );
}

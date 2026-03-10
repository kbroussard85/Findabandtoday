import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function AboutPage() {
  const steps = [
    { title: "Create Your Identity", desc: "Set up your professional profile with media, technical riders, and availability." },
    { title: "Match & Negotiate", desc: "Our AI Liaison handles the back-and-forth on pricing and dates based on your preferences." },
    { title: "Secure the Booking", desc: "Automated contracts and I-9s ensure you're protected and compliant for every gig." },
    { title: "Get Paid Instantly", desc: "Payouts are triggered automatically post-show via our secure Stripe integration." }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 antialiased py-20 px-8">
      <div className="max-w-4xl mx-auto space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter">
            The Future of <span className="text-purple-500">Booking</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            FindABandToday is the world&apos;s first automated AI talent agency, designed to remove the friction from live music commerce.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-12">
          <h2 className="text-3xl font-black uppercase italic tracking-tight border-b border-zinc-800 pb-4">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="shrink-0 w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-500 font-black italic transition-all group-hover:bg-purple-600 group-hover:text-white group-hover:scale-110">
                  0{i + 1}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-white">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="bg-zinc-900/30 border border-zinc-800 p-12 rounded-3xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Our Mission</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              We believe artists should focus on their craft, not paperwork. By automating the legal and financial logistics of live performance, we empower the next generation of talent to tour sustainably and profitably.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {['No Paperwork', 'Automated I-9s', 'Instant Payouts', 'AI Negotiation'].map((tag, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full border border-zinc-800">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{tag}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="text-center pt-12">
          <Link href="/" className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-2xl">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { HelpCircle, Mail, MessageSquare, Book, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const contactOptions = [
    {
      title: "Email Support",
      desc: "Get in touch with our team for account or billing issues.",
      icon: <Mail className="text-blue-500" />,
      action: "support@findabandtoday.com"
    },
    {
      title: "Live Chat",
      desc: "Available for Venue Command and Artist Biz subscribers.",
      icon: <MessageSquare className="text-purple-500" />,
      action: "Start Chat"
    },
    {
      title: "Documentation",
      desc: "Detailed guides on radius matching and AI negotiation.",
      icon: <Book className="text-green-500" />,
      action: "View Docs",
      link: "/docs"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 antialiased">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Help Center</h1>
          </div>
          <HelpCircle size={24} className="text-zinc-700" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-20 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">How can we help?</h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Whether you&apos;re a venue looking for the perfect match or an artist scaling your tour, 
            our support system is here to ensure the &quot;Boring Logistics&quot; stay handled.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactOptions.map((option, i) => (
            <div key={i} className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
                {option.icon}
              </div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">{option.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed mb-6">{option.desc}</p>
              
              {option.link ? (
                <Link href={option.link} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                  {option.action} →
                </Link>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  {option.action}
                </span>
              )}
            </div>
          ))}
        </div>

        <section className="bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12 text-center space-y-6">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">Frequently Asked Questions</h3>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            <details className="group border-b border-zinc-800 pb-4">
              <summary className="list-none cursor-pointer flex justify-between items-center font-bold uppercase italic text-xs tracking-widest text-zinc-300">
                How does the AI Negotiator work?
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
                The AI Brain reads your uploaded documents or text templates and communicates directly with artists 
                during the matching phase to ensure terms align before you even see the offer.
              </p>
            </details>
            <details className="group border-b border-zinc-800 pb-4">
              <summary className="list-none cursor-pointer flex justify-between items-center font-bold uppercase italic text-xs tracking-widest text-zinc-300">
                What is &quot;Radius Matchmaking&quot;?
                <span className="group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-zinc-500 text-xs mt-4 leading-relaxed">
                Our geospatial engine searches for artists within a 5–500 mile radius of your venue who are 
                actively looking for gigs on your specific open dates.
              </p>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
}

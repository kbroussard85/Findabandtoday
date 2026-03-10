'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Shield, Rocket, Music, Star, Briefcase, Globe } from 'lucide-react';

const FeatureBlock = ({ title, description, icon: Icon, color }: { title: string, description: string, icon: any, color: string }) => (
  <motion.div
    whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.4)' }}
    className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl space-y-4 transition-colors relative overflow-hidden group"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-10 mb-6`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-purple-400 transition-colors">{title}</h3>
    <p className="text-zinc-500 leading-relaxed font-medium">
      {description}
    </p>
    <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
  </motion.div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-24 py-12">
        <header className="space-y-6 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]"
          >
            The <span className="text-purple-600 block mt-2">Vision</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-xl lg:text-2xl font-bold max-w-3xl leading-snug"
          >
            Disrupting the archaic manual booking process by creating a convenient network of professional talent and buyers. Greatly improving the experience for both venues and artists through an autonomous booking and payout system.
          </motion.p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureBlock
            title="Geospatial Matching"
            color="bg-purple-500"
            icon={MapPin}
            description="Our PostGIS-powered engine finds the perfect talent within your specific radius, ensuring every gig is geographically and financially viable."
          />
          <FeatureBlock
            title="Automated Agency"
            color="bg-blue-500"
            icon={Zap}
            description="We handle the &quot;Boring Logistics&quot; so you can focus on the performance. From I-9 tax compliance to legally binding contracts, we automate the heavy lifting of live music."
          />
          <FeatureBlock
            title="Gig Maximizer"
            color="bg-emerald-500"
            icon={Rocket}
            description="Get your calendar filled instantly with prospective bookings based on geolocation and pricing. Our Maximizer auto-populates your calendar with pending matches."
          />
          <FeatureBlock
            title="Tour Package"
            color="bg-orange-500"
            icon={Globe}
            description="If you are on the road and need to fill dates fast, we can fill the gaps or book the whole tour. A flat fee of $299.99 for a minimum of 5 confirmed dates."
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 border-t border-zinc-900">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white">
              Built by <span className="text-zinc-500">Musicians</span>
            </h2>
            <div className="space-y-6 text-zinc-400 font-medium leading-relaxed text-lg">
              <p>
                We here at Find A Band Today are all musicians who personally know the struggle of booking shows for your band. We want to bring a standard that is so convenient to the user it becomes the new norm of booking.
              </p>
              <p>
                For a venue or event organizer, a simple swipe left or right on the band you like and have your calendar, contracts, and emails done in seconds. Bands get peace of mind knowing they have guarantees and access to available dates without the back and forth of annoying emails and texts.
              </p>
              <p>
                Our goal was to help ourselves book tours and local gigs regularly, which became an intention to create a community that could thrive by simply offering their needs to each other in the entertainment space.
              </p>
              <p>
                Pro services unlock full access to all features allowing unlimited submissions, media, automated payouts, and more. Our Maximizer is great for keeping your calendar full without hundreds of hours of work.
              </p>
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl italic">
                &quot;We know the struggle, and we are here to help. Contact us anytime for any reason—we are a small team wanting to improve your experience on and off site. Cheers!&quot;
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 lg:p-12 rounded-[3rem] space-y-8 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Shield size={200} />
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-purple-500">Zero-Knowledge Identity</h2>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed relative z-10">
              We prioritize your privacy above all else. By utilizing Auth0 &quot;Blinded Identity&quot; patterns, we never persist your sensitive PII in our local database. You own your data; we just facilitate the connection with military-grade security.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="px-4 py-2 bg-zinc-800/50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">Auth0 Triple-Guard</div>
              <div className="px-4 py-2 bg-zinc-800/50 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">AES-256 Encryption</div>
            </div>
          </div>
        </div>

        <footer className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">FindABandToday</span>
            <div className="h-1 w-12 bg-purple-600/30 rounded-full"></div>
            <span className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">© 2026</span>
          </div>
          <div className="flex gap-8">
            <span className="text-purple-500 font-black uppercase italic tracking-tighter text-sm group cursor-pointer hover:text-purple-400 transition-colors">Nashville</span>
            <span className="text-zinc-700 font-black uppercase italic tracking-tighter text-sm">Austin</span>
            <span className="text-zinc-700 font-black uppercase italic tracking-tighter text-sm">LA</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// src/app/page.tsx

import Link from 'next/link';
import './globals.css';

export default function Home() {
  return (
    <main className="split-container">
      {/* BAND SIDE */}
      <section className="split-side side-band">
        <div className="split-content">
          <h1>Artist</h1>
          <p>Book better gigs. Automate your tour routing. Get paid on time.</p>
          <Link href="/onboarding/band">
            <button className="btn-band">Enter the Show</button>
          </Link>
        </div>
      </section>

      {/* VENUE SIDE */}
      <section className="split-side side-venue">
        <div className="split-content">
          <h1>Venue</h1>
          <p>Discover top talent. Manage your booking calendar. Simplify compliance.</p>
          <Link href="/onboarding/venue">
            <button className="btn-venue">Find Talent</button>
          </Link>
        </div>
      </section>
    </main>
  );
}

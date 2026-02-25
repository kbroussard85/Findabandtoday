# Requirements Traceability: FABT (Automated AI Talent Agency)

## Core Features (v1)

### Setup & Foundation
- [x] **SETUP-01:** Initialize Next.js (TypeScript, Vanilla CSS).
- [x] **SETUP-02:** Configure Prisma with PostgreSQL + PostGIS.

### Identity & Security
- [x] **AUTH-01:** Implement Auth0 zero-knowledge "Blinded Identity" flow.
- [x] **AUTH-02:** Sync Auth0 registration with local Prisma 'User' model.
- [x] **AUTH-03:** Role-based logic (BAND vs VENUE) during signup/onboarding.

### Geospatial Matchmaking
- [x] **GEO-01:** Define PostGIS location types in Prisma schema (`Unsupported`).
- [ ] **GEO-02:** Implement radius search logic (ST_DWithin) for Band/Venue matching.
- [ ] **GEO-03:** Configure geospatial indexing (GIST) on location columns.

### UI/UX (The LiveNation Aesthetic)
- [x] **UI-01:** Dark mode base (`#121212`) with Electric Purple/Deep Sea Blue accents.
- [x] **UI-02:** 50/50 vertical split landing page.
- [x] **UI-03:** Low-friction onboarding wizard for Bands and Venues.
- [ ] **UI-04:** Swipe-to-book card interface.
- [ ] **UI-05:** Discovery Grid with blurred contact fields for non-subscribers.

### Revenue & Payments
- [ ] **STRIPE-01:** Stripe Connect integration for automated payouts.
- [ ] **STRIPE-02:** Subscription tiers (ARTIST_BIZ, VENUE_COMMAND, MAXIMIZER).
- [ ] **STRIPE-03:** Paywall logic for gated "Pro" features.
- [ ] **STRIPE-04:** Automated I-9 and tax status verification.

### AI Liaison (The Maximizer)
- [ ] **AI-01:** Automated email/offer generation on "Match".
- [ ] **AI-02:** LangGraph agent for "alternating-offer" negotiation.
- [ ] **AI-03:** AI-generated PDF contracts.

## Status Summary
- **Total Requirements:** 23
- **Completed:** 9
- **In Progress:** 0
- **Remaining:** 14
- **Success Rate:** 39%

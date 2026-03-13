# Roadmap: FABT (Automated AI Talent Agency)

This roadmap outlines the development of the FABT platform, from initial technical foundation to advanced AI-driven negotiation agents.

## Phases

- [x] **Phase 1: Identity & Geo-Foundation** - Core stack, Auth0 zero-knowledge, and PostGIS setup.
- [x] **Phase 2: Directory & Premium UX** - Onboarding, discovery grid, and freemium gated access.
- [x] **Phase 3: Transaction Engine** - Stripe Connect, automated contracts, and payout automation.
- [ ] **Phase 3.5: Venue Marketplace & Dashboard Pivot** - Tinder-style booking, Agreement Vault, and Venue-specific UX.
- [ ] **Phase 4: Agentic Negotiation** - LangGraph agents for auto-negotiation and tour optimization.

---

## Phase Details

### Phase 1: Identity & Geo-Foundation
**Goal**: Establish the technical bedrock, including secure authentication and geospatial data storage.
**Depends on**: Nothing
**Requirements**: SETUP-01, SETUP-02, AUTH-01, AUTH-02, GEO-01
**Success Criteria**:
  1. Next.js application is deployed and connected to a PostgreSQL database with PostGIS enabled.
  2. Users can sign up via Auth0, and PII is stripped/managed via Auth0 Actions before DB storage.
  3. Database roles (Band/Venue) are correctly assigned upon first login.
  4. Geospatial coordinates can be saved and indexed in the `Band` and `Venue` tables using Prisma.
**Plans**: TBD

### Phase 2: Directory & Premium UX
**Goal**: Deliver the searchable marketplace with high-fidelity UI and gated access.
**Depends on**: Phase 1
**Requirements**: AUTH-03, GEO-02, GEO-03, UI-01, UI-02, UI-03, UI-05, STRIPE-02, STRIPE-03
**Success Criteria**:
  1. Discovery grid displays local talent/venues within the user's defined radius (5-500 miles).
  2. 15-second audio snippets play automatically on the discovery cards.
  3. Non-subscribers see "Blurred UI" for premium fields (contact/calendar).
  4. Subscription tiers (Artist Biz, Venue Command) are available and correctly toggle feature access.
**Plans**: TBD

### Phase 3: Transaction Engine
**Goal**: Automate the booking execution, compliance, and payments.
**Depends on**: Phase 2
**Requirements**: STRIPE-01, STRIPE-04, TRANS-01, TRANS-02, TRANS-03, UI-04
**Success Criteria**:
  1. Venues can use the "Swipe-to-Book" interface to initiate booking requests for bands.
  2. System generates valid PDF contracts and I-9 forms automatically upon booking confirmation.
  3. Band receives payout via Stripe Connect automatically on the "Day of Show".
  4. Stripe webhooks correctly handle payout and subscription lifecycle events.
**Plans**: TBD

### Phase 3.5: Venue Marketplace & Dashboard Pivot
**Goal**: Transition to a two-sided marketplace with venue-specific workflows and "Swipe-to-Book" logic.
**Depends on**: Phase 3
**Requirements**: VENUE-01, VENUE-02, VENUE-03, AI-04
**Success Criteria**:
  1. Venue Dashboard is calendar-dominant with a "Submission Stack" for band requests.
  2. Venues can "Upload Agreements" (soft text/PDF) to train the AI Negotiator.
  3. "Swipe-to-Book" logic triggers automated email alerts and preliminary contracts.
  4. Post-show analytics and payout data are stored in the "Past Shows" section.
**Plans**: TBD

### Phase 4: Agentic Negotiation
**Goal**: Deploy AI agents to handle outreach, negotiation, and tour optimization.
**Depends on**: Phase 3
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria**:
  1. AI Liaison agent drafts and sends initial booking offers autonomously.
  2. Multi-agent negotiation (LangGraph) handles price/date counter-offers between parties.
  3. "The Maximizer" AI provides priority ranking and optimal match suggestions for tour routes.
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Identity & Geo-Foundation | 0/1 | Not started | - |
| 2. Directory & Premium UX | 0/1 | Not started | - |
| 3. Transaction Engine | 0/1 | Not started | - |
| 3.5. Venue Marketplace | 0/1 | Not started | - |
| 4. Agentic Negotiation | 0/1 | Not started | - |

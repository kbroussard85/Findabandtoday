# Phase 3 Master Plan: Transaction Engine

This document provides an extensive breakdown of all tasks in Phase 3. Use this as a checklist to track progress and verify each step before proceeding to the next plan.

---

## 🏗️ Plan 3.1: Transaction Engine Foundation
**Goal:** Define the data models and logic for managing gig offers and negotiations.

### Tasks
- [x] **3.1.1: Update Prisma Models**
  - Add `Gig`, `Offer`, and `OfferHistory` models to `schema.prisma`.
  - Define relations between Gigs, Bands, and Venues.
- [x] **3.1.2: Implement State Machine**
  - Create `src/lib/negotiation/state-machine.ts`.
  - Define states: `DRAFT`, `OFFER_SENT`, `COUNTER_OFFER`, `ACCEPTED`, `REJECTED`, `BOOKED`.
  - Implement validation logic for legal state transitions.
- [x] **3.1.3: Gig API Endpoints**
  - Build `api/gigs/route.ts` for CRUD operations.
  - Build `api/gigs/offer/route.ts` for counter-offers.

### 🧪 Testing & Validation
- [x] **Schema Check:** Run `npx prisma validate` and verify models appear in the database.
- [x] **Logic Check:** Attempt to transition a gig from `REJECTED` to `BOOKED` and verify the state machine blocks it.
- [x] **API Check:** Create a test gig via `curl` and verify it appears in the `OfferHistory` table.

---

## 💳 Plan 3.2: Stripe Connect Onboarding
**Goal:** Enable multi-party payments by onboarding users to Stripe Connect Express.

### Tasks
- [x] **3.2.1: Stripe Client Setup**
  - Create `src/lib/stripe/client.ts` with Connect configuration.
- [x] **3.2.2: Onboarding API**
  - Build `api/stripe/onboarding/route.ts` to generate Express dashboard links.
- [x] **3.2.3: Webhook Integration**
  - Update `api/webhooks/stripe/route.ts` to handle `account.updated` events and update user status in DB.

### 🧪 Testing & Validation
- [x] **Link Test:** Verify the onboarding link redirects to the Stripe Express flow.
- [x] **Webhook Test:** Complete a mock onboarding and verify the `stripeAccountId` is saved to the user record.

---

## 🃏 Plan 3.3: Swipe-to-Book UI
**Goal:** Build the interactive, mobile-optimized interface for gig discovery and offers.

### Tasks
- [x] **3.3.1: Swipe Component**
  - Build `src/components/booking/SwipeToBook.tsx` using **Framer Motion**.
  - Implement drag gestures and exit animations.
- [x] **3.3.2: Offer Modal**
  - Create an overlay to input offer terms (Price, Date) when a "Right Swipe" occurs.
- [x] **3.3.3: Booking Grid Integration**
  - Integrate the swipe deck into the `/discover` page.

### 🧪 Testing & Validation
- [x] **Gesture Test:** Verify cards rotate and change color (green/red) based on swipe direction.
- [x] **Flow Test:** Swipe right on a band and verify the "Create Offer" modal appears with pre-filled data.

---

## 📄 Plan 3.4: Compliance & Payouts
**Goal:** Automate contract generation and finalize payments on the "Day of Show".

### Tasks
- [x] **3.4.1: PDF Contract Generator**
  - Build `src/lib/pdf/contract-generator.tsx` using `@react-pdf/renderer`.
  - Map gig terms (Venue, Band, Price, Date) into a legal template.
- [x] **3.4.2: Contract API**
  - Build `api/gigs/[id]/contract/route.ts` to stream the generated PDF.
- [x] **3.4.3: Payout Automation**
  - Implement `api/cron/payouts/route.ts` to trigger Stripe Transfers 24 hours after show completion.

### 🧪 Testing & Validation
- [x] **PDF Check:** Trigger a contract download and verify all gig details are correctly rendered in the PDF.
- [x] **Transfer Check:** Run the cron route manually in test mode and verify funds move from the Platform to the Band's connected account.

---

## 🏁 Phase 3 Completion Criteria
- [x] Full negotiation lifecycle (Offer -> Counter -> Accept) is functional.
- [x] Users can onboard to Stripe Connect.
- [x] Swipe-to-Book UI is polished and responsive.
- [x] Automated PDF contracts are generated for every confirmed gig.
- [x] Payouts are triggered automatically post-show.

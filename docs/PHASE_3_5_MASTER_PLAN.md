# Phase 3.5 Master Plan: Venue Marketplace & Dashboard Pivot

This document provides an extensive breakdown of all tasks in Phase 3.5. This phase pivots the Venue experience to a calendar-dominant, swipe-to-book marketplace.

---

## 🏗️ Plan 3.5.1: Venue-Specific Schema & Inventory
**Goal:** Expand the database to handle venue inventory (open dates) and the Agreement Vault.

### Tasks
- [x] **3.5.1.1: Database Schema Expansion (Supabase/Prisma)**
  - Add `open_dates` table to track venue inventory.
  - Add `venue_agreements` table (Vault) for AI Negotiator templates.
  - Update `engagements` to store `contract_url` and `payment_method`.
- [x] **3.5.1.2: Prisma Client Sync**
  - Update `schema.prisma` to reflect new tables.
  - Run `npx prisma generate`.

### 🧪 Testing & Validation
- [x] Run `npx prisma validate`.
- [x] Verify `open_dates` can be linked to a Venue profile.

---

## 📁 Plan 3.5.2: The Agreement Vault & Calendar Dashboard
**Goal:** Build the "Brain" of the Venue experience where they manage inventory and legal templates.

### Tasks
- [x] **3.5.2.1: Calendar-Dominant Dashboard UI**
  - Build `src/app/dashboard/venue/page.tsx`.
  - Implement a calendar view showing "Open", "Pending", and "Booked" dates.
- [x] **3.5.2.2: The Agreement Vault Component**
  - Build `src/components/venue/AgreementVault.tsx`.
  - Implement "Soft Text" input for clauses and Payout Structure (JSON).
  - Integrate PDF upload for existing contracts via UploadThing.
- [x] **3.5.2.3: "Past Shows" Section**
  - Build a section to display historical payout and attendance data.

### 🧪 Testing & Validation
- [x] **Vault Test:** Save a payout structure and verify it persists in the `venue_agreements` table.
- [x] **Inventory Test:** Add an "Open Date" via the calendar and verify it appears in the `open_dates` table.

---

## 🔍 Plan 3.5.3: The Submission Stack & Swipe Logic
**Goal:** Implement the "Tinder-style" deck for managing band submissions.

### Tasks
- [x] **3.5.3.1: Submission Stack UI**
  - Build `src/components/venue/SubmissionStack.tsx` using **Framer Motion**.
  - Create stacking card UI with Band Logo, Social Stats, and Past Performance badges.
- [x] **3.5.3.2: Swipe Server Action**
  - Implement `src/app/actions/venue-swipe.ts`.
  - Handle `right` (Confirm) and `left` (Pass) logic.
- [x] **3.5.3.3: Notification Sequence**
  - Integrate **Resend API** to trigger emails on preliminary confirmation.

### 🧪 Testing & Validation
- [x] **Swipe Test:** Swipe right on a card and verify the engagement status moves to `VENUE_CONFIRMED` (or `ACCEPTED`).
- [x] **Email Test:** Verify an email is sent to the band when a venue swipes right.

---

## 🔒 Plan 3.5.4: AI Negotiator Integration & Payout Logic
**Goal:** Connect the AI Negotiator to the Agreement Vault and finalize the 5% commission model.

### Tasks
- [x] **3.5.4.1: AI Negotiator "Brain" Update**
  - Update Gemini prompt logic to pull from `venue_agreements`.
  - Implement variable field injection (Time, Date, Location) based on `engagements`.
- [ ] **3.5.4.2: Dual Payment Logic**
  - **Option A (In-Person):** Implement Stripe billing for the 5% commission on the band's card.
  - **Option B (Platform):** Implement escrow logic (Total - 5% - $5 fee).
- [ ] **3.5.4.3: Document Pack Generation**
  - Auto-generate the full pack: Contract, I-9, Stage Plot, and Input List.

### 🧪 Testing & Validation
- [x] **AI Test:** Verify the drafted contract includes specific clauses from the Venue's Agreement Vault.
- [ ] **Fee Test:** Simulate a show completion and verify the 5% commission is correctly calculated/billed.

---

## 🏁 Phase 3.5 Completion Criteria
- [ ] Venues have a dedicated, calendar-dominant dashboard.
- [ ] Agreement Vault successfully feeds templates to the AI Negotiator.
- [ ] "Swipe-to-Book" interaction is functional and triggers notifications.
- [ ] 5% revenue model is implemented for both In-Person and Platform payments.

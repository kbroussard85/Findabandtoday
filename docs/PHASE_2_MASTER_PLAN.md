# Phase 2 Master Plan: Directory & Premium UX

This document provides an extensive breakdown of all tasks in Phase 2. Use this as a checklist to track progress and verify each step before proceeding to the next plan.

---

## 🏗️ Plan 2.1: Database Schema Expansion
**Goal:** Prepare the data layer for rich profiles, media, and subscriptions.

### Tasks
- [x] **2.1.1: Update Prisma Models**
  - Add `bio`, `media` (JSON), `availability` (JSON), and `negotiationPrefs` (JSON) to `Band` and `Venue` models.
  - Add `subscriptionStatus` and `stripeCustomerId` for revenue integration.
- [x] **2.1.2: Apply Migration**
  - Run `npx prisma migrate dev --name expand_profile_schema`.
  - Regenerate Prisma Client.

### 🧪 Testing & Validation
- [x] Run `npx prisma validate` to ensure schema integrity.
- [x] Run `npx prisma migrate status` to confirm the database is in sync.
- [x] Check `src/lib/prisma.ts` to ensure types are correctly updated.

---

## 📁 Plan 2.2: Profiles & Media Uploads
**Goal:** Implement the user-facing profile editor and cloud storage integration.

### Tasks
- [x] **2.2.1: Setup UploadThing**
  - Configure `src/app/api/uploadthing/core.ts` for `MP3` and `MP4` file types.
  - Set file size limits (e.g., 4MB for Audio, 16MB for Video).
- [x] **2.2.2: Profile Editor Page**
  - Build `src/app/profile/page.tsx`.
  - Implement form fields for Bio and Negotiation Preferences (Min Rate, Guarantee).
- [x] **2.2.3: Media Upload UI**
  - Integrate `<UploadDropzone>` for Drag-and-Drop uploads.
  - Save returned file URLs to the Prisma database.
- [x] **2.2.4: Availability Calendar Editor**
  - Integrate `react-day-picker`.
  - Allow users to multi-select "Unavailable" dates and save to DB.

### 🧪 Testing & Validation
- [x] **Upload Test:** Upload a sample MP3 and MP4; verify they appear in the UploadThing dashboard and the URL is saved to the local DB.
- [x] **Calendar Test:** Select 3 dates, save, refresh the page, and verify the dates remain selected.
- [x] **Form Test:** Change "Minimum Rate" from $200 to $500 and verify it persists in the database.

---

## 🔍 Plan 2.3: Discovery & Global Navigation
**Goal:** Build the public-facing directory and the app's primary navigation.

### Tasks
- [x] **2.3.1: Global Task Bar**
  - Build `src/components/layout/TaskBar.tsx` (Fixed position, mobile-first design).
  - Links: `Search`, `Discover`, `Profile`, `About`.
- [x] **2.3.2: Upgraded Discovery API**
  - Update `api/discovery/route.ts` to fetch new profile data (media, bio).
- [x] **2.3.3: Interactive Media Cards**
  - Add `<video>` and `<audio>` players to `ArtistCard`.
  - **Auto-Pause Logic:** Implement `useEffect` to pause media after 15 seconds.

### 🧪 Testing & Validation
- [x] **Nav Test:** Click every link on the Task Bar and verify correct routing.
- [x] **Autoplay Test:** Open the Discovery grid; verify media starts (if possible) and **stops** exactly at the 15-second mark.
- [x] **Radius Test:** Move the radius slider from 5 to 50 miles and verify the grid updates with new results.

---

## 🔒 Plan 2.4: Revenue & Premium Gating
**Goal:** Integrate Stripe and implement the "Blurred UI" security pattern.

### Tasks
- [x] **2.4.1: Stripe Checkout Integration**
  - Implement `api/checkout/route.ts` to create sessions for "Artist Biz" and "Venue Command" tiers.
- [x] **2.4.2: Webhook Sync**
  - Build `api/webhooks/stripe/route.ts` to toggle `isPaid` on successful payment.
- [x] **2.4.3: Blurred UI Security**
  - Apply CSS blur to sensitive fields in `ArtistCard`.
  - **API Gating:** Update `api/discovery/route.ts` to nullify `contact` and `calendar` fields in the JSON response if `requestingUser.isPaid === false`.

### 🧪 Testing & Validation
- [x] **Free User Check:** Log in with a non-paid account. Verify that DevTools cannot reveal blurred info because the data is null in the API response.
- [x] **Stripe Test:** Use Stripe Test Card `4242...` to complete a purchase. Verify the UI immediately un-blurs.
- [x] **Tier Test:** Ensure "Band" users can only see Band-specific subscription options.

---

## 🏁 Phase 2 Completion Criteria
- [x] Users can upload media and set availability.
- [x] Discovery grid works with live media and radius searching.
- [x] Navigation is persistent across the app.
- [x] Premium content is successfully secured behind the paywall.

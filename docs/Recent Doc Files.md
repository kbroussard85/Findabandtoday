## **Part 1: The Project Brief & Strategy**

**File: `01_PROJECT_BRIEF.md`**

### **The Vision**

To disrupt the archaic manual booking process by providing an **Automated AI Talent Agency**. The platform serves as a high-fidelity bridge between two distinct user types, handling the "Boring Logistics" (Contracts, Tax, Payments) so they can focus on "Live Music."

### **The Core Slices**

1. **Identity & Security:** Zero-knowledge Auth0 integration.  
2. **Geospatial Engine:** 5–500 mile radius matching (PostGIS).  
3. **Revenue & Paywall:** Freemium "Tease" model with Stripe-gated "Pro" features.  
4. **Transaction Engine:** Automated I-9s, Contracts, and Day-of-Show (DOS) Payouts.  
5. **The Maximizer AI:** Priority ranking and auto-negotiation agents.

---

## **Part 2: UI/UX Specification (The "LiveNation" Aesthetic)**

**File: `02_UX_SPEC.md`**

### **Visual Language**

* **Base:** Dark Mode (`#000000`).  
* **Accents:** Electric Purple (`#A855F7`) for Bands, Deep Sea Blue (`#3B82F6`) for Venues.  
* **Typography:** Bold, Italicized, All-caps headers (Inter Tight) for a high-octane "Concert Poster" feel.

### **User Flows**

1. **Split Entry:** A 50/50 vertical split landing page.  
2. **The Onboarding Wizard:** Low-friction data collection with "Skip" options to get users into the "Tease" directory immediately.  
3. **The Discovery Grid:** Card-based layout with a 15-second "Auto-Play" audio snippet and blurred "Contact/Full Calendar" fields for non-subscribers.  
4. **The Swipe-to-Book:** A mobile-optimized Tinder-style card deck for Venues to quickly vet and "Match" with bands.

---

## **Part 3: Data Architecture (The "Brick" Schema)**

**File: `03_DATABASE_SCHEMA.md`**

We use **Prisma** with **PostgreSQL** and **PostGIS**. This allows for complex geospatial math required for tour routing.

Code snippet  
// schema.prisma

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
}

generator client {  
  provider \= "prisma-client-js"  
}

enum UserRole {  
  BAND  
  VENUE  
}

model User {  
  id               String    @id @default(cuid())  
  auth0Id          String    @unique  
  email            String    @unique  
  role             UserRole  
  stripeCustomerId String?   @unique  
  isPaid           Boolean   @default(false)  
  subscriptionTier String?   // "ARTIST\_BIZ", "VENUE\_COMMAND", "MAXIMIZER"  
  createdAt        DateTime  @default(now())

  bandProfile      Band?  
  venueProfile     Venue?  
}

model Band {  
  id               String   @id @default(cuid())  
  userId           String   @unique  
  user             User     @relation(fields: \[userId\], references: \[id\])  
  name             String  
  lat              Float?  
  lng              Float?  
  searchRadius     Int      @default(50) // 5 to 500 miles  
  audioUrlPreview  String?  // 15s snippet  
  audioUrlFull     String?  // Gated behind isPaid  
  taxStatus        Boolean  @default(false) // Verified I-9  
  gigs             Gig\[\]  
}

model Venue {  
  id               String   @id @default(cuid())  
  userId           String   @unique  
  user             User     @relation(fields: \[userId\], references: \[id\])  
  name             String  
  lat              Float?  
  lng              Float?  
  capacity         Int?  
  gigs             Gig\[\]  
}

model Gig {  
  id             String    @id @default(cuid())  
  status         String    @default("PENDING") // PENDING, DEPOSIT\_HELD, COMPLETED  
  payout         Float  
  contractUrl    String?   // AI-Generated PDF Link  
  bandId         String  
  band           Band      @relation(fields: \[bandId\], references: \[id\])  
  venueId        String  
  venue          Venue     @relation(fields: \[venueId\], references: \[id\])  
}

---

## **Part 4: API & Logic Workflows**

**File: `04_LOGIC_WORKFLOWS.md`**

### **Slice: Radius Matchmaking (The IOTM Search)**

When a Venue searches for talent, the backend executes a PostGIS query to find all Bands whose `searchRadius` covers the Venue's `lat/lng`.

### **Slice: The AI Liaison (Agentic Action)**

1. **Trigger:** Venue swipes "Right" on a Band.  
2. **Action:** AI triggers a webhook to `lib/ai-liaison.ts`.  
3. **Prompt:** "Draft a booking offer for \[Band\] at \[Venue\] for \[Date\]. Terms: $\[Amount\] \+ $\[Split\]. Ensure tech rider for \[Stage Plot\] is attached."  
4. **Result:** Automated email sent via SendGrid/Resend with a "Confirm Booking" link that leads to the Paywall.

---

## **Part 5: Security & Compliance**

**File: `05_SECURITY_COMPLIANCE.md`**

### **The Zero-Trust Policy**

* **PII:** All Personal Identifiable Information is managed by **Auth0**. We store only the `auth0_id`.  
* **Payments:** All card data is managed by **Stripe**. We store only `stripe_customer_id` and `subscription_active` status.  
* **Compliance:** The system uses `react-pdf` to auto-generate I-9 tax forms and performance contracts. These are stored in a private S3 bucket with signed-URL access only.

---

## **Part 6: Deployment & Build Steps (Antigravity Config)**

**File: `06_BUILD_INSTRUCTIONS.md`**

To build this "Brick-by-Brick," the Gemini CLI must follow this sequence:

1. **Slice 0 (Foundation):** Setup Next.js, Tailwind, and Prisma. Configure `.gitignore` to protect keys.  
2. **Slice 1 (Identity):** Hook up Auth0. Test that "Band" vs "Venue" roles are correctly tagged in the DB.  
3. **Slice 2 (Discovery UI):** Build the Landing Page and the "Tease" Grid. Verify the 15s audio player works.  
4. **Slice 3 (Radius Logic):** Implement the `ST_DWithin` PostGIS query. Back-test with seed data (Nashville/Franklin match).  
5. **Slice 4 (Revenue):** Implement Stripe Webhooks. Verify that payment toggles `isPaid` and "Unlocks" the blurred UI.  
6. **Slice 5 (Compliance):** Build the AI Liaison prompt and PDF generator. Test a "Match" to "Contract" flow.


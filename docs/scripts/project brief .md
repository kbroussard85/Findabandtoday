### **1\. Comprehensive Project Brief (PROJECT\_BRIEF\_V2.md)**

**The Strategic Vision & Market Positioning**

* **Platform Identity:** A high-frequency booking engine that utilizes "Asynchronous Negotiation." Unlike IOTM, which is a static directory, this is a **transactional ecosystem**.  
* **The Problem:** Currently, booking a 10-city tour takes 40+ hours of emailing, manual contract signing, and chasing W-9s.  
* **The Solution:** Our "Match-to-Contract" pipeline. A Venue posts a "Date Hole"; the system alerts all Bands within the set radius whose "Calendar Slots" match and who meet the "Genre/Technical" requirements.  
* **Monetization Matrix:**  
  * **The Base:** Recurring SaaS revenue (Sustainment).  
  * **The Friction:** 5% "Trust Fee" (Transaction).  
  * **The Speed:** $29.99 Maximizer (Priority Ranking in Venue Swipe Decks).  
  * **The Service:** $229 Human-in-the-loop Tour Coordination (High Ticket).

---

### **2\. Deep-Dive PRD (PRD\_DETAILED.md)**

**Technical & Functional Requirements (The "How-To")**

#### **Core Feature: The "Smart-Swipe" Algorithm**

* **Logic:** When a Venue views the "Submission Deck," bands are ranked:  
  1. **Paid "Maximizer" Bands** (Always top of stack).  
  2. **Radius Proximity** (Closest bands ranked higher to minimize travel risk).  
  3. **Reliability Score** (Bands with 0 cancellations ranked highest).

#### **Core Feature: The AI Liaison (Agentic Workflow)**

* **Trigger:** Venue swipes "Right."  
* **Action:** \* AI fetches the Venue's backline\_info and the Band's stage\_plot.  
  * AI checks for "Deal Breakers" (e.g., Band needs 4 mics, Venue only has 2).  
  * AI drafts a "Pre-filled Negotiation" email: *"Hey \[Band\], \[Venue\] likes your vibe. They offer a $300 Guarantee \+ 20% Door. Here is the contract link."*

#### **Core Feature: The Compliance Vault**

* **Document Generation:** Using a library like react-pdf or an API like DocuSign, the system creates a dynamic PDF.  
* **Storage:** Stored in an S3 Bucket with restricted access. Links are only visible to the two parties and the Admin.

---

### **3\. UI/UX Specification (UX\_SPEC\_EXTENDED.md)**

**Component-Level Design Standards**

* **Color Palette:**  
  * **Pure Black:** \#000000 (Main Background).  
  * **Electric Purple:** \#A855F7 (Band UI Primary).  
  * **Deep Sea Blue:** \#3B82F6 (Venue UI Primary).  
  * **Danger Red:** \#EF4444 (Cancellation alerts/Log-out).  
* **Typography:** \* **Headlines:** *Inter Tight* or *Archivo Black* — Heavy weight, all-caps, italicized (The LiveNation "Heavy" feel).  
  * **Body:** *Geist Sans* or *Roboto Mono* — Technical, readable, high-contrast.  
* **The "Tease" Component Logic:**  
  * **Blur Filter:** backdrop-blur-xl applied to any div containing "Contact Email" or "Venue Phone Number" for non-paid users.  
  * **The "Unlock" Overlay:** A center-aligned modal with a "Upgrade to Pro to Contact" button.

---

### **4\. System Architecture (SYSTEM\_ARCH\_V2.md)**

**The Infrastructure & API Mapping**

#### **The Database Layer (PostgreSQL/PostGIS)**

* **Geospatial Query:**  
  $$ST\\\_DWithin(geography(ST\\\_MakePoint(band\\\_lng, band\\\_lat)), geography(ST\\\_MakePoint(venue\\\_lng, venue\\\_lat)), radius\\\_in\\\_meters)$$  
* **Schema Indexing:** Indices on auth0Id, stripeCustomerId, and a GIST index on the geospatial location column.

#### **The API Surface (Endpoints)**

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/onboarding | Updates user metadata and triggers first-time DB entry. |
| GET | /api/matches | Returns "Smart-Ranked" list of gigs/bands within radius. |
| POST | /api/booking/initiate | Triggers the AI Liaison and holds the 5% deposit in Stripe Escrow. |
| PATCH | /api/booking/payout | Releases funds to Band Connect account upon "Gig Completion" check-in. |

---

### **5\. Full Project File Tree (GitHub Ready)**

Plaintext  
/root  
├── /app  
│   ├── /dashboard  
│   │   ├── /band             \# Artist-specific views (Radius settings, EPK)  
│   │   └── /venue            \# Venue-specific views (Swipe deck, calendar)  
│   ├── /pro                  \# Gated routes (Paywall middleware protected)  
│   └── /legal                \# Terms of Service & Cancellation Policies  
├── /hooks  
│   ├── useAudioPlayer.ts     \# Handles 15s preview logic  
│   └── useStripeSubscription.ts \# Real-time check of payment status  
├── /lib  
│   ├── /ai  
│   │   └── openai-client.ts  \# Handles Liaison prompt engineering  
│   └── /stripe  
│       └── connect-logic.ts  \# Handles the 5% split & DOS payouts  
├── /tests  
│   ├── /integration          \# Testing the Stripe \-\> DB handshake  
│   └── /e2e                  \# Testing the "Swipe" to "Email" flow  
├── next.config.js  
├── tailwind.config.js  
└── docker-compose.yml        \# For local Postgres/PostGIS dev

**John (PM):** This is the high-resolution version, Reid. We have specified the **SQL math**, the **Tailwind hex codes**, and the **State Management** for the paywall.


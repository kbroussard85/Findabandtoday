# Phase 4 Master Plan: Agentic Negotiation

This document outlines the development of the AI-driven negotiation agents for the FABT platform.

## 🏗️ Plan 4.1: AI Liaison Foundation
**Goal:** Establish the base AI infrastructure and implement the Liaison agent for initial booking drafts.

### Tasks
- [x] **4.1.1: Environment & SDK Setup**
  - Add `OPENAI_API_KEY` to `.env`.
  - Create `src/lib/ai/client.ts` for LangChain/OpenAI initialization.
- [x] **4.1.2: AI Liaison Core Logic**
  - Build `src/lib/ai/agents/liaison.ts`.
  - Implement prompt engineering to draft professional booking offers based on Band/Venue profiles.
- [x] **4.1.3: Outreach API**
  - Build `api/ai/outreach/route.ts` to trigger the Liaison agent.
  - Integrate with the existing `Gig` model to save drafted offers.

### 🧪 Testing & Validation
- [ ] **Prompt Test:** Verify the agent produces professional, context-aware messages for both Bands and Venues.
- [ ] **Integration Test:** Trigger the outreach API and verify a new `Gig` in `DRAFT` status is created with the AI-generated message.

---

## 🏗️ Plan 4.2: Multi-Agent Negotiation (LangGraph)
**Goal:** Implement the stateful negotiation flow between "The Agent" (Band side) and "The Booker" (Venue side).

### Tasks
- [x] **4.2.1: LangGraph State Definition**
  - Define the negotiation state (Amount, Date, Status, History) in `src/lib/ai/negotiation/graph.ts`.
- [x] **4.2.2: Negotiation Nodes**
  - Build nodes for `Propose`, `Evaluate`, `Counter-Offer`, and `Finalize`.
- [x] **4.2.3: Logic Hooks**
  - Integrate the negotiation graph with `runNegotiationSession` in `src/lib/ai/negotiation/runner.ts`.

### 🧪 Testing & Validation
- [ ] **Graph Test:** Run a mock negotiation session and verify it terminates in either `ACCEPTED` or `REJECTED` state.
- [ ] **Compliance Test:** Ensure the AI never agrees to terms below a user's defined `minRate` in `negotiationPrefs`.

---

## 🏗️ Plan 4.3: "The Maximizer" Tour Optimizer
**Goal:** Deploy an agent that analyzes geographic data and availability to suggest optimal bookings.

### Tasks
- [x] **4.3.1: Geospatial Analysis Node**
  - Implement logic to fetch nearby opportunities within the `searchRadius` using PostGIS.
- [x] **4.3.2: Ranking Agent**
  - Build `src/lib/ai/agents/maximizer.ts` to rank opportunities by pay, distance, and historical success.
- [x] **4.3.3: Suggestion Dashboard**
  - Update `src/app/directory/page.tsx` to display "AI Top Picks" for the user.

### 🧪 Testing & Validation
- [ ] **Routing Test:** Verify the Maximizer suggests a route that minimizes travel time between consecutive gig dates.
- [ ] **Matching Test:** Ensure suggestions respect the user's `availability` and `negotiationPrefs`.

---

## 🏁 Phase 4 Completion Criteria
- [ ] AI Liaison can autonomously draft and send booking offers.
- [ ] LangGraph negotiation engine handles multi-turn price/date discussions.
- [ ] "The Maximizer" provides high-quality, geographically optimized gig suggestions.
- [ ] All AI actions are logged and auditable in the database.

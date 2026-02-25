# Project: FABT (Automated AI Talent Agency)

## Core Vision
To disrupt the manual booking process by providing an **Automated AI Talent Agency**. The platform handles the "Boring Logistics" (Contracts, Tax, Payments) using AI and Geospatial matching.

## Technical Stack
- **Frontend:** Next.js (TypeScript), Vanilla CSS
- **Database:** PostgreSQL + PostGIS
- **ORM:** Prisma
- **Auth:** Auth0 (Zero-Knowledge / Blinded Identity)
- **Payments:** Stripe Connect
- **AI:** OpenAI (GPT-4o-mini / o1) / LangGraph
- **Documents:** `react-pdf` for Contracts and I-9 forms.

## Key Features
- **50/50 Split Landing Page:** Clear entry point for Bands and Venues.
- **Geospatial Discovery:** Match talent based on proximity using PostGIS.
- **Automated AI Negotiation:** AI-driven "liaison" for booking and terms.
- **Zero-Knowledge Auth:** Secure identity management with minimal PII persistence.
- **Automated Compliance:** PDF generation for I-9s and contracts.

## Current Phase: Phase 1 (Identity & Geo-Foundation)
- Next.js scaffolding: **Complete**
- Prisma Schema: **Complete**
- Auth0 Integration: **Initial Structure Complete**
- Landing Page & Onboarding UI: **Initial Structure Complete**
- Auth0 Sync Logic: **Initial Structure Complete**
- Database Migration: **To be performed**
- Local PostGIS setup: **Pending Verification**

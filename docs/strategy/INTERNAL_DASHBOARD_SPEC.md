# FABT Internal Dashboard & Liquidity Spec

## Overview
An internal-only dashboard (`/admin/*`) used for platform management, cold-start scraping, and team collaboration.

## 1. Liquidity Engine (Crawl4AI Integration)
To solve the "Empty Stage" problem, we will seed the directory with "Unclaimed Profiles."
*   **The Tech:** Integration with **Crawl4AI** to scrape venue data from Google Maps, Yelp, and local music blogs.
*   **Workflow:**
    1.  Admin enters a city (e.g., "Austin, TX").
    2.  Crawl4AI fetches venue names, addresses, and tech specs.
    3.  System creates "Shadow Profiles" in the DB.
    4.  Bands can "Pitch" to these venues via FABT; FABT sends a cold email to the venue owner saying "A band wants to book you on FABT. Claim your profile to see the rider."

## 2. Dashboard Modules

### A. Development & Kanban
*   **GitHub Sync:** Tightly coupled integration with the FABT repository.
*   **Features:** Real-time view of `In Progress` vs `Done` issues, pull request status, and build health.

### B. Content & Marketing
*   **Content Calendar:** Internal scheduler for social media posts (Instagram/TikTok).
*   **Metric Monitoring:** Tracking referral link performance (which bands are bringing in the most venues?).

### C. Observability & SRE (PostHog Integration)
*   **User Funnels:** Where do artists drop off? (e.g., "Started EPK -> Never Applied").
*   **Reliability:** Real-time monitoring of Stripe Webhook failures and Upstash Workflow errors.
*   **Heatmaps:** Understanding how venues interact with the "Swipe to Book" interface.

### D. Revenue & KPI Tracker
*   **GMV (Gross Marketplace Volume):** Total dollar amount of gigs booked.
*   **Take Rate:** Net revenue after Stripe fees.
*   **Liquidity Ratio:** Ratio of active bands to active venues in a specific geographic radius.

## 3. Collaboration Tools
*   **Async Notes:** Internal "Pinned Comments" on specific venue or artist profiles for the team to coordinate outreach.

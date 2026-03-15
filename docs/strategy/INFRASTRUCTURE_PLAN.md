# FABT Infrastructure & Capacity Plan

## "Zero-Cost" Stack Assumptions
Targeting maximum scale within free quotas to preserve runway during early development.

| Provider | Service | Free Quota | Capacity Estimate |
| :--- | :--- | :--- | :--- |
| **Oracle Cloud** | Compute | 4 ARM Ampere / 24GB RAM | ~50,000 MAU (optimized). |
| **Supabase** | DB/Auth | 500MB DB / 5GB Bandwidth | ~5,000-10,000 user profiles. |
| **Auth0** | Identity | 7,500 Monthly Active Users | **Current Bottleneck: 7,500.** |
| **Vercel** | Hosting | 100GB Bandwidth / Serverless | ~10,000-20,000 visitors. |

## Scaling Milestones
1.  **The "Hobby" Phase (< 5,000 Users):** Total TOC = **$0/mo** (excluding domains/LLM tokens).
2.  **The "Startup" Phase (5k - 20k Users):** Estimated TOC = **$150/mo** (Vercel Pro + Supabase Pro).
3.  **The "Growth" Phase (20k+ Users):** Estimated TOC = **$500+/mo** (Usage-based pricing kicks in).

## Recommendations
*   **Thin Compute:** Move as much logic as possible to the **Edge Runtime** on Vercel to minimize "Active CPU Time" billing.
*   **Cache Aggressively:** Use Upstash Redis (Free Tier) to cache directory searches and avoid expensive database hits.

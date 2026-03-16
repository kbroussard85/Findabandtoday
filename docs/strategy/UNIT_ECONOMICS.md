# FABT Marketplace Unit Economics

## Transactional Breakdown
Example: A **$1,000 Gig Booking** processed through FABT.

| Component | Amount | Logic |
| :--- | :--- | :--- |
| **Venue Total** | **$1,050.00** | $1,000 Gig + 5% Trust Fee. |
| **Artist Payout** | **$950.00** | $1,000 Gig - 5% Platform Fee. |
| **FABT Gross Revenue** | **$100.00** | The delta between the two fees. |

## Direct Transactional Costs (COGS)
| Item | Cost | Note |
| :--- | :--- | :--- |
| **Stripe Processing** | $30.75 | 2.9% + $0.30 on incoming $1,050. |
| **KYC/Verification** | $0.50 | Identity check amortized over 6 gigs. |
| **1099 Issuance** | $0.40 | Annual tax filing cost amortized over 10 gigs. |
| **Connect Fee** | $0.00 | Assuming Stripe Connect **Standard** accounts. |
| **Total Direct Cost** | **$31.65** | |

## Net Contribution Margin
*   **Net Profit per Gig:** **$68.35**
*   **Contribution Margin:** **68%**

## Subscription Revenue
Monthly subscriptions (Artist/Venue) are treated as **High-Margin Gross Profit (90%+)** used to cover fixed costs (Vercel, Auth0, Database).

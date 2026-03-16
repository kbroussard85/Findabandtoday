# FABT Fintech & Payout Architecture

## Core Decision: Stripe Connect Standard
We use **Stripe Connect Standard** rather than Express to eliminate the $2/mo per user fee and minimize legal liability as a money transmitter.

## The "Escrow" Logic (24-Hour Hold)
To protect venues from no-shows and artists from chargebacks, we implement a 24-hour payout hold after every gig.

### Technical Stack
*   **Payments:** Stripe Connect.
*   **Orchestrator:** **Upstash Workflow.**
*   **Runtime:** Next.js Serverless Functions.

### The Workflow Pattern
1.  **Booking Confirmed:** Venue pays; money enters FABT platform account.
2.  **Trigger Workflow:** FABT sends event to Upstash: `booking.completed`.
3.  **The Wait:** Upstash Workflow executes a `sleep` until `gig_end_time + 24 hours`.
4.  **Dispute Check:** Workflow queries the database: `is_disputed?`
5.  **The Payout:** If no dispute, Workflow triggers the `stripe.transfers.create` call to move funds to the Artist's account.

## Idempotency & Safety
*   Every payout call MUST include a `booking_id` as the **Stripe Idempotency Key** to prevent double-paying an artist in case of network retries.
*   The system uses **Webhooks** to listen for `account.updated` to ensure artists have completed their KYC (identity verification) before we allow a booking to start.

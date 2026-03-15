# FABT Booking & Fintech Schema Expansion

## Overview
To transition from a directory to a marketplace, the database must move from a "State of the User" model to a "State of the Transaction" model.

## 1. Booking State Machine
Every booking must follow a strict, immutable state machine to ensure financial auditability.

| State | Trigger | Action |
| :--- | :--- | :--- |
| `DRAFT` | Artist applies / Venue invites | No financial lock. |
| `PENDING_PAYMENT` | Venue clicks "Book" | Stripe Checkout Session created. |
| `PAID_ESCROW` | Stripe Webhook: `checkout.session.completed` | Funds held by Stripe; Upstash Workflow triggered. |
| `GIG_ACTIVE` | Current Time == Gig Time | Monitoring for real-time issues. |
| `POST_GIG_HOLD` | Gig End Time + 1 min | 24-hour dispute window starts. |
| `PAYOUT_PENDING` | Window closed + No Dispute | Payout logic triggered via Upstash. |
| `COMPLETED` | Stripe Webhook: `transfer.created` | Artist paid; FABT fee realized. |
| `DISPUTED` | Venue clicks "Open Dispute" | Payout halted; manual review required. |
| `REFUNDED` | Admin/Policy trigger | Funds returned to Venue via Stripe. |

## 2. New Database Tables (Suggested)

### `bookings`
*   `id`: UUID
*   `artist_id`: FK -> users
*   `venue_id`: FK -> venues
*   `status`: enum (states above)
*   `gig_total_cents`: int
*   `platform_fee_cents`: int
*   `trust_fee_cents`: int
*   `stripe_payment_intent_id`: string
*   `scheduled_payout_at`: timestamp

### `financial_logs`
*   *Purpose: Ledger-style tracking for every cent to prevent balance errors.*
*   `id`: UUID
*   `booking_id`: FK -> bookings
*   `type`: enum (CREDIT, DEBIT)
*   `amount`: int
*   `description`: string (e.g., "Stripe Processing Fee")

## 3. Implementation Guardrails
*   **Soft Deletes:** Never delete a booking record once it hits `PAID_ESCROW`. 
*   **Atomic Transactions:** Use database transactions (e.g., Prisma `$transaction`) when updating booking status and logging financial movement.

# Part 4: API & Logic Workflows

## Slice: Radius Matchmaking (The IOTM Search)
When a Venue searches for talent, the backend executes a PostGIS query to find all Bands whose `searchRadius` covers the Venue's `lat/lng`.

## Slice: The AI Liaison (Agentic Action)
1. **Trigger:** Venue swipes "Right" on a Band.  
2. **Action:** AI triggers a webhook to `lib/ai-liaison.ts`.  
3. **Prompt:** "Draft a booking offer for [Band] at [Venue] for [Date]. Terms: $[Amount] + $[Split]. Ensure tech rider for [Stage Plot] is attached."  
4. **Result:** Automated email sent via SendGrid/Resend with a "Confirm Booking" link that leads to the Paywall.

# Part 6: Deployment & Build Steps (Antigravity Config)

To build this "Brick-by-Brick," the Gemini CLI must follow this sequence:

1. **Slice 0 (Foundation):** Setup Next.js, Tailwind, and Prisma. Configure `.gitignore` to protect keys.  
2. **Slice 1 (Identity):** Hook up Auth0. Test that "Band" vs "Venue" roles are correctly tagged in the DB.  
3. **Slice 2 (Discovery UI):** Build the Landing Page and the "Tease" Grid. Verify the 15s audio player works.  
4. **Slice 3 (Radius Logic):** Implement the `ST_DWithin` PostGIS query. Back-test with seed data (Nashville/Franklin match).  
5. **Slice 4 (Revenue):** Implement Stripe Webhooks. Verify that payment toggles `isPaid` and "Unlocks" the blurred UI.  
6. **Slice 5 (Compliance):** Build the AI Liaison prompt and PDF generator. Test a "Match" to "Contract" flow.

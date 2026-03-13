This is the "Vault." By implementing **Stripe Escrow and Authorization logic**, we ensure FABT stays legally compliant while securing the gas money for the band. We are using **Stripe Payment Intents** with `capture_method: 'manual'`. This allows us to "hold" the $50 or the 5% fee on the Venue's card when the band submits an offer, and only "capture" it once the Venue hits **Accept**.

Below is the technical `.md` file for the backend logic.

---

## **Document: Stripe Escrow & Fee Logic**

**File: `08_STRIPE_ESCROW_LOGIC.md`**

### **1\. The Logic Flow**

1. **Authorization (The Hold):** When a Band/Venue initiates a "Let's Book," we create a Payment Intent. We do not charge the card yet; we verify the funds exist and place a 7-day hold.  
2. **Acceptance (The Capture):** When the second party accepts the offer, the `capture` command is sent.  
3. **Cancellation (The Release):** If the offer is declined or expires, the hold is released automatically.  
4. **Payout (The Split):** For digital payouts, funds move to the **Stripe Connect** account of the Band, minus the platform fee.

---

### **2\. Technical Implementation (`lib/stripe/escrow.ts`)**

TypeScript  
import Stripe from 'stripe';  
import prisma from '../prisma';

const stripe \= new Stripe(process.env.STRIPE\_SECRET\_KEY\!, { apiVersion: '2023-10-16' });

/\*\*  
 \* STEP 1: INITIALIZE ESCROW (THE HOLD)  
 \* Triggered when a Band/Venue clicks "Submit Offer"  
 \*/  
export async function initializeBookingHold(gigId: string, amount: number) {  
  const gig \= await prisma.gig.findUnique({ where: { id: gigId }, include: { venue: { include: { user: true } } } });

  // Calculate Fee: $50 Flat or 5% of Guarantee (whichever the logic dictates)  
  const feeAmount \= amount \>= 1000 ? amount \* 0.05 : 50; 

  const paymentIntent \= await stripe.paymentIntents.create({  
    amount: Math.round(feeAmount \* 100), // Stripe uses cents  
    currency: 'usd',  
    customer: gig.venue.user.stripeCustomerId,  
    capture\_method: 'manual', // THIS IS THE ESCROW HOLD  
    metadata: { gigId: gigId, type: 'BOOKING\_DEPOSIT' },  
  });

  // Store the Intent ID in our DB to capture it later  
  await prisma.gig.update({  
    where: { id: gigId },  
    data: { stripePaymentIntentId: paymentIntent.id, status: 'ESCROW\_HOLD' }  
  });

  return paymentIntent.client\_secret;  
}

/\*\*  
 \* STEP 2: CAPTURE ESCROW (THE DEAL IS DONE)  
 \* Triggered when the Venue clicks "Accept"  
 \*/  
export async function captureBookingFee(gigId: string) {  
  const gig \= await prisma.gig.findUnique({ where: { id: gigId } });

  if (\!gig?.stripePaymentIntentId) throw new Error("No payment intent found.");

  const intent \= await stripe.paymentIntents.capture(gig.stripePaymentIntentId);

  await prisma.gig.update({  
    where: { id: gigId },  
    data: { status: 'CONFIRMED', depositPaid: true }  
  });

  return intent;  
}

/\*\*  
 \* STEP 3: RELEASE HOLD (THE DEAL FAILED)  
 \* Triggered if the offer is declined or expires  
 \*/  
export async function releaseBookingHold(gigId: string) {  
  const gig \= await prisma.gig.findUnique({ where: { id: gigId } });

  if (gig?.stripePaymentIntentId) {  
    await stripe.paymentIntents.cancel(gig.stripePaymentIntentId);  
    await prisma.gig.update({  
      where: { id: gigId },  
      data: { status: 'CANCELLED' }  
    });  
  }  
}

---

### **3\. Database Schema Updates**

**Winston:** We need these fields to track the Stripe transaction state within our Prisma models.

Code snippet  
// Extension to model Gig  
model Gig {  
  // ... existing fields  
  stripePaymentIntentId String?  @unique // The "Hold" ID  
  depositPaid           Boolean  @default(false)  
  payoutStatus          PayoutStatus @default(NOT\_APPLICABLE)  
    
  // Timestamps for Escrow Expiry  
  holdExpiresAt         DateTime?  
}

enum PayoutStatus {  
  NOT\_APPLICABLE  
  HELD\_IN\_ESCROW  
  RELEASED\_TO\_BAND  
  REFUNDED\_TO\_VENUE  
}

---

### **4\. Automated DOS Compliance Workflow**

For "Cash Day of Show" deals, the $50 fee captured by FABT serves as a **Performance Guarantee**.

* **Proof of Show:** If the Band checks in via GPS on the app at the venue location, the "Escrow" state moves to `COMPLETED`.  
* **No-Show Dispute:** If the Venue flags a "No-Show," the AI Liaison triggers an automated dispute process, holding the $50 for manual review or as a penalty fee.

---

### **5\. Antigravity Back-Test Plan**

1. **Simulate Hold:** Call `initializeBookingHold` and verify the Stripe Dashboard shows a "Succeeded \- Uncaptured" status.  
2. **Simulate Timeout:** Set a 24-hour expiry and verify the `releaseBookingHold` triggers if the second party doesn't sign.  
3. **Simulate Capture:** Call `captureBookingFee` and verify the funds move from "Uncaptured" to "Succeeded" in Stripe.

**John (PM):** This brick is ready for implementation. It ensures the platform gets paid and the bookings are legally and financially binding.


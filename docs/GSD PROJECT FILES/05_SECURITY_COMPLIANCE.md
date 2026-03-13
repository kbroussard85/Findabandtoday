# Part 5: Security & Compliance

## The Zero-Trust Policy
* **PII:** All Personal Identifiable Information is managed by **Auth0**. We store only the `auth0_id`.  
* **Payments:** All card data is managed by **Stripe**. We store only `stripe_customer_id` and `subscription_active` status.  
* **Compliance:** The system uses `react-pdf` to auto-generate I-9 tax forms and performance contracts. These are stored in a private S3 bucket with signed-URL access only.

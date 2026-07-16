# CX AI-Proficiency Build Round - V1 Spec

**Applicant Information:**
- **Name:** harsh kumar
- **Email:** hk6009@srmist.edu.in
- **Roll No:** RA2311027010065

## 1. Merchant Record Shape
The merchant record simulates a B2B SaaS platform customer. 

**Data Schema:**
- `id`: (String) Unique identifier for the merchant.
- `name`: (String) Merchant company name.
- `planTier`: (String) "Basic", "Pro", or "Enterprise".
- `signupDate`: (Date String) Date the merchant joined.
- `lastLoginDate`: (Date String) The last time an admin logged in.
- `supportTicketsOpen`: (Integer) Number of unresolved support tickets.
- `paymentDeclined`: (Boolean) True if the latest invoice payment failed.
- `usageDropPercentage`: (Float) Percentage drop in core API/platform usage over the last 30 days compared to the prior 30 days.

## 2. Churn Signals
I have identified the following signals as indicators of churn risk:

1. **Payment Declined (Involuntary Churn):** If a payment fails and the merchant hasn't updated their billing information, they will be automatically churned when the grace period expires. This is the highest priority risk.
2. **Usage Drop Percentage (Disengagement):** A significant drop (> 30%) in platform usage indicates the merchant is no longer deriving value from the product, usually a precursor to cancellation.
3. **High Open Support Tickets (Frustration):** Having > 3 open support tickets indicates technical blockers or poor UX, leading to dissatisfaction and eventual churn.
4. **Stale Login (Stagnation):** If the merchant hasn't logged in for over 14 days, they are an "at-risk" account due to lack of engagement, especially on higher-tier plans.

## 3. Data Persistence
Given no historical data or dataset is provided and no backend is required by the prompt, the merchant data will be generated and persisted entirely **in-memory** within the frontend application using a JavaScript array (`script.js`). The data simulates a fetch from a REST API endpoint.

## 4. Recommended Next Steps Logic
The dashboard evaluates each merchant's data and recommends exactly one "Next Step" based on the most critical signal present:

- **If `paymentDeclined` is true:** 
  *Recommendation:* "Send automated billing reminder & link to update payment method." (High Priority)
- **Else if `usageDropPercentage` > 30:** 
  *Recommendation:* "Schedule a Customer Success check-in to discuss feature adoption." (Medium Priority)
- **Else if `supportTicketsOpen` > 3:** 
  *Recommendation:* "Escalate open tickets to Tier 2 support immediately." (Medium Priority)
- **Else if `lastLoginDate` > 14 days ago:**
  *Recommendation:* "Send re-engagement email campaign highlighting new features." (Low Priority)
- **Else:**
  *Recommendation:* "Monitor." (Healthy Account)

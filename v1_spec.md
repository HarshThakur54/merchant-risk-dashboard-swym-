# V1 Spec Doc: Merchant Churn Risk Dashboard

## 1. Problem Statement
We need a dashboard to identify merchants at risk of churning from our platform and to provide actionable next steps for the Customer Success (CS) team to retain them.

## 2. Merchant Record Shape
To effectively predict churn, we need a combination of firmographic data, product usage metrics, and support interactions. The mock merchant record will contain:
- **id**: Unique identifier.
- **name**: Merchant company name.
- **planTier**: Basic, Pro, Enterprise.
- **mrr**: Monthly Recurring Revenue (financial impact).
- **tenureMonths**: Months since signup.
- **loginsLast30Days**: Frequency of platform access.
- **coreFeatureUsage**: A score (0-100) showing how much value they extract.
- **openSupportTickets**: Number of current unresolved issues.
- **paymentStatus**: Healthy, Past Due, Expiring Soon.

## 3. Churn Risk Signals
We define risk using a rule-based engine across these metrics:
- **Usage Drop-off**: `loginsLast30Days` <= 2, or `coreFeatureUsage` < 30.
- **Support Friction**: `openSupportTickets` >= 3, indicating a frustrating experience.
- **Financial Risk**: `paymentStatus` is "Past Due" or "Expiring Soon".
- **Early Churn Risk**: `tenureMonths` <= 3 combined with low usage.

**Risk Levels**: High, Medium, Low.

## 4. Recommended Next Steps
Based on the primary churn signal triggered, the system will recommend:
- *Signal: Low Usage* -> **Recommendation**: Schedule a re-engagement product walkthrough.
- *Signal: High Support Tickets* -> **Recommendation**: CS Manager to personally reach out and expedite ticket resolution.
- *Signal: Payment Risk* -> **Recommendation**: Send automated billing update link.
- *Signal: Early Churn Risk* -> **Recommendation**: Mandate a 1-on-1 onboarding sync call.

## 5. Technical Approach & Persistence
- **Data Persistence**: For this V1 build, data will be mocked using a static JSON array within the application state to simulate a backend API response. No real database is used.
- **Frontend**: Vanilla HTML/JS/CSS to ensure a lightweight, fast, and dependency-free application that is easy to audit. The UI will feature a clean, sortable data table highlighting "High Risk" merchants at the top with premium aesthetics.
- **Deployment**: The repository will be deployed via GitHub Pages for live viewing.

# Donation System Integration & Configuration Architecture
## Sincerely You Are Significant, Inc. (SYS)

This guide documents the technical design, provider comparison, security standards, and exact activation steps for the online donation system of **Sincerely You Are Significant, Inc.**

---

### 1. Architectural Principles & Security Rules

To protect donors and preserve non-profit integrity, the following architectural rules are strictly enforced:

1. **Zero-PII / Zero Card Data on Server**: Credit/debit card numbers, CVVs, and banking details are **never** entered, stored, or processed on this website's infrastructure.
2. **Hosted Provider Checkout**: All payment processing occurs on secure, PCI-DSS Level 1 compliant checkout pages hosted directly by the authorized provider.
3. **No Fabricated Accounts**: No dummy payment links, mock confirmation receipts, or fake API keys exist in this codebase.
4. **Environment Separation**: Test mode and live production mode must use separate provider credentials and webhook secrets.
5. **Clear Disclosures**: Donor tax-deductibility status (501(c)(3)), receipt delivery timeline, and recurring donation cancellation terms are prominently visible before checkout.

---

### 2. Provider Options Comparison

| Provider | Platform Fee | Processing Fee | Payout Speed | Recommendation for SYS |
|---|---|---|---|---|
| **Zeffy** | **0%** (100% free for nonprofits) | **0%** (funded by optional donor tips) | Daily/Weekly direct deposit | ⭐ **Top Recommendation**: SYS keeps 100% of every dollar donated. Automatically sends 501(c)(3) tax receipts. |
| **PayPal Giving Fund** | 0% | 0% | Monthly via grant check/deposit | Excellent secondary channel. Reaches PayPal/Venmo users directly. |
| **Stripe Nonprofit** | 0% | 2.2% + $0.30 per transaction | Rolling 2-day payouts | Best for custom hosted checkout sessions if custom branded portal is desired. |

---

### 3. Step-by-Step Activation Instructions for Bianca Reid

#### Option A: Zeffy (Recommended — 0% Processing Fees)
1. Sign up at [zeffy.com](https://www.zeffy.com/en-US) using the organization's official email (`admin@youaresignificant.org`).
2. Provide organization legal name: `Sincerely You Are Significant, Inc.` and Henry County address.
3. Upload official IRS 501(c)(3) determination letter and link the organization's business bank account for direct deposits.
4. Under **Forms > New Donation Form**, configure:
   - Campaign Name: `General Community Mission Support`
   - Suggested tiers: `$25`, `$50`, `$100`, `$250`, or custom amount
   - Recurring gifts: Enable monthly option
   - Tax receipt: Confirm custom message with Habakkuk 2:2 reference and organization contact info.
5. Copy the generated direct donation link (e.g. `https://www.zeffy.com/donation-form/...`).
6. Update `js/config.js`:
   ```javascript
   donations: {
     enabled: true,
     provider: 'zeffy',
     checkoutUrl: 'https://www.zeffy.com/donation-form/[YOUR-FORM-ID]',
     ...
   }
   ```

#### Option B: PayPal Giving Fund
1. Enroll at [paypal.com/givingfund](https://www.paypal.com/givingfund).
2. Confirm 501(c)(3) status and link your PayPal business account.
3. Obtain your official Giving Fund profile URL: `https://www.paypal.com/fundraiser/hub/...`.
4. Update `js/config.js` with the URL and set `provider: 'paypal'`.

#### Option C: Stripe Hosted Checkout (with Webhook Verification)
If Stripe is selected, a secure webhook endpoint is recommended to log confirmation records:
1. Create a Stripe account at [stripe.com](https://stripe.com) and apply for the non-profit discount.
2. In the Stripe Dashboard, create a **Donation Payment Link**.
3. In Vercel Environment Variables, configure:
   - `STRIPE_PUBLISHABLE_KEY` (`pk_live_...`)
   - `STRIPE_SECRET_KEY` (`sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
4. Stripe automatically handles idempotent event processing using `event.id` to prevent duplicate receipts.

---

### 4. Alternative Giving Instructions (Active Today)

Until Bianca Reid configures an online processor, the `/support` page provides owner-approved direct giving instructions:
- **By Mail / Check**: Payable to `Sincerely You Are Significant, Inc.`, Eagles Landing Pkwy, Stockbridge, GA 30281.
- **Direct Coordinator Assistance**: Phone: `404-997-2563` | Email: `admin@youaresignificant.org`.
- **Receipts**: Official written acknowledgments for all charitable contributions are sent by return mail or email.

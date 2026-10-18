# Sincerely You Are Significant, Inc. (SYS)
## Launch Verification & Owner Action Checklist

This document details the exact facts, credentials, and settings requiring confirmation by **Bianca Reid (Founder & Provider)** before official public marketing launch.

---

### 1. Facts Requiring Owner Confirmation

| Item | Current Website Implementation | Owner Action Required |
|------|--------------------------------|------------------------|
| **EIN (Tax Identification Number)** | Displayed as official 501(c)(3) tax-exempt status without exposing raw unverified digits | Confirm the official Federal Employer Identification Number (EIN) for donation receipts. |
| **Physical Address & Suite Number** | Displays `Eagles Landing Pkwy, Stockbridge, GA 30281` | Confirm whether a suite number or specific PO Box should be shown for mail donations. |
| **Jonesboro Office Protocol** | Stated as "By Appointment Only" (phone: 404-997-2563) to protect client privacy | Confirm intake procedure and whether client consultations are offered in-person, virtual/telehealth, or both. |
| **Direct Online Donation Processor** | Explains that online portal is being configured and accepts donations by mail or direct coordination | Select and link a preferred online giving platform. **Recommendation: Zeffy** (100% free for 501(c)(3) nonprofits with 0% platform/processing fees) or **Stripe / PayPal Giving Fund**. |
| **Youth Age Range / Cohort** | Framed generally as adolescents & youth seeking structure and mentorship | Confirm specific age brackets (e.g., ages 11–18 or middle/high school). |
| **Upcoming Events Calendar** | Displays seasonal outreach focus areas with an invitation to join the community notification list | Provide confirmed dates, times, and venue reservations when seasonal community events are scheduled. |

---

### 2. Environment Variables & Resend Email Forwarding Setup

For live contact & volunteer inquiry email forwarding, configure these variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Required? | Purpose | Default / Example |
|---------------|-----------|---------|-------------------|
| `RESEND_API_KEY` | Recommended | Authenticates with Resend API to forward submissions | `re_123456789...` |
| `RESEND_FROM_EMAIL` | Optional | Verified sender address (requires domain DNS verification in Resend) | `Sincerely You Are Significant <inquiries@youaresignificant.org>` (or `onboarding@resend.dev` for testing) |
| `RESEND_TO_EMAIL` | Optional | Admin inbox destination receiving inquiries | `admin@youaresignificant.org` |
| `UPSTASH_REDIS_REST_URL` | Optional | Upstash Redis REST URL for multi-region serverless rate limiting | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis REST Bearer Token | `AX...` |

#### Exact Resend Dashboard Setup Steps:
1. Create a free account at [resend.com](https://resend.com).
2. Go to **Domains > Add Domain** and enter `youaresignificant.org`.
3. Add the 3 DNS records provided by Resend (DKIM, SPF, MX) to your domain registrar (GoDaddy, Namecheap, Google Domains/Squarespace, etc.).
4. Go to **API Keys > Create API Key**, name it `SYS Website Vercel`, and copy the key (`re_...`).
5. Open your Vercel Dashboard for the `youaresignificant` project, navigate to **Settings > Environment Variables**, and add `RESEND_API_KEY`.
6. *(Testing Before Domain DNS)*: While waiting for DNS propagation, you can leave `RESEND_FROM_EMAIL` unset or set to `onboarding@resend.dev` to test delivery to your verified account email.

*(Note: If `RESEND_API_KEY` is not yet configured, the website's `/api/contact` serverless endpoint operates safely in standby mode: it validates submissions, defends against spam, logs an anonymous audit record with zero PII, and returns an honest status explaining that automated forwarding is in offline standby mode while directing visitors to the direct phone/email.)*

---

### 3. Google Business Profile & Local SEO Checklist

For high ranking on Google Maps and Local Pack for *"nonprofit in Stockbridge GA"* and *"human services in Henry County"*:
1. **Google Business Profile (GBP)**:
   - Claim or create profile under: **Sincerely You Are Significant, Inc.**
   - Primary Category: **Non-Profit Organization** or **Human Services Organization**.
   - Service Area: **Stockbridge, GA**, **Jonesboro, GA**, **Henry County, GA**, **Clayton County, GA**.
   - Address settings: If the Jonesboro location does not accept unscheduled walk-ins, configure as a **Service-Area Business (SAB)** with address hidden, or specify "Appointments Required".
   - Appointment link: `https://youaresignificant.org/contact.html`.
2. **Local Citations**:
   - Maintain exact consistency across Google Business Profile, Facebook, Instagram, and Guidestar/Candid:
     - Name: Sincerely You Are Significant, Inc.
     - Phone: 404-997-2563
     - Email: admin@youaresignificant.org

---

### 4. How to Update Website Content

- **General Organization Details**: Edit `js/config.js` to update phone, email, addresses, and social handles in one central location.
- **Programs & Services**: Edit `services.html` sections (`#youth`, `#families`, `#seniors`, `#community`).
- **Upcoming Events**: When an event is confirmed, update `community.html`.
- **Donation Links**: Once Zeffy or Stripe is setup, replace the direct inquiry button in `support.html` with your live giving URL.

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

### 2. Environment Variables for Vercel Deployment

For live form submission email forwarding, add the following optional variables in **Vercel Project Settings > Environment Variables**:

| Variable Name | Required? | Purpose | Example |
|---------------|-----------|---------|---------|
| `RESEND_API_KEY` | Optional | Dispatches contact submissions directly to `admin@youaresignificant.org` via Resend email API | `re_123456789...` |
| `NOTIFICATION_EMAIL` | Optional | Custom email destination for inquiries (defaults to `admin@youaresignificant.org`) | `admin@youaresignificant.org` |

*(Note: If no API key is set, the website's `/api/contact` serverless function gracefully logs submissions safely and provides real receipt confirmation to the user.)*

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

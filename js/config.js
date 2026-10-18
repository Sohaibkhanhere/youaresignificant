/**
 * Sincerely You Are Significant, Inc. (SYS)
 * Centralized Site Configuration & Organization Entity Data
 * 
 * This file serves as the single source of truth for organization details,
 * verified contact information, service areas, and integration settings.
 */

const SYS_CONFIG = {
  // Entity & Branding
  organizationName: 'Sincerely You Are Significant, Inc.',
  shortName: 'You Are Significant',
  acronym: 'SYS',
  tagline: 'Guiding Youth · Empowering Lives · Building Futures',
  guidingVerse: {
    verse: 'Habakkuk 2:2',
    translation: 'NKJV',
    text: 'Write the vision and make it plain, that he may run who reads it.'
  },
  status: '501(c)(3) Tax-Exempt Nonprofit Organization',
  category: 'Human Services Nonprofit Agency',

  // Leadership
  founder: {
    name: 'Bianca Reid',
    title: 'Founder & Provider',
    values: ['Faith', 'People', 'Families', 'Community', 'Impact']
  },

  // Contact & Locations
  contact: {
    phone: '404-997-2563',
    phoneFormatted: '+1-404-997-2563',
    email: 'admin@youaresignificant.org',
    website: 'https://youaresignificant.org',
    previewUrl: 'https://youaresignificant.vercel.app',
    
    // Physical & Service Addresses
    adminAddress: {
      street: 'Eagles Landing Pkwy',
      city: 'Stockbridge',
      state: 'GA',
      zip: '30281',
      country: 'US',
      label: 'Eagles Landing Pkwy, Stockbridge, GA 30281'
    },
    serviceLocation: {
      city: 'Jonesboro',
      state: 'GA',
      notes: 'Consultations & In-Person Services strictly by appointment only.'
    },
    serviceAreas: [
      'Stockbridge, GA',
      'Jonesboro, GA',
      'Henry County, GA',
      'Clayton County, GA',
      'South Metro Atlanta'
    ]
  },

  // Social Links
  social: {
    instagram: 'https://www.instagram.com/thesysorg',
    instagramHandle: '@theSYSorg',
    facebook: 'https://www.facebook.com/profile.php?id=61594629771230'
  },

  // Crisis & Emergency Resources (SYS is human services, not an emergency crisis facility)
  crisisResources: [
    {
      name: '988 Suicide & Crisis Lifeline',
      contact: 'Call or text 988',
      description: 'Free, confidential 24/7 mental health crisis support across the US.'
    },
    {
      name: 'Georgia Crisis & Access Line (GCAL)',
      contact: '1-800-715-4225',
      description: '24/7 free access to Georgia state mental health and addiction services.'
    },
    {
      name: 'Emergency Services',
      contact: 'Call 911',
      description: 'For immediate life-threatening medical, fire, or safety emergencies.'
    }
  ],

  // Launch Verification Items Pending Owner Confirmation
  pendingVerification: {
    ein: 'Pending confirmation from Bianca Reid',
    donationProcessor: 'Pending integration (Zeffy, Stripe, or PayPal Giving Fund recommended)',
    exactJonesboroHours: 'By appointment only — specific client hours pending confirmation',
    youthProgramAgeRange: 'Currently open to youth & adolescents; specific cohort ranges pending confirmation'
  },

  // Donation Integration Architecture (Config-Driven & Multi-Provider Ready)
  // When Bianca Reid selects a provider, set provider to 'zeffy', 'paypal', or 'stripe',
  // configure the approved URL, and the frontend will automatically surface the secure button.
  donations: {
    enabled: false, // Set to true once an approved provider account is configured
    provider: null, // Options: 'zeffy' | 'paypal' | 'stripe' | null
    checkoutUrl: null, // Direct secure hosted checkout URL (never collect card details on-site)
    taxDeductibleDisclosure: 'Sincerely You Are Significant, Inc. is a registered 501(c)(3) tax-exempt nonprofit organization. Contributions are tax-deductible to the fullest extent permitted by law.',
    receiptPolicy: 'Official charitable donation tax receipts are automatically issued by the payment provider upon successful transaction completion.',
    recurringDisclosure: 'Monthly recurring contributions can be modified or cancelled at any time by contacting admin@youaresignificant.org or managing via the provider confirmation email.'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SYS_CONFIG;
}

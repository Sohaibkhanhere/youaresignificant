/**
 * Serverless Contact & Inquiry Handler for Vercel
 * Endpoint: POST /api/contact
 * 
 * Validates submissions server-side, guards against spam bots via honeypot,
 * and formats inquiries for administration.
 */

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Please submit via POST.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, email, phone, inquiry, message, consent, hp_field } = body;

    // 1. Honeypot check for spam protection
    if (hp_field) {
      // Bot filled out hidden field — quietly reject with 200 to prevent bot retraining
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been received.'
      });
    }

    // 2. Server-side validation
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.push('Inquiry message must be at least 10 characters long.');
    }

    if (consent !== true && consent !== 'true' && consent !== 'on') {
      errors.push('Privacy consent must be acknowledged.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: 'Validation failed. Please review the highlighted fields.'
      });
    }

    // 3. Sanitize inputs
    const sanitizedData = {
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().toLowerCase().slice(0, 100),
      phone: phone ? String(phone).trim().slice(0, 30) : 'Not provided',
      inquiry: inquiry ? String(inquiry).trim().slice(0, 60) : 'General Inquiry',
      message: String(message).trim().slice(0, 2000),
      timestamp: new Date().toISOString(),
      referenceId: 'SYS-' + Date.now().toString(36).toUpperCase()
    };

    // 4. Dispatch Email if email service credentials exist (e.g. Resend, Sendgrid, or SMTP)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Sincerely You Are Significant <inquiries@youaresignificant.org>',
            to: ['admin@youaresignificant.org'],
            reply_to: sanitizedData.email,
            subject: `[SYS Inquiry #${sanitizedData.referenceId}] ${sanitizedData.inquiry} from ${sanitizedData.name}`,
            text: `New Website Inquiry\n\nReference: ${sanitizedData.referenceId}\nName: ${sanitizedData.name}\nEmail: ${sanitizedData.email}\nPhone: ${sanitizedData.phone}\nCategory: ${sanitizedData.inquiry}\nDate: ${sanitizedData.timestamp}\n\nMessage:\n${sanitizedData.message}\n`
          })
        });
      } catch (emailErr) {
        console.error('Email dispatch error (Resend):', emailErr);
        // We still acknowledge receipt to the client
      }
    } else {
      // Log for development / serverless logs
      console.log('Inquiry received (Email provider not configured):', {
        ref: sanitizedData.referenceId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        inquiry: sanitizedData.inquiry
      });
    }

    return res.status(200).json({
      success: true,
      referenceId: sanitizedData.referenceId,
      message: 'Thank you for reaching out to Sincerely You Are Significant. Your message has been received, and our team will respond shortly.',
      receivedAt: sanitizedData.timestamp
    });

  } catch (error) {
    console.error('Server error processing contact form:', error);
    return res.status(500).json({
      success: false,
      message: 'A temporary server error occurred. Please contact us directly at admin@youaresignificant.org or call 404-997-2563.'
    });
  }
};

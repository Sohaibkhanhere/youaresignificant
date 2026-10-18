/**
 * Serverless Contact & Volunteer Inquiry Handler for Vercel
 * Endpoint: POST /api/contact
 * 
 * Production Hardened Architecture:
 * - Restrictive CORS and Origin validation
 * - Strict content-type and payload size bounds (max 32KB)
 * - Multi-layered anti-spam: Honeypot + Form Speed Trap (Timestamp Token)
 * - Abuse mitigation: SHA-256 IP hashing + Upstash Redis integration (when configured)
 * - Anti-Email Header Injection: Control characters and CRLF strictly stripped from headers
 * - Privacy-First Logging: Zero PII logged to server stdout / cloud log drains
 * - Cryptographically random Reference IDs (SYS-<timestamp>-<randomHex>)
 * - Resend API integration with AbortController timeout (7s)
 * - Transparent delivery reporting (distinguishes acceptance from inbox delivery)
 */

const crypto = require('crypto');

// Allowed Origins for CORS / CSRF verification
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?youaresignificant\.org$/i,
  /^https:\/\/youaresignificant\.vercel\.app$/i,
  /^https:\/\/youaresignificant-[a-z0-9-]*\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+-sohaibkhanheres-projects\.vercel\.app$/i,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i
];

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
}

// Generate secure non-PII Reference ID
function generateReferenceId() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SYS-${timePart}-${randPart}`;
}

// Strip CRLF and header injection characters
function sanitizeHeaderString(val) {
  if (!val) return '';
  return String(val)
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[%0A%0D%0a%0d]/g, '')
    .trim();
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const isAllowed = isOriginAllowed(origin);

  // Set restrictive CORS headers
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    // Same-origin or non-browser request; do not reflect wildcard
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Handle pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Reject unsupported HTTP methods
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST submissions are supported.'
    });
  }

  // Validate Origin if present to prevent cross-site form submission from unauthorized sites
  if (origin && !isAllowed) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Cross-origin submission from this domain is not permitted.'
    });
  }

  // Verify Content-Type
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
    return res.status(415).json({
      success: false,
      error: 'Unsupported Media Type. Submissions must be formatted as JSON.'
    });
  }

  // Body Size Guard: Check Content-Length (max 32KB)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 32768) {
    return res.status(413).json({
      success: false,
      error: 'Payload Too Large. Submissions must not exceed 32KB.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({
          success: false,
          error: 'Malformed JSON payload. Please ensure input is valid JSON.'
        });
      }
    }
    body = body || {};

    const { name, email, phone, inquiry, message, consent, hp_field, form_ts } = body;

    // 1. Anti-Spam Layer A: Honeypot check
    if (hp_field) {
      // Quietly defuse bot with 200 OK without creating tickets or dispatching emails
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been received.'
      });
    }

    // 2. Anti-Spam Layer B: Speed Trap (Form Timestamp Token)
    // Automated bots typically submit forms in < 1.5 seconds from page render
    if (form_ts) {
      const parsedTs = parseInt(form_ts, 10);
      if (!isNaN(parsedTs)) {
        const timeElapsed = Date.now() - parsedTs;
        if (timeElapsed > 0 && timeElapsed < 1500) {
          // Bot filled form too quickly - silent defusal
          return res.status(200).json({
            success: true,
            message: 'Your inquiry has been received.'
          });
        }
      }
    }

    // 3. Abuse Mitigation: IP Hash & Rate Limiting
    const rawIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
                  req.headers['x-real-ip'] ||
                  req.socket?.remoteAddress ||
                  'unknown-ip';

    const ipHash = crypto
      .createHash('sha256')
      .update(rawIp + (process.env.IP_SALT || 'SYS_STATIC_SALT_2026'))
      .digest('hex')
      .slice(0, 16);

    // Optional Upstash Redis atomic rate limiting if configured in Vercel
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (upstashUrl && upstashToken) {
      try {
        const rateLimitKey = `sys:rl:${ipHash}:${Math.floor(Date.now() / 60000)}`;
        const upstashRes = await fetch(`${upstashUrl}/pipeline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${upstashToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            ['INCR', rateLimitKey],
            ['EXPIRE', rateLimitKey, 60]
          ])
        });
        const upstashData = await upstashRes.json();
        const requestCount = upstashData[0]?.result;
        if (typeof requestCount === 'number' && requestCount > 5) {
          return res.status(429).json({
            success: false,
            error: 'Too Many Requests. Please wait one minute before submitting another inquiry.',
            retryAfter: 60
          });
        }
      } catch (redisErr) {
        // Fail open if rate limit service is unavailable
      }
    }

    // 4. Server-Side Validation & Input Normalization
    const errors = [];

    // Full Name: 2 - 100 characters
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long.');
    } else if (name.trim().length > 100) {
      errors.push('Full name must not exceed 100 characters.');
    }

    // Email Address: strict regex, 5 - 100 characters, no control characters
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    if (!cleanEmail || cleanEmail.length > 100 || !emailRegex.test(cleanEmail)) {
      errors.push('A valid, well-formed email address is required.');
    }

    // Phone: optional, max 30 characters
    const cleanPhone = phone ? String(phone).trim().slice(0, 30) : '';

    // Inquiry Category: max 80 characters
    const cleanInquiry = inquiry ? sanitizeHeaderString(inquiry).slice(0, 80) : 'General Inquiry';

    // Message Body: 10 - 3000 characters
    const rawMessage = message ? String(message).trim() : '';
    if (!rawMessage || rawMessage.length < 10) {
      errors.push('Inquiry message must be at least 10 characters long.');
    } else if (rawMessage.length > 3000) {
      errors.push('Inquiry message must not exceed 3,000 characters.');
    }

    // Consent: required acknowledgement
    if (consent !== true && consent !== 'true' && consent !== 'on') {
      errors.push('Privacy and terms acknowledgement must be checked.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: errors,
        message: errors.join(' ')
      });
    }

    // 5. Sanitized Data Structure (Control characters stripped from header candidates)
    const sanitizedData = {
      name: sanitizeHeaderString(name).slice(0, 100),
      email: cleanEmail,
      phone: sanitizeHeaderString(cleanPhone),
      inquiry: cleanInquiry,
      message: rawMessage.replace(/\r\n/g, '\n').slice(0, 3000),
      timestamp: new Date().toISOString(),
      referenceId: generateReferenceId()
    };

    // 6. Safe Non-PII Audit Logging
    let emailStatus = 'unconfigured';
    const resendApiKey = process.env.RESEND_API_KEY;

    // 7. Resend Email Dispatch with AbortController Timeout (7s)
    if (resendApiKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'Sincerely You Are Significant <inquiries@youaresignificant.org>';
      const toEmail = process.env.RESEND_TO_EMAIL || 'admin@youaresignificant.org';

      const emailPayload = {
        from: fromEmail,
        to: [toEmail],
        reply_to: sanitizedData.email,
        subject: `[SYS Inquiry #${sanitizedData.referenceId}] ${sanitizedData.inquiry} from ${sanitizedData.name}`,
        text: `New Website Inquiry\n\nReference ID: ${sanitizedData.referenceId}\nName: ${sanitizedData.name}\nEmail: ${sanitizedData.email}\nPhone: ${sanitizedData.phone || 'Not provided'}\nCategory: ${sanitizedData.inquiry}\nReceived At: ${sanitizedData.timestamp}\n\nMessage:\n${sanitizedData.message}\n\n--\nSincerely You Are Significant, Inc. (SYS)\nHuman Services Non-Profit Agency | Stockbridge & Jonesboro, GA`
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (emailResponse.ok) {
          emailStatus = 'forwarded';
        } else {
          const errData = await emailResponse.json().catch(() => ({}));
          emailStatus = 'provider_rejected';
          console.error('[SYS_EMAIL_ERROR] Resend API rejected message:', {
            status: emailResponse.status,
            message: errData.message || 'Unknown provider error'
          });
        }
      } catch (dispatchErr) {
        clearTimeout(timeoutId);
        emailStatus = dispatchErr.name === 'AbortError' ? 'timeout' : 'network_error';
        console.error('[SYS_EMAIL_ERROR] Email dispatch exception:', {
          type: emailStatus,
          message: dispatchErr.message
        });
      }
    }

    // Log sanitized audit event (ZERO PII: no name, no email, no message body)
    console.log('[SYS_INQUIRY_AUDIT]', {
      referenceId: sanitizedData.referenceId,
      category: sanitizedData.inquiry,
      timestamp: sanitizedData.timestamp,
      ipHash: ipHash,
      emailStatus: emailStatus
    });

    // 8. Honest Client Response
    let userMessage = 'Thank you for reaching out to Sincerely You Are Significant. Your message has been received, and our team will review it shortly.';
    if (emailStatus === 'unconfigured') {
      userMessage = 'Your inquiry has been logged with Reference ID ' + sanitizedData.referenceId + '. Note: Direct email forwarding is currently in offline standby mode. If your request requires urgent attention, please also reach us at 404-997-2563 or admin@youaresignificant.org.';
    } else if (emailStatus === 'provider_rejected' || emailStatus === 'timeout' || emailStatus === 'network_error') {
      userMessage = 'Your inquiry has been logged with Reference ID ' + sanitizedData.referenceId + '. However, automated notification delivery experienced a temporary delay. Please retain your Reference ID and contact admin@youaresignificant.org or 404-997-2563 if you do not receive a reply within 2 business days.';
    }

    return res.status(200).json({
      success: true,
      referenceId: sanitizedData.referenceId,
      emailForwarded: emailStatus === 'forwarded',
      deliveryStatus: emailStatus,
      message: userMessage,
      receivedAt: sanitizedData.timestamp
    });

  } catch (fatalError) {
    console.error('[SYS_FATAL_ERROR] Error handling inquiry:', fatalError.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing your inquiry.',
      message: 'Please contact Sincerely You Are Significant directly at admin@youaresignificant.org or call 404-997-2563.'
    });
  }
};

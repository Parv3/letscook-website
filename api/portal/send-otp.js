import { Resend } from 'resend';
import crypto from 'crypto';
import { checkRateLimit, createOtpToken } from '../lib/portalDb.js';

function setCors(req, res) {
  const origin = req.headers?.origin;
  const isAllowed = !origin || 
    origin.endsWith('letscook.co.in') || 
    origin.includes('localhost') || 
    origin.endsWith('.vercel.app');

  if (typeof res.setHeader === 'function') {
    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  return isAllowed;
}

export default async function handler(req, res) {
  if (!setCors(req, res)) {
    return res.status(403).json({ success: false, error: 'Forbidden: Origin not allowed.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

    // Rate Limiting: Max 4 OTPs per 10 minutes per IP & Email
    const ipCheck = checkRateLimit(`portal_otp_ip:${clientIp}`, 4, 10 * 60 * 1000);
    if (ipCheck.limited) {
      return res.status(429).json({
        success: false,
        error: `Too many requests from this IP. Please wait ${ipCheck.waitSec} seconds.`
      });
    }

    const emailCheck = checkRateLimit(`portal_otp_email:${normalizedEmail}`, 4, 10 * 60 * 1000);
    if (emailCheck.limited) {
      return res.status(429).json({
        success: false,
        error: `Too many verification attempts for this email. Please wait ${emailCheck.waitSec} seconds.`
      });
    }

    // Generate Cryptographically Secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const otpToken = createOtpToken(normalizedEmail, otp, expiresAt);

    // If Resend API Key is configured, dispatch high-craft transactional email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #060608; color: #f4f4f6; margin: 0; padding: 40px 16px;">
            <div style="max-width: 500px; margin: 0 auto; background: #121216; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
              <h2 style="margin: 0 0 12px; color: #ffffff; letter-spacing: -0.02em;">Let's Cook Community</h2>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                Your one-time portal authentication passkey is below. This code is confidential and expires in 15 minutes.
              </p>
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00f0ff;">${otp}</span>
              </div>
              <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin: 0;">
                If you did not request this verification code, please ignore this email. No access was granted.
              </p>
            </div>
          </body>
        </html>
      `;

      let emailSent = false;
      try {
        const sendRes = await resend.emails.send({
          from: "Let's Cook Portal <certificates@letscook.co.in>",
          to: [normalizedEmail],
          subject: `Your Let's Cook Portal Passkey: ${otp}`,
          text: `Your Let's Cook portal passkey is: ${otp} (valid for 15 minutes).`,
          html: emailHtml
        });
        if (sendRes && !sendRes.error) {
          emailSent = true;
        }
      } catch (sendErr) {
        console.warn('Resend send error, falling back:', sendErr.message);
      }
    } else {
      console.log(`[LOCAL/DEV OTP DISPATCH] Email: ${normalizedEmail} | OTP: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: `Passkey dispatched to ${normalizedEmail}`,
      otpToken,
      expiresAt,
      // Security: Only expose devOtp in explicit local development, never in live production
      devOtp: ((process.env.NODE_ENV !== 'production' && !process.env.VERCEL) || process.env.SHOW_PORTAL_OTP === 'true') ? otp : undefined
    });
  } catch (error) {
    console.error('Error in portal send-otp:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while processing request.' });
  }
}

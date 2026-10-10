import { Resend } from 'resend';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load participant registry
function getCertificates() {
  try {
    const certPath = path.resolve(process.cwd(), 'src/data/certificates.json');
    if (fs.existsSync(certPath)) {
      return JSON.parse(fs.readFileSync(certPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading certificates.json:', err);
  }
  return [];
}

export default async function handler(req, res) {
  // CORS & method check
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const certs = getCertificates();
    const participantCert = certs.find(
      c => c.recipient && c.recipient.email && c.recipient.email.toLowerCase().trim() === normalizedEmail
    );

    if (!participantCert) {
      return res.status(404).json({
        success: false,
        error: 'No certificate found for this email address. Please make sure you enter the exact email used during event registration.'
      });
    }

    const participantName = participantCert.recipient.name || 'Builder';
    const eventName = 'ORIGIN – Hackathon Guidance Workshop + Ideathon';

    // 1. Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    const secret = process.env.RESEND_API_KEY || 'letscook-default-secret-salt-2026';
    const token = crypto
      .createHmac('sha256', secret)
      .update(`${normalizedEmail}|${otp}|${expiresAt}`)
      .digest('hex');

    // 2. Dispatch email via Resend
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY environment variable is missing.');
      return res.status(500).json({
        success: false,
        error: 'Email service is not yet configured. Please verify RESEND_API_KEY is set in Vercel.'
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #060608; color: #f1f5f9; margin: 0; padding: 24px 12px; }
            .container { max-width: 520px; margin: 0 auto; background: #0e1017; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px 24px; }
            .brand { font-size: 18px; font-weight: 800; letter-spacing: 0.05em; color: #ffffff; margin-bottom: 24px; display: flex; align-items: center; }
            .brand span { color: #00f0ff; }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
            .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
            .otp-box { background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
            .otp-code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00f0ff; }
            .otp-caption { font-size: 12px; color: #64748b; margin-top: 8px; }
            .footer { font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; margin-top: 24px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">LET'S <span>COOK</span></div>
            <div class="title">Your Certificate Verification Code</div>
            <div class="text">
              Hi <strong>${participantName}</strong>,<br><br>
              You requested access to your official certificate of participation for <strong>${eventName}</strong>. Use the one-time code below to verify your email and unlock your certificate:
            </div>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="otp-caption">This code is valid for 15 minutes.</div>
            </div>

            <div class="text" style="font-size: 12px; color: #64748b;">
              If you did not request this verification code, please ignore this email. No access was granted.
            </div>

            <div class="footer">
              Let's Cook • Student-Run Tech & Builder Community<br>
              Codere. Aedificare. Vincere. • letscook.co.in
            </div>
          </div>
        </body>
      </html>
    `;

    // Try sending from onboarding@resend.dev during testing or certificates@letscook.co.in
    const emailText = `Hi ${participantName},\n\nYour Let's Cook verification code is: ${otp}\n\nThis code is valid for 15 minutes.\n\nLet's Cook Community • letscook.co.in`;

    let sendResult;
    try {
      sendResult = await resend.emails.send({
        from: "Let's Cook <certificates@letscook.co.in>",
        to: [normalizedEmail],
        subject: `Your Let's Cook Verification Code: ${otp}`,
        text: emailText,
        html: emailHtml
      });
    } catch (sendErr) {
      console.error('Error calling resend.emails.send:', sendErr);
      return res.status(500).json({ success: false, error: sendErr.message });
    }

    if (sendResult.error) {
      console.error('Resend error:', sendResult.error);
      return res.status(500).json({ success: false, error: sendResult.error.message });
    }

    return res.status(200).json({
      success: true,
      email: normalizedEmail,
      expiresAt: expiresAt,
      token: token,
      resendId: sendResult.data?.id,
      message: `Verification code sent to ${normalizedEmail}`
    });
  } catch (error) {
    console.error('Error in send-otp handler:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while sending email.' });
  }
}

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

    const directVerifyUrl = `https://letscook.co.in/verify?code=${encodeURIComponent(participantCert?.verificationCode || otp)}&email=${encodeURIComponent(normalizedEmail)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Let's Cook Credential Verification</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              background-color: #050608; 
              color: #f1f5f9; 
              margin: 0; 
              padding: 32px 12px; 
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              max-width: 540px; 
              margin: 0 auto; 
              background: #0b0d14; 
              border: 1px solid rgba(0, 240, 255, 0.22); 
              border-radius: 18px; 
              padding: 36px 28px; 
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.08);
            }
            .brand-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
              padding-bottom: 18px;
              margin-bottom: 26px;
            }
            .brand-logo { 
              font-size: 19px; 
              font-weight: 900; 
              letter-spacing: 0.08em; 
              color: #ffffff; 
            }
            .brand-logo span { 
              color: #00f0ff; 
              text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
            }
            .telemetry-chip {
              font-family: 'SF Mono', Consolas, Monaco, monospace;
              font-size: 10px;
              letter-spacing: 0.1em;
              color: #00f0ff;
              background: rgba(0, 240, 255, 0.08);
              border: 1px solid rgba(0, 240, 255, 0.3);
              padding: 4px 8px;
              border-radius: 4px;
            }
            .title { 
              font-size: 22px; 
              font-weight: 800; 
              color: #ffffff; 
              margin: 0 0 8px 0; 
              letter-spacing: -0.02em;
            }
            .subtitle {
              font-size: 13px;
              color: #ff2e56;
              font-weight: 600;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              margin-bottom: 20px;
            }
            .text { 
              font-size: 14px; 
              line-height: 1.65; 
              color: #94a3b8; 
              margin-bottom: 24px; 
            }
            .text strong {
              color: #ffffff;
            }
            .otp-container { 
              background: linear-gradient(180deg, rgba(0, 240, 255, 0.06) 0%, rgba(14, 18, 28, 0.9) 100%); 
              border: 1px solid #00f0ff; 
              border-radius: 14px; 
              padding: 26px 16px; 
              text-align: center; 
              margin: 28px 0; 
              box-shadow: 0 0 30px rgba(0, 240, 255, 0.14), inset 0 0 20px rgba(0, 240, 255, 0.04);
            }
            .otp-code { 
              font-family: 'Space Grotesk', 'SF Mono', Consolas, Monaco, monospace; 
              font-size: 42px; 
              font-weight: 900; 
              letter-spacing: 12px; 
              color: #00f0ff; 
              text-shadow: 0 0 16px rgba(0, 240, 255, 0.6);
              margin-left: 12px;
            }
            .otp-caption { 
              font-family: 'SF Mono', Consolas, monospace;
              font-size: 11px; 
              color: #64748b; 
              margin-top: 10px; 
              letter-spacing: 0.08em;
            }
            .cta-button {
              display: block;
              width: 100%;
              box-sizing: border-box;
              background: linear-gradient(135deg, #00f0ff 0%, #0070f3 100%);
              color: #050608 !important;
              font-weight: 800;
              font-size: 14px;
              text-align: center;
              padding: 14px 20px;
              border-radius: 10px;
              text-decoration: none;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
              margin: 22px 0 24px 0;
            }
            .badges-row {
              display: flex;
              justify-content: center;
              gap: 8px;
              flex-wrap: wrap;
              margin: 20px 0;
              padding: 12px;
              background: rgba(255, 255, 255, 0.02);
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .badge-item {
              font-family: monospace;
              font-size: 10px;
              color: #94a3b8;
              letter-spacing: 0.05em;
            }
            .footer { 
              font-size: 11px; 
              color: #64748b; 
              border-top: 1px solid rgba(255,255,255,0.06); 
              padding-top: 20px; 
              margin-top: 26px; 
              text-align: center; 
              line-height: 1.6;
            }
            .footer-motto {
              color: #00f0ff;
              font-weight: 700;
              letter-spacing: 0.15em;
              font-size: 10px;
              margin-bottom: 6px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand-bar">
              <div class="brand-logo">LET'S <span>COOK</span></div>
              <div class="telemetry-chip">SECURE DISPATCH // OTP</div>
            </div>

            <div class="title">Certificate Verification</div>
            <div class="subtitle">${eventName}</div>

            <div class="text">
              Hi <strong>${participantName}</strong>,<br><br>
              You requested access to your official certificate of participation. Enter the secure 6-digit one-time code below to unlock and download your credential:
            </div>
            
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
              <div class="otp-caption">VALID FOR 15 MINUTES • SINGLE-USE NONCE</div>
            </div>

            <a href="${directVerifyUrl}" class="cta-button">
              ⚡ UNLOCK CERTIFICATE DIRECTLY
            </a>

            <div class="badges-row">
              <span class="badge-item">🔒 HMAC-SHA256 SIGNED</span>
              <span class="badge-item">•</span>
              <span class="badge-item">🛡️ ZERO-KNOWLEDGE GATE</span>
              <span class="badge-item">•</span>
              <span class="badge-item">⚡ 2K LOSSLESS EXPORT</span>
            </div>

            <div class="text" style="font-size: 12px; color: #64748b; margin-top: 18px;">
              If you did not request this verification code, please ignore this email. Your certificate remains securely encrypted.
            </div>

            <div class="footer">
              <div class="footer-motto">CODERE • AEDIFICARE • VINCERE</div>
              Let's Cook — Student-Run Tech & Builder Community<br>
              Official Credential Registry • <a href="https://letscook.co.in" style="color: #94a3b8; text-decoration: none;">letscook.co.in</a>
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
    return res.status(500).json({ success: false, error: error.message || 'Internal server error while sending email.' });
  }
}

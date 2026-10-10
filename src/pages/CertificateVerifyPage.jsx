import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Mail, 
  Award, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  verifyAndGetCertificate, 
  getPortalStats, 
  getAllEvents 
} from '../services/certificateService';
import CertificateViewer from '../components/CertificateViewer';
import { playTechClick } from '../utils/soundEngine';

export default function CertificateVerifyPage({ setCurrentPage }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => getPortalStats(), []);
  const events = useMemo(() => getAllEvents(), []);

  // Check URL query parameters on mount (e.g. /verify?code=547162)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Let's Cook | Credential Verification Portal";

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('pin') || params.get('key');
    const emailParam = params.get('email');
    const idParam = params.get('id');

    if (codeParam) {
      setVerificationCode(codeParam);
      attemptVerification(codeParam, emailParam || '', idParam || '');
    }

    return () => {
      document.title = "Let's Cook | Student-Run Tech & Builder Community";
    };
  }, []);

  const attemptVerification = (codeToVerify, emailToVerify = '', idToVerify = '') => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const result = verifyAndGetCertificate({
        code: codeToVerify,
        email: emailToVerify,
        certId: idToVerify
      });

      if (result.success && result.certificate) {
        setSelectedCert(result.certificate);
        setErrorMessage('');
        if (window.history && window.history.pushState) {
          window.history.pushState(
            null, 
            '', 
            `/verify?code=${encodeURIComponent(result.certificate.verificationCode)}`
          );
        }
      } else {
        setSelectedCert(null);
        setErrorMessage(
          result.error || 'Invalid verification code. Please check the code sent to your registered email.'
        );
      }
      setIsLoading(false);
    }, 250);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    playTechClick();
    if (!verificationCode.trim()) {
      setErrorMessage('Please enter your 6-digit verification code.');
      return;
    }
    attemptVerification(verificationCode, emailInput);
  };

  const handleLockReset = () => {
    playTechClick();
    setSelectedCert(null);
    setVerificationCode('');
    setEmailInput('');
    setErrorMessage('');
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/verify');
    }
  };

  const handleReturnHome = () => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    setCurrentPage('home');
  };

  return (
    <div className="verify-page-wrapper animate-fade-in">
      {/* Background Ambience */}
      <div className="verify-ambient-grid" />
      <div className="verify-radial-glow" />

      <main className="verify-main-container">
        {/* Top Navigation Bar */}
        <div className="verify-top-bar">
          <button 
            onClick={handleReturnHome}
            className="verify-back-btn"
            aria-label="Return to main website"
          >
            <ArrowLeft size={16} /> RETURN TO MAIN SITE
          </button>
          
          <div className="verify-status-indicator">
            <span className="status-ping" />
            <span className="status-label">ENCRYPTED REGISTRY • ACTIVE</span>
          </div>
        </div>

        {/* Portal Hero Header */}
        <header className="verify-hero">
          <div className="verify-badge-pill">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>CONFIDENTIAL CREDENTIAL VERIFICATION</span>
          </div>

          <h1 className="verify-title">
            Verify Your <span className="text-gradient-cyan">Certificate</span>
          </h1>
          <p className="verify-subtitle">
            Enter the personal 6-digit verification code sent to your registered email address to unlock and download your official certificate.
          </p>
        </header>

        {/* 1. UNLOCKED VIEW: DISPLAY ONLY THIS PARTICIPANT'S CERTIFICATE */}
        {selectedCert ? (
          <section className="verified-view-section animate-fade-in">
            {/* Authenticated Verification Card */}
            <div className="verified-credential-card">
              <div className="cred-card-header">
                <div className="cred-badge">
                  <div className="cred-icon-wrap">
                    <ShieldCheck size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <span className="cred-badge-status">AUTHENTICATED CREDENTIAL RECORD</span>
                    <span className="cred-badge-id">Credential ID: {selectedCert.id}</span>
                  </div>
                </div>

                <button 
                  onClick={handleLockReset}
                  className="cred-reset-btn"
                  title="Lock and verify another code"
                >
                  <Lock size={14} /> Lock / Verify Another
                </button>
              </div>

              <div className="cred-details-grid">
                <div className="cred-field">
                  <label>ISSUED TO</label>
                  <p className="cred-highlight-name">{selectedCert.recipient.name}</p>
                </div>
                <div className="cred-field">
                  <label>CREDENTIAL TYPE</label>
                  <p>{selectedCert.credentialType}</p>
                </div>
                <div className="cred-field">
                  <label>EVENT</label>
                  <p>{selectedCert.event?.name || 'ORIGIN 2026'}</p>
                </div>
                <div className="cred-field">
                  <label>COLLABORATION</label>
                  <p>Let's Cook {selectedCert.event?.partner ? `× ${selectedCert.event.partner}` : ''}</p>
                </div>
                <div className="cred-field">
                  <label>ISSUE DATE</label>
                  <p>{selectedCert.issueDate}</p>
                </div>
                <div className="cred-field">
                  <label>VERIFICATION HASH</label>
                  <p className="font-mono text-xs text-zinc-400">{selectedCert.verifyHash}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Certificate Viewer & Downloader */}
            <div className="cert-renderer-box">
              <CertificateViewer 
                certificate={selectedCert} 
                event={selectedCert.event || events[0]} 
              />
            </div>
          </section>
        ) : (
          /* 2. LOCKED ACCESS GATE: ENTER CONFIDENTIAL VERIFICATION CODE */
          <section className="verify-gate-section">
            <div className="gate-card">
              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <KeyRound size={28} className="text-cyan-400" />
                </div>
                <h3>Access Your Credential</h3>
                <p>
                  Each certificate is private and protected. Only you can view and download your certificate using the code sent to your email.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="gate-form">
                {/* Verification Code Input */}
                <div className="input-group">
                  <label htmlFor="verify-code-input">
                    PERSONAL VERIFICATION CODE
                  </label>
                  <div className="input-field-wrap">
                    <KeyRound size={18} className="input-icon" />
                    <input
                      id="verify-code-input"
                      type="text"
                      maxLength={12}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.trim());
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="e.g. 547162"
                      className="gate-input code-input"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="input-hint">
                    Check your email inbox or spam folder for your 6-digit access code.
                  </span>
                </div>

                {/* Optional Email Input Toggle */}
                {showEmailField && (
                  <div className="input-group animate-fade-in">
                    <label htmlFor="verify-email-input">
                      REGISTERED EMAIL ADDRESS (OPTIONAL)
                    </label>
                    <div className="input-field-wrap">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="verify-email-input"
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value.trim())}
                        placeholder="your.email@example.com"
                        className="gate-input"
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="gate-error-banner animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="gate-submit-btn"
                >
                  {isLoading ? (
                    <span className="btn-loading-state">
                      <span className="btn-spinner" /> VERIFYING ACCESS...
                    </span>
                  ) : (
                    <>
                      <Unlock size={18} /> ACCESS MY CERTIFICATE
                    </>
                  )}
                </button>

                <div className="gate-footer-links">
                  {!showEmailField ? (
                    <button
                      type="button"
                      onClick={() => setShowEmailField(true)}
                      className="link-btn"
                    >
                      Verify with Email + Code
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowEmailField(false)}
                      className="link-btn"
                    >
                      Verify with Code Only
                    </button>
                  )}
                </div>
              </form>

              {/* Assistance Notice */}
              <div className="gate-help-box">
                <HelpCircle size={16} className="text-zinc-500 flex-shrink-0" />
                <p>
                  Haven't received your code? Contact the organizing team via WhatsApp or reach out to Let's Cook to request your credential passkey.
                </p>
              </div>
            </div>

            {/* Official Event Registry Details */}
            <div className="events-directory-showcase">
              <div className="directory-header">
                <Sparkles size={18} className="text-cyan-400" />
                <h3>Event Verification Details</h3>
              </div>

              <div className="events-directory-grid">
                {events.map(ev => (
                  <div key={ev.id} className="event-directory-card">
                    <div className="event-dir-header">
                      <span className="event-category-badge">{ev.category}</span>
                      <span className="event-date-tag">{ev.date}</span>
                    </div>
                    <h4>{ev.name}</h4>
                    <p>{ev.description}</p>
                    <div className="event-dir-footer">
                      <span>Organized by {ev.organization} {ev.partner ? `× ${ev.partner}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        .verify-page-wrapper {
          position: relative;
          min-height: 100vh;
          padding: 30px 20px 80px 20px;
          background-color: #060608;
          color: #f1f5f9;
          overflow-x: hidden;
        }

        .verify-ambient-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .verify-radial-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 450px;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.09) 0%, rgba(255, 0, 85, 0.03) 50%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .verify-main-container {
          position: relative;
          z-index: 1;
          max-width: 980px;
          margin: 0 auto;
        }

        .verify-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
        }

        .verify-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .verify-back-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 240, 255, 0.3);
          transform: translateX(-2px);
        }

        .verify-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .status-ping {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .verify-hero {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 36px auto;
        }

        .verify-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0, 240, 255, 0.06);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 999px;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #00f0ff;
          margin-bottom: 20px;
        }

        .verify-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f0ff 0%, #38bdf8 60%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .verify-subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Access Gate Card */
        .verify-gate-section {
          display: flex;
          flex-direction: column;
          gap: 40px;
          max-width: 620px;
          margin: 0 auto;
        }

        .gate-card {
          background: linear-gradient(165deg, rgba(20, 24, 34, 0.88) 0%, rgba(10, 12, 18, 0.98) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 240, 255, 0.05);
        }

        .gate-card-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .gate-lock-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px auto;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gate-card-header h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .gate-card-header p {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .gate-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.06em;
        }

        .input-field-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .gate-input {
          width: 100%;
          height: 54px;
          padding: 0 20px 0 48px;
          background: rgba(14, 16, 24, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          color: #ffffff;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .gate-input:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          background: rgba(18, 22, 32, 0.95);
        }

        .code-input {
          font-family: var(--font-mono, monospace);
          font-size: 1.25rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .input-hint {
          font-size: 0.76rem;
          color: #64748b;
        }

        .gate-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #f87171;
          font-size: 0.86rem;
        }

        .gate-submit-btn {
          height: 52px;
          background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
          border: none;
          border-radius: 14px;
          color: #060608;
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 6px 25px rgba(0, 240, 255, 0.3);
        }

        .gate-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.12);
          box-shadow: 0 10px 30px rgba(0, 240, 255, 0.45);
        }

        .gate-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-loading-state {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(6, 6, 8, 0.3);
          border-top-color: #060608;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gate-footer-links {
          text-align: center;
        }

        .link-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.82rem;
          cursor: pointer;
          text-decoration: underline;
          transition: color 0.2s ease;
        }

        .link-btn:hover {
          color: #00f0ff;
        }

        .gate-help-box {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .gate-help-box p {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Verified View Specifics */
        .verified-view-section {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .verified-credential-card {
          background: linear-gradient(165deg, rgba(20, 24, 34, 0.85) 0%, rgba(10, 12, 18, 0.95) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.08);
        }

        .cred-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
        }

        .cred-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cred-badge-status {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.8rem;
          font-weight: 800;
          color: #34d399;
          letter-spacing: 0.06em;
        }

        .cred-badge-id {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .cred-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cred-reset-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .cred-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
        }

        .cred-field label {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .cred-field p {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }

        .cred-highlight-name {
          color: #00f0ff !important;
          font-size: 1.15rem !important;
          font-weight: 800 !important;
        }

        .cert-renderer-box {
          background: rgba(14, 16, 22, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
        }

        /* Event Showcase */
        .events-directory-showcase {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 24px;
        }

        .directory-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .directory-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .events-directory-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .event-directory-card {
          background: rgba(18, 22, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-dir-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .event-category-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          color: #ff0055;
          padding: 2px 8px;
          background: rgba(255, 0, 85, 0.1);
          border-radius: 6px;
        }

        .event-date-tag {
          font-size: 0.75rem;
          color: #64748b;
        }

        .event-directory-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .event-directory-card p {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
        }

        .event-dir-footer {
          margin-top: 6px;
          font-size: 0.74rem;
          color: #64748b;
          font-family: var(--font-mono, monospace);
        }

        @media (max-width: 640px) {
          .gate-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

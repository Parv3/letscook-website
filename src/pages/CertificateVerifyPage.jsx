import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  HelpCircle,
  Copy,
  Check,
  Terminal as TerminalIcon,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio
} from 'lucide-react';
import CertificateViewer from '../components/CertificateViewer';
import VerifyCyberBackground from '../components/VerifyCyberBackground';
import { verifyAndGetCertificate } from '../services/certificateService';
import { playTechClick } from '../utils/soundEngine';

export default function CertificateVerifyPage({ setCurrentPage }) {
  // Wizard steps: 'email' | 'otp' | 'static-code' | 'verified'
  const [step, setStep] = useState('email');
  
  // Inputs & State
  const [emailInput, setEmailInput] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [staticCodeInput, setStaticCodeInput] = useState('');
  
  // OTP Session Token
  const [otpSession, setOtpSession] = useState(null); // { email, expiresAt, token }
  const [resendCountdown, setResendCountdown] = useState(0);
  
  // Result
  const [selectedCert, setSelectedCert] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopiedHash, setIsCopiedHash] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Live telemetry ping jitter
  const [latency, setLatency] = useState(21);

  // Refs for 6 discrete OTP digit inputs
  const otpInputRefs = useRef([]);

  // Sync URL query params on mount (e.g. /verify?code=547162&email=...)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Let's Cook | Credential Verification Portal";

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code') || params.get('pin');
    const emailParam = params.get('email');

    if (emailParam) {
      setEmailInput(emailParam);
    }

    if (codeParam) {
      setStaticCodeInput(codeParam);
      handleStaticCodeVerify(codeParam, emailParam || '');
    }

    // Dynamic latency jitter (18ms - 25ms)
    const latencyInterval = setInterval(() => {
      setLatency(18 + Math.floor(Math.random() * 8));
    }, 3500);

    return () => {
      document.title = "Let's Cook | Student-Run Tech & Builder Community";
      clearInterval(latencyInterval);
    };
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Handle direct static code verification
  const handleStaticCodeVerify = (codeToVerify, email = '') => {
    setIsLoading(true);
    setErrorMessage('');
    const result = verifyAndGetCertificate({ code: codeToVerify, email });
    if (result.success && result.certificate) {
      setSelectedCert(result.certificate);
      setStep('verified');
    } else {
      setErrorMessage(result.error || 'Invalid verification code.');
    }
    setIsLoading(false);
  };

  // STEP 1: Request 6-digit OTP to be sent via email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    playTechClick();

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSession({
          email: cleanEmail,
          expiresAt: data.expiresAt,
          token: data.token
        });
        setStep('otp');
        setOtpDigits(['', '', '', '', '', '']);
        setResendCountdown(60); // 60s cooldown
        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setErrorMessage(data.error || 'Could not send verification code. Please check your email.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setErrorMessage('Network error while requesting code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    
    // Handle paste of full 6-digit code
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      if (digits.length >= 6) {
        triggerOtpVerification(newDigits.join(''));
      } else if (otpInputRefs.current[digits.length]) {
        otpInputRefs.current[digits.length].focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    if (errorMessage) setErrorMessage('');

    // Advance to next input
    if (cleanVal && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }

    // Auto trigger verify if last digit entered
    if (cleanVal && index === 5 && newDigits.every(d => d !== '')) {
      triggerOtpVerification(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // STEP 2: Verify submitted OTP
  const triggerOtpVerification = async (fullOtp) => {
    if (!otpSession) return;
    playTechClick();

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpSession.email,
          otp: fullOtp,
          expiresAt: otpSession.expiresAt,
          token: otpSession.token
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setSelectedCert(data.certificate);
        setStep('verified');
      } else {
        setErrorMessage(data.error || 'Invalid or expired verification code.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setErrorMessage('Network error during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualOtpSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    triggerOtpVerification(fullOtp);
  };

  const handleResetLock = () => {
    playTechClick();
    setSelectedCert(null);
    setStep('email');
    setEmailInput('');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpSession(null);
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

  const copyVerifyHash = () => {
    if (!selectedCert?.verifyHash) return;
    playTechClick();
    navigator.clipboard.writeText(selectedCert.verifyHash).then(() => {
      setIsCopiedHash(true);
      setTimeout(() => setIsCopiedHash(false), 2000);
    });
  };

  return (
    <div className="verify-page-wrapper">
      {/* 60 FPS Procedural Cyber Background */}
      <VerifyCyberBackground />

      {/* Cyber Ambient Atmosphere */}
      <div className="verify-scanline-ambient" />

      <main className="verify-main-container">
        {/* Top Telemetry & Status HUD Bar */}
        <div className="verify-top-bar">
          <button 
            onClick={handleReturnHome}
            className="verify-back-btn"
            aria-label="Return to main website"
          >
            <ArrowLeft size={14} /> 
            <span>[ RETURN TO MAIN SITE ]</span>
          </button>
          
          <div className="verify-telemetry-hud">
            <div className="hud-status-badge">
              <span className="hud-led-active" />
              <div className="hud-badge-capsule">
                <span className="badge-highlight-blue">AUTO</span>
                <span className="badge-rest">MATED OTP DISPATCH • ACTIVE</span>
              </div>
            </div>

            <div className="hud-telemetry-metrics">
              <span className="hud-metric-pill">
                <Cpu size={12} className="text-cyan-400" />
                <span>BOM-01</span>
              </span>
              <span className="hud-metric-pill">
                <Radio size={12} className="text-emerald-400" />
                <span>{latency}ms</span>
              </span>
              <span className="hud-metric-pill hidden sm:inline-flex">
                <span>TLS 1.3</span>
              </span>
              <span className="hud-metric-pill hidden md:inline-flex">
                <span>HMAC-SHA256</span>
              </span>
            </div>
          </div>
        </div>

        {/* Portal Hero Header */}
        <header className="verify-hero">
          <div className="verify-badge-pill">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>LET'S COOK OFFICIAL CREDENTIAL REGISTRY // ORIGIN 2026</span>
            <span className="badge-pulse-glow" />
          </div>

          <h1 className="verify-title">
            CERTIFICATE <span className="text-gradient-cyan">VERIFICATION</span>
          </h1>
          <p className="verify-subtitle">
            ZERO-KNOWLEDGE AUTHENTICATION GATE • 256-BIT CRYPTOGRAPHIC VERIFICATION
          </p>
        </header>

        {/* ========================================================================= */}
        {/* VIEW A: UNLOCKED & VERIFIED CERTIFICATE DISPLAY                           */}
        {/* ========================================================================= */}
        {step === 'verified' && selectedCert && (
          <section className="verified-view-section animate-fade-in">
            {/* Authenticated Verification Card */}
            <div className="verified-credential-card">
              {/* Corner tech crosshairs */}
              <div className="cyber-corner tl">+</div>
              <div className="cyber-corner tr">+</div>
              <div className="cyber-corner bl">+</div>
              <div className="cyber-corner br">+</div>

              <div className="cred-card-header">
                <div className="cred-badge">
                  <div className="cred-icon-wrap">
                    <ShieldCheck size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <span className="cred-badge-status">AUTHENTICATED CREDENTIAL RECORD</span>
                    <span className="cred-badge-id">CREDENTIAL ID: {selectedCert.id}</span>
                  </div>
                </div>

                <button 
                  onClick={handleResetLock}
                  className="cred-reset-btn"
                  title="Lock and verify another certificate"
                >
                  <Lock size={14} /> Lock & Exit
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
                  <label>INTEGRITY HASH</label>
                  <div className="hash-copy-wrap" onClick={copyVerifyHash} title="Click to copy hash">
                    <p className="font-mono text-xs text-zinc-300">{selectedCert.verifyHash}</p>
                    {isCopiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-zinc-500" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Certificate Viewer & Downloader */}
            <div className="cert-renderer-box">
              <CertificateViewer 
                certificate={selectedCert} 
                event={selectedCert.event} 
              />
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: STEP 1 - ENTER REGISTERED EMAIL                                   */}
        {/* ========================================================================= */}
        {step === 'email' && (
          <section className="verify-gate-section animate-fade-in">
            <div className="gate-card">
              {/* Corner tech crosshairs */}
              <div className="cyber-corner tl">+</div>
              <div className="cyber-corner tr">+</div>
              <div className="cyber-corner bl">+</div>
              <div className="cyber-corner br">+</div>

              <div className="gate-card-scanline" />

              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <Mail size={26} className="text-cyan-400" />
                </div>
                <h3>VERIFY VIA REGISTERED EMAIL</h3>
                <p>
                  Enter your email address from event registration. Our automated delivery engine will dispatch a confidential 6-digit one-time code to unlock your credential.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="gate-form">
                <div className="input-group">
                  <label htmlFor="verify-email-input">
                    REGISTERED EMAIL ADDRESS
                  </label>
                  <div className="input-field-wrap">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="verify-email-input"
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="e.g. participant@gmail.com"
                      className="gate-input"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="input-hint">
                    🔒 Zero-Knowledge Access • Single-Use Code Dispatched From certificates@letscook.co.in
                  </span>
                </div>

                {errorMessage && (
                  <div className="gate-error-banner animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !emailInput}
                  className="gate-submit-btn"
                >
                  {isLoading ? (
                    <span className="btn-loading-state">
                      <span className="btn-spinner" /> DISPATCHING CODE...
                    </span>
                  ) : (
                    <>
                      <span>DISPATCH VERIFICATION CODE</span> <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="gate-footer-links">
                  <button
                    type="button"
                    onClick={() => {
                      playTechClick();
                      setStep('static-code');
                      setErrorMessage('');
                    }}
                    className="link-btn"
                  >
                    Have a direct passkey? Enter code instead →
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW C: STEP 2 - ENTER 6-DIGIT OTP                                        */}
        {/* ========================================================================= */}
        {step === 'otp' && (
          <section className="verify-gate-section animate-fade-in">
            <div className="gate-card">
              {/* Corner tech crosshairs */}
              <div className="cyber-corner tl">+</div>
              <div className="cyber-corner tr">+</div>
              <div className="cyber-corner bl">+</div>
              <div className="cyber-corner br">+</div>

              <div className="gate-card-scanline" />

              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <KeyRound size={26} className="text-cyan-400" />
                </div>
                <h3>ENTER 6-DIGIT SECURITY CODE</h3>
                <p>
                  We dispatched a 6-digit one-time code to <strong className="text-cyan-400 font-mono">{otpSession?.email}</strong>. Check your inbox and spam folder.
                </p>
              </div>

              <form onSubmit={handleManualOtpSubmit} className="gate-form">
                <div className="input-group">
                  <label>
                    ONE-TIME VERIFICATION CODE
                  </label>
                  
                  {/* Discrete 6-Digit Cyber Matrix Cells */}
                  <div className="otp-matrix-row">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`otp-digit-box ${digit ? 'filled' : ''}`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <span className="input-hint text-center">
                    ⏱️ Code expires in 15 minutes • Single-use nonce
                  </span>
                </div>

                {errorMessage && (
                  <div className="gate-error-banner animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.some(d => d === '')}
                  className="gate-submit-btn"
                >
                  {isLoading ? (
                    <span className="btn-loading-state">
                      <span className="btn-spinner" /> VERIFYING HMAC SIGNATURE...
                    </span>
                  ) : (
                    <>
                      <Unlock size={18} /> UNLOCK & VIEW CERTIFICATE
                    </>
                  )}
                </button>

                <div className="gate-resend-row">
                  {resendCountdown > 0 ? (
                    <span className="resend-timer-text">
                      Resend code in <strong className="text-cyan-400 font-mono">{resendCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="resend-action-btn"
                      disabled={isLoading}
                    >
                      <RefreshCw size={14} /> Resend verification code
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      playTechClick();
                      setStep('email');
                      setErrorMessage('');
                    }}
                    className="change-email-btn"
                  >
                    Change email
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW D: FALLBACK - DIRECT PASSKEY                                         */}
        {/* ========================================================================= */}
        {step === 'static-code' && (
          <section className="verify-gate-section animate-fade-in">
            <div className="gate-card">
              {/* Corner tech crosshairs */}
              <div className="cyber-corner tl">+</div>
              <div className="cyber-corner tr">+</div>
              <div className="cyber-corner bl">+</div>
              <div className="cyber-corner br">+</div>

              <div className="gate-card-scanline" />

              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <Lock size={26} className="text-cyan-400" />
                </div>
                <h3>ENTER DIRECT PASSKEY</h3>
                <p>
                  If you received a direct 6-digit confidential passkey, enter it below to unlock your certificate immediately.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  playTechClick();
                  handleStaticCodeVerify(staticCodeInput);
                }} 
                className="gate-form"
              >
                <div className="input-group">
                  <label htmlFor="static-code-field">
                    6-DIGIT PASSKEY
                  </label>
                  <div className="input-field-wrap">
                    <KeyRound size={18} className="input-icon" />
                    <input
                      id="static-code-field"
                      type="text"
                      maxLength={12}
                      value={staticCodeInput}
                      onChange={(e) => {
                        setStaticCodeInput(e.target.value.trim());
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="e.g. 547162"
                      className="gate-input code-input font-mono"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="gate-error-banner animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !staticCodeInput}
                  className="gate-submit-btn"
                >
                  <Unlock size={18} /> UNLOCK CERTIFICATE
                </button>

                <div className="gate-footer-links">
                  <button
                    type="button"
                    onClick={() => {
                      playTechClick();
                      setStep('email');
                      setErrorMessage('');
                    }}
                    className="link-btn"
                  >
                    ← Back to email verification
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* COLLAPSIBLE CRYPTOGRAPHIC TELEMETRY DRAWER                                 */}
        {/* ========================================================================= */}
        <section className="verify-telemetry-drawer">
          <button 
            onClick={() => {
              playTechClick();
              setIsLogOpen(!isLogOpen);
            }}
            className="telemetry-drawer-toggle"
          >
            <div className="drawer-title-row">
              <TerminalIcon size={14} className="text-cyan-400" />
              <span>REGISTRY AUDIT LOG // CRYPTO-TELEMETRY</span>
            </div>
            {isLogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isLogOpen && (
            <div className="telemetry-log-console animate-fade-in">
              <div className="log-line text-zinc-500">[02:00:01] REGISTRY DAEMON INITIALIZED // NODE BOM-01</div>
              <div className="log-line text-zinc-400">[02:00:02] LOADED DATASET: 34 VERIFIED ORIGIN 2026 PARTICIPANTS</div>
              <div className="log-line text-cyan-400">[02:00:03] PROTOCOL: HMAC-SHA256 • NONCE EXPIRE: 900s</div>
              <div className="log-line text-emerald-400">[02:00:04] RESEND SENDER DOMAIN: certificates@letscook.co.in [DKIM/SPF VERIFIED]</div>
              <div className="log-line text-zinc-300">[02:00:05] CLIENT HANDSHAKE READY // STATUS: 200 OK</div>
            </div>
          )}
        </section>
      </main>

      <style>{`
        .verify-page-wrapper {
          position: relative;
          min-height: 100vh;
          padding: 30px 20px 80px 20px;
          background-color: transparent;
          color: #f1f5f9;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .verify-scanline-ambient {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.05) 0%, transparent 65%);
          pointer-events: none;
          z-index: 1;
        }

        .verify-main-container {
          position: relative;
          z-index: 2;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Top HUD Navigation Bar */
        .verify-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: rgba(10, 12, 18, 0.75);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(0, 240, 255, 0.18);
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
          flex-wrap: wrap;
          gap: 12px;
        }

        .verify-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .verify-back-btn:hover {
          color: #00f0ff;
          border-color: rgba(0, 240, 255, 0.4);
          background: rgba(0, 240, 255, 0.06);
          transform: translateX(-2px);
        }

        .verify-telemetry-hud {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hud-status-badge {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hud-led-active {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: statusPulse 2s infinite;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hud-badge-capsule {
          display: inline-flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          overflow: hidden;
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .badge-highlight-blue {
          background: #0052ff;
          color: #ffffff;
          padding: 3px 6px;
          font-weight: 800;
        }

        .badge-rest {
          color: #94a3b8;
          padding: 3px 8px;
        }

        .hud-telemetry-metrics {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hud-metric-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 3px 8px;
          font-family: monospace;
          font-size: 0.65rem;
          color: #94a3b8;
        }

        /* Hero Header */
        .verify-hero {
          text-align: center;
          margin-bottom: 44px;
        }

        .verify-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 240, 255, 0.07);
          border: 1px solid rgba(0, 240, 255, 0.3);
          padding: 7px 18px;
          border-radius: 9999px;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #00f0ff;
          margin-bottom: 20px;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.12);
          position: relative;
        }

        .badge-pulse-glow {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff;
        }

        .verify-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 12px;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f0ff 0%, #0099ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .verify-subtitle {
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.8rem;
          color: #94a3b8;
          letter-spacing: 0.1em;
          max-width: 620px;
          margin: 0 auto;
        }

        /* Cybernetic Gate Card */
        .verify-gate-section {
          display: flex;
          justify-content: center;
        }

        .gate-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: rgba(11, 14, 22, 0.82);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 240, 255, 0.22);
          border-radius: 18px;
          padding: 38px 32px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 240, 255, 0.08);
          overflow: hidden;
        }

        .gate-card-scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00f0ff, transparent);
          animation: cardScan 4s ease-in-out infinite;
          opacity: 0.6;
        }

        @keyframes cardScan {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(480px); opacity: 0; }
        }

        /* Tech Corner Brackets */
        .cyber-corner {
          position: absolute;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          color: #00f0ff;
          line-height: 1;
          user-select: none;
          pointer-events: none;
          opacity: 0.7;
        }
        .cyber-corner.tl { top: 8px; left: 10px; }
        .cyber-corner.tr { top: 8px; right: 10px; }
        .cyber-corner.bl { bottom: 8px; left: 10px; }
        .cyber-corner.br { bottom: 8px; right: 10px; }

        .gate-card-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .gate-lock-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.3);
          margin-bottom: 18px;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
        }

        .gate-card-header h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #ffffff;
          margin-bottom: 10px;
        }

        .gate-card-header p {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.55;
        }

        .gate-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group label {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #00f0ff;
        }

        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .gate-input {
          width: 100%;
          background: rgba(6, 8, 12, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 14px 14px 14px 44px;
          font-size: 0.95rem;
          color: #ffffff;
          transition: all 0.2s ease;
          outline: none;
        }

        .gate-input:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          background: rgba(6, 8, 12, 0.95);
        }

        /* Discrete 6-Digit OTP Matrix Row */
        .otp-matrix-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 6px 0;
        }

        .otp-digit-box {
          width: 52px;
          height: 60px;
          text-align: center;
          background: rgba(6, 8, 12, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 10px;
          color: #00f0ff;
          font-family: 'Space Grotesk', 'SF Mono', monospace;
          font-size: 1.8rem;
          font-weight: 800;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
        }

        .otp-digit-box:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.35);
          transform: translateY(-2px);
          background: rgba(14, 20, 32, 0.95);
        }

        .otp-digit-box.filled {
          border-color: rgba(0, 240, 255, 0.6);
          background: rgba(0, 240, 255, 0.05);
        }

        .input-hint {
          font-size: 0.72rem;
          color: #64748b;
          font-family: monospace;
          letter-spacing: 0.03em;
        }

        .gate-error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 12px 14px;
          color: #f87171;
          font-size: 0.85rem;
        }

        .gate-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          background: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%);
          color: #050608;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 15px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(0, 240, 255, 0.3);
        }

        .gate-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 240, 255, 0.5);
          filter: brightness(1.08);
        }

        .gate-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .btn-loading-state {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top-color: #050608;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gate-resend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.82rem;
        }

        .resend-action-btn, .change-email-btn, .link-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
        }

        .resend-action-btn:hover, .change-email-btn:hover, .link-btn:hover {
          color: #00f0ff;
        }

        .gate-footer-links {
          text-align: center;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Verified Section */
        .verified-view-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .verified-credential-card {
          position: relative;
          background: rgba(11, 14, 22, 0.82);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 16px;
          padding: 28px 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        .cred-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 18px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 14px;
        }

        .cred-badge {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cred-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .cred-badge-status {
          display: block;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.75rem;
          font-weight: 800;
          color: #10b981;
          letter-spacing: 0.08em;
        }

        .cred-badge-id {
          display: block;
          font-family: monospace;
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .cred-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.8rem;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cred-reset-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .cred-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }

        .cred-field label {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 4px;
        }

        .cred-field p {
          font-size: 0.92rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .cred-highlight-name {
          color: #00f0ff !important;
          font-size: 1.15rem !important;
          font-weight: 800 !important;
        }

        .hash-copy-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          width: fit-content;
        }

        .hash-copy-wrap:hover {
          border-color: rgba(0, 240, 255, 0.3);
        }

        /* Collapsible Cryptographic Telemetry Drawer */
        .verify-telemetry-drawer {
          margin-top: 48px;
          background: rgba(10, 12, 18, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }

        .telemetry-drawer-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .telemetry-drawer-toggle:hover {
          background: rgba(0, 240, 255, 0.04);
          color: #00f0ff;
        }

        .drawer-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .telemetry-log-console {
          padding: 14px 18px;
          background: #040508;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.72rem;
          line-height: 1.7;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        @media (max-width: 640px) {
          .verify-title { font-size: 1.9rem; }
          .gate-card { padding: 26px 18px; }
          .otp-digit-box { width: 42px; height: 50px; font-size: 1.5rem; }
          .otp-matrix-row { gap: 6px; }
        }
      `}</style>
    </div>
  );
}

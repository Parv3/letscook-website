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
  Trophy,
  Medal,
  Award,
  ShieldAlert,
  Clock
} from 'lucide-react';
import CertificateViewer from '../components/CertificateViewer';
import VerifyCyberBackground from '../components/VerifyCyberBackground';
import SiteExplosionEasterEgg from '../components/SiteExplosionEasterEgg';
import { verifyAndGetCertificate } from '../services/certificateService';
import { playTechClick } from '../utils/soundEngine';

// Rate Limiter configuration for passkey verification: max 4 tries per 1 hour
const RATE_LIMIT_MAX_ATTEMPTS = 4;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_STORAGE_KEY = 'lc_passkey_rate_limit_attempts';

function getPasskeyAttempts() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter(ts => typeof ts === 'number' && now - ts < RATE_LIMIT_WINDOW_MS);
  } catch {
    return [];
  }
}

function recordFailedPasskeyAttempt() {
  try {
    const attempts = getPasskeyAttempts();
    attempts.push(Date.now());
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(attempts));
    return attempts;
  } catch {
    return [];
  }
}

function clearPasskeyAttempts() {
  try {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  } catch {}
}

function getLockoutTimeRemaining() {
  const attempts = getPasskeyAttempts();
  if (attempts.length < RATE_LIMIT_MAX_ATTEMPTS) return 0;
  const earliest = attempts[0];
  const now = Date.now();
  const remaining = earliest + RATE_LIMIT_WINDOW_MS - now;
  return remaining > 0 ? remaining : 0;
}

function formatLockoutTime(ms) {
  if (ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

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
  const [isExploding, setIsExploding] = useState(false);

  // Rate Limiting State for Passkey
  const [passkeyLockoutRemaining, setPasskeyLockoutRemaining] = useState(() => getLockoutTimeRemaining());
  const [passkeyAttemptsCount, setPasskeyAttemptsCount] = useState(() => getPasskeyAttempts().length);

  // Refs for 6 discrete OTP digit inputs
  const otpInputRefs = useRef([]);

  // Live ticker for passkey lockout countdown & attempts sync
  useEffect(() => {
    const updateRateLimit = () => {
      const remaining = getLockoutTimeRemaining();
      const currentAttempts = getPasskeyAttempts();
      setPasskeyLockoutRemaining(remaining);
      setPasskeyAttemptsCount(currentAttempts.length);
    };

    updateRateLimit();
    const interval = setInterval(updateRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync URL query params on mount (e.g. /verify?code=547162&email=...)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Let's Cook | Official Certifications Portal";

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

    return () => {
      document.title = "Let's Cook | Student-Run Tech & Builder Community";
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

  // Handle direct static code verification with strict 4 tries / 1 hour rate limiting
  const handleStaticCodeVerify = (codeToVerify, email = '') => {
    // Check if user is currently locked out
    const currentLockout = getLockoutTimeRemaining();
    if (currentLockout > 0) {
      setPasskeyLockoutRemaining(currentLockout);
      setErrorMessage(`Rate limit reached: Max 4 attempts per hour. Locked for ${formatLockoutTime(currentLockout)}. Please verify via your registered email.`);
      return;
    }

    const clean = (codeToVerify || '').trim();
    if (!clean) return;

    if (clean === '300406') {
      setIsExploding(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const result = verifyAndGetCertificate({ code: clean, email });

    if (result.success && result.certificate) {
      clearPasskeyAttempts();
      setPasskeyAttemptsCount(0);
      setPasskeyLockoutRemaining(0);
      setSelectedCert(result.certificate);
      setStep('verified');
    } else {
      const updatedAttempts = recordFailedPasskeyAttempt();
      const newCount = updatedAttempts.length;
      setPasskeyAttemptsCount(newCount);

      if (newCount >= RATE_LIMIT_MAX_ATTEMPTS) {
        const lockout = getLockoutTimeRemaining();
        setPasskeyLockoutRemaining(lockout);
        setErrorMessage(
          `Security lockout active: 4 failed attempts reached. Passkey entry is locked for ${formatLockoutTime(lockout)}. You can still verify anytime via your registered email.`
        );
      } else {
        const triesLeft = RATE_LIMIT_MAX_ATTEMPTS - newCount;
        setErrorMessage(
          `${result.error || 'Invalid verification passkey.'} (${triesLeft} of ${RATE_LIMIT_MAX_ATTEMPTS} ${triesLeft === 1 ? 'try' : 'tries'} remaining this hour)`
        );
      }
    }
    setIsLoading(false);
  };

  const handleExplosionComplete = () => {
    setIsExploding(false);
    setStaticCodeInput('');
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMessage('');
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
    const clean = (fullOtp || '').trim();
    if (clean === '300406') {
      setIsExploding(true);
      return;
    }
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
          otp: clean,
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

  return (
    <div className="verify-page-wrapper">
      {/* 5-Second Site Explosion Easter Egg */}
      <SiteExplosionEasterEgg isActive={isExploding} onComplete={handleExplosionComplete} />

      {/* 60 FPS Procedural Cyber Moving Background */}
      <VerifyCyberBackground />

      {/* Subtle Ambient Radial Glow (Adapts to Winner Gold/Silver/Bronze) */}
      <div className={`verify-scanline-ambient ${selectedCert?.awardTier ? `ambient-${selectedCert.awardTier}` : ''}`} />

      <main className="verify-main-container">
        {/* Sleek Minimal Top Navigation Bar */}
        <div className="verify-top-bar">
          <button 
            onClick={handleReturnHome}
            className="verify-back-btn"
            aria-label="Return to main website"
          >
            <ArrowLeft size={16} /> 
            <span>Home</span>
          </button>
          
          <div className="verify-top-nav-links">
            <button onClick={handleReturnHome} className="top-nav-pill">
              Home
            </button>
            <button className="top-nav-pill active">
              Certifications
            </button>
            <button 
              onClick={() => {
                playTechClick();
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', '/links');
                }
                setCurrentPage('links');
              }} 
              className="top-nav-pill"
            >
              Links
            </button>
          </div>
        </div>

        {/* Portal Hero Header */}
        <header className="verify-hero">
          {step === 'verified' && selectedCert?.awardTier ? (
            <div className={`verify-badge-pill winner-badge-pill tier-${selectedCert.awardTier}`}>
              {selectedCert.awardTier === 'gold' && <Trophy size={14} className="text-yellow-400" />}
              {selectedCert.awardTier === 'silver' && <Medal size={14} className="text-slate-200" />}
              {selectedCert.awardTier === 'bronze' && <Award size={14} className="text-amber-500" />}
              <span>{selectedCert.award?.toUpperCase()} • OFFICIAL CREDENTIAL</span>
            </div>
          ) : (
            <div className="verify-badge-pill">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>LET'S COOK OFFICIAL CREDENTIAL REGISTRY</span>
            </div>
          )}

          <h1 className="verify-title">
            {step === 'verified' && selectedCert?.awardTier ? (
              <>
                Certificate of <span className={`text-gradient-${selectedCert.awardTier}`}>Achievement</span>
              </>
            ) : (
              <>
                Official <span className="text-gradient-cyan">Certifications</span>
              </>
            )}
          </h1>
          <p className="verify-subtitle">
            {step === 'verified' && selectedCert?.awardTier ? (
              <>
                Official Ideathon Podium Award credential awarded to <strong className="text-white">{selectedCert.recipient.name}</strong> for outstanding performance in ORIGIN 2026.
              </>
            ) : (
              'Enter your registered email address to receive an automated verification code and access your official certificate.'
            )}
          </p>
        </header>

        {/* ========================================================================= */}
        {/* VIEW A: UNLOCKED & VERIFIED CERTIFICATE DISPLAY                           */}
        {/* ========================================================================= */}
        {step === 'verified' && selectedCert && (
          <section className="verified-view-section animate-fade-in">
            <div className="verified-top-action-bar">
              {selectedCert.awardTier && (
                <div className={`winner-pill-chip tier-${selectedCert.awardTier}`}>
                  {selectedCert.awardTier === 'gold' && <Trophy size={14} className="text-yellow-400" />}
                  {selectedCert.awardTier === 'silver' && <Medal size={14} className="text-slate-200" />}
                  {selectedCert.awardTier === 'bronze' && <Award size={14} className="text-amber-500" />}
                  <span>{selectedCert.award}</span>
                </div>
              )}
              <button 
                onClick={handleResetLock}
                className="cred-reset-btn"
                title="Verify another certificate"
              >
                <Lock size={14} /> Verify Another Certificate
              </button>
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
              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <Mail size={26} className="text-cyan-400" />
                </div>
                <h3>Verify With Your Email</h3>
                <p>
                  Enter the email address you used during event registration. We'll send an automated 6-digit code to unlock your certificate.
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
                    A 6-digit verification code will be sent to this email.
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
                      <span className="btn-spinner" /> Sending verification code...
                    </span>
                  ) : (
                    <>
                      <span>Send Verification Code</span> <ArrowRight size={18} />
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
              <div className="gate-card-header">
                <div className="gate-lock-icon">
                  <KeyRound size={26} className="text-cyan-400" />
                </div>
                <h3>Enter Verification Code</h3>
                <p>
                  We sent a 6-digit code to <strong className="text-cyan-400 font-mono">{otpSession?.email}</strong>. Check your inbox and spam folder.
                </p>
              </div>

              <form onSubmit={handleManualOtpSubmit} className="gate-form">
                <div className="input-group">
                  <label>
                    6-DIGIT VERIFICATION CODE
                  </label>
                  
                  {/* Discrete 6-Digit Matrix Cells */}
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
                    Code expires in 15 minutes.
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
                      <span className="btn-spinner" /> Verifying code...
                    </span>
                  ) : (
                    <>
                      <Unlock size={18} /> Unlock & View Certificate
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
                      <RefreshCw size={14} /> Resend code
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
              <div className="gate-card-header">
                <div className={`gate-lock-icon ${passkeyLockoutRemaining > 0 ? 'lockout' : ''}`}>
                  {passkeyLockoutRemaining > 0 ? (
                    <ShieldAlert size={26} className="text-amber-400" />
                  ) : (
                    <KeyRound size={26} className="text-cyan-400" />
                  )}
                </div>
                <h3>{passkeyLockoutRemaining > 0 ? 'Security Lockout' : 'Enter Direct Passkey'}</h3>
                <p>
                  {passkeyLockoutRemaining > 0
                    ? 'Too many failed attempts (4/4). Passkey verification is temporarily restricted.'
                    : 'If you received a 6-digit confidential passkey, enter it below to unlock your certificate immediately.'}
                </p>
              </div>

              {passkeyLockoutRemaining > 0 ? (
                <div className="rate-limit-lockout-box animate-fade-in">
                  <div className="lockout-time-display">
                    <Clock size={18} className="text-amber-400" />
                    <span>LOCKED FOR <strong className="font-mono text-amber-300">{formatLockoutTime(passkeyLockoutRemaining)}</strong></span>
                  </div>
                  <p className="lockout-desc">
                    Maximum rate limit reached (4 tries / 1 hour). To prevent unauthorized passkey testing, direct entry is locked until the security cooldown expires.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playTechClick();
                      setStep('email');
                      setErrorMessage('');
                    }}
                    className="gate-submit-btn lockout-fallback-btn"
                  >
                    <Mail size={18} /> Verify With Email Instead
                  </button>
                  <div className="gate-footer-links">
                    <span className="text-xs text-zinc-500">Email OTP verification remains open at all times.</span>
                  </div>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    playTechClick();
                    handleStaticCodeVerify(staticCodeInput);
                  }} 
                  className="gate-form"
                >
                  <div className="input-group">
                    <div className="input-label-row">
                      <label htmlFor="static-code-field">6-DIGIT PASSKEY</label>
                      <div className="rate-limit-pills-wrap" title="Max 4 attempts per hour">
                        <span className="rate-limit-badge">
                          {RATE_LIMIT_MAX_ATTEMPTS - passkeyAttemptsCount} of {RATE_LIMIT_MAX_ATTEMPTS} tries left
                        </span>
                        <div className="rate-limit-dots">
                          {[...Array(RATE_LIMIT_MAX_ATTEMPTS)].map((_, idx) => (
                            <span 
                              key={idx} 
                              className={`attempt-dot ${idx < passkeyAttemptsCount ? 'used' : 'available'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
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
                        placeholder="e.g. 300406"
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
                    <Unlock size={18} /> Unlock Certificate
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
              )}
            </div>
          </section>
        )}
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
          background: radial-gradient(circle at 50% 15%, rgba(0, 240, 255, 0.05) 0%, transparent 60%);
          pointer-events: none;
          z-index: 1;
          transition: background 0.5s ease;
        }

        .verify-scanline-ambient.ambient-gold {
          background: radial-gradient(circle at 50% 15%, rgba(251, 191, 36, 0.12) 0%, transparent 65%);
        }

        .verify-scanline-ambient.ambient-silver {
          background: radial-gradient(circle at 50% 15%, rgba(226, 232, 240, 0.12) 0%, transparent 65%);
        }

        .verify-scanline-ambient.ambient-bronze {
          background: radial-gradient(circle at 50% 15%, rgba(234, 88, 12, 0.12) 0%, transparent 65%);
        }

        .verify-main-container {
          position: relative;
          z-index: 2;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Top Bar */
        .verify-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(10, 12, 18, 0.75);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          margin-bottom: 40px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        .verify-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 7px 14px;
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

        .verify-top-nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .top-nav-pill {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .top-nav-pill:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .top-nav-pill.active {
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid rgba(0, 240, 255, 0.25);
        }

        /* Hero Header */
        .verify-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .verify-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.3);
          padding: 6px 16px;
          border-radius: 9999px;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #00f0ff;
          margin-bottom: 16px;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
          transition: all 0.3s ease;
        }

        .winner-badge-pill.tier-gold {
          border-color: rgba(251, 191, 36, 0.5);
          background: rgba(251, 191, 36, 0.12);
          color: #fbbf24;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.25);
        }

        .winner-badge-pill.tier-silver {
          border-color: rgba(226, 232, 240, 0.5);
          background: rgba(226, 232, 240, 0.12);
          color: #f8fafc;
          box-shadow: 0 0 20px rgba(226, 232, 240, 0.25);
        }

        .winner-badge-pill.tier-bronze {
          border-color: rgba(234, 88, 12, 0.5);
          background: rgba(234, 88, 12, 0.12);
          color: #fb923c;
          box-shadow: 0 0 20px rgba(234, 88, 12, 0.25);
        }

        .verify-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f0ff 0%, #0099ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text-gradient-gold {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text-gradient-silver {
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .text-gradient-bronze {
          background: linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #b45309 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .verify-subtitle {
          font-size: 0.95rem;
          color: #94a3b8;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Gate Card */
        .verify-gate-section {
          display: flex;
          justify-content: center;
        }

        .gate-card {
          width: 100%;
          max-width: 480px;
          background: rgba(11, 14, 22, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          padding: 36px 30px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 240, 255, 0.06);
        }

        .gate-card-header {
          text-align: center;
          margin-bottom: 26px;
        }

        .gate-lock-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.25);
          margin-bottom: 16px;
        }

        .gate-card-header h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
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
          font-family: 'Space Grotesk', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94a3b8;
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
          padding: 13px 14px 13px 44px;
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

        /* 6-Digit Matrix Cells */
        .otp-matrix-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 6px 0;
        }

        .otp-digit-box {
          width: 50px;
          height: 58px;
          text-align: center;
          background: rgba(6, 8, 12, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #00f0ff;
          font-family: 'Space Grotesk', 'SF Mono', monospace;
          font-size: 1.7rem;
          font-weight: 800;
          outline: none;
          transition: all 0.2s ease;
        }

        .otp-digit-box:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
          transform: translateY(-2px);
          background: rgba(14, 20, 32, 0.95);
        }

        .otp-digit-box.filled {
          border-color: rgba(0, 240, 255, 0.6);
          background: rgba(0, 240, 255, 0.05);
        }

        .input-hint {
          font-size: 0.75rem;
          color: #64748b;
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
          font-weight: 700;
          padding: 14px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(0, 240, 255, 0.25);
        }

        .gate-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(0, 240, 255, 0.4);
          filter: brightness(1.06);
        }

        .gate-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          gap: 16px;
        }

        .verified-top-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .winner-pill-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 16px;
          border-radius: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .winner-pill-chip.tier-gold {
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.4);
          color: #fbbf24;
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.15);
        }

        .winner-pill-chip.tier-silver {
          background: rgba(226, 232, 240, 0.12);
          border: 1px solid rgba(226, 232, 240, 0.4);
          color: #f8fafc;
          box-shadow: 0 0 15px rgba(226, 232, 240, 0.15);
        }

        .winner-pill-chip.tier-bronze {
          background: rgba(234, 88, 12, 0.12);
          border: 1px solid rgba(234, 88, 12, 0.4);
          color: #fb923c;
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.15);
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

        /* Rate Limit & Security Lockout Styles */
        .gate-lock-icon.lockout {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.25);
        }

        .rate-limit-lockout-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: center;
          padding: 6px 0;
        }

        .lockout-time-display {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 12px;
          padding: 12px 18px;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #fbbf24;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
        }

        .lockout-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .lockout-fallback-btn {
          background: linear-gradient(135deg, #00f0ff 0%, #0066ff 100%) !important;
          color: #050608 !important;
          box-shadow: 0 4px 18px rgba(0, 240, 255, 0.25) !important;
        }

        .input-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .input-label-row label {
          margin-bottom: 0 !important;
        }

        .rate-limit-pills-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rate-limit-badge {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }

        .rate-limit-dots {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .attempt-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          transition: all 0.25s ease;
        }

        .attempt-dot.available {
          background: #00f0ff;
          box-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
        }

        .attempt-dot.used {
          background: #ef4444;
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
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

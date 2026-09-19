import React, { useEffect, useState, useRef } from 'react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';
import { playCinematicShatterSound, playNeonIgniteSound } from '../utils/soundEngine';
import LogoMark from './LogoMark';

/**
 * LaunchOverlay: Live Official Launch Screen with Cinematic Logo Reveal
 * 
 * Transition Phases:
 * 1. idle: Live countdown timer ticking to Monday 12:00 PM IST.
 * 2. charging: Sub-bass boom & physical screen rumble.
 * 3. cracking: Spiderweb glass fracturing shockwave dissolves countdown.
 * 4. logo-flicker: Logo reveals in center, flickers with electric neon CRT discharge.
 * 5. logo-present: Logo locks steady, presents itself with luminous pulse & motto.
 * 6. dissolve: Smooth cinematic dissolve & zoom into the live website.
 */
export default function LaunchOverlay({ onReveal }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'charging' | 'cracking' | 'logo-flicker' | 'logo-present' | 'dissolve'
  const [shockwaveRadius, setShockwaveRadius] = useState(0);
  const hasTriggeredRef = useRef(false);
  const keyBufferRef = useRef('');

  // Lock body scroll while launch overlay is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Automatic Cinematic Logo Reveal Sequence
  const playCinematicShatter = () => {
    if (animPhase !== 'idle') return;

    // Phase 1: Synthesized Sub-Bass Boom & Glass Crackle Sound
    playCinematicShatterSound();
    setAnimPhase('charging');

    // Phase 2: Spiderweb Glass Fracturing & Radial Shockwave (1000ms)
    setTimeout(() => {
      setAnimPhase('cracking');

      let radius = 0;
      const waveInterval = setInterval(() => {
        radius += 20;
        setShockwaveRadius(radius);
        if (radius >= 360) clearInterval(waveInterval);
      }, 35);
    }, 1000);

    // Phase 3: Reveal Vector Logo with Electric Flicker (1900ms)
    setTimeout(() => {
      setAnimPhase('logo-flicker');
      playNeonIgniteSound();
    }, 1900);

    // Phase 4: Logo Presents Itself Proudly (3100ms)
    setTimeout(() => {
      setAnimPhase('logo-present');
    }, 3100);

    // Phase 5: Smooth Cinematic Fade-Away as website opens (4500ms)
    setTimeout(() => {
      setAnimPhase('dissolve');
    }, 4500);

    // Phase 6: Complete Transition (5900ms)
    setTimeout(() => {
      onReveal();
    }, 5900);
  };

  // Developer Keystroke & URL Bypass
  useEffect(() => {
    // 1. URL parameter check (?dev, #dev, ?cook, etc.)
    const url = window.location.href.toLowerCase();
    if (
      url.includes('?dev') ||
      url.includes('&dev') ||
      url.includes('dev=true') || 
      url.includes('#dev') || 
      url.includes('?cook') ||
      url.includes('access=1') || 
      url.includes('access=true') || 
      url.includes('secret=1') || 
      url.includes('unlock=1') || 
      url.includes('mobile=1')
    ) {
      playCinematicShatter();
      return;
    }

    const handleKeyDown = (e) => {
      if (animPhase !== 'idle') return;

      // 2. Single Key Shortcut: Backtick / Tilde (` or ~)
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        playCinematicShatter();
        return;
      }

      // 3. Hotkey shortcut: Alt + L (Launch), Alt + C (Cook), or Alt + D (Dev)
      if (e.altKey && (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        playCinematicShatter();
        return;
      }

      // 4. Secret typed keyword: simply type 'cook', 'dev', or 'parv'
      if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        keyBufferRef.current = (keyBufferRef.current + e.key.toLowerCase()).slice(-10);
        if (
          keyBufferRef.current.endsWith('cook') || 
          keyBufferRef.current.endsWith('dev') || 
          keyBufferRef.current.endsWith('parv')
        ) {
          playCinematicShatter();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.unlock = playCinematicShatter;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete window.unlock;
    };
  }, [animPhase]);

  // Live 1-second countdown tick & auto-trigger when completed
  useEffect(() => {
    const target = getNextMondayNoon();

    const checkAndTick = () => {
      const remaining = calculateTimeLeft(target);
      setTimeLeft(remaining);

      // Auto-trigger cinematic shatter when timer reaches 0
      if (remaining.completed && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        playCinematicShatter();
      }
    };

    checkAndTick();
    const interval = setInterval(checkAndTick, 1000);
    return () => clearInterval(interval);
  }, [animPhase]);

  const isCountdownPhase = animPhase === 'idle' || animPhase === 'charging' || animPhase === 'cracking';

  return (
    <div className={`cinematic-backdrop ${animPhase}`}>
      {/* Shockwave Radial Glow Effect */}
      {animPhase !== 'idle' && shockwaveRadius > 0 && (
        <div 
          className="shockwave-ring" 
          style={{ width: `${shockwaveRadius * 4}px`, height: `${shockwaveRadius * 4}px` }}
        />
      )}

      {/* Spiderweb Glass Crack SVG Overlay */}
      {animPhase === 'cracking' && (
        <svg viewBox="0 0 1000 1000" className="cinematic-crack-svg">
          <path d="M500 500 L200 100 L400 800 L500 500 L800 200 L700 900 L500 500 L100 600 L500 500 L900 400" stroke="#a3083b" strokeWidth="4" fill="none" className="crack-path main-crack" />
          <path d="M500 500 L100 100 M500 500 L900 900 M500 500 L300 950 M500 500 L850 50" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 4" fill="none" className="crack-path secondary-crack" />
          <circle cx="500" cy="500" r="140" stroke="#ff2a6d" strokeWidth="2" fill="none" opacity="0.8" />
          <circle cx="500" cy="500" r="280" stroke="#8b002e" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      )}

      <div className={`cinematic-content ${animPhase}`}>
        {isCountdownPhase ? (
          <div className="countdown-view-group">
            <h1 className="cinematic-heading">
              MONDAY 12:00 PM IST
            </h1>

            {/* GIANT COUNTDOWN TIMER */}
            <div className="giant-timer-container">
              <div className="giant-unit">
                <span className="giant-val">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="giant-lbl">DAYS</span>
              </div>
              <span className="giant-colon">:</span>
              <div className="giant-unit">
                <span className="giant-val">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="giant-lbl">HOURS</span>
              </div>
              <span className="giant-colon">:</span>
              <div className="giant-unit">
                <span className="giant-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="giant-lbl">MINUTES</span>
              </div>
              <span className="giant-colon">:</span>
              <div className="giant-unit">
                <span className="giant-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="giant-lbl">SECONDS</span>
              </div>
            </div>
          </div>
        ) : (
          /* LOGO REVEAL, FLICKER & PRESENTATION */
          <div className={`logo-reveal-container ${animPhase}`}>
            <div className="reveal-logo-wrapper">
              <LogoMark size={140} className="reveal-logo" />
            </div>
            <div className="reveal-text-block">
              <h2 className="reveal-brand-name">LET'S COOK</h2>
              <p className="reveal-motto">CODERE · AEDIFICARE · VINCERE</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cinematic-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #060608;
          background-image: radial-gradient(circle at 50% 50%, rgba(139, 0, 46, 0.45) 0%, rgba(6, 6, 8, 0.98) 75%);
          z-index: 6000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1), filter 1.4s ease;
        }

        .cinematic-backdrop.charging {
          animation: rumble 1s ease infinite;
        }

        .cinematic-backdrop.cracking {
          animation: heavyRumble 0.8s ease infinite;
        }

        .cinematic-backdrop.dissolve {
          opacity: 0;
          transform: scale(1.15);
          filter: blur(12px);
          pointer-events: none;
        }

        @keyframes rumble {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-1px, 1px); }
          100% { transform: translate(0, 0); }
        }

        @keyframes heavyRumble {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-5px, 5px) rotate(-1deg); }
          40% { transform: translate(5px, -4px) rotate(1deg); }
          60% { transform: translate(-4px, -3px) rotate(-0.5deg); }
          80% { transform: translate(4px, 4px) rotate(0.5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .shockwave-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid #a3083b;
          box-shadow: 0 0 60px #8b002e, inset 0 0 60px #8b002e;
          pointer-events: none;
          transition: width 0.05s linear, height 0.05s linear;
        }

        .cinematic-crack-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }

        .crack-path {
          stroke-dasharray: 800;
          stroke-dashoffset: 0;
          animation: drawCrack 0.8s ease forwards;
        }

        @keyframes drawCrack {
          from { stroke-dashoffset: 800; }
          to { stroke-dashoffset: 0; }
        }

        .cinematic-content {
          position: relative;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 1200px;
          color: #ffffff;
        }

        .cinematic-heading {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 40px;
          font-weight: 600;
        }

        /* GIANT MASSIVE TIMER DISPLAY */
        .giant-timer-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 3vw, 40px);
          width: 100%;
        }

        .giant-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .giant-val {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(3.5rem, 12vw, 9.5rem);
          line-height: 0.95;
          color: #ffffff;
          text-shadow: 0 0 40px rgba(139, 0, 46, 0.6);
          letter-spacing: -0.04em;
        }

        .giant-lbl {
          font-size: clamp(0.65rem, 1.8vw, 1.1rem);
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--accent-burgundy-hover);
          margin-top: 12px;
        }

        .giant-colon {
          font-family: var(--font-display);
          font-size: clamp(2.5rem, 9vw, 7rem);
          font-weight: 700;
          color: var(--accent-burgundy);
          margin-top: -30px;
          text-shadow: 0 0 20px rgba(163, 8, 59, 0.8);
        }

        /* LOGO REVEAL PRESENTATION SECTION */
        .logo-reveal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        .logo-reveal-container.logo-flicker {
          animation: neonFlicker 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .logo-reveal-container.logo-present {
          animation: presentPulse 1.4s ease-in-out infinite alternate;
        }

        .reveal-logo-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 36px;
          border-radius: 20px;
          background: radial-gradient(circle, rgba(0, 0, 0, 0.92) 0%, rgba(6, 6, 8, 0.65) 70%, transparent 100%);
          box-shadow: 0 0 70px rgba(0, 0, 0, 0.95);
        }

        .reveal-brand-name {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 6vw, 4.4rem);
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #ffffff;
          text-shadow: 0 0 25px rgba(255, 42, 109, 0.9), 0 0 55px rgba(163, 8, 59, 0.7);
          margin-top: 6px;
        }

        .reveal-motto {
          font-family: var(--font-body);
          font-size: clamp(0.75rem, 1.8vw, 1.05rem);
          font-weight: 600;
          letter-spacing: 0.35em;
          color: #d4d4d8;
          text-transform: uppercase;
          margin-top: 8px;
          text-shadow: 0 0 12px rgba(163, 8, 59, 0.6);
        }

        @keyframes neonFlicker {
          0% { opacity: 0; transform: scale(0.88); filter: drop-shadow(0 0 0 transparent); }
          6% { opacity: 0.9; transform: scale(0.94); filter: drop-shadow(0 0 25px #a3083b); }
          12% { opacity: 0.12; filter: none; }
          20% { opacity: 0.95; transform: scale(0.98); filter: drop-shadow(0 0 45px #ff2a6d); }
          28% { opacity: 0.25; }
          38% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 0 60px #a3083b); }
          50% { opacity: 0.45; }
          65% { opacity: 1; filter: drop-shadow(0 0 75px #ff2a6d); }
          80% { opacity: 0.85; }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 50px rgba(163, 8, 59, 0.9)); }
        }

        @keyframes presentPulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 40px rgba(163, 8, 59, 0.8)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 70px rgba(255, 42, 109, 1)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 40px rgba(163, 8, 59, 0.8)); }
        }
        .cinematic-heading {
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        }

        @media (max-width: 600px) {
          .cinematic-backdrop {
            padding: 16px 12px;
          }
          .giant-timer-container {
            gap: clamp(2px, 1.2vw, 8px);
          }
          .giant-val {
            font-size: clamp(2.0rem, 8.5vw, 4.2rem);
          }
          .giant-colon {
            font-size: clamp(1.6rem, 6.5vw, 3.2rem);
            margin-top: -10px;
          }
          .giant-lbl {
            font-size: clamp(0.5rem, 1.6vw, 0.75rem);
            letter-spacing: 0.1em;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';
import { playCinematicShatterSound } from '../utils/soundEngine';

/**
 * LaunchOverlay: Live Official Launch Screen
 * Automatically triggers the 4-phase cinematic glass shatter sequence and Web Audio boom
 * when the live countdown reaches 00:00:00:00. Access to the site is strictly blocked until the timer runs out.
 */
export default function LaunchOverlay({ onReveal }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'charging' | 'cracking' | 'shattering'
  const [shockwaveRadius, setShockwaveRadius] = useState(0);
  const hasTriggeredRef = useRef(false);

  // Lock body scroll while launch overlay is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Automatic 4-Second Cinematic Shatter Sequence
  const playCinematicShatter = () => {
    if (animPhase !== 'idle') return;

    // Phase 1: Synthesized Sub-Bass Boom & Glass Crackle Sound
    playCinematicShatterSound();
    setAnimPhase('charging');

    // Phase 2: Spiderweb Glass Fracturing & Radial Shockwave Expansion (1200ms)
    setTimeout(() => {
      setAnimPhase('cracking');

      let radius = 0;
      const waveInterval = setInterval(() => {
        radius += 18;
        setShockwaveRadius(radius);
        if (radius >= 320) clearInterval(waveInterval);
      }, 40);
    }, 1200);

    // Phase 3: Explosive Glass Shatter & Slow-Motion Dissolve (2600ms)
    setTimeout(() => {
      setAnimPhase('shattering');
    }, 2600);

    // Phase 4: Complete Transition into Live Website (3800ms)
    setTimeout(() => {
      onReveal();
    }, 3800);
  };

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

  return (
    <div className={`cinematic-backdrop ${animPhase}`}>
      {/* Shockwave Radial Glow Effect */}
      {animPhase !== 'idle' && (
        <div 
          className="shockwave-ring" 
          style={{ width: `${shockwaveRadius * 4}px`, height: `${shockwaveRadius * 4}px` }}
        />
      )}

      {/* Spiderweb Glass Crack SVG Overlay */}
      {(animPhase === 'cracking' || animPhase === 'shattering') && (
        <svg viewBox="0 0 1000 1000" className="cinematic-crack-svg">
          <path d="M500 500 L200 100 L400 800 L500 500 L800 200 L700 900 L500 500 L100 600 L500 500 L900 400" stroke="#a3083b" strokeWidth="4" fill="none" className="crack-path main-crack" />
          <path d="M500 500 L100 100 M500 500 L900 900 M500 500 L300 950 M500 500 L850 50" stroke="#ffffff" strokeWidth="2" strokeDasharray="8 4" fill="none" className="crack-path secondary-crack" />
          <circle cx="500" cy="500" r="140" stroke="#ff2a6d" strokeWidth="2" fill="none" opacity="0.8" />
          <circle cx="500" cy="500" r="280" stroke="#8b002e" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      )}

      <div className={`cinematic-content ${animPhase}`}>
        <h1 className="cinematic-heading">MONDAY 12:00 PM IST</h1>

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

      <style>{`
        .cinematic-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #060608;
          background-image: radial-gradient(circle at 50% 50%, rgba(139, 0, 46, 0.4) 0%, rgba(6, 6, 8, 0.98) 75%);
          z-index: 6000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          transition: opacity 1.2s ease, transform 1.2s ease;
        }

        .cinematic-backdrop.charging {
          animation: rumble 1.2s ease infinite;
        }

        .cinematic-backdrop.cracking {
          animation: heavyRumble 0.8s ease infinite;
        }

        .cinematic-backdrop.shattering {
          opacity: 0;
          transform: scale(1.3);
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
          box-shadow: 0 0 50px #8b002e, inset 0 0 50px #8b002e;
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
          animation: drawCrack 1s ease forwards;
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
          transition: transform 0.8s ease, filter 0.8s ease;
        }

        .cinematic-content.charging {
          filter: drop-shadow(0 0 35px #a3083b);
        }

        .cinematic-content.shattering {
          transform: scale(1.2);
          filter: blur(8px) contrast(200%);
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
          margin-bottom: 0;
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

        @media (max-width: 600px) {
          .cinematic-backdrop {
            padding: 16px 12px;
          }
          .giant-timer-container {
            gap: clamp(2px, 1.2vw, 8px);
            margin-bottom: 0;
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

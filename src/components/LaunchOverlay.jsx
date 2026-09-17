import React, { useEffect, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';
import { playCinematicShatterSound } from '../utils/soundEngine';

export default function LaunchOverlay({ onReveal }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));
  const [animPhase, setAnimPhase] = useState('idle'); // 'idle' | 'charging' | 'cracking' | 'shattering'
  const [shockwaveRadius, setShockwaveRadius] = useState(0);

  // Live timer tick
  useEffect(() => {
    const target = getNextMondayNoon();
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Start Slow, Cinematic 4-Second Shatter Sequence
  const playCinematicShatter = () => {
    if (animPhase !== 'idle') return;

    // Trigger Synthesized Web Audio API Glass Shatter Boom Sound
    playCinematicShatterSound();

    // Phase 1: Energy Charge & Deep Rumble (0ms -> 1200ms)
    setAnimPhase('charging');

    // Phase 2: Spiderweb Glass Fracturing (1200ms -> 2600ms)
    setTimeout(() => {
      setAnimPhase('cracking');
      
      let radius = 0;
      const waveInterval = setInterval(() => {
        radius += 15;
        setShockwaveRadius(radius);
        if (radius >= 300) clearInterval(waveInterval);
      }, 50);
    }, 1200);

    // Phase 3: Explosive Shatter & Slow-Motion Dissolve (2600ms -> 4000ms)
    setTimeout(() => {
      setAnimPhase('shattering');
    }, 2600);

    // Phase 4: Complete Transition into Website
    setTimeout(() => {
      onReveal();
    }, 3800);
  };

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
        {/* Top Header Badge */}
        <div className="launch-header-tag">
          <Sparkles size={16} className="tag-sparkle" />
          <span>LET'S COOK OFFICIAL LAUNCH</span>
        </div>

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

        {/* Cinematic Simulation Control */}
        <div className="cinematic-controls">
          <button 
            onClick={playCinematicShatter}
            disabled={animPhase !== 'idle'}
            className="btn-primary btn-hero-play"
          >
            <Play size={20} className="play-icon" /> 
            {animPhase === 'idle' ? 'PLAY CINEMATIC SHATTER REVEAL' : 'SHATTERING & UNLOCKING...'}
          </button>
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

        .launch-header-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background-color: rgba(139, 0, 46, 0.25);
          border: 1px solid var(--accent-burgundy-border);
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          border-radius: var(--radius-badge);
          margin-bottom: 24px;
        }

        .tag-sparkle {
          color: var(--accent-burgundy-hover);
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
          margin-bottom: 60px;
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

        .cinematic-controls {
          margin-top: 10px;
        }

        .btn-hero-play {
          padding: 16px 36px;
          font-size: 1.05rem;
          letter-spacing: 0.08em;
          box-shadow: 0 10px 30px rgba(139, 0, 46, 0.5);
        }

        .play-icon {
          fill: currentColor;
        }

        @media (max-width: 600px) {
          .giant-timer-container {
            gap: 6px;
          }
          .giant-colon {
            margin-top: -15px;
          }
        }
      `}</style>
    </div>
  );
}

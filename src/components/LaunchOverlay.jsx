import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Lock, Zap } from 'lucide-react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';

export default function LaunchOverlay({ onReveal }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));
  const [isCracking, setIsCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);

  // Live Countdown & Auto-Trigger on Timer Completion
  useEffect(() => {
    const target = getNextMondayNoon();
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft(target);
      setTimeLeft(remaining);

      if (remaining.completed && !isCracking) {
        triggerGlassShatter();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isCracking]);

  // Trigger Glass Crack & Shatter Transition
  const triggerGlassShatter = () => {
    setIsCracking(true);
    let step = 0;
    const crackInterval = setInterval(() => {
      step += 1;
      setCrackProgress(step);
      if (step >= 10) {
        clearInterval(crackInterval);
        setTimeout(() => {
          onReveal();
        }, 400);
      }
    }, 120);
  };

  // Canvas Scratch Foil Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#5b0e2d');
    gradient.addColorStop(0.5, '#8b002e');
    gradient.addColorStop(1, '#2b0314');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < canvas.width; i += 16) {
      ctx.fillRect(i, 0, 1, canvas.height);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO PREVIEW COUNTDOWN', canvas.width / 2, canvas.height / 2);

    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Swipe or drag across foil', canvas.width / 2, canvas.height / 2 + 22);
  }, []);

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas || isCracking) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x - rect.left, y - rect.top, 32, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }

    const percent = Math.round((transparentCount / (pixels.length / 4)) * 100);
    setScratchPercent(percent);
  };

  const handleMouseDown = (e) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsScratching(false);

  const handleTouchStart = (e) => {
    setIsScratching(true);
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isScratching) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  return (
    <div className={`launch-overlay-backdrop ${isCracking ? 'shattering' : ''}`}>
      <div className={`launch-container ${isCracking ? 'crack-shake' : ''}`}>
        
        {/* Top Status Header */}
        <div className="launch-badge">
          <Lock size={14} className="lock-icon" />
          <span>SITE LOCKED UNTIL LAUNCH</span>
        </div>

        <h1 className="launch-title">LET'S COOK OFFICIAL LAUNCH</h1>
        <p className="launch-subtitle">
          The main website unlocks automatically when the countdown hits zero on <strong>Monday at 12:00 PM IST</strong>.
        </p>

        {/* Scratch & Timer Card Wrapper */}
        <div className="scratch-card-wrapper">
          {/* Glass Crack SVG Animation Overlay */}
          {isCracking && (
            <div className="glass-crack-layer">
              <svg viewBox="0 0 540 220" className="crack-svg">
                <path d="M270 110 L150 20 L220 180 L270 110 L380 40 L450 160 L270 110 L90 120 L270 110 L310 200" stroke="#ff2a6d" strokeWidth="3" fill="none" className="crack-line line-1" />
                <path d="M270 110 L40 50 M270 110 L500 190 M270 110 L180 210 M270 110 L340 10" stroke="#ffffff" strokeWidth="2" fill="none" className="crack-line line-2" />
                <circle cx="270" cy="110" r={crackProgress * 25} fill="none" stroke="#8b002e" strokeWidth="6" opacity="0.8" />
              </svg>
            </div>
          )}

          {/* Underneath Content (Live Timer) */}
          <div className="timer-reveal-box">
            <span className="reveal-label">COUNTDOWN TO MONDAY 12:00 PM</span>
            
            <div className="countdown-grid">
              <div className="timer-unit">
                <span className="timer-value">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="timer-label">DAYS</span>
              </div>
              <span className="colon">:</span>
              <div className="timer-unit">
                <span className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="timer-label">HOURS</span>
              </div>
              <span className="colon">:</span>
              <div className="timer-unit">
                <span className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="timer-label">MINS</span>
              </div>
              <span className="colon">:</span>
              <div className="timer-unit">
                <span className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="timer-label">SECS</span>
              </div>
            </div>

            <div className="target-date">Unlocks Monday, 12:00 PM IST</div>
          </div>

          {/* Canvas Scratch Foil Layer */}
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Lock Status & Admin Simulation Controls */}
        <div className="launch-actions">
          <div className="lock-status-note">
            <span>Website Access: <strong>Locked</strong> ({scratchPercent}% Scratched)</span>
          </div>

          {/* Development Test Shatter Trigger */}
          <button 
            onClick={triggerGlassShatter}
            className="btn-secondary btn-sm test-shatter-btn"
            title="Simulate Timer Completion & Glass Shatter"
          >
            <Zap size={14} /> SIMULATE LAUNCH UNLOCK
          </button>
        </div>
      </div>

      <style>{`
        .launch-overlay-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-main);
          background-image: radial-gradient(circle at 50% 35%, rgba(139, 0, 46, 0.35) 0%, rgba(10, 10, 12, 0.99) 75%);
          z-index: 5000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow-y: auto;
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s ease;
        }

        .launch-overlay-backdrop.shattering {
          opacity: 0;
          transform: scale(1.15);
          pointer-events: none;
        }

        .launch-container {
          max-width: 600px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.1s ease;
        }

        .crack-shake {
          animation: crackShake 0.4s ease infinite;
        }

        @keyframes crackShake {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-3px, 3px) rotate(-1deg); }
          50% { transform: translate(3px, -2px) rotate(1deg); }
          75% { transform: translate(-2px, -3px) rotate(0deg); }
          100% { transform: translate(2px, 2px) rotate(0.5deg); }
        }

        .launch-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background-color: var(--accent-burgundy-light);
          border: 1px solid var(--accent-burgundy-border);
          color: var(--accent-burgundy-hover);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border-radius: var(--radius-badge);
          margin-bottom: 16px;
        }

        .lock-icon {
          color: var(--accent-burgundy);
        }

        .launch-title {
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          line-height: 1.1;
          margin-bottom: 12px;
          letter-spacing: -0.03em;
        }

        .launch-subtitle {
          color: var(--text-muted);
          font-size: clamp(0.85rem, 2.5vw, 1rem);
          max-width: 480px;
          margin-bottom: 28px;
        }

        .scratch-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 520px;
          height: 210px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          user-select: none;
        }

        .glass-crack-layer {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          background: rgba(139, 0, 46, 0.2);
          backdrop-filter: blur(2px);
        }

        .crack-svg {
          width: 100%;
          height: 100%;
        }

        .crack-line {
          stroke-dasharray: 400;
          stroke-dashoffset: 0;
          animation: crackDraw 0.5s ease forwards;
        }

        @keyframes crackDraw {
          from { stroke-dashoffset: 400; }
          to { stroke-dashoffset: 0; }
        }

        .timer-reveal-box {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: linear-gradient(135deg, var(--bg-surface) 0%, #1a030b 100%);
        }

        .reveal-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-burgundy-hover);
          margin-bottom: 12px;
        }

        .countdown-grid {
          display: flex;
          align-items: center;
          gap: clamp(6px, 2vw, 14px);
        }

        .timer-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: clamp(46px, 12vw, 64px);
        }

        .timer-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(1.8rem, 6vw, 2.5rem);
          color: var(--text-main);
          line-height: 1;
        }

        .timer-label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .colon {
          font-family: var(--font-display);
          font-size: clamp(1.4rem, 4vw, 2rem);
          font-weight: 700;
          color: var(--accent-burgundy);
          margin-top: -10px;
        }

        .target-date {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 12px;
        }

        .scratch-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
          touch-action: none;
        }

        .launch-actions {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .lock-status-note {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .test-shatter-btn {
          font-size: 0.75rem;
          padding: 8px 16px;
          margin-top: 4px;
          opacity: 0.85;
        }

        .test-shatter-btn:hover {
          opacity: 1;
        }

        @media (max-width: 480px) {
          .scratch-card-wrapper {
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
}

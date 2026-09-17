import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, ArrowRight, MousePointerClick } from 'lucide-react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';

export default function LaunchOverlay({ onReveal }) {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));
  const [autoRevealed, setAutoRevealed] = useState(false);

  // Update countdown timer every second
  useEffect(() => {
    const target = getNextMondayNoon();
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Canvas Foil Surface
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill canvas with rich metallic burgundy scratch foil texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#5b0e2d');
    gradient.addColorStop(0.5, '#8b002e');
    gradient.addColorStop(1, '#3b061c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Overlay subtle geometric texture pattern & text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, 0, 1, canvas.height);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE TO REVEAL COUNTDOWN', canvas.width / 2, canvas.height / 2);

    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Hold & drag mouse across foil', canvas.width / 2, canvas.height / 2 + 24);
  }, []);

  // Scratch action handlers
  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x - rect.left, y - rect.top, 28, 0, Math.PI * 2);
    ctx.fill();

    calculateScratchedPercentage();
  };

  const calculateScratchedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentCount++;
    }

    const percent = Math.round((transparentCount / (pixels.length / 4)) * 100);
    setScratchPercent(percent);

    if (percent > 45 && !autoRevealed) {
      setAutoRevealed(true);
      setTimeout(() => {
        onReveal();
      }, 600);
    }
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
    <div className="launch-overlay-backdrop animate-fade-in">
      <div className="launch-container">
        {/* Top Header Badge */}
        <div className="launch-badge">
          <Sparkles size={14} />
          <span>OFFICIAL LAUNCH EVENT</span>
        </div>

        <h1 className="launch-title">LET'S COOK LAUNCH COUNTDOWN</h1>
        <p className="launch-subtitle">
          Revealing the platform and community sprint tracks live on <strong>Monday at 12:00 PM</strong>.
        </p>

        {/* Scratch Card Container */}
        <div className="scratch-card-wrapper">
          {/* Underneath Content (Revealed Timer) */}
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

            <div className="target-date">Target: Monday, 12:00 PM IST</div>
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

        {/* Progress & Action Controls */}
        <div className="launch-actions">
          <div className="scratch-progress">
            <span>Foil Scratched: <strong>{scratchPercent}%</strong></span>
            {scratchPercent < 45 && (
              <span className="scratch-hint">
                <MousePointerClick size={14} /> Scratch box above to reveal
              </span>
            )}
          </div>

          <button onClick={onReveal} className="btn-primary btn-lg">
            ENTER SITE & MINIMIZE TIMER <ArrowRight size={18} />
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
          background-image: radial-gradient(circle at 50% 30%, rgba(139, 0, 46, 0.25) 0%, rgba(10, 10, 12, 0.98) 70%);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
        }

        .launch-container {
          max-width: 680px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .launch-title {
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.1;
          margin-bottom: 12px;
          letter-spacing: -0.03em;
        }

        .launch-subtitle {
          color: var(--text-muted);
          font-size: 1.05rem;
          max-width: 520px;
          margin-bottom: 32px;
        }

        .scratch-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 540px;
          height: 200px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          user-select: none;
        }

        .timer-reveal-box {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, var(--bg-surface) 0%, #1a030b 100%);
        }

        .reveal-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-burgundy-hover);
          margin-bottom: 12px;
        }

        .countdown-grid {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .timer-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
        }

        .timer-value {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 2.4rem;
          color: var(--text-main);
          line-height: 1;
        }

        .timer-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .colon {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-burgundy);
          margin-top: -12px;
        }

        .target-date {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 14px;
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
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
        }

        .scratch-progress {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .scratch-hint {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-burgundy-hover);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

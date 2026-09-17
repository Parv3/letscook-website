import React, { useState, useEffect, useRef } from 'react';
import { Clock, Move } from 'lucide-react';
import { getNextMondayNoon, calculateTimeLeft } from '../utils/countdown';

export default function MacOsTimerWindow({ isVisible, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(getNextMondayNoon()));

  // Live timer tick
  useEffect(() => {
    const target = getNextMondayNoon();
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Desktop Mouse Drag logic
  const handleMouseDown = (e) => {
    if (e.target.closest('.mac-control')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  // Mobile Touch Drag logic
  const handleTouchStart = (e) => {
    if (e.target.closest('.mac-control')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    posStartRef.current = { ...position };
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;

      const windowWidth = Math.min(320, window.innerWidth - 32);
      const newX = Math.max(8, Math.min(window.innerWidth - windowWidth - 8, posStartRef.current.x + dx));
      const newY = Math.max(8, Math.min(window.innerHeight - 140, posStartRef.current.y + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  if (!isVisible) return null;

  // Minimized Compact State
  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="mac-minimized-badge no-print animate-fade-in"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        title="Click to expand macOS Launch Timer Window"
      >
        <div className="mac-dot red-dot"></div>
        <div className="mac-dot yellow-dot"></div>
        <div className="mac-dot green-dot"></div>
        <Clock size={13} className="badge-clock" />
        <span className="badge-text">
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>

        <style>{`
          .mac-minimized-badge {
            position: fixed;
            z-index: 2500;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background-color: var(--bg-surface);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-btn);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            cursor: pointer;
            color: var(--text-main);
          }
          .badge-clock {
            color: var(--accent-burgundy);
          }
          .badge-text {
            font-family: var(--font-display);
            font-size: 0.75rem;
            font-weight: 700;
          }
        `}</style>
      </button>
    );
  }

  return (
    <div
      className="mac-window-container no-print animate-fade-in"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* macOS Titlebar Header */}
      <div 
        className="mac-titlebar" 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="mac-controls">
          <button onClick={onClose} className="mac-control red-dot" title="Close window" aria-label="Close window" />
          <button onClick={() => setIsMinimized(true)} className="mac-control yellow-dot" title="Minimize window" aria-label="Minimize window" />
          <button onClick={() => setPosition({ x: 16, y: 80 })} className="mac-control green-dot" title="Reset position" aria-label="Reset position" />
        </div>

        <div className="mac-title">
          <Clock size={12} className="mac-title-icon" />
          <span>launch-timer.sh</span>
        </div>

        <div className="drag-handle-hint">
          <Move size={12} />
        </div>
      </div>

      {/* macOS Window Body */}
      <div className="mac-body">
        <div className="mac-timer-header">
          <span>UNLOCKS MONDAY 12:00 PM IST</span>
        </div>

        <div className="mac-countdown-row">
          <div className="mac-unit">
            <span className="mac-val">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="mac-lbl">DAYS</span>
          </div>
          <span className="mac-colon">:</span>
          <div className="mac-unit">
            <span className="mac-val">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="mac-lbl">HOURS</span>
          </div>
          <span className="mac-colon">:</span>
          <div className="mac-unit">
            <span className="mac-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="mac-lbl">MINS</span>
          </div>
          <span className="mac-colon">:</span>
          <div className="mac-unit">
            <span className="mac-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="mac-lbl">SECS</span>
          </div>
        </div>
      </div>

      <style>{`
        .mac-window-container {
          position: fixed;
          z-index: 2500;
          width: 300px;
          max-width: calc(100vw - 24px);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          user-select: none;
          touch-action: none;
        }

        .mac-titlebar {
          height: 34px;
          background-color: var(--bg-main);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          cursor: move;
        }

        .mac-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mac-control {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .red-dot { background-color: #ff5f56; }
        .yellow-dot { background-color: #ffbd2e; }
        .green-dot { background-color: #27c93f; }

        .mac-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.03em;
        }

        .mac-title-icon {
          color: var(--accent-burgundy);
        }

        .drag-handle-hint {
          color: var(--text-dim);
          display: flex;
          align-items: center;
        }

        .mac-body {
          padding: 14px;
          background: linear-gradient(180deg, var(--bg-surface) 0%, #16161c 100%);
        }

        .mac-timer-header {
          text-align: center;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent-burgundy-hover);
          margin-bottom: 8px;
        }

        .mac-countdown-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .mac-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 40px;
        }

        .mac-val {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1;
        }

        .mac-lbl {
          font-size: 0.55rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .mac-colon {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-burgundy);
          margin-top: -6px;
        }
      `}</style>
    </div>
  );
}

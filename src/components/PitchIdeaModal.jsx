import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, ExternalLink, CheckCircle2, Terminal, Move, Minus, Maximize2 } from 'lucide-react';
import { getTrackedUrl } from '../utils/utmTracker';
import { playTechClick } from '../utils/soundEngine';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

/**
 * PitchIdeaModal: macOS Terminal Window Sliding Up From Bottom
 * Replaces generic centered popup with an authentic macOS window docked at the bottom of the screen.
 * Supports titlebar controls (red: close, yellow: minimize to bottom dock, green: expand), drag handles,
 * and touch/mouse slide-up behavior.
 */
export default function PitchIdeaModal({ isOpen, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Drag State for macOS window
  const [positionOffset, setPositionOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset position offset when reopened
  useEffect(() => {
    if (isOpen) {
      setPositionOffset({ x: 0, y: 0 });
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.mac-control')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    offsetStartRef.current = { ...positionOffset };
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.mac-control')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    offsetStartRef.current = { ...positionOffset };
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      setPositionOffset({
        x: offsetStartRef.current.x + dx,
        y: Math.min(200, Math.max(-500, offsetStartRef.current.y + dy))
      });
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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    playTechClick();
    if (!projectTitle || !description || !email) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setProjectTitle('');
      setTechStack('');
      setDescription('');
      setEmail('');
      onClose();
    }, 4000);
  };

  // Minimized Bottom Badge State
  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="mac-pitch-minimized-badge no-print animate-fade-in"
        title="Click to expand macOS Pitch Project Window"
      >
        <div className="mac-dot red-dot"></div>
        <div className="mac-dot yellow-dot"></div>
        <div className="mac-dot green-dot"></div>
        <Terminal size={14} className="badge-terminal-icon" />
        <span className="badge-text">pitch-project.sh [DRAFT SAVED]</span>
        <Maximize2 size={12} className="badge-expand-icon" />

        <style>{`
          .mac-pitch-minimized-badge {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 5500;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background-color: var(--bg-surface);
            border: 1px solid var(--accent-burgundy-border);
            border-radius: var(--radius-btn);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            cursor: pointer;
            color: var(--text-main);
            animation: slideUpBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .badge-terminal-icon {
            color: var(--accent-burgundy-hover);
          }
          .badge-text {
            font-family: var(--font-display);
            font-size: 0.8rem;
            font-weight: 700;
          }
          .badge-expand-icon {
            color: var(--text-muted);
            margin-left: 4px;
          }
          @keyframes slideUpBottom {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="pitch-backdrop-overlay no-print" onClick={onClose}>
      <div 
        className="mac-pitch-window animate-slide-up-bottom"
        onClick={e => e.stopPropagation()}
        style={{
          transform: `translate(calc(-50% + ${positionOffset.x}px), ${positionOffset.y}px)`
        }}
      >
        {/* macOS Titlebar Header */}
        <div 
          className="mac-titlebar"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="mac-controls">
            <button onClick={onClose} className="mac-control red-dot" title="Close window" aria-label="Close window" />
            <button onClick={() => setIsMinimized(true)} className="mac-control yellow-dot" title="Minimize to bottom dock" aria-label="Minimize to bottom dock" />
            <button onClick={() => setPositionOffset({ x: 0, y: 0 })} className="mac-control green-dot" title="Reset position" aria-label="Reset position" />
          </div>

          <div className="mac-title">
            <Terminal size={13} className="mac-title-icon" />
            <span>pitch-project.sh - zsh - 80x24</span>
          </div>

          <div className="drag-handle-hint" title="Drag to move window">
            <Move size={13} />
          </div>
        </div>

        {/* macOS Window Terminal Body */}
        <div className="mac-terminal-body">
          <div className="terminal-prompt-header">
            <span className="prompt-user">builder@letscook</span>
            <span className="prompt-sep">:</span>
            <span className="prompt-path">~/letscook/pitch</span>
            <span className="prompt-cmd">$ lets-cook pitch --new-project</span>
          </div>

          <div className="pitch-intro">
            <h3>PITCH A PROJECT TO LET'S COOK</h3>
            <p>Propose a software tool, AI project, or hackathon idea to form a student sprint team.</p>
          </div>

          {submitted ? (
            <div className="terminal-success-box animate-fade-in">
              <CheckCircle2 size={36} className="success-icon" />
              <h4>[SUCCESS 200 OK] PITCH SUBMITTED!</h4>
              <p>Your idea has been logged in the Let's Cook sprint queue. Community leads will contact you shortly via email or Discord.</p>
              <a 
                href={getTrackedUrl(LINKTREE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-3 glow-btn"
                onClick={playTechClick}
              >
                OPEN LINKTREE COMMUNITY PORTAL <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pitch-terminal-form">
              <div className="form-group">
                <label htmlFor="pitch-title-input">
                  <span className="term-symbol">$</span> PROJECT NAME / IDEA:
                </label>
                <input
                  id="pitch-title-input"
                  type="text"
                  placeholder="e.g. Open-Source AI Code Reviewer"
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  required
                  className="pitch-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pitch-tech-input">
                  <span className="term-symbol">$</span> REQUIRED TECH STACK:
                </label>
                <input
                  id="pitch-tech-input"
                  type="text"
                  placeholder="e.g. React, Python, FastAPI, Docker"
                  value={techStack}
                  onChange={e => setTechStack(e.target.value)}
                  className="pitch-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pitch-desc-input">
                  <span className="term-symbol">$</span> SHORT DESCRIPTION & GOALS:
                </label>
                <textarea
                  id="pitch-desc-input"
                  rows={3}
                  placeholder="What problem does this solve and what builder roles do you need?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="pitch-input textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pitch-email-input">
                  <span className="term-symbol">$</span> EMAIL / DISCORD / WHATSAPP HANDLE:
                </label>
                <input
                  id="pitch-email-input"
                  type="text"
                  placeholder="e.g. alex@student.edu or @alex_dev"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pitch-input"
                />
              </div>

              <div className="form-action-row">
                <button type="submit" className="btn-primary w-full mt-2 glow-btn">
                  EXECUTE PITCH SUBMISSION <Send size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .pitch-backdrop-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 5000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
        }

        .mac-pitch-window {
          position: fixed;
          bottom: 0;
          left: 50%;
          width: 580px;
          max-width: 100vw;
          max-height: 85vh;
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 0, 46, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 5500;
          touch-action: none;
        }

        .animate-slide-up-bottom {
          animation: slideUpBottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpBottom {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }

        .mac-titlebar {
          height: 36px;
          background-color: #0c0c10;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          cursor: move;
          user-select: none;
        }

        .mac-controls {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .mac-control {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .mac-control:hover {
          transform: scale(1.15);
        }

        .red-dot { background-color: #ff5f56; }
        .yellow-dot { background-color: #ffbd2e; }
        .green-dot { background-color: #27c93f; }

        .mac-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.04em;
        }

        .mac-title-icon {
          color: var(--accent-burgundy-hover);
        }

        .drag-handle-hint {
          color: var(--text-dim);
          display: flex;
          align-items: center;
        }

        .mac-terminal-body {
          padding: 20px 24px;
          background: linear-gradient(180deg, var(--bg-surface) 0%, #0d0d12 100%);
          overflow-y: auto;
          max-height: calc(85vh - 36px);
        }

        .terminal-prompt-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 0.75rem;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px dashed var(--border-color);
        }

        .prompt-user {
          color: var(--accent-burgundy-hover);
          font-weight: 700;
        }

        .prompt-sep {
          color: var(--text-dim);
        }

        .prompt-path {
          color: #4cc9f0;
        }

        .prompt-cmd {
          color: #f4f4f6;
          font-weight: 600;
        }

        .pitch-intro {
          margin-bottom: 18px;
        }

        .pitch-intro h3 {
          font-size: 1.25rem;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .pitch-intro p {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .pitch-terminal-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .term-symbol {
          color: var(--accent-burgundy-hover);
        }

        .pitch-input {
          width: 100%;
          padding: 10px 14px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          color: var(--text-main);
          font-size: 0.85rem;
          font-family: var(--font-body);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .pitch-input:focus {
          border-color: var(--accent-burgundy);
          box-shadow: 0 0 12px rgba(139, 0, 46, 0.4);
          outline: none;
        }

        .textarea {
          resize: none;
        }

        .terminal-success-box {
          padding: 24px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(139, 0, 46, 0.15);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-card);
        }

        .success-icon {
          color: var(--accent-burgundy-hover);
          margin-bottom: 10px;
        }

        .terminal-success-box h4 {
          font-family: monospace;
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .terminal-success-box p {
          font-size: 0.85rem;
          color: var(--text-muted);
          max-width: 420px;
          margin-bottom: 14px;
        }

        .mt-3 {
          margin-top: 12px;
        }

        @media (max-width: 640px) {
          .pitch-backdrop-overlay {
            padding: 0;
          }
          .mac-pitch-window {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 14px 14px 0 0;
            transform: none !important;
          }
          .mac-terminal-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

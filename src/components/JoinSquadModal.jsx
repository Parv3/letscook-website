import React, { useState } from 'react';
import { X, ArrowUpRight, Cpu, Layers, Terminal, Sparkles, Network, CheckCircle2 } from 'lucide-react';
import { playTechClick } from '../utils/soundEngine';
import { getTrackedUrl } from '../utils/utmTracker';

const SQUAD_TRACKS = [
  {
    id: 'systems',
    title: 'SYSTEMS & RUNTIMES',
    desc: 'Low-level architectures, Rust/Go utilities, memory optimization & compiler tools.',
    icon: Cpu,
    tag: 'RUST · GO · C++',
  },
  {
    id: 'ai-ml',
    title: 'APPLIED AI & AGENTS',
    desc: 'Autonomous multi-turn agent systems, local quantization & LLM benchmarks.',
    icon: Sparkles,
    tag: 'PYTORCH · FASTAPI · ONNX',
  },
  {
    id: 'fullstack',
    title: 'FULL-STACK & CLOUD',
    desc: 'Scalable web applications, reactive state, Dockerized deployments & edge databases.',
    icon: Layers,
    tag: 'NEXT.JS · TYPESCRIPT · DOCKER',
  },
  {
    id: 'networks',
    title: 'DISTRIBUTED & MOBILE',
    desc: 'P2P data synchronization, WebRTC mesh communication & cross-platform apps.',
    icon: Network,
    tag: 'REACT NATIVE · WEBRTC · WASM',
  },
];

const BASE_JOIN_URL = 'https://linktr.ee/letscookfoundry?utm_source=join_squad';

export default function JoinSquadModal({ isOpen, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState('systems');

  if (!isOpen) return null;

  const handleSelectTrack = (trackId) => {
    playTechClick();
    setSelectedTrack(trackId);
  };

  const handleProceedToSquad = () => {
    playTechClick();
    const finalUrl = `${BASE_JOIN_URL}&track=${selectedTrack}`;
    window.open(getTrackedUrl(finalUrl), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="join-modal-backdrop no-print" onClick={onClose}>
      <div className="join-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="join-modal-header">
          <div>
            <div className="join-badge">// SPRINT CLEARANCE TIER 01</div>
            <h3 className="join-title">CHOOSE YOUR SPRINT DISCIPLINE</h3>
          </div>
          <button onClick={onClose} className="join-close-btn" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p className="join-desc">
          Let's Cook organizes builders into focused agile squads. Select your primary core engineering discipline to route directly to matching channels and active sprint repositories.
        </p>

        {/* Tracks List */}
        <div className="tracks-list">
          {SQUAD_TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTrack === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`track-option-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="track-card-header">
                  <div className="track-icon-wrapper">
                    <Icon size={18} />
                  </div>
                  <div className="track-info">
                    <h4 className="track-name">{track.title}</h4>
                    <span className="track-tag">{track.tag}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="track-check-icon" />}
                </div>
                <p className="track-details">{track.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="join-action-row">
          <button onClick={handleProceedToSquad} className="btn-primary w-full glow-btn">
            ACCESS SQUAD CHANNELS <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .join-modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          z-index: 5500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease forwards;
        }

        .join-modal-window {
          width: 100%;
          max-width: 640px;
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-card);
          padding: 28px;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.8);
          animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .join-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .join-badge {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--logo-accent-color, #ff2a6d);
          letter-spacing: 0.12em;
          margin-bottom: 4px;
        }

        .join-title {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .join-close-btn {
          color: var(--text-dim);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .join-close-btn:hover {
          color: var(--text-main);
        }

        .join-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .tracks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .track-option-card {
          padding: 14px 16px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-badge);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .track-option-card:hover {
          border-color: var(--accent-burgundy-border);
          transform: translateX(4px);
        }

        .track-option-card.selected {
          border-color: var(--logo-accent-color, #ff2a6d);
          background-color: var(--bg-surface-hover);
          box-shadow: 0 0 16px rgba(255, 42, 109, 0.15);
        }

        .track-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }

        .track-icon-wrapper {
          color: var(--logo-accent-color, #ff2a6d);
          display: flex;
          align-items: center;
        }

        .track-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .track-name {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }

        .track-tag {
          font-family: monospace;
          font-size: 0.68rem;
          color: var(--text-dim);
          background-color: var(--bg-surface);
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid var(--border-color);
        }

        .track-check-icon {
          color: var(--logo-accent-color, #ff2a6d);
        }

        .track-details {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: 30px;
        }

        .join-action-row {
          display: flex;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 600px) {
          .join-modal-window {
            padding: 20px 16px;
          }
          .track-details {
            margin-left: 0;
            margin-top: 6px;
          }
        }
      `}</style>
    </div>
  );
}

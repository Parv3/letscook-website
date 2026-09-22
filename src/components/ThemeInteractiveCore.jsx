import React, { useState } from 'react';
import { ArrowUpRight, Zap, Shield, Sparkles, Activity } from 'lucide-react';
import { StormbreakerSVG } from './HomePage';

export default function ThemeInteractiveCore({ squad, onOpenLinks, onPlaySound }) {
  const [isSurging, setIsSurging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCoreClick = () => {
    setIsSurging(true);
    if (onPlaySound && squad?.sound) {
      squad.sound();
    }
    setTimeout(() => setIsSurging(false), 800);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const squadKey = squad?.key || 'ironman';
  const color = squad?.color || '#ff0055';
  const secondary = squad?.secondaryColor || '#00f0ff';

  return (
    <div className="interactive-core-card">
      {/* 1. Header Telemetry & Waveform Equalizer */}
      <div className="core-telemetry-header">
        <div className="core-badge-pill" style={{ borderColor: `${color}40`, color: color }}>
          <span className="core-pulse-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <span>
            {squadKey === 'ironman' && 'STARK QUANTUM CORE // 3.2 GW'}
            {squadKey === 'captain' && 'VIBRANIUM ALLIANCE // SHIELD 100%'}
            {squadKey === 'thor' && 'BIFROST PLASMA FORGE // 1.21 MV'}
            {squadKey === 'core' && 'AVENGERS PROTOCOL // LEVEL 7 ACTIVE'}
          </span>
        </div>

        {/* Live Equalizer Waveform Bars */}
        <div className="core-equalizer-bars" aria-hidden="true">
          <span className="eq-bar eq-1" style={{ background: color }} />
          <span className="eq-bar eq-2" style={{ background: secondary }} />
          <span className="eq-bar eq-3" style={{ background: color }} />
          <span className="eq-bar eq-4" style={{ background: secondary }} />
        </div>
      </div>

      {/* 2. Interactive Holographic Energy Reactor (Tilt & Surge on Click) */}
      <div 
        className={`core-reactor-stage ${isSurging ? 'core-surging' : ''}`}
        onClick={handleCoreClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          cursor: 'pointer'
        }}
        title="Click to pulse energy shockwave"
      >
        {/* Ambient Radial Energy Aura */}
        <div 
          className="core-aura-glow" 
          style={{
            background: `radial-gradient(circle, ${color}35 0%, transparent 70%)`
          }} 
        />

        {/* Dynamic Expanding Shockwave Ring on Click */}
        {isSurging && (
          <div 
            className="core-shockwave-ring" 
            style={{
              borderColor: secondary,
              boxShadow: `0 0 30px ${color}`
            }} 
          />
        )}

        {/* A. IRON MAN: Arc Reactor Cybernetic Rings */}
        {squadKey === 'ironman' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 200 200" className="reactor-svg">
              <defs>
                <radialGradient id="starkCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#00f0ff" />
                  <stop offset="75%" stopColor="#ff0055" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#070c14" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Outer Gimbal Ring */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="2" strokeDasharray="8 6" className="spin-slow" />
              <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255, 0, 85, 0.4)" strokeWidth="1.5" strokeDasharray="16 8" className="spin-reverse" />
              <circle cx="100" cy="100" r="64" fill="rgba(10, 16, 26, 0.85)" stroke="#00f0ff" strokeWidth="2.5" />
              
              {/* Triangular Core Unibeam */}
              <polygon points="100,48 144,124 56,124" fill="none" stroke="#00f0ff" strokeWidth="3" className="pulse-slow" />
              <polygon points="100,58 132,118 68,118" fill="url(#starkCore)" />
              <circle cx="100" cy="100" r="14" fill="#ffffff" filter="drop-shadow(0 0 10px #00f0ff)" />
              
              {/* Crosshair HUD Elements */}
              <line x1="100" y1="18" x2="100" y2="34" stroke="#00f0ff" strokeWidth="2" />
              <line x1="100" y1="166" x2="100" y2="182" stroke="#00f0ff" strokeWidth="2" />
              <line x1="18" y1="100" x2="34" y2="100" stroke="#00f0ff" strokeWidth="2" />
              <line x1="166" y1="100" x2="182" y2="100" stroke="#00f0ff" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* B. CAPTAIN AMERICA: Vibranium Kinetic Shield Core */}
        {squadKey === 'captain' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 200 200" className="reactor-svg">
              <defs>
                <radialGradient id="vibraniumCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0055ff" stopOpacity="0.2" />
                </radialGradient>
              </defs>
              {/* Concentric Shield Rings */}
              <circle cx="100" cy="100" r="90" fill="#991b1b" stroke="#dc2626" strokeWidth="2" className="pulse-slow" />
              <circle cx="100" cy="100" r="74" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="58" fill="#991b1b" stroke="#dc2626" strokeWidth="2" />
              <circle cx="100" cy="100" r="42" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Outer Orbital Targeting Reticle */}
              <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="12 8" className="spin-slow" />
              
              {/* Center 5-Point Star */}
              <polygon 
                points="100,68 107,84 124,84 111,94 116,110 100,100 84,110 89,94 76,84 93,84" 
                fill="#ffffff" 
                filter="drop-shadow(0 0 8px #ffffff)" 
                className="spin-reverse"
              />
            </svg>
          </div>
        )}

        {/* C. THOR: Asgardian Bifrost Plasma Sphere */}
        {squadKey === 'thor' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 200 200" className="reactor-svg">
              <defs>
                <radialGradient id="asgardGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#070c14" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Runes & Lightning Rings */}
              <circle cx="100" cy="100" r="92" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 6" className="spin-slow" />
              <circle cx="100" cy="100" r="78" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 8" className="spin-reverse" />
              <circle cx="100" cy="100" r="62" fill="rgba(20, 14, 8, 0.85)" stroke="#f59e0b" strokeWidth="2.5" />
              
              {/* Crackling Lightning Bolts */}
              <path d="M100,38 L115,70 L95,85 L125,120 L85,160" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" className="lightning-flicker-1" />
              <path d="M85,55 L70,85 L85,100 L65,135" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" className="lightning-flicker-2" />
              
              <circle cx="100" cy="100" r="22" fill="url(#asgardGlow)" />
              <circle cx="100" cy="100" r="8" fill="#ffffff" filter="drop-shadow(0 0 10px #f59e0b)" />
            </svg>
          </div>
        )}

        {/* D. CORE TEAM: Avengers Command Quantum Nexus */}
        {squadKey === 'core' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 200 200" className="reactor-svg">
              <defs>
                <radialGradient id="avengersGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#8b002e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0a0a0e" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Gyroscopic Command Rings */}
              <circle cx="100" cy="100" r="92" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="16 8" className="spin-slow" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="#ff0055" strokeWidth="1.8" strokeDasharray="8 6" className="spin-reverse" />
              <circle cx="100" cy="100" r="60" fill="rgba(14, 10, 12, 0.9)" stroke="#f59e0b" strokeWidth="2" />
              
              {/* Avengers Emblem */}
              <path d="M96 48 L68 138 L86 138 L96 106 L122 106 L122 92 L98 92 L104 64 Z" fill="#f59e0b" />
              <path d="M122 92 L144 138 L128 138 L122 122 L114 122 Z" fill="#f59e0b" />
              <polygon points="114,106 156,106 136,92" fill="#ff0055" />
              
              <circle cx="100" cy="100" r="10" fill="url(#avengersGlow)" />
            </svg>
          </div>
        )}

        {/* Click Hint Overlay */}
        <div className="core-click-hint">
          <span>{isSurging ? '⚡ ENERGY SURGE DISCHARGED' : 'TAP CORE TO PULSE ENERGY'}</span>
        </div>
      </div>

      {/* 3. Primary Network Navigation CTA */}
      <div className="core-action-footer">
        <button 
          onClick={onOpenLinks}
          className="btn-primary w-full glow-btn core-access-btn"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, #8b002e 100%)`,
            boxShadow: `0 4px 24px ${color}35`
          }}
        >
          OPEN COMMUNITY LINKS <ArrowUpRight size={17} />
        </button>
        <span className="core-footer-caption">Instant access to WhatsApp, Discord, GitHub & Socials</span>
      </div>

      <style>{`
        .interactive-core-card {
          position: relative;
          background: linear-gradient(165deg, rgba(20, 20, 26, 0.85) 0%, rgba(10, 10, 14, 0.95) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }

        .core-telemetry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .core-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid;
        }

        .core-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: statusDotPulse 1.8s infinite ease-in-out;
        }

        .core-equalizer-bars {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 16px;
        }

        .eq-bar {
          width: 3px;
          border-radius: 2px;
          opacity: 0.85;
          animation: eqBounce 1.2s infinite ease-in-out alternate;
        }
        .eq-1 { height: 60%; animation-delay: 0s; }
        .eq-2 { height: 100%; animation-delay: 0.25s; }
        .eq-3 { height: 40%; animation-delay: 0.5s; }
        .eq-4 { height: 80%; animation-delay: 0.15s; }

        @keyframes eqBounce {
          0% { height: 25%; }
          100% { height: 100%; }
        }

        .core-reactor-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 22px 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease;
          user-select: none;
          overflow: hidden;
        }

        .core-reactor-stage:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .core-aura-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          transition: background 0.4s ease;
        }

        .core-shockwave-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid;
          pointer-events: none;
          z-index: 2;
          animation: shockwaveExpand 0.75s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes shockwaveExpand {
          0% {
            width: 20px;
            height: 20px;
            opacity: 1;
          }
          100% {
            width: 260px;
            height: 260px;
            opacity: 0;
          }
        }

        .reactor-svg-wrap {
          position: relative;
          z-index: 1;
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .reactor-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .core-reactor-stage:hover .reactor-svg-wrap {
          transform: scale(1.05);
        }

        .spin-slow {
          transform-origin: center;
          animation: spinClockwise 20s linear infinite;
        }

        .spin-reverse {
          transform-origin: center;
          animation: spinCounterClockwise 15s linear infinite;
        }

        @keyframes spinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinCounterClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .pulse-slow {
          animation: corePulse 2.4s infinite ease-in-out alternate;
        }

        @keyframes corePulse {
          0% { opacity: 0.7; transform: scale(0.98); transform-origin: center; }
          100% { opacity: 1; transform: scale(1.02); transform-origin: center; }
        }

        .lightning-flicker-1 {
          animation: lightningFlicker 1.5s infinite steps(2);
        }
        .lightning-flicker-2 {
          animation: lightningFlicker 1.8s infinite steps(3) 0.3s;
        }

        @keyframes lightningFlicker {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.3; }
        }

        .core-click-hint {
          position: relative;
          z-index: 1;
          margin-top: 14px;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #8a8a98;
          transition: color 0.2s ease;
        }

        .core-reactor-stage:hover .core-click-hint {
          color: #ffffff;
        }

        .core-action-footer {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .core-access-btn {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          font-weight: 800;
          letter-spacing: 0.03em;
          height: 48px;
          transition: all 0.25s ease;
        }

        .core-access-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.12);
        }

        .core-footer-caption {
          font-size: 0.74rem;
          color: #71717a;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

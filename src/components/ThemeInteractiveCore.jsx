import React, { useState, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ThemeInteractiveCore({ squad, onOpenLinks, onPlaySound }) {
  const [isSurging, setIsSurging] = useState(false);
  const containerRef = useRef(null);

  const handleCoreClick = () => {
    setIsSurging(true);
    if (onPlaySound && squad?.sound) {
      squad.sound();
    }
    setTimeout(() => setIsSurging(false), 900);
  };

  const squadKey = squad?.key || 'ironman';
  const color = squad?.color || '#ff0055';
  const secondary = squad?.secondaryColor || '#00f0ff';

  return (
    <div className="interactive-core-card">
      {/* Interactive Holographic Energy Reactor (Zero clutter, pure visual animation) */}
      <div 
        ref={containerRef}
        className={`core-reactor-stage ${isSurging ? 'core-surging' : ''}`}
        onClick={handleCoreClick}
        title="Tap to pulse energy"
      >
        {/* Ambient Radial Energy Aura */}
        <div 
          className="core-aura-glow" 
          style={{
            background: `radial-gradient(circle, ${color}30 0%, ${secondary}15 45%, transparent 70%)`
          }} 
        />

        {/* Dynamic Expanding Shockwave Rings on Surge */}
        {isSurging && (
          <>
            <div className="core-shockwave-ring wave-1" style={{ borderColor: secondary }} />
            <div className="core-shockwave-ring wave-2" style={{ borderColor: color }} />
          </>
        )}

        {/* ======================================================== */}
        {/* A. IRON MAN: Authentic 10-Coil Stark Arc Reactor         */}
        {/* ======================================================== */}
        {squadKey === 'ironman' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 240 240" className="reactor-svg" aria-label="Stark Arc Reactor">
              <defs>
                <radialGradient id="unibeamCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#00f0ff" />
                  <stop offset="70%" stopColor="#0088cc" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="starkCoil" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#ff0055" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
                <filter id="arcNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Cybernetic Ring with HUD Ticks */}
              <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.5" strokeDasharray="4 8" className="spin-slow" />
              <circle cx="120" cy="120" r="98" fill="none" stroke="rgba(255, 0, 85, 0.35)" strokeWidth="2" strokeDasharray="14 10" className="spin-reverse" />
              
              {/* Heavy Outer Titanium Chasis */}
              <circle cx="120" cy="120" r="86" fill="rgba(8, 12, 20, 0.85)" stroke="rgba(0, 240, 255, 0.6)" strokeWidth="2.5" />
              
              {/* 10 Realistic Arc Reactor Magnetic Induction Coils */}
              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 120 120)`} className="arc-coil-group">
                  <rect x="116" y="38" width="8" height="18" rx="2" fill="url(#starkCoil)" stroke="#00f0ff" strokeWidth="1" filter="url(#arcNeonGlow)" />
                  <line x1="120" y1="56" x2="120" y2="70" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1.5" />
                </g>
              ))}

              {/* Inner Counter-Rotating Hexagonal Ring */}
              <circle cx="120" cy="120" r="62" fill="none" stroke="#00f0ff" strokeWidth="2" strokeDasharray="10 6" className="spin-fast" />
              <circle cx="120" cy="120" r="50" fill="rgba(6, 10, 16, 0.9)" stroke="rgba(255, 0, 85, 0.7)" strokeWidth="1.5" />

              {/* Floating Concentric Energy Triangle */}
              <polygon points="120,74 158,140 82,140" fill="none" stroke="#00f0ff" strokeWidth="2.5" className="pulse-fast" filter="url(#arcNeonGlow)" />
              <polygon points="120,82 150,134 90,134" fill="url(#unibeamCore)" opacity="0.8" />

              {/* Pure White High-Intensity Reactor Center */}
              <circle cx="120" cy="120" r="16" fill="#ffffff" filter="url(#arcNeonGlow)" className="pulse-fast" />

              {/* Targeting HUD Reticles */}
              <line x1="120" y1="14" x2="120" y2="30" stroke="#00f0ff" strokeWidth="2" />
              <line x1="120" y1="210" x2="120" y2="226" stroke="#00f0ff" strokeWidth="2" />
              <line x1="14" y1="120" x2="30" y2="120" stroke="#00f0ff" strokeWidth="2" />
              <line x1="210" y1="120" x2="226" y2="120" stroke="#00f0ff" strokeWidth="2" />
            </svg>
          </div>
        )}

        {/* ======================================================== */}
        {/* B. CAPTAIN AMERICA: Vibranium Shield Kinetic Matrix      */}
        {/* ======================================================== */}
        {squadKey === 'captain' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 240 240" className="reactor-svg" aria-label="Vibranium Shield">
              <defs>
                <linearGradient id="shieldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
                  <stop offset="45%" stopColor="transparent" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0.4)" />
                </linearGradient>
                <filter id="shieldGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Orbital Kinetic Dampener Ring */}
              <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="16 10" className="spin-slow" />
              <circle cx="120" cy="120" r="102" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="6 6" className="spin-reverse" />

              {/* Concentric Vibranium Bands */}
              <circle cx="120" cy="120" r="92" fill="#991b1b" stroke="#dc2626" strokeWidth="2" />
              <circle cx="120" cy="120" r="76" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="1.5" />
              <circle cx="120" cy="120" r="60" fill="#991b1b" stroke="#dc2626" strokeWidth="2" />
              <circle cx="120" cy="120" r="44" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="2" />

              {/* Dynamic Rotating Specular Sheen */}
              <circle cx="120" cy="120" r="92" fill="url(#shieldSheen)" className="spin-slow" />

              {/* Center Polished Silver Star */}
              <polygon 
                points="120,82 129,102 150,102 133,115 140,135 120,123 100,135 107,115 90,102 111,102" 
                fill="#ffffff" 
                filter="url(#shieldGlow)"
                className="pulse-fast"
              />

              {/* 8 Kinetic Dampener Nodes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <circle key={deg} cx={120 + 102 * Math.cos(deg * Math.PI / 180)} cy={120 + 102 * Math.sin(deg * Math.PI / 180)} r="3" fill="#38bdf8" />
              ))}
            </svg>
          </div>
        )}

        {/* ======================================================== */}
        {/* C. THOR: Asgardian Bifrost Plasma Forge                  */}
        {/* ======================================================== */}
        {squadKey === 'thor' && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 240 240" className="reactor-svg" aria-label="Bifrost Forge">
              <defs>
                <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Nordic Rune Rings */}
              <circle cx="120" cy="120" r="108" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="18 8" className="spin-slow" />
              <circle cx="120" cy="120" r="96" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 8" className="spin-reverse" />
              <circle cx="120" cy="120" r="78" fill="rgba(18, 12, 8, 0.88)" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Swirling Bifrost Plasma Center */}
              <circle cx="120" cy="120" r="48" fill="url(#plasmaGlow)" className="pulse-fast" filter="url(#lightningGlow)" />

              {/* Crackling High-Voltage Lightning Bolts */}
              <path d="M120,44 L138,82 L112,102 L148,142 L100,192" stroke="#38bdf8" strokeWidth="2.8" fill="none" strokeLinecap="round" className="lightning-bolt bolt-1" filter="url(#lightningGlow)" />
              <path d="M102,64 L86,102 L104,122 L78,162" stroke="#facc15" strokeWidth="2.2" fill="none" strokeLinecap="round" className="lightning-bolt bolt-2" filter="url(#lightningGlow)" />
              <path d="M140,78 L156,112 L132,132 L150,166" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" className="lightning-bolt bolt-3" />

              {/* Core Supernova Spark */}
              <circle cx="120" cy="120" r="14" fill="#ffffff" filter="url(#lightningGlow)" />
            </svg>
          </div>
        )}

        {/* ======================================================== */}
        {/* D. DESIGN TEAM: Hulk Gamma Bio-Reactor Core              */}
        {/* ======================================================== */}
        {(squadKey === 'hulk' || squadKey === 'core') && (
          <div className="reactor-svg-wrap">
            <svg viewBox="0 0 240 240" className="reactor-svg" aria-label="Hulk Gamma Bio-Reactor Core">
              <defs>
                <radialGradient id="gammaBioCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#4ade80" />
                  <stop offset="70%" stopColor="#22c55e" />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="gammaGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Concentric Gamma Containment Rings */}
              <circle cx="120" cy="120" r="108" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="16 8" className="spin-slow" />
              <circle cx="120" cy="120" r="92" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="10 10" className="spin-reverse" />
              <circle cx="120" cy="120" r="76" fill="rgba(6, 17, 9, 0.9)" stroke="#22c55e" strokeWidth="2.5" />

              {/* Rotating Concentric Octagon Core */}
              <polygon 
                points="120,54 166,73 186,120 166,166 120,186 73,166 54,120 73,73" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2" 
                className="spin-slow" 
              />

              {/* High-Energy Gamma Core Glow */}
              <circle cx="120" cy="120" r="46" fill="url(#gammaBioCoreGlow)" className="pulse-fast" filter="url(#gammaGlowFilter)" />

              {/* Central Gamma Radiation Bio-Geometry */}
              <g filter="url(#gammaGlowFilter)">
                <circle cx="120" cy="120" r="18" fill="#ffffff" />
                <path d="M120 90 L120 108 M94 135 L110 126 M146 135 L130 126" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Orbital Emerald & Violet Particle Nodes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <circle 
                  key={deg} 
                  cx={120 + 92 * Math.cos(deg * Math.PI / 180)} 
                  cy={120 + 92 * Math.sin(deg * Math.PI / 180)} 
                  r="3.5" 
                  fill={i % 2 === 0 ? '#22c55e' : '#a855f7'} 
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Only Single Clean CTA: JOIN COMMUNITY */}
      <div className="core-action-footer">
        <button 
          onClick={onOpenLinks}
          className="btn-primary w-full glow-btn core-access-btn"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, #15803d 100%)`,
            boxShadow: `0 6px 28px ${color}40`
          }}
        >
          JOIN COMMUNITY <ArrowUpRight size={18} />
        </button>
      </div>

      <style>{`
        .interactive-core-card {
          position: relative;
          background: linear-gradient(165deg, rgba(20, 20, 26, 0.85) 0%, rgba(10, 10, 14, 0.95) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }

        .core-reactor-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, border-color 0.3s ease;
          user-select: none;
          cursor: pointer;
          overflow: hidden;
          min-height: 220px;
        }

        .core-reactor-stage:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .core-aura-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 260px;
          height: 260px;
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
          border-radius: 50%;
          border: 2px solid;
          pointer-events: none;
          z-index: 2;
        }

        .wave-1 {
          animation: shockwavePulse 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        .wave-2 {
          animation: shockwavePulse 0.95s cubic-bezier(0.1, 0.8, 0.3, 1) 0.15s forwards;
        }

        @keyframes shockwavePulse {
          0% {
            width: 30px;
            height: 30px;
            opacity: 1;
          }
          100% {
            width: 320px;
            height: 320px;
            opacity: 0;
          }
        }

        .reactor-svg-wrap {
          position: relative;
          z-index: 1;
          width: 180px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .core-reactor-stage:hover .reactor-svg-wrap {
          transform: scale(1.08);
        }

        .reactor-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .spin-slow {
          transform-origin: center;
          animation: spinClockwise 22s linear infinite;
        }

        .spin-reverse {
          transform-origin: center;
          animation: spinCounterClockwise 16s linear infinite;
        }

        .spin-fast {
          transform-origin: center;
          animation: spinClockwise 10s linear infinite;
        }

        @keyframes spinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinCounterClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .pulse-fast {
          animation: corePulseFx 1.8s infinite ease-in-out alternate;
        }

        @keyframes corePulseFx {
          0% { opacity: 0.75; transform: scale(0.97); transform-origin: center; }
          100% { opacity: 1; transform: scale(1.03); transform-origin: center; }
        }

        .lightning-bolt {
          animation: lightningCycle 2s infinite ease-in-out;
        }
        .bolt-1 { animation-delay: 0s; }
        .bolt-2 { animation-delay: 0.4s; }
        .bolt-3 { animation-delay: 0.8s; }

        @keyframes lightningCycle {
          0%, 100% { opacity: 0.95; stroke-width: 2.8; }
          20% { opacity: 0.3; stroke-width: 1.5; }
          40% { opacity: 1; stroke-width: 3.2; }
          60% { opacity: 0.4; stroke-width: 1.8; }
          80% { opacity: 0.9; stroke-width: 2.5; }
        }

        .core-action-footer {
          display: flex;
          flex-direction: column;
        }

        .core-access-btn {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          font-weight: 800;
          letter-spacing: 0.05em;
          height: 50px;
          border-radius: 12px;
          font-size: 0.92rem;
          transition: all 0.25s ease;
        }

        .core-access-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.15);
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { 
  playRepulsorSound, 
  playThunderStrike, 
  playAssembleFanfare, 
  playTimeStoneReversal,
  playVibraniumPing 
} from '../utils/soundEngine';

export default function CinematicEasterEggOverlay({ effect, onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [showMandala, setShowMandala] = useState(false);

  useEffect(() => {
    if (!effect) {
      setShowMandala(false);
      return;
    }

    if (effect === 'snap') {
      // 1. THANOS SNAP & PHYSICAL ASH DUST DISINTEGRATION
      playThunderStrike();
      const canvas = canvasRef.current;
      let dustAnimId;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = (canvas.width = window.innerWidth);
        const h = (canvas.height = window.innerHeight);

        const ashList = Array.from({ length: 320 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.random() * 4 + 2,
          vy: (Math.random() - 0.5) * 3 - 2,
          size: Math.random() * 3.5 + 1.2,
          alpha: 1
        }));

        const renderAsh = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let stillAlive = false;
          ashList.forEach(a => {
            a.x += a.vx;
            a.y += a.vy;
            a.alpha -= 0.0035;
            if (a.alpha > 0) {
              stillAlive = true;
              ctx.fillStyle = `rgba(180, 180, 195, ${Math.max(0, a.alpha)})`;
              ctx.fillRect(a.x, a.y, a.size, a.size);
            }
          });
          if (stillAlive) {
            dustAnimId = requestAnimationFrame(renderAsh);
          }
        };
        dustAnimId = requestAnimationFrame(renderAsh);
      }

      // Disintegrate half the cards AND key text elements across the page
      const targetElements = document.querySelectorAll(
        '.squad-card, .stat-card, .access-box, .initiative-mini-card, .active-squad-spotlight, h1, h2, h3, .hero-subtitle, .badge-squad, .section-desc, .feature-bullet'
      );
      targetElements.forEach((el, idx) => {
        if (idx % 2 === 0) {
          el.style.transition = 'all 2.4s cubic-bezier(0.25, 1, 0.5, 1)';
          el.style.opacity = '0.04';
          el.style.filter = 'grayscale(1) blur(7px)';
          el.style.transform = 'translateY(-14px) skewX(8deg) scale(0.97)';
        }
      });

      // Doctor Strange Time Stone Reversal after 3 seconds
      const timer1 = setTimeout(() => {
        playTimeStoneReversal();
        setShowMandala(true);

        setTimeout(() => {
          targetElements.forEach(el => {
            el.style.opacity = '';
            el.style.filter = '';
            el.style.transform = '';
          });
          setShowMandala(false);
          if (onCompleteRef.current) onCompleteRef.current();
        }, 3400);
      }, 3000);

      return () => {
        if (dustAnimId) cancelAnimationFrame(dustAnimId);
        clearTimeout(timer1);
      };
    } else if (effect === 'shield') {
      // CAPTAIN AMERICA VIBRANIUM SHIELD RICOCHET
      playVibraniumPing();
      document.body.classList.add('seismic-shake');

      const ping1 = setTimeout(() => playVibraniumPing(), 550);
      const ping2 = setTimeout(() => playVibraniumPing(), 1100);
      const ping3 = setTimeout(() => playVibraniumPing(), 1700);
      const ping4 = setTimeout(() => playVibraniumPing(), 2150);

      const shakeTimer = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
      }, 2500);

      const timer = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
        if (onCompleteRef.current) onCompleteRef.current();
      }, 2800);

      return () => {
        clearTimeout(ping1);
        clearTimeout(ping2);
        clearTimeout(ping3);
        clearTimeout(ping4);
        clearTimeout(shakeTimer);
        clearTimeout(timer);
        document.body.classList.remove('seismic-shake');
      };
    } else if (effect === 'bifrost') {
      // 2. PRISMATIC BIFROST SLAM & SEISMIC RUMBLE
      playThunderStrike();
      document.body.classList.add('seismic-shake');
      const timer = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
        if (onCompleteRef.current) onCompleteRef.current();
      }, 1900);
      return () => {
        document.body.classList.remove('seismic-shake');
        clearTimeout(timer);
      };
    } else if (effect === 'jarvis') {
      // 3. STARK MARK LXXXV TACTICAL HUD OVERLAY
      playRepulsorSound();
      const cards = document.querySelectorAll('.squad-card, .stat-card, .active-squad-spotlight, .initiative-mini-card');
      cards.forEach(c => c.classList.add('plasma-glow'));
      const timer = setTimeout(() => {
        cards.forEach(c => c.classList.remove('plasma-glow'));
        if (onCompleteRef.current) onCompleteRef.current();
      }, 3800);
      return () => {
        cards.forEach(c => c.classList.remove('plasma-glow'));
        clearTimeout(timer);
      };
    } else if (effect === 'worthy') {
      // 4. THOR MJOLNIR LIGHTNING WORTHINESS TEST
      playThunderStrike();
      document.body.classList.add('seismic-shake');
      const cards = document.querySelectorAll('.squad-card, .active-squad-spotlight, .initiative-mini-card');
      cards.forEach(c => c.classList.add('plasma-glow'));
      const timer = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
        cards.forEach(c => c.classList.remove('plasma-glow'));
        if (onCompleteRef.current) onCompleteRef.current();
      }, 1800);
      return () => {
        document.body.classList.remove('seismic-shake');
        cards.forEach(c => c.classList.remove('plasma-glow'));
        clearTimeout(timer);
      };
    } else if (effect === 'assemble') {
      // 5. AVENGERS ASSEMBLE HOLOGRAPHIC CREST
      playAssembleFanfare();
      document.body.classList.add('seismic-shake');
      const timer = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
        if (onCompleteRef.current) onCompleteRef.current();
      }, 2400);
      return () => {
        document.body.classList.remove('seismic-shake');
        clearTimeout(timer);
      };
    }
  }, [effect]);

  if (!effect) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, pointerEvents: 'none' }} aria-hidden="true">
      {/* 1. Canvas for Real Dust Disintegration */}
      {effect === 'snap' && (
        <>
          <canvas 
            ref={canvasRef} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'none' }} 
          />
          {showMandala && (
            <div className="doctor-strange-mandala">
              <div className="chronal-ripple-wave" />
              <svg 
                style={{ width: '380px', height: '380px', color: '#10b981', filter: 'drop-shadow(0 0 50px #10b981) drop-shadow(0 0 90px #059669)' }} 
                viewBox="0 0 200 200"
              >
                <circle cx="100" cy="100" r="95" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="16 6 4 6" />
                <circle cx="100" cy="100" r="82" fill="none" stroke="#34d399" strokeWidth="1.8" strokeDasharray="8 8" />
                <circle cx="100" cy="100" r="68" fill="none" stroke="#6ee7b7" strokeWidth="1.2" />
                {/* Mystic Geometric Squares & Stars */}
                <polygon points="100,8 192,100 100,192 8,100" fill="none" stroke="#10b981" strokeWidth="2" />
                <polygon points="35,35 165,35 165,165 35,165" fill="none" stroke="#34d399" strokeWidth="1.5" />
                <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="5 5" />
                {/* Inner Runes & Core Eye */}
                <circle cx="100" cy="100" r="38" fill="rgba(6, 78, 59, 0.75)" stroke="#34d399" strokeWidth="2.5" />
                <circle cx="100" cy="100" r="16" fill="#a7f3d0" filter="drop-shadow(0 0 15px #6ee7b7)" />
                {/* Mystic Ring Glyph Accents */}
                <path d="M100 5 L100 25 M100 175 L100 195 M5 100 L25 100 M175 100 L195 100" stroke="#a7f3d0" strokeWidth="2" />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#6ee7b7',
                fontFamily: 'monospace',
                fontWeight: 900,
                letterSpacing: '0.25em',
                fontSize: '11px',
                textTransform: 'uppercase',
                textShadow: '0 0 12px #10b981',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}>
                TIME STONE // ENTROPY REVERSED
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. Bifrost Rainbow Pillar & Asgardian Runes */}
      {effect === 'bifrost' && (
        <div className="bifrost-overlay-screen">
          <div className="bifrost-beam-pillar" />
          <div className="bifrost-runes-text">
            ᚦ ᚢ ᚱ ᛁ ᛋ ᚨ ᛉ // ASGARDIAN BIFROST CONDUIT // 1.21 GIGAWATTS
          </div>
        </div>
      )}

      {/* 3. Stark Nanotech Interior HUD Overlay */}
      {effect === 'jarvis' && (
        <div className="jarvis-hud-screen">
          <div className="jarvis-laser-sweep" />
          
          <div className="jarvis-telemetry-top">
            <div style={{ fontWeight: 800, letterSpacing: '0.08em' }}>
              ● MARK LXXXV // STARK HUD ONLINE
            </div>
            <div style={{ color: '#a1a1aa' }}>REPULSOR POWER: 100% · F.R.I.D.A.Y. RUNTIME: NOMINAL</div>
            <div style={{ color: '#a1a1aa' }}>ALTITUDE: 12,400 FT · ARC REACTOR: 3.2 GW</div>
          </div>

          <div className="jarvis-reticle-center">
            <div className="jarvis-reticle-spin" />
            <div className="jarvis-reticle-target" />
            <div style={{ 
              position: 'absolute', 
              top: '-24px', 
              fontFamily: 'monospace', 
              fontSize: '10px', 
              color: '#00f0ff', 
              letterSpacing: '0.15em',
              fontWeight: 800 
            }}>
              TARGET ACQUIRED
            </div>
          </div>

          <div className="jarvis-telemetry-bottom">
            <div>TELEMETRY: ALL STABILIZERS NOMINAL</div>
            <div style={{ color: '#a1a1aa' }}>STATUS: PROOF THAT TONY STARK HAS A HEART</div>
          </div>
        </div>
      )}

      {/* 4. Mjolnir Worthiness Lightning Flash */}
      {effect === 'worthy' && (
        <div className="lightning-flash-screen">
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'monospace',
            fontWeight: 900,
            letterSpacing: '0.15em',
            color: '#facc15',
            fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
            textTransform: 'uppercase',
            textAlign: 'center',
            textShadow: '0 0 25px #eab308'
          }}>
            ⚡ WHOSOEVER HOLDS THIS HAMMER... ⚡
          </div>
        </div>
      )}

      {/* 5. Avengers Assemble Holographic Crest */}
      {effect === 'assemble' && (
        <div className="assemble-crest-screen">
          <svg 
            style={{ width: '320px', height: '320px', color: '#f59e0b', filter: 'drop-shadow(0 0 60px #f59e0b)' }} 
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="16 8" />
            <circle cx="100" cy="100" r="78" fill="#0d0d14" stroke="#ff0055" strokeWidth="4" />
            <path d="M96 28 L62 145 L84 145 L94 105 L128 105 L128 88 L98 88 L108 52 Z" fill="currentColor" />
            <path d="M128 88 L160 145 L138 145 L128 125 L118 125 Z" fill="currentColor" />
            <polygon points="120,105 180,105 155,85" fill="#ff0055" />
          </svg>
        </div>
      )}

      {/* 6. Captain America Vibranium Shield Ricochet */}
      {effect === 'shield' && (
        <div className="vibranium-bouncing-shield" aria-hidden="true">
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <defs>
              <radialGradient id="shieldSheen" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="96" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            <circle cx="100" cy="100" r="76" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="100" cy="100" r="56" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <circle cx="100" cy="100" r="36" fill="#1e40af" stroke="#1e3a8a" strokeWidth="1" />
            <polygon 
              points="100,67 108,86 128,86 112,98 118,118 100,106 82,118 88,98 72,86 92,86" 
              fill="#ffffff" 
              filter="drop-shadow(0 0 5px rgba(255,255,255,0.9))"
            />
            <circle cx="100" cy="100" r="96" fill="url(#shieldSheen)" />
          </svg>
        </div>
      )}
    </div>
  );
}

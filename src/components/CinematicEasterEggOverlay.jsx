import React, { useEffect, useRef, useState } from 'react';
import { 
  playRepulsorSound, 
  playThunderStrike, 
  playAssembleFanfare, 
  playTimeStoneReversal,
  playVibraniumPing,
  playCinematicShatterSound
} from '../utils/soundEngine';

export default function CinematicEasterEggOverlay({ effect, onComplete }) {
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [showMandala, setShowMandala] = useState(false);
  const [assembleStep, setAssembleStep] = useState(0);

  useEffect(() => {
    if (!effect) {
      setShowMandala(false);
      setAssembleStep(0);
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
      // 5. ALL LOGOS CONVERGE & KILL THANOS CLIMAX
      setAssembleStep(1); // Thanos manifests ("I am inevitable")
      playThunderStrike();

      // Step 2: Cap calls Assemble, fanfare sounds, 4 logos converge inwards
      const timer1 = setTimeout(() => {
        setAssembleStep(2);
        playAssembleFanfare();
      }, 950);

      // Step 3: Massive kinetic impact, shatter sound, Thanos crushed
      const timer2 = setTimeout(() => {
        setAssembleStep(3);
        playThunderStrike();
        playCinematicShatterSound();
        document.body.classList.add('seismic-shake');
      }, 2200);

      // Step 4: Shake stops, Thanos turns to ash, victory crest radiates
      const timer3 = setTimeout(() => {
        setAssembleStep(4);
        document.body.classList.remove('seismic-shake');
      }, 3300);

      // Step 5: Animation complete
      const timer4 = setTimeout(() => {
        document.body.classList.remove('seismic-shake');
        setAssembleStep(0);
        if (onCompleteRef.current) onCompleteRef.current();
      }, 4600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        document.body.classList.remove('seismic-shake');
        setAssembleStep(0);
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

      {/* 5. Avengers Assemble: Unified Strike & Kill Thanos Climax */}
      {effect === 'assemble' && (
        <div className="assemble-battle-screen">
          {/* A. Thanos Entity at Center */}
          <div className="thanos-entity" aria-label="Thanos">
            <svg 
              width="240" 
              height="240" 
              viewBox="0 0 200 200" 
              fill="none"
              style={{ filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.9))' }}
            >
              <defs>
                <linearGradient id="thanosSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="50%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>
                <linearGradient id="thanosGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
              </defs>

              {/* Thanos Head / Body */}
              <circle cx="100" cy="95" r="54" fill="url(#thanosSkin)" stroke="#3b0764" strokeWidth="2" />
              
              {/* Ridged Titan Jawline */}
              <path d="M78 112 C78 136 122 136 122 112 Z" fill="url(#thanosSkin)" stroke="#3b0764" strokeWidth="2" />
              <line x1="88" y1="118" x2="88" y2="132" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="96" y1="120" x2="96" y2="134" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="104" y1="120" x2="104" y2="134" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="112" y1="118" x2="112" y2="132" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />

              {/* Menacing Glowing Eyes */}
              <ellipse cx="84" cy="92" rx="6" ry="3" fill="#facc15" />
              <ellipse cx="116" cy="92" rx="6" ry="3" fill="#facc15" />
              <ellipse cx="84" cy="92" rx="2" ry="2" fill="#ffffff" />
              <ellipse cx="116" cy="92" rx="2" ry="2" fill="#ffffff" />

              {/* Golden Titan Battle Helmet & Crest */}
              <path d="M62 76 C62 48 138 48 138 76 L134 94 L126 78 L74 78 L66 94 Z" fill="url(#thanosGold)" stroke="#713f12" strokeWidth="2" />
              <polygon points="100,42 108,68 92,68" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />

              {/* Raised Golden Infinity Gauntlet */}
              <g transform="translate(130, 95) scale(0.65)">
                <rect x="0" y="0" width="46" height="60" rx="10" fill="url(#thanosGold)" stroke="#713f12" strokeWidth="2" />
                {/* 6 Infinity Stones */}
                <circle cx="12" cy="18" r="4" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
                <circle cx="23" cy="12" r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                <circle cx="34" cy="18" r="4" fill="#a855f7" filter="drop-shadow(0 0 6px #a855f7)" />
                <circle cx="12" cy="34" r="4" fill="#f97316" filter="drop-shadow(0 0 6px #f97316)" />
                <circle cx="34" cy="34" r="4" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)" />
                <polygon points="23,22 28,29 18,29" fill="#facc15" filter="drop-shadow(0 0 10px #facc15)" />
              </g>
            </svg>
          </div>

          {/* B. Four Converging Squad Weapons/Logos Flying In */}
          {/* 1. Top-Left: Iron Man Arc Reactor */}
          <div className="strike-logo-tl" style={{ marginLeft: '-40px', marginTop: '-40px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 20px #00f0ff)' }}>
              <circle cx="50" cy="50" r="44" fill="#0d040a" stroke="#ff0055" strokeWidth="4" strokeDasharray="10 4" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="#00f0ff" strokeWidth="3" strokeDasharray="6 6" />
              <polygon points="50,22 74,64 26,64" fill="rgba(0, 240, 255, 0.4)" stroke="#00f0ff" strokeWidth="3" />
              <circle cx="50" cy="50" r="10" fill="#ffffff" />
            </svg>
          </div>

          {/* 2. Top-Right: Captain America Vibranium Shield */}
          <div className="strike-logo-tr" style={{ marginLeft: '-40px', marginTop: '-40px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }}>
              <circle cx="50" cy="50" r="46" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <circle cx="50" cy="50" r="36" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="50" cy="50" r="26" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
              <circle cx="50" cy="50" r="16" fill="#1e40af" />
              <polygon points="50,38 53,44 60,44 55,48 57,54 50,50 43,54 45,48 40,44 47,44" fill="#ffffff" />
            </svg>
          </div>

          {/* 3. Bottom-Left: Thor Stormbreaker */}
          <div className="strike-logo-bl" style={{ marginLeft: '-40px', marginTop: '-40px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 20px #f59e0b)' }}>
              <path d="M48,22 C34,22 18,28 14,40 C12,50 18,62 48,64 Z" fill="#38bdf8" stroke="#f0f9ff" strokeWidth="2" />
              <polygon points="52,28 78,24 84,28 84,52 78,56 52,52" fill="#475569" stroke="#f59e0b" strokeWidth="2" />
              <rect x="44" y="24" width="12" height="32" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="50" cy="40" r="4" fill="#facc15" />
              <path d="M48,56 C46,65 52,72 49,82 C47,88 51,94 48,98" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* 4. Bottom-Right: Foundry Avengers Crest */}
          <div className="strike-logo-br" style={{ marginLeft: '-40px', marginTop: '-40px' }}>
            <svg width="80" height="80" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 20px #ff0055)' }}>
              <circle cx="50" cy="50" r="45" fill="#0d0d14" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 5" />
              <circle cx="50" cy="50" r="35" fill="#180a14" stroke="#ff0055" strokeWidth="2.5" />
              <path d="M48 22 L32 68 L42 68 L47 52 L60 52 L60 44 L48 44 L52 30 Z" fill="#f59e0b" />
              <polygon points="56,52 78,52 68,44" fill="#ff0055" />
            </svg>
          </div>

          {/* C. Blinding Nova Shockwave Burst on Impact */}
          <div className="assemble-nova-wave" />

          {/* D. Ascendant Victorious Avengers Crest */}
          <div className="assemble-victory-crest">
            <svg 
              style={{ width: '320px', height: '320px', color: '#f59e0b', filter: 'drop-shadow(0 0 70px #f59e0b) drop-shadow(0 0 120px #ff0055)' }} 
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="16 8" />
              <circle cx="100" cy="100" r="78" fill="#0d0d14" stroke="#ff0055" strokeWidth="4" />
              <path d="M96 28 L62 145 L84 145 L94 105 L128 105 L128 88 L98 88 L108 52 Z" fill="currentColor" />
              <path d="M128 88 L160 145 L138 145 L128 125 L118 125 Z" fill="currentColor" />
              <polygon points="120,105 180,105 155,85" fill="#ff0055" />
            </svg>
          </div>

          {/* E. Dynamic Climax Battle Text */}
          <div className="assemble-banner-text" style={{
            color: assembleStep >= 3 ? '#facc15' : assembleStep === 2 ? '#38bdf8' : '#e879f9',
            textShadow: assembleStep >= 3 ? '0 0 25px #eab308' : '0 0 20px #a855f7'
          }}>
            {assembleStep <= 1 && '💀 THANOS: "I AM INEVITABLE."'}
            {assembleStep === 2 && '⚡ "AVENGERS... ASSEMBLE!"'}
            {assembleStep >= 3 && '★ AND WE... ARE THE FOUNDRY! (THANOS ELIMINATED) ★'}
          </div>
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

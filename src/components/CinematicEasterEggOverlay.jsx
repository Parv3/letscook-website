import React, { useEffect, useRef } from 'react';
import { 
  playRepulsorSound, 
  playThunderStrike, 
  playAssembleFanfare, 
  playTimeStoneReversal 
} from '../utils/soundEngine';

export default function CinematicEasterEggOverlay({ effect, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!effect) return;

    if (effect === 'snap') {
      // 1. THANOS SNAP & REAL ASH DUST DISINTEGRATION
      playThunderStrike();
      const canvas = canvasRef.current;
      let dustAnimId;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ashList = Array.from({ length: 280 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
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

      // Disintegrate half the cards on page
      const targetCards = document.querySelectorAll('.squad-card, .stat-card, .access-box, .initiative-mini-card');
      targetCards.forEach((c, idx) => {
        if (idx % 2 === 0) {
          c.style.transition = 'all 2.2s cubic-bezier(0.25, 1, 0.5, 1)';
          c.style.opacity = '0.08';
          c.style.filter = 'grayscale(1) blur(6px)';
          c.style.transform = 'translateY(-12px) skewX(6deg)';
        }
      });

      // Doctor Strange Time Stone Reversal after 3 seconds
      const timer1 = setTimeout(() => {
        playTimeStoneReversal();
        const mandala = document.getElementById('timestone-mandala-mount');
        if (mandala) mandala.style.display = 'block';

        setTimeout(() => {
          targetCards.forEach(c => {
            c.style.opacity = '';
            c.style.filter = '';
            c.style.transform = '';
          });
          if (mandala) mandala.style.display = 'none';
          if (onComplete) onComplete();
        }, 3200);
      }, 3000);

      return () => {
        if (dustAnimId) cancelAnimationFrame(dustAnimId);
        clearTimeout(timer1);
      };
    } else if (effect === 'bifrost') {
      // 2. PRISMATIC BIFROST SLAM & SEISMIC RUMBLE
      playThunderStrike();
      document.body.classList.add('shake-active');
      const timer = setTimeout(() => {
        document.body.classList.remove('shake-active');
        if (onComplete) onComplete();
      }, 1900);
      return () => {
        document.body.classList.remove('shake-active');
        clearTimeout(timer);
      };
    } else if (effect === 'jarvis') {
      // 3. STARK MARK LXXXV TACTICAL HUD OVERLAY
      playRepulsorSound();
      const cards = document.querySelectorAll('.squad-card, .stat-card, .active-squad-spotlight');
      cards.forEach(c => c.classList.add('plasma-active'));
      const timer = setTimeout(() => {
        cards.forEach(c => c.classList.remove('plasma-active'));
        if (onComplete) onComplete();
      }, 4200);
      return () => {
        cards.forEach(c => c.classList.remove('plasma-active'));
        clearTimeout(timer);
      };
    } else if (effect === 'worthy') {
      // 4. THOR MJOLNIR LIGHTNING WORTHINESS TEST
      playThunderStrike();
      document.body.classList.add('shake-active');
      const cards = document.querySelectorAll('.squad-card, .active-squad-spotlight');
      cards.forEach(c => c.classList.add('plasma-active'));
      const timer = setTimeout(() => {
        document.body.classList.remove('shake-active');
        cards.forEach(c => c.classList.remove('plasma-active'));
        if (onComplete) onComplete();
      }, 2200);
      return () => {
        document.body.classList.remove('shake-active');
        cards.forEach(c => c.classList.remove('plasma-active'));
        clearTimeout(timer);
      };
    } else if (effect === 'assemble') {
      // 5. AVENGERS ASSEMBLE HOLOGRAPHIC CREST
      playAssembleFanfare();
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [effect, onComplete]);

  if (!effect) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }} aria-hidden="true">
      {/* 1. Canvas for Real Dust Disintegration */}
      {effect === 'snap' && (
        <>
          <canvas 
            ref={canvasRef} 
            style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} 
          />
          <div 
            id="timestone-mandala-mount" 
            className="timestone-mandala-screen"
            style={{ display: 'none' }}
          >
            <svg 
              style={{ width: '280px', height: '280px', color: '#34d399', filter: 'drop-shadow(0 0 45px #10b981)' }} 
              viewBox="0 0 200 200"
            >
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="12 6" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" />
              <polygon points="100,15 175,100 100,185 25,100" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="100,25 160,100 100,175 40,100" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="28" fill="#042f2e" stroke="currentColor" strokeWidth="3" />
              <circle cx="100" cy="100" r="10" fill="#a7f3d0" />
            </svg>
          </div>
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
    </div>
  );
}

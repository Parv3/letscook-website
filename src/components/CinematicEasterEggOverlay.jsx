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
      // 1. THANOS SNAP & DUST DISINTEGRATION
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 300 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() + 0.3) * 3,
          vy: -(Math.random() * 2 + 1),
          size: Math.random() * 4 + 1.5,
          alpha: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.4 ? '#a1a1aa' : '#52525b'
        }));

        let animId;
        const renderDust = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let alive = false;
          particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.005;
            if (p.alpha > 0) {
              alive = true;
              ctx.fillStyle = p.color;
              ctx.globalAlpha = Math.max(0, p.alpha);
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          if (alive) {
            animId = requestAnimationFrame(renderDust);
          }
        };
        animId = requestAnimationFrame(renderDust);

        // Disintegrate cards visually
        const cards = document.querySelectorAll('.squad-card, .pillar-card, .faq-item');
        cards.forEach((card, i) => {
          if (i % 2 === 0) {
            card.style.transition = 'all 1.8s cubic-bezier(0.25, 1, 0.5, 1)';
            card.style.transform = 'skew(-8deg) scale(0.96) translate(15px, -10px)';
            card.style.filter = 'blur(14px)';
            card.style.opacity = '0.05';
          }
        });

        // Time Stone Reversal after 2.8 seconds
        const timer1 = setTimeout(() => {
          playTimeStoneReversal();
          const mandala = document.getElementById('timestone-mandala-mount');
          if (mandala) mandala.style.display = 'block';

          setTimeout(() => {
            cards.forEach(card => {
              card.style.transform = '';
              card.style.filter = '';
              card.style.opacity = '';
            });
            if (mandala) mandala.style.display = 'none';
            if (onComplete) onComplete();
          }, 2400);
        }, 2800);

        return () => {
          cancelAnimationFrame(animId);
          clearTimeout(timer1);
        };
      }
    } else if (effect === 'bifrost') {
      // 2. BIFROST RAINBOW BEAM SLAM & SEISMIC SHAKE
      playThunderStrike();
      document.body.classList.add('shake-active');
      const timer = setTimeout(() => {
        document.body.classList.remove('shake-active');
        if (onComplete) onComplete();
      }, 2000);
      return () => {
        document.body.classList.remove('shake-active');
        clearTimeout(timer);
      };
    } else if (effect === 'jarvis') {
      // 3. STARK NANOTECH HUD OVERLAY
      playRepulsorSound();
      const cards = document.querySelectorAll('.squad-card, .hero-content');
      cards.forEach(c => c.classList.add('plasma-active'));
      const timer = setTimeout(() => {
        cards.forEach(c => c.classList.remove('plasma-active'));
        if (onComplete) onComplete();
      }, 5000);
      return () => {
        cards.forEach(c => c.classList.remove('plasma-active'));
        clearTimeout(timer);
      };
    } else if (effect === 'worthy') {
      // 4. THOR MJOLNIR WORTHINESS LIGHTNING
      playThunderStrike();
      document.body.classList.add('shake-active');
      const timer = setTimeout(() => {
        document.body.classList.remove('shake-active');
        if (onComplete) onComplete();
      }, 2200);
      return () => {
        document.body.classList.remove('shake-active');
        clearTimeout(timer);
      };
    } else if (effect === 'assemble') {
      // 5. AVENGERS ASSEMBLE FANFARE & CREST
      playAssembleFanfare();
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [effect, onComplete]);

  if (!effect) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. Canvas for Ash / Dust Disintegration */}
      {effect === 'snap' && (
        <>
          <canvas ref={canvasRef} className="absolute inset-0 z-50" />
          <div 
            id="timestone-mandala-mount" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none hidden"
            style={{ animation: 'timeStoneSpin 2.4s ease-in-out forwards' }}
          >
            <svg className="w-64 h-64 md:w-80 md:h-80 text-emerald-400" style={{ filter: 'drop-shadow(0 0 35px #10b981)' }} viewBox="0 0 200 200">
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
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          {/* Central Prismatic Beam */}
          <div 
            className="absolute inset-x-0 top-0 bottom-0 mx-auto w-48 md:w-80"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(56,189,248,0.9) 25%, rgba(234,179,8,0.85) 50%, rgba(236,72,153,0.9) 75%, rgba(255,255,255,1) 100%)',
              filter: 'drop-shadow(0 0 80px rgba(56,189,248,1))',
              animation: 'bifrostPillar 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          />
          {/* Asgardian Glowing Runes */}
          <div className="relative z-10 flex flex-col items-center gap-6 font-mono text-3xl md:text-5xl font-black text-amber-200 tracking-widest animate-pulse" style={{ textShadow: '0 0 20px #f59e0b' }}>
            <span>ᚦ ᚢ ᚱ</span>
            <span>ᛁ ᛋ ᚨ</span>
            <span>ᛉ</span>
          </div>
        </div>
      )}

      {/* 3. Stark Nanotech Interior HUD Overlay */}
      {effect === 'jarvis' && (
        <div className="absolute inset-0 z-50 border-2 border-cyan-400/30 bg-cyan-950/10 backdrop-blur-[1px]">
          {/* Sweeping Laser Line */}
          <div 
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" 
            style={{ 
              boxShadow: '0 0 25px #00f0ff',
              animation: 'laserSweep 2.5s linear infinite' 
            }} 
          />
          
          {/* Top Left Telemetry */}
          <div className="absolute top-6 left-6 font-mono text-[11px] text-cyan-400 space-y-1" style={{ textShadow: '0 0 8px #00f0ff' }}>
            <div className="flex items-center gap-2 font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span> 
              MARK LXXXV // STARK HUD ONLINE
            </div>
            <div className="text-zinc-400">REPULSOR POWER: 100% · F.R.I.D.A.Y. RUNTIME: NOMINAL</div>
            <div className="text-zinc-400">ARC REACTOR CORE: 3.2 GW · TARGET LOCK: ENGAGED</div>
          </div>

          {/* Center Aim Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-400/40 rounded-full flex items-center justify-center">
            <div className="w-48 h-48 border border-dashed border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
            <div className="w-4 h-4 border-2 border-rose-500"></div>
            <div className="absolute -top-5 font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
              TARGET ACQUIRED
            </div>
          </div>

          {/* Bottom Right Heart Status */}
          <div className="absolute bottom-6 right-6 font-mono text-[11px] text-cyan-400 text-right" style={{ textShadow: '0 0 8px #00f0ff' }}>
            <div>TELEMETRY: ALL FLIGHT STABILIZERS NOMINAL</div>
            <div className="text-zinc-400">STATUS: PROOF THAT TONY STARK HAS A HEART</div>
          </div>
        </div>
      )}

      {/* 4. Mjolnir Worthiness Lightning */}
      {effect === 'worthy' && (
        <div className="absolute inset-0 z-50 bg-amber-300/10 pointer-events-none flex items-center justify-center">
          <div 
            className="w-full h-full absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(234,179,8,0.3) 40%, transparent 80%)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          <div className="relative z-10 text-center font-mono font-black tracking-widest text-amber-300 text-2xl md:text-4xl uppercase drop-shadow-[0_0_20px_#f59e0b]">
            ⚡ WHOSOEVER HOLDS THIS HAMMER... ⚡
          </div>
        </div>
      )}

      {/* 5. Avengers Assemble Golden Holographic Crest */}
      {effect === 'assemble' && (
        <div 
          className="absolute top-1/2 left-1/2 z-50 pointer-events-none"
          style={{ animation: 'avengersAAssemble 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <svg className="w-72 h-72 md:w-96 md:h-96 text-amber-400" style={{ filter: 'drop-shadow(0 0 50px #f59e0b)' }} viewBox="0 0 200 200">
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

import React, { useEffect, useRef, useState } from 'react';
import { 
  playThunderStrike, 
  playCinematicShatterSound, 
  playTimeStoneReversal 
} from '../utils/soundEngine';

/**
 * SiteExplosionEasterEgg
 * Triggered by secret passkey "300406".
 * Features:
 * - Steady camera (no screen shake)
 * - Towering volcanic fire eruption with billowing volumetric smoke and floating glowing embers
 * - Floating tactical "Sub-Web Page" browser window with live satellite YouTube explosion feed & telemetry
 * - 5-second automatic countdown and seamless reconstitution back to normal!
 */
export default function SiteExplosionEasterEgg({ isActive, onComplete }) {
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isActive) return;

    // 1. Play Explosive Sound FX
    try {
      playThunderStrike();
      setTimeout(() => playCinematicShatterSound(), 120);
    } catch (e) {
      console.warn('Audio play error:', e);
    }

    // 2. Synthesize deep sub-bass seismic rumble via Web Audio API
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(22, ctx.currentTime + 2.5);
        gain.gain.setValueAtTime(0.75, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }
    } catch (e) {
      // Audio fallback
    }

    // 3. Volcanic Fire Eruption & Volumetric Smoke Canvas Simulation
    const canvas = canvasRef.current;
    let animId = null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let w = (canvas.width = window.innerWidth);
      let h = (canvas.height = window.innerHeight);

      const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      const spawnOriginX = () => w * 0.5 + (Math.random() - 0.5) * 140;
      const spawnOriginY = () => h * 0.88 + (Math.random() - 0.5) * 40;

      // Class for billowing volumetric smoke puffs
      class SmokePuff {
        constructor() {
          this.reset(true);
        }
        reset(initial = false) {
          this.x = spawnOriginX();
          this.y = initial ? spawnOriginY() - Math.random() * h * 0.5 : spawnOriginY();
          this.vx = (Math.random() - 0.5) * 2.8;
          this.vy = -(Math.random() * 3.5 + 1.8);
          this.size = Math.random() * 35 + 25;
          this.maxSize = Math.random() * 160 + 140;
          this.growth = Math.random() * 0.9 + 0.6;
          this.alpha = initial ? Math.random() * 0.45 : 0;
          this.maxAlpha = Math.random() * 0.35 + 0.25;
          this.rotation = Math.random() * Math.PI * 2;
          this.vRot = (Math.random() - 0.5) * 0.015;
          this.shade = Math.floor(Math.random() * 25 + 18); // Dark charcoal tones
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy *= 0.995;
          this.vx += (Math.random() - 0.5) * 0.1;
          this.rotation += this.vRot;
          if (this.size < this.maxSize) this.size += this.growth;

          if (this.alpha < this.maxAlpha && this.y > h * 0.4) {
            this.alpha += 0.015;
          } else {
            this.alpha -= 0.0035;
          }

          if (this.y < -this.maxSize || this.alpha <= 0) {
            this.reset();
          }
        }
        draw(c) {
          if (this.alpha <= 0) return;
          c.save();
          c.translate(this.x, this.y);
          c.rotate(this.rotation);
          
          const grad = c.createRadialGradient(0, 0, 0, 0, 0, this.size);
          grad.addColorStop(0, `rgba(${this.shade}, ${this.shade + 2}, ${this.shade + 6}, ${this.alpha})`);
          grad.addColorStop(0.5, `rgba(${this.shade - 5}, ${this.shade - 3}, ${this.shade}, ${this.alpha * 0.7})`);
          grad.addColorStop(1, `rgba(${this.shade - 10}, ${this.shade - 10}, ${this.shade - 5}, 0)`);
          
          c.fillStyle = grad;
          c.beginPath();
          c.arc(0, 0, this.size, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      }

      // Class for ascending flame bursts (additive fire plume)
      class FlameParticle {
        constructor() {
          this.reset(true);
        }
        reset(initial = false) {
          this.x = spawnOriginX();
          this.y = initial ? spawnOriginY() - Math.random() * h * 0.45 : spawnOriginY();
          this.vx = (Math.random() - 0.5) * 4.5;
          this.vy = -(Math.random() * 9 + 6);
          this.size = Math.random() * 30 + 20;
          this.growth = Math.random() * 1.1 + 0.7;
          this.life = initial ? Math.random() * 0.6 + 0.4 : 1.0;
          this.decay = Math.random() * 0.018 + 0.012;
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.vy *= 0.985;
          this.vx += (Math.random() - 0.5) * 0.2;
          this.size += this.growth;
          this.life -= this.decay;
          if (this.life <= 0 || this.y < -50) {
            this.reset();
          }
        }
        draw(c) {
          if (this.life <= 0) return;
          c.save();
          const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
          // Color stages: White-hot core -> Golden yellow -> Blazing orange -> Deep crimson
          if (this.life > 0.75) {
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.life * 0.95})`);
            grad.addColorStop(0.3, `rgba(255, 235, 120, ${this.life * 0.85})`);
            grad.addColorStop(0.7, `rgba(255, 110, 0, ${this.life * 0.6})`);
            grad.addColorStop(1, 'rgba(255, 40, 0, 0)');
          } else if (this.life > 0.35) {
            grad.addColorStop(0, `rgba(255, 220, 50, ${this.life * 0.9})`);
            grad.addColorStop(0.4, `rgba(255, 80, 0, ${this.life * 0.7})`);
            grad.addColorStop(0.8, `rgba(220, 20, 0, ${this.life * 0.4})`);
            grad.addColorStop(1, 'rgba(180, 0, 0, 0)');
          } else {
            grad.addColorStop(0, `rgba(255, 60, 0, ${this.life * 0.8})`);
            grad.addColorStop(0.6, `rgba(160, 10, 20, ${this.life * 0.4})`);
            grad.addColorStop(1, 'rgba(40, 0, 0, 0)');
          }

          c.fillStyle = grad;
          c.beginPath();
          c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      }

      // Class for swirling fiery spark embers
      class FireEmber {
        constructor() {
          this.reset(true);
        }
        reset(initial = false) {
          this.x = spawnOriginX();
          this.y = initial ? spawnOriginY() - Math.random() * h * 0.7 : spawnOriginY();
          this.vx = (Math.random() - 0.5) * 8;
          this.vy = -(Math.random() * 14 + 7);
          this.radius = Math.random() * 3.5 + 1.2;
          this.alpha = initial ? Math.random() * 0.8 + 0.2 : 1;
          this.decay = Math.random() * 0.014 + 0.007;
          this.color = Math.random() > 0.4 ? '#ffca28' : '#ff3d00';
          this.wobblePhase = Math.random() * Math.PI * 2;
        }
        update() {
          this.wobblePhase += 0.08;
          this.x += this.vx + Math.sin(this.wobblePhase) * 1.5;
          this.y += this.vy;
          this.vy += 0.08; // subtle gravity
          this.vx *= 0.99;
          this.alpha -= this.decay;
          if (this.alpha <= 0 || this.y < -20) {
            this.reset();
          }
        }
        draw(c) {
          if (this.alpha <= 0) return;
          c.save();
          c.globalAlpha = Math.max(0, this.alpha);
          c.fillStyle = this.color;
          c.shadowColor = '#ff6d00';
          c.shadowBlur = 10;
          c.beginPath();
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      }

      const smokePuffs = Array.from({ length: 65 }, () => new SmokePuff());
      const flames = Array.from({ length: 90 }, () => new FlameParticle());
      const embers = Array.from({ length: 110 }, () => new FireEmber());

      const render = () => {
        ctx.clearRect(0, 0, w, h);

        // 1. Draw volumetric dark billowing smoke puffs
        ctx.globalCompositeOperation = 'source-over';
        smokePuffs.forEach(p => {
          p.update();
          p.draw(ctx);
        });

        // 2. Draw blazing additive fire eruption column
        ctx.globalCompositeOperation = 'lighter';
        flames.forEach(f => {
          f.update();
          f.draw(ctx);
        });

        // 3. Draw fiery sparks and embers
        embers.forEach(e => {
          e.update();
          e.draw(ctx);
        });

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';

        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        if (animId) cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
      };
    }

    // 4. Countdown Timer from 5 to 0
    let currentSeconds = 5;
    const interval = setInterval(() => {
      currentSeconds -= 1;
      setCountdown(currentSeconds);
      if (currentSeconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // 5. Automatic site restoration back to normal after exactly 5 seconds
    const restoreTimer = setTimeout(() => {
      try {
        playTimeStoneReversal();
      } catch (e) {
        // Audio fallback
      }
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      clearInterval(interval);
      clearTimeout(restoreTimer);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="detonation-overlay-root">
      {/* Background Volcanic Eruption & Atmosphere Tint */}
      <div className="detonation-volcano-glow" />

      {/* Full viewport Canvas for Fire Eruption, Billowing Smoke & Embers */}
      <canvas ref={canvasRef} className="detonation-fire-canvas" />

      {/* Floating Tactical "Sub-Web Page" / Surveillance Browser Window */}
      <div className="sub-web-window animate-scale-up">
        {/* Browser Chrome Header */}
        <div className="window-titlebar">
          <div className="window-dots">
            <span className="dot dot-close" />
            <span className="dot dot-minimize" />
            <span className="dot dot-expand" />
          </div>

          <div className="window-address-bar">
            <svg className="lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="address-text">
              https://satellite.orbital-command.net/feed/blast?sector=300406
            </span>
          </div>

          <div className="window-live-pill">
            <span className="live-pulse" />
            <span>LIVE INTERCEPT</span>
          </div>
        </div>

        {/* Browser Webpage Content: Embedded Explosion Feed */}
        <div className="window-viewport">
          {/* Autoplaying YouTube explosion video */}
          <iframe
            className="blast-video-iframe"
            src="https://www.youtube-nocookie.com/embed/5gD_TL1BqFg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=5gD_TL1BqFg&playsinline=1"
            title="Detonation Surveillance Feed"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Tactical HUD Overlay on top of the video */}
          <div className="viewport-hud-overlay">
            <div className="hud-top-row">
              <div className="hud-tag">CAM-04 // ORBITAL DETONATION</div>
              <div className="hud-tag red-glow">OVERHEAT 5,420°C</div>
            </div>

            <div className="hud-crosshair">
              <div className="reticle-box" />
              <div className="reticle-text">TARGET DESTABILIZED</div>
            </div>

            <div className="hud-bottom-row">
              <div className="hud-metric">
                <span className="metric-label">PRESSURE</span>
                <span className="metric-val">142.8 PSI</span>
              </div>
              <div className="hud-metric">
                <span className="metric-label">STATUS</span>
                <span className="metric-val highlight">CRITICAL EXPLOSION</span>
              </div>
              <div className="hud-metric">
                <span className="metric-label">SECTOR CODE</span>
                <span className="metric-val">#300406</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-window Footer with Site Reconstitution Status */}
        <div className="window-footer">
          <div className="footer-status-info">
            <span className="alert-symbol">⚠️</span>
            <div className="status-texts">
              <strong className="status-title">PASSKEY 300406 TRIGGERED DETONATION SEQUENCE</strong>
              <span className="status-sub">Structural firewall breached. Initiating temporal reconstitution...</span>
            </div>
          </div>

          <div className="reconstitution-timer-badge">
            <span className="timer-label">RESTORE IN</span>
            <span className="timer-seconds">{countdown}s</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Root container: Perfectly steady, no screen shaking! */
        .detonation-overlay-root {
          position: fixed;
          inset: 0;
          z-index: 999999;
          pointer-events: all;
          overflow: hidden;
          background: #07070a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        /* Ambient atmospheric volcano glow rising from the horizon */
        .detonation-volcano-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 100%, rgba(255, 90, 0, 0.45) 0%, rgba(210, 30, 0, 0.25) 35%, rgba(10, 10, 15, 0.95) 85%);
          animation: pulseVolcanoGlow 2.5s ease-in-out infinite alternate;
        }

        @keyframes pulseVolcanoGlow {
          0% { opacity: 0.85; }
          100% { opacity: 1; }
        }

        /* Canvas: Blazing fire eruption, volumetric smoke & spark embers */
        .detonation-fire-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        /* Floating Tactical Sub-Web Window */
        .sub-web-window {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 760px;
          background: rgba(12, 14, 22, 0.96);
          border: 1.5px solid rgba(255, 70, 0, 0.7);
          border-radius: 14px;
          box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.85),
            0 0 50px rgba(255, 60, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          overflow: hidden;
          backdrop-filter: blur(25px);
          animation: windowPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes windowPopIn {
          0% { opacity: 0; transform: scale(0.92) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Window Titlebar */
        .window-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(20, 24, 38, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
        }

        .window-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-close { background: #ff5f56; }
        .dot-minimize { background: #ffbd2e; }
        .dot-expand { background: #27c93f; }

        .window-address-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(6, 8, 14, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 5px 12px;
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.73rem;
          color: #94a3b8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .lock-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        .address-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .window-live-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 20px;
          font-family: 'Space Grotesk', monospace;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #f87171;
          flex-shrink: 0;
        }

        .live-pulse {
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 8px #ef4444;
          animation: pulseDot 1s infinite alternate;
        }

        @keyframes pulseDot {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.25); opacity: 1; }
        }

        /* Window Viewport Area */
        .window-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000000;
          overflow: hidden;
        }

        .blast-video-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
          pointer-events: none;
          transform: scale(1.05); /* Slight crop of letterboxing */
        }

        /* Tactical HUD overlay above video */
        .viewport-hud-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.7);
        }

        .hud-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hud-tag {
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .hud-tag.red-glow {
          color: #ff4d4f;
          border-color: rgba(255, 77, 79, 0.5);
          box-shadow: 0 0 12px rgba(255, 77, 79, 0.35);
        }

        .hud-crosshair {
          align-self: center;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .reticle-box {
          width: 60px;
          height: 60px;
          border: 1.5px dashed rgba(255, 70, 0, 0.75);
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 60, 0, 0.4);
          animation: reticleSpin 12s linear infinite;
        }

        @keyframes reticleSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .reticle-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #ff7849;
          text-shadow: 0 0 8px rgba(255, 80, 0, 0.8);
        }

        .hud-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px 14px;
        }

        .hud-metric {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-label {
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.6rem;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .metric-val {
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.76rem;
          font-weight: 700;
          color: #cbd5e1;
        }

        .metric-val.highlight {
          color: #ff4d4f;
          text-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
        }

        /* Window Footer */
        .window-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(16, 20, 32, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          gap: 16px;
        }

        .footer-status-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-symbol {
          font-size: 1.6rem;
        }

        .status-texts {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .status-sub {
          font-size: 0.76rem;
          color: #94a3b8;
        }

        .reconstitution-timer-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 50, 0, 0.12);
          border: 1.5px solid rgba(255, 70, 0, 0.45);
          padding: 6px 16px;
          border-radius: 8px;
          box-shadow: 0 0 16px rgba(255, 60, 0, 0.2);
          flex-shrink: 0;
        }

        .timer-label {
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #ff7849;
        }

        .timer-seconds {
          font-family: 'Space Grotesk', monospace;
          font-size: 1.7rem;
          font-weight: 900;
          color: #ff3344;
          text-shadow: 0 0 14px rgba(255, 51, 68, 0.8);
          min-width: 32px;
          text-align: right;
        }

        @media (max-width: 640px) {
          .window-address-bar { display: none; }
          .hud-bottom-row { display: none; }
          .window-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
          .reconstitution-timer-badge { align-self: flex-end; }
        }
      `}</style>
    </div>
  );
}

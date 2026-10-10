import React, { useEffect, useRef, useState } from 'react';
import { 
  playThunderStrike, 
  playCinematicShatterSound, 
  playTimeStoneReversal 
} from '../utils/soundEngine';

/**
 * SiteExplosionEasterEgg
 * Triggered by secret passkey "300406".
 * Explodes the whole screen with shockwave, flying debris shards, screen shake, and fire embers,
 * then magically reconstitutes the entire site after 5 seconds!
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
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 1.8);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      }
    } catch (e) {
      // Audio fallback
    }

    // 3. Setup 60 FPS Debris, Shrapnel & Flame Embers Canvas
    const canvas = canvasRef.current;
    let animId = null;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);

      const centerX = w / 2;
      const centerY = h / 2;

      // Debris shards (polygonal glass & cyber fragments)
      const shardCount = 140;
      const shards = Array.from({ length: shardCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 22 + 8;
        return {
          x: centerX + (Math.random() - 0.5) * 40,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 24 + 6,
          color: ['#ff2e56', '#ff8800', '#ffffff', '#00f0ff', '#111827'][Math.floor(Math.random() * 5)],
          alpha: 1
        };
      });

      // Blazing fire spark embers
      const emberCount = 200;
      const embers = Array.from({ length: emberCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 28 + 12;
        return {
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 4 + 1.5,
          color: Math.random() > 0.5 ? '#ff2e56' : '#ffaa00',
          alpha: 1,
          decay: Math.random() * 0.012 + 0.006
        };
      });

      // Shockwave ring
      let shockwaveRadius = 10;
      let shockwaveAlpha = 1;

      const renderExplosion = () => {
        ctx.clearRect(0, 0, w, h);

        // Draw expanding shockwave
        if (shockwaveAlpha > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, shockwaveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 60, 90, ${shockwaveAlpha})`;
          ctx.lineWidth = 14 * shockwaveAlpha;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(centerX, centerY, shockwaveRadius * 0.85, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 200, 50, ${shockwaveAlpha * 0.8})`;
          ctx.lineWidth = 8 * shockwaveAlpha;
          ctx.stroke();

          shockwaveRadius += 34;
          shockwaveAlpha -= 0.022;
        }

        // Draw debris shards
        shards.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.45; // Gravity
          s.vx *= 0.985;
          s.rotation += s.vRot;
          s.alpha -= 0.005;

          if (s.alpha > 0) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0, s.alpha);

            ctx.beginPath();
            ctx.moveTo(-s.size / 2, -s.size / 2);
            ctx.lineTo(s.size / 2, -s.size / 4);
            ctx.lineTo(s.size / 3, s.size / 2);
            ctx.lineTo(-s.size / 2, s.size / 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });

        // Draw burning embers
        embers.forEach(e => {
          e.x += e.vx;
          e.y += e.vy;
          e.vy += 0.25;
          e.vx *= 0.97;
          e.vy *= 0.97;
          e.alpha -= e.decay;

          if (e.alpha > 0) {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = Math.max(0, e.alpha);
            ctx.fill();
          }
        });

        animId = requestAnimationFrame(renderExplosion);
      };

      animId = requestAnimationFrame(renderExplosion);
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

    // 5. Restore back to normal after exactly 5 seconds
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
      {/* Detonation Flash & Glitch Filter */}
      <div className="detonation-flash-blast" />

      {/* Screen Fracture Cracks Overlay */}
      <div className="detonation-glass-cracks" />

      {/* Canvas for Debris & Sparks */}
      <canvas ref={canvasRef} className="detonation-particles-canvas" />

      {/* Central Cybernetic Warning HUD */}
      <div className="detonation-alert-hud animate-fade-in">
        <div className="hud-warning-icon">💥</div>
        <h2 className="hud-warning-title">CRITICAL SYSTEM OVERLOAD</h2>
        <div className="hud-code-badge">[ ERROR 300406 // CORE BREACH DETONATED ]</div>
        <p className="hud-warning-desc">
          Passkey <strong>300406</strong> triggered structural destabilization.
        </p>
        <div className="hud-countdown-box">
          <span>RECONSTITUTING SYSTEM INTEGRITY IN</span>
          <div className="countdown-number">{countdown}s</div>
        </div>
      </div>

      <style>{`
        .detonation-overlay-root {
          position: fixed;
          inset: 0;
          z-index: 999999;
          pointer-events: all;
          overflow: hidden;
          background: rgba(6, 6, 8, 0.88);
          animation: cameraEarthquake 0.12s infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes cameraEarthquake {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-10px, 8px) rotate(-1.5deg); }
          40% { transform: translate(12px, -9px) rotate(1.2deg); }
          60% { transform: translate(-8px, -11px) rotate(-0.8deg); }
          80% { transform: translate(10px, 7px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        .detonation-flash-blast {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 46, 86, 0.8) 45%, rgba(0, 0, 0, 0.95) 100%);
          animation: blastFlashFade 1.6s ease-out forwards;
          pointer-events: none;
        }

        @keyframes blastFlashFade {
          0% { opacity: 1; transform: scale(0.6); }
          15% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.15; transform: scale(1.4); }
        }

        .detonation-glass-cracks {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 50% 50%, transparent 20%, rgba(255, 46, 86, 0.12) 100%);
          border: 4px solid #ff2e56;
          box-shadow: inset 0 0 80px rgba(255, 46, 86, 0.6);
          pointer-events: none;
        }

        .detonation-particles-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .detonation-alert-hud {
          position: relative;
          z-index: 10;
          background: rgba(14, 18, 28, 0.94);
          backdrop-filter: blur(20px);
          border: 2px solid #ff2e56;
          border-radius: 20px;
          padding: 36px 32px;
          max-width: 480px;
          width: 90%;
          text-align: center;
          box-shadow: 0 0 60px rgba(255, 46, 86, 0.5), inset 0 0 30px rgba(255, 46, 86, 0.15);
        }

        .hud-warning-icon {
          font-size: 3.5rem;
          margin-bottom: 8px;
          animation: pulseIcon 0.8s ease-in-out infinite alternate;
        }

        @keyframes pulseIcon {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }

        .hud-warning-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          text-shadow: 0 0 20px #ff2e56;
        }

        .hud-code-badge {
          display: inline-block;
          font-family: 'SF Mono', Consolas, monospace;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #ff2e56;
          background: rgba(255, 46, 86, 0.12);
          border: 1px solid rgba(255, 46, 86, 0.4);
          padding: 5px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .hud-warning-desc {
          font-size: 0.9rem;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .hud-countdown-box {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
        }

        .hud-countdown-box span {
          display: block;
          font-family: monospace;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: #64748b;
          margin-bottom: 6px;
        }

        .countdown-number {
          font-family: 'Space Grotesk', monospace;
          font-size: 2.8rem;
          font-weight: 900;
          color: #ff2e56;
          text-shadow: 0 0 25px rgba(255, 46, 86, 0.8);
          animation: pulseNumber 1s infinite;
        }

        @keyframes pulseNumber {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

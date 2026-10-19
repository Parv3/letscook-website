import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaJump, playGbaScore, playGbaCrash, playGbaLaser, playGbaPowerup, playGbaBounce } from './GbaAudio';
import { submitScore } from '../../services/arcadeLeaderboardService';

/**
 * Game 1: STARK FLIGHT (Optimized)
 * Fixed 60Hz physics timestep accumulator (eliminates high refresh rate speedups).
 * Crisp 480x320 canvas, gentle floaty jetpack, repulsor blasters,
 * shield powerups, and automatic leaderboard score synchronization!
 */
export default function StarkFlightGame({ onExit, onOpenLeaderboard, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_stark_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    bestScore: highScore,
    playerY: 150,
    velocity: 0,
    gravity: 0.16,
    thrust: -3.4,
    hasShield: false,
    lasers: [],
    gates: [],
    drones: [],
    arcCores: [],
    shieldOrbs: [],
    particles: [],
    frame: 0
  });

  const triggerThrust = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'ready') {
      s.gameState = 'playing';
      s.score = 0;
      s.playerY = 150;
      s.velocity = -2.8;
      s.gates = [];
      s.drones = [];
      s.arcCores = [];
      s.lasers = [];
      s.hasShield = false;
      s.frame = 0;
      setScore(0);
      setHasShield(false);
      setGameState('playing');
      playGbaJump();
      return;
    }
    if (s.gameState === 'gameover') {
      s.gameState = 'playing';
      s.score = 0;
      s.playerY = 150;
      s.velocity = -2.8;
      s.gates = [];
      s.drones = [];
      s.arcCores = [];
      s.lasers = [];
      s.hasShield = false;
      s.particles = [];
      s.frame = 0;
      setScore(0);
      setHasShield(false);
      setGameState('playing');
      playGbaJump();
      return;
    }
    if (s.gameState === 'playing') {
      s.velocity = s.thrust;
      playGbaJump();
    }
  }, []);

  const triggerShoot = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'playing') return;

    s.lasers.push({
      x: 95,
      y: s.playerY,
      vx: 8.5,
      w: 20,
      h: 4
    });
    playGbaLaser();
  }, []);

  // Controls triggers
  useEffect(() => {
    if (buttonA || dpadState.up || startTrigger) {
      triggerThrust();
    }
    if (buttonB) {
      triggerShoot();
    }
  }, [buttonA, buttonB, dpadState.up, startTrigger, triggerThrust, triggerShoot]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        triggerThrust();
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'j' || e.key === 'J' || e.code === 'KeyF') {
        e.preventDefault();
        triggerShoot();
      } else if (e.key === 'l' || e.key === 'L') {
        if (onOpenLeaderboard) onOpenLeaderboard();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerThrust, triggerShoot, onExit, onOpenLeaderboard]);

  // Main Canvas Loop: Fixed 60Hz Timestep Accumulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 480);
    const height = (canvas.height = 320);

    let animId = null;
    let lastTime = 0;
    const TICK_STEP = 1000 / 60;
    let accumulator = 0;

    const tickPhysics = () => {
      const s = stateRef.current;
      s.frame++;

      if (s.gameState === 'playing') {
        s.velocity += s.gravity;
        s.playerY += s.velocity;

        if (s.playerY > height - 28) {
          s.playerY = height - 28;
          s.velocity = -1.6;
        }
        if (s.playerY < 20) {
          s.playerY = 20;
          s.velocity = 0.6;
        }

        // Dynamic scroll speed: starts brisk and confident at 1.45, ramps smoothly up to 2.5
        const scrollSpeed = Math.min(2.5, 1.45 + (s.score / 260) * 0.35);

        // Spawn gates with dynamic wide gap & spacing
        const gateInterval = Math.max(90, Math.floor(135 - (s.score / 220) * 12));
        if (s.frame % gateInterval === 0) {
          const gap = Math.max(120, Math.floor(145 - (s.score / 220) * 8));
          const topH = 25 + Math.random() * (height - gap - 60);
          s.gates.push({
            x: width,
            topH,
            gap,
            passed: false
          });

          s.arcCores.push({
            x: width + 30,
            y: topH + gap / 2,
            collected: false
          });

          if (Math.random() < 0.35 && !s.hasShield) {
            s.shieldOrbs.push({
              x: width + 85,
              y: topH + gap / 2 + (Math.random() - 0.5) * 45,
              collected: false
            });
          }
        }

        // Spawn Hydra drones when score > 60 for action
        if (s.score > 60 && s.frame % 150 === 75) {
          const droneSpeed = -Math.min(2.4, 1.5 + (s.score / 350) * 0.3);
          s.drones.push({
            x: width + 15,
            y: 50 + Math.random() * (height - 100),
            vx: droneSpeed,
            hp: 1
          });
        }

        // Update Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.x += l.vx;

          for (let dIdx = s.drones.length - 1; dIdx >= 0; dIdx--) {
            const dr = s.drones[dIdx];
            if (
              l.x + l.w > dr.x &&
              l.x < dr.x + 24 &&
              l.y > dr.y &&
              l.y < dr.y + 18
            ) {
              s.drones.splice(dIdx, 1);
              s.lasers.splice(i, 1);
              s.score += 30;
              setScore(s.score);
              playGbaBounce();

              for (let p = 0; p < 10; p++) {
                s.particles.push({
                  x: dr.x + 12,
                  y: dr.y + 9,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#fbbf24',
                  life: 20
                });
              }
              break;
            }
          }

          if (l.x > width + 25) s.lasers.splice(i, 1);
        }

        // Update Gates
        for (let i = s.gates.length - 1; i >= 0; i--) {
          const g = s.gates[i];
          g.x -= scrollSpeed;

          if (!g.passed && g.x < 65) {
            g.passed = true;
            s.score += 15;
            setScore(s.score);
            if (s.score > s.bestScore) {
              s.bestScore = s.score;
              setHighScore(s.score);
              localStorage.setItem('lc_gba_stark_hi', String(s.score));
            }
          }

          const botY = g.topH + g.gap;
          if (
            g.x < 90 &&
            g.x + 24 > 70 &&
            (s.playerY - 12 < g.topH || s.playerY + 12 > botY)
          ) {
            if (s.hasShield) {
              s.hasShield = false;
              setHasShield(false);
              playGbaBounce();
              g.x = -60;
              for (let p = 0; p < 12; p++) {
                s.particles.push({
                  x: 80,
                  y: s.playerY,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: '#38bdf8',
                  life: 22
                });
              }
            } else {
              s.gameState = 'gameover';
              setGameState('gameover');
              playGbaCrash();
              submitScore('stark', s.score);
            }
          }

          if (g.x < -40) s.gates.splice(i, 1);
        }

        // Update Drones
        for (let i = s.drones.length - 1; i >= 0; i--) {
          const dr = s.drones[i];
          dr.x += dr.vx;

          if (
            dr.x < 90 &&
            dr.x + 22 > 70 &&
            Math.abs(s.playerY - (dr.y + 9)) < 16
          ) {
            if (s.hasShield) {
              s.hasShield = false;
              setHasShield(false);
              s.drones.splice(i, 1);
              playGbaBounce();
            } else {
              s.gameState = 'gameover';
              setGameState('gameover');
              playGbaCrash();
              submitScore('stark', s.score);
            }
          }

          if (dr.x < -30) s.drones.splice(i, 1);
        }

        // Update Arc Cores
        for (let i = s.arcCores.length - 1; i >= 0; i--) {
          const c = s.arcCores[i];
          c.x -= scrollSpeed;
          const dist = Math.hypot(c.x - 78, c.y - s.playerY);
          if (dist < 24) {
            s.score += 25;
            setScore(s.score);
            playGbaScore();
            s.arcCores.splice(i, 1);
          } else if (c.x < -30) {
            s.arcCores.splice(i, 1);
          }
        }

        // Update Shield Orbs
        for (let i = s.shieldOrbs.length - 1; i >= 0; i--) {
          const so = s.shieldOrbs[i];
          so.x -= scrollSpeed;
          const dist = Math.hypot(so.x - 78, so.y - s.playerY);
          if (dist < 24) {
            s.hasShield = true;
            setHasShield(true);
            playGbaPowerup();
            s.shieldOrbs.splice(i, 1);
          } else if (so.x < -30) {
            s.shieldOrbs.splice(i, 1);
          }
        }
      }
    };

    const draw = () => {
      const s = stateRef.current;

      // Cyber Sky
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 45) - (s.frame * 0.25)) % width;
        const sy = (i * 22) % (height - 40);
        ctx.fillRect(sx < 0 ? sx + width : sx, sy, 2, 2);
      }

      // City silhouette
      ctx.fillStyle = '#0b1426';
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 44) - (s.frame * 0.45)) % (14 * 44);
        const bh = 45 + ((i * 24) % 65);
        ctx.fillRect(bx < -44 ? bx + 14 * 44 : bx, height - bh, 38, bh);
      }

      // Gates
      s.gates.forEach(g => {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(g.x, 0, 22, g.topH);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(g.x + 4, g.topH - 6, 14, 6);

        const botY = g.topH + g.gap;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(g.x, botY, 22, height - botY);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(g.x + 4, botY, 14, 6);

        ctx.fillStyle = s.frame % 6 < 3 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(g.x + 8, g.topH, 6, g.gap);
      });

      // Drones
      s.drones.forEach(dr => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(dr.x, dr.y + 4, 22, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dr.x + 4, dr.y + 6, 5, 5);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(dr.x + 3, dr.y, 16, 3);
      });

      // Lasers
      ctx.fillStyle = '#00f0ff';
      s.lasers.forEach(l => {
        ctx.fillRect(l.x, l.y - 2, l.w, l.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x + 5, l.y - 1, l.w - 8, 2);
      });

      // Arc Cores
      s.arcCores.forEach(c => {
        const pulse = Math.sin(s.frame * 0.15) * 2;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 7 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shield Orbs
      s.shieldOrbs.forEach(so => {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(so.x, so.y, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('🛡️', so.x - 6, so.y + 5);
      });

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color || '#38bdf8';
        ctx.fillRect(p.x, p.y, 3, 3);
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Iron Man Sprite
      const px = 75;
      const py = s.playerY;

      // Flame
      if (s.gameState === 'playing') {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(px - 10, py);
        ctx.lineTo(px - 20 - Math.random() * 8, py - 4);
        ctx.lineTo(px - 20 - Math.random() * 8, py + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Armor
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(px - 8, py - 9, 22, 18);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(px + 6, py - 7, 8, 8);
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(px + 8, py - 5, 3, 3);
      ctx.fillRect(px - 1, py - 3, 5, 5);

      if (s.hasShield) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px + 4, py, 19 + Math.sin(s.frame * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // HUD
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 100, 24);
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 20, 24);

      if (s.hasShield) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('SHIELD', 16, 24);
      }

      // Overlays
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STARK FLIGHT', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText('PRESS [A] TO START', width / 2, height / 2 + 15);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 25);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2 + 5);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '13px monospace';
        ctx.fillText('PRESS [A] TO RETRY', width / 2, height / 2 + 35);
      }
    };

    const loop = (currentTime) => {
      animId = requestAnimationFrame(loop);
      if (!lastTime) {
        lastTime = currentTime;
        return;
      }

      let delta = currentTime - lastTime;
      lastTime = currentTime;
      if (delta > 80) delta = 80;

      accumulator += delta;
      if (accumulator > 100) accumulator = TICK_STEP;
      let ticks = 0;
      while (accumulator >= TICK_STEP && ticks < 5) {
        tickPhysics();
        accumulator -= TICK_STEP;
        ticks++;
      }

      draw();
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      const s = stateRef.current;
      if (s.score > 0) {
        submitScore('stark', s.score);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={triggerThrust}
        className="w-full h-full object-contain cursor-pointer"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

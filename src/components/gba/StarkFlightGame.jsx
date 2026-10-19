import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaJump, playGbaScore, playGbaCrash, playGbaLaser, playGbaPowerup, playGbaBounce } from './GbaAudio';

/**
 * Game 1: STARK FLIGHT (Overhauled)
 * Smooth, floaty retro arcade Iron Man flight.
 * Fire repulsor blasters to destroy drones, glide through wide laser gates,
 * collect Arc Cores, and grab energy shields!
 */
export default function StarkFlightGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
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
    playerY: 100,
    velocity: 0,
    gravity: 0.14,      // Very gentle gravity
    thrust: -2.8,       // Floaty, controllable lift
    hasShield: false,
    lasers: [],         // Player repulsor shots
    gates: [],          // Wide laser barriers
    drones: [],         // Destructible flying drones
    arcCores: [],       // Floating Arc Reactor coins
    shieldOrbs: [],     // Shield pickups
    particles: [],
    frame: 0
  });

  // Action: Lift Repulsor Thruster
  const triggerThrust = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'ready') {
      s.gameState = 'playing';
      s.score = 0;
      s.playerY = 100;
      s.velocity = -2.2;
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
      s.playerY = 100;
      s.velocity = -2.2;
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

  // Action: Shoot Repulsor Laser
  const triggerShoot = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'playing') return;

    // Fire laser beam from Iron Man's palm
    s.lasers.push({
      x: 65,
      y: s.playerY,
      vx: 6,
      w: 14,
      h: 3
    });
    playGbaLaser();
  }, []);

  // Listen to physical GBA controls
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
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerThrust, triggerShoot, onExit]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 320);
    const height = (canvas.height = 213);

    let animId = null;

    const render = () => {
      const s = stateRef.current;
      s.frame++;

      // 1. Cyber Sky & Parallax Skyline
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, width, height);

      // Starfield / cyber points
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 35) - (s.frame * 0.2)) % width;
        const sy = (i * 17) % (height - 30);
        ctx.fillRect(sx < 0 ? sx + width : sx, sy, 1.5, 1.5);
      }

      // City silhouette
      ctx.fillStyle = '#0b1426';
      for (let i = 0; i < 12; i++) {
        const bx = ((i * 32) - (s.frame * 0.35)) % (12 * 32);
        const bh = 35 + ((i * 19) % 45);
        ctx.fillRect(bx < -32 ? bx + 12 * 32 : bx, height - bh, 28, bh);
      }

      // 2. Physics & Logic when Playing
      if (s.gameState === 'playing') {
        s.velocity += s.gravity;
        s.playerY += s.velocity;

        // Soft floor & ceiling dampening
        if (s.playerY > height - 20) {
          s.playerY = height - 20;
          s.velocity = -1.2;
        }
        if (s.playerY < 14) {
          s.playerY = 14;
          s.velocity = 0.5;
        }

        // Spawn Laser Gates (Gentle frequency, wide 92px gaps!)
        if (s.frame % 130 === 0) {
          const gap = 92;
          const topH = 20 + Math.random() * (height - gap - 45);
          s.gates.push({
            x: width,
            topH,
            gap,
            passed: false
          });

          // Spawn floating Arc Reactor ring
          s.arcCores.push({
            x: width + 22,
            y: topH + gap / 2,
            collected: false
          });

          // 25% chance for a Shield Orb pickup
          if (Math.random() < 0.25 && !s.hasShield) {
            s.shieldOrbs.push({
              x: width + 60,
              y: topH + gap / 2 + (Math.random() - 0.5) * 30,
              collected: false
            });
          }
        }

        // Spawn occasional Hydra drones to blast!
        if (s.frame % 160 === 80) {
          s.drones.push({
            x: width + 10,
            y: 35 + Math.random() * (height - 70),
            vx: -1.3,
            hp: 1
          });
        }

        // Update Repulsor Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.x += l.vx;

          // Check hit against drones
          for (let dIdx = s.drones.length - 1; dIdx >= 0; dIdx--) {
            const dr = s.drones[dIdx];
            if (
              l.x + l.w > dr.x &&
              l.x < dr.x + 18 &&
              l.y > dr.y &&
              l.y < dr.y + 14
            ) {
              // Destroy Drone!
              s.drones.splice(dIdx, 1);
              s.lasers.splice(i, 1);
              s.score += 30;
              setScore(s.score);
              playGbaBounce();

              // Explosion particles
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: dr.x + 9,
                  y: dr.y + 7,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  color: '#fbbf24',
                  life: 18
                });
              }
              break;
            }
          }

          if (l.x > width + 20) s.lasers.splice(i, 1);
        }

        // Update Laser Gates (Gentle scroll speed 1.1)
        for (let i = s.gates.length - 1; i >= 0; i--) {
          const g = s.gates[i];
          g.x -= 1.1;

          // Score on passing
          if (!g.passed && g.x < 45) {
            g.passed = true;
            s.score += 15;
            setScore(s.score);
            if (s.score > s.bestScore) {
              s.bestScore = s.score;
              setHighScore(s.score);
              localStorage.setItem('lc_gba_stark_hi', String(s.score));
            }
          }

          // Player collision test (Hitbox: x: 48, y: s.playerY - 8, w: 16, h: 16)
          const botY = g.topH + g.gap;
          if (
            g.x < 64 &&
            g.x + 18 > 48 &&
            (s.playerY - 8 < g.topH || s.playerY + 8 > botY)
          ) {
            if (s.hasShield) {
              // Shield absorbs the crash!
              s.hasShield = false;
              setHasShield(false);
              playGbaBounce();
              g.x = -50; // clear barrier
              for (let p = 0; p < 10; p++) {
                s.particles.push({
                  x: 55,
                  y: s.playerY,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#38bdf8',
                  life: 20
                });
              }
            } else {
              s.gameState = 'gameover';
              setGameState('gameover');
              playGbaCrash();
            }
          }

          if (g.x < -30) s.gates.splice(i, 1);
        }

        // Update Hydra Drones
        for (let i = s.drones.length - 1; i >= 0; i--) {
          const dr = s.drones[i];
          dr.x += dr.vx;

          // Player collision with drone
          if (
            dr.x < 62 &&
            dr.x + 16 > 48 &&
            Math.abs(s.playerY - (dr.y + 7)) < 12
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
            }
          }

          if (dr.x < -20) s.drones.splice(i, 1);
        }

        // Update Arc Cores
        for (let i = s.arcCores.length - 1; i >= 0; i--) {
          const c = s.arcCores[i];
          c.x -= 1.1;
          const dist = Math.hypot(c.x - 55, c.y - s.playerY);
          if (dist < 18) {
            s.score += 25;
            setScore(s.score);
            playGbaScore();
            s.arcCores.splice(i, 1);
          } else if (c.x < -20) {
            s.arcCores.splice(i, 1);
          }
        }

        // Update Shield Orbs
        for (let i = s.shieldOrbs.length - 1; i >= 0; i--) {
          const so = s.shieldOrbs[i];
          so.x -= 1.1;
          const dist = Math.hypot(so.x - 55, so.y - s.playerY);
          if (dist < 18) {
            s.hasShield = true;
            setHasShield(true);
            playGbaPowerup();
            s.shieldOrbs.splice(i, 1);
          } else if (so.x < -20) {
            s.shieldOrbs.splice(i, 1);
          }
        }
      }

      // 3. Render Laser Gates
      s.gates.forEach(g => {
        // Upper Pylon
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(g.x, 0, 16, g.topH);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(g.x + 3, g.topH - 4, 10, 4);

        // Lower Pylon
        const botY = g.topH + g.gap;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(g.x, botY, 16, height - botY);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(g.x + 3, botY, 10, 4);

        // Shimmering Forcefield Line
        ctx.fillStyle = s.frame % 6 < 3 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(239, 68, 68, 0.25)';
        ctx.fillRect(g.x + 6, g.topH, 4, g.gap);
      });

      // 4. Render Drones
      s.drones.forEach(dr => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(dr.x, dr.y + 3, 16, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(dr.x + 3, dr.y + 5, 4, 4); // Red sensor eye
        // Rotors
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(dr.x + 2, dr.y, 12, 2);
      });

      // 5. Render Lasers
      ctx.fillStyle = '#00f0ff';
      s.lasers.forEach(l => {
        ctx.fillRect(l.x, l.y - 1, l.w, l.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(l.x + 4, l.y, l.w - 6, 1);
      });

      // 6. Render Collectibles (Arc Cores & Shield Orbs)
      s.arcCores.forEach(c => {
        const pulse = Math.sin(s.frame * 0.15) * 1.5;
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      s.shieldOrbs.forEach(so => {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(so.x, so.y, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('🛡️', so.x - 5, so.y + 4);
      });

      // 7. Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color || '#38bdf8';
        ctx.fillRect(p.x, p.y, 2, 2);
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // 8. Render Iron Man Sprite
      const px = 52;
      const py = s.playerY;

      // Thruster flame
      if (s.gameState === 'playing') {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(px - 8, py);
        ctx.lineTo(px - 14 - Math.random() * 5, py - 3);
        ctx.lineTo(px - 14 - Math.random() * 5, py + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Armor Body (Red & Gold)
      ctx.fillStyle = '#dc2626'; // Hot rod red
      ctx.fillRect(px - 6, py - 6, 16, 12);
      ctx.fillStyle = '#fbbf24'; // Gold faceplate / shoulder
      ctx.fillRect(px + 4, py - 5, 6, 6);
      ctx.fillStyle = '#00f0ff'; // Arc reactor & eye slit
      ctx.fillRect(px + 6, py - 3, 2, 2);
      ctx.fillRect(px - 1, py - 2, 4, 4);

      // Shield Bubble if active!
      if (s.hasShield) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + 2, py, 14 + Math.sin(s.frame * 0.2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 9. HUD Overlay
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 75, 16);
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 15, 16);

      // Left Hint
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.font = '8px monospace';
      ctx.fillText('[A/▲] FLY  [B/Z] SHOOT LASER', 12, 16);

      if (s.hasShield) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('SHIELD: ACTIVE', 12, 28);
      }

      // Ready / Game Over Screens
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('STARK FLIGHT', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] OR [▲] TO ENGAGE THRUSTERS', width / 2, height / 2 + 5);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '8px monospace';
        ctx.fillText('PRESS [B] TO SHOOT REPULSOR BEAMS!', width / 2, height / 2 + 25);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUIT SYSTEM OFFLINE', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO REBOOT THRUSTERS', width / 2, height / 2 + 22);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('[B / ESC] RETURN TO MULTICART MENU', width / 2, height / 2 + 40);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

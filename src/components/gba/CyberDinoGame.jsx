import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaJump, playGbaCrash, playGbaMilestone, playGbaBip } from './GbaAudio';
import { submitScore } from '../../services/arcadeLeaderboardService';

/**
 * CYBER DINO RUN (Optimized)
 * Fixed 60Hz physics timestep accumulator (eliminates 120Hz/144Hz high refresh rate speed bugs!).
 * Crisp 480x320 canvas, day/night cycles, 100-pt milestone chimes,
 * and automatic leaderboard score synchronization!
 */
export default function CyberDinoGame({ onExit, onOpenLeaderboard, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_dino_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    bestScore: highScore,
    speed: 2.0,
    frame: 0,
    milestoneFlash: 0,
    
    // Dino Physics (Tuned for 480x320 resolution - Easy, forgiving floaty jumps)
    dino: {
      x: 55,
      y: 250,
      groundY: 250,
      vy: 0,
      gravity: 0.48,
      jumpForce: -9.2,
      isGrounded: true,
      isDucking: false,
      step: 0
    },

    // Obstacles
    obstacles: [],
    nextSpawnIn: 110,

    // Deco
    clouds: [
      { x: 80, y: 45, speed: 0.4 },
      { x: 260, y: 70, speed: 0.3 },
      { x: 420, y: 35, speed: 0.5 }
    ],
    groundPebbles: [],
    particles: []
  });

  // Initialize ground pebbles
  useEffect(() => {
    const s = stateRef.current;
    s.groundPebbles = [];
    for (let i = 0; i < 40; i++) {
      s.groundPebbles.push({
        x: Math.random() * 480,
        y: 254 + Math.random() * 35,
        w: Math.random() > 0.5 ? 3 : 2
      });
    }
  }, []);

  const triggerJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'ready') {
      s.gameState = 'playing';
      s.score = 0;
      s.speed = 2.0;
      s.obstacles = [];
      s.frame = 0;
      setGameState('playing');
      setScore(0);
      s.dino.vy = s.dino.jumpForce;
      s.dino.isGrounded = false;
      playGbaJump();
      return;
    }
    if (s.gameState === 'gameover') {
      s.gameState = 'playing';
      s.score = 0;
      s.speed = 2.0;
      s.dino.y = s.dino.groundY;
      s.dino.vy = 0;
      s.dino.isGrounded = true;
      s.dino.isDucking = false;
      s.obstacles = [];
      s.particles = [];
      s.frame = 0;
      setScore(0);
      setGameState('playing');
      playGbaBip();
      return;
    }
    if (s.gameState === 'playing' && s.dino.isGrounded) {
      s.dino.vy = s.dino.jumpForce;
      s.dino.isGrounded = false;
      playGbaJump();

      for (let i = 0; i < 5; i++) {
        s.particles.push({
          x: s.dino.x + 6,
          y: s.dino.groundY,
          vx: -(Math.random() * 2 + 0.5),
          vy: -(Math.random() * 1.5),
          life: 18
        });
      }
    }
  }, []);

  // Ducking state
  useEffect(() => {
    const s = stateRef.current;
    const shouldDuck = dpadState.down || buttonB;
    s.dino.isDucking = shouldDuck;

    if (shouldDuck && !s.dino.isGrounded && s.dino.vy < 4) {
      s.dino.vy += 1.2;
    }
  }, [dpadState.down, buttonB]);

  // Jump trigger
  useEffect(() => {
    if (buttonA || dpadState.up || startTrigger) {
      triggerJump();
    }
  }, [buttonA, dpadState.up, startTrigger, triggerJump]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const s = stateRef.current;
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        triggerJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        s.dino.isDucking = true;
        if (!s.dino.isGrounded) s.dino.vy += 1.2;
      } else if (e.key === 'l' || e.key === 'L') {
        if (onOpenLeaderboard) onOpenLeaderboard();
      } else if (e.key === 'Escape') {
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e) => {
      const s = stateRef.current;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'x' || e.key === 'X') {
        s.dino.isDucking = false;
      }
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') {
        if (!s.dino.isGrounded && s.dino.vy < -3.5) {
          s.dino.vy = -3.5;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerJump, onExit, onOpenLeaderboard]);

  // Main Game Loop: Fixed 60Hz Timestep Accumulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 480);
    const height = (canvas.height = 320);
    const groundY = 250;

    let animId = null;
    let lastTime = 0;
    const TICK_STEP = 1000 / 60; // Exact 60 FPS standard
    let accumulator = 0;

    // 1. Single Physics Tick Step (Guaranteed 60 ticks per sec)
    const tickPhysics = () => {
      const s = stateRef.current;
      s.frame++;

      if (s.gameState === 'playing') {
        // Score increment every 3 ticks
        if (s.frame % 3 === 0) {
          s.score++;
          setScore(s.score);

          // 100-pt milestone chime
          if (s.score > 0 && s.score % 100 === 0) {
            playGbaMilestone();
            s.milestoneFlash = 35;
          }

          if (s.score > s.bestScore) {
            s.bestScore = s.score;
            setHighScore(s.score);
            localStorage.setItem('lc_gba_dino_hi', String(s.score));
          }

          // Very gradual acceleration capped at 6.8
          if (s.speed < 6.8) {
            s.speed += 0.0008;
          }
        }

        // Dino Gravity & Movement
        const d = s.dino;
        d.vy += d.gravity;
        d.y += d.vy;

        if (d.y >= d.groundY) {
          d.y = d.groundY;
          d.vy = 0;
          if (!d.isGrounded) {
            d.isGrounded = true;
            s.particles.push({ x: d.x + 8, y: groundY, vx: -1.2, vy: -0.8, life: 12 });
          }
        }

        // Running animation frames
        if (s.frame % 6 === 0) {
          d.step = (d.step + 1) % 2;
        }

        // Spawn Obstacles with gentle progressive difficulty
        s.nextSpawnIn--;
        if (s.nextSpawnIn <= 0) {
          const allowFlyers = s.score > 160;
          const roll = Math.random();

          if (allowFlyers && roll < 0.32) {
            // Flying Pterodactyl Drone
            const altLevels = [175, 205, 224];
            const altY = altLevels[Math.floor(Math.random() * altLevels.length)];
            s.obstacles.push({
              type: 'bird',
              x: width + 15,
              y: altY,
              w: 28,
              h: 16,
              wingUp: false
            });
          } else {
            // Quantum Cacti - starts with easy single cactus, scales up later
            const sizeRoll = Math.random();
            let w = 16;
            let h = 34;
            let count = 1;
            if (s.score > 250 && sizeRoll > 0.72) {
              w = 34;
              count = 3;
            } else if (s.score > 75 && sizeRoll > 0.45) {
              w = 26;
              count = 2;
            }

            s.obstacles.push({
              type: 'cactus',
              x: width + 15,
              y: groundY - h,
              w,
              h,
              count
            });
          }

          // Generous obstacle spacing at first, shrinks smoothly as speed increases
          s.nextSpawnIn = Math.floor(65 + Math.random() * 55 + (180 / s.speed));
        }

        // Update Obstacles & Collision Check
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          if (obs.type === 'bird' && s.frame % 10 === 0) {
            obs.wingUp = !obs.wingUp;
          }

          // Player Hitbox
          let pBox;
          if (d.isDucking && d.isGrounded) {
            pBox = { x: d.x + 4, y: groundY - 18, w: 32, h: 18 };
          } else {
            pBox = { x: d.x + 5, y: d.y - 36, w: 22, h: 36 };
          }

          const obsBox = { x: obs.x + 3, y: obs.y + 3, w: obs.w - 6, h: obs.h - 4 };

          if (
            pBox.x < obsBox.x + obsBox.w &&
            pBox.x + pBox.w > obsBox.x &&
            pBox.y < obsBox.y + obsBox.h &&
            pBox.y + pBox.h > obsBox.y
          ) {
            // Crash!
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();

            // Submit score to global/local arcade leaderboard!
            submitScore('dino', s.score);

            for (let p = 0; p < 14; p++) {
              s.particles.push({
                x: d.x + 12,
                y: d.y - 18,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.7) * 5,
                life: 25
              });
            }
            break;
          }

          if (obs.x + obs.w < -30) {
            s.obstacles.splice(i, 1);
          }
        }
      }
    };

    // 2. Render Screen Frame
    const draw = () => {
      const s = stateRef.current;
      const cycleProg = Math.floor(s.score / 400) % 2;
      const isNight = cycleProg === 1;

      // Background
      ctx.fillStyle = isNight ? '#090d18' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Stars
      if (isNight) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        for (let i = 0; i < 30; i++) {
          const sx = (i * 47 + 18) % width;
          const sy = (i * 23 + 12) % 130;
          ctx.fillRect(sx, sy, 2, 2);
        }
        // Crescent Moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(390, 50, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#090d18';
        ctx.beginPath();
        ctx.arc(396, 47, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parallax Clouds
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.16)' : 'rgba(148, 163, 184, 0.5)';
      s.clouds.forEach(cloud => {
        if (s.gameState === 'playing') cloud.x -= cloud.speed;
        if (cloud.x < -60) cloud.x = width + Math.random() * 40;

        ctx.fillRect(cloud.x, cloud.y, 34, 9);
        ctx.fillRect(cloud.x + 6, cloud.y - 6, 22, 6);
        ctx.fillRect(cloud.x + 12, cloud.y - 10, 10, 4);
      });

      // Ground Line
      ctx.strokeStyle = isNight ? '#38bdf8' : '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Ground Pebbles
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(100, 116, 139, 0.45)';
      s.groundPebbles.forEach(p => {
        if (s.gameState === 'playing') p.x -= s.speed;
        if (p.x < 0) p.x = width + Math.random() * 25;
        ctx.fillRect(p.x, p.y, p.w * 2, 2);
      });

      // Render Obstacles
      s.obstacles.forEach(obs => {
        if (obs.type === 'cactus') {
          ctx.fillStyle = isNight ? '#00f0ff' : '#0f766e';
          for (let c = 0; c < (obs.count || 1); c++) {
            const cx = obs.x + c * 12;
            ctx.fillRect(cx + 3, obs.y, 6, obs.h);
            ctx.fillRect(cx, obs.y + 8, 3, 12);
            ctx.fillRect(cx + 8, obs.y + 6, 3, 10);
          }
        } else if (obs.type === 'bird') {
          ctx.fillStyle = isNight ? '#ef4444' : '#b91c1c';
          ctx.fillRect(obs.x + 8, obs.y + 5, 18, 9);
          ctx.fillRect(obs.x, obs.y + 6, 8, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 10, obs.y + 6, 3, 3);

          ctx.fillStyle = isNight ? '#f87171' : '#dc2626';
          if (obs.wingUp) {
            ctx.fillRect(obs.x + 12, obs.y - 6, 6, 12);
            ctx.fillRect(obs.x + 15, obs.y - 12, 4, 7);
          } else {
            ctx.fillRect(obs.x + 12, obs.y + 10, 6, 12);
            ctx.fillRect(obs.x + 15, obs.y + 18, 4, 7);
          }
        }
      });

      // Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = isNight ? '#38bdf8' : '#64748b';
        ctx.fillRect(pt.x, pt.y, 3, 3);
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // Render Dino Character
      const d = s.dino;
      ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';

      if (d.isDucking && d.isGrounded) {
        // Ducking Dino
        ctx.fillRect(d.x, groundY - 17, 36, 13);
        ctx.fillRect(d.x + 28, groundY - 20, 14, 11);
        ctx.fillStyle = isNight ? '#ffffff' : '#f8fafc';
        ctx.fillRect(d.x + 36, groundY - 18, 3, 3);

        ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';
        if (d.step === 0) {
          ctx.fillRect(d.x + 6, groundY - 4, 6, 4);
          ctx.fillRect(d.x + 22, groundY - 3, 6, 3);
        } else {
          ctx.fillRect(d.x + 9, groundY - 3, 6, 3);
          ctx.fillRect(d.x + 20, groundY - 4, 6, 4);
        }
      } else {
        // Standing / Jumping Dino
        const dy = d.y;
        ctx.fillRect(d.x + 14, dy - 38, 18, 15);
        ctx.fillRect(d.x + 20, dy - 32, 14, 9);
        ctx.fillStyle = isNight ? '#ffffff' : '#f8fafc';
        ctx.fillRect(d.x + 20, dy - 35, 3, 3);

        ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';
        ctx.fillRect(d.x + 6, dy - 26, 20, 18);
        ctx.fillRect(d.x, dy - 20, 6, 9);
        ctx.fillRect(d.x + 22, dy - 20, 5, 3);

        if (!d.isGrounded) {
          ctx.fillRect(d.x + 8, dy - 8, 4, 6);
          ctx.fillRect(d.x + 18, dy - 8, 4, 6);
        } else {
          if (d.step === 0) {
            ctx.fillRect(d.x + 8, dy - 8, 4, 9);
            ctx.fillRect(d.x + 18, dy - 8, 4, 4);
          } else {
            ctx.fillRect(d.x + 8, dy - 8, 4, 4);
            ctx.fillRect(d.x + 18, dy - 8, 4, 9);
          }
        }
      }

      // HUD
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'right';

      const showScore = s.milestoneFlash > 0 ? (Math.floor(s.frame / 4) % 2 === 0) : true;
      if (s.milestoneFlash > 0) s.milestoneFlash--;

      ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 100, 24);

      if (showScore) {
        ctx.fillStyle = isNight ? '#00f0ff' : '#0f172a';
        ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 20, 24);
      }

      // Overlay Screens
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER DINO RUN', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText('PRESS [A] TO START', width / 2, height / 2 + 15);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ff0055';
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

    // 3. High-Refresh-Rate Safe Game Loop
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
      while (accumulator >= TICK_STEP) {
        tickPhysics();
        accumulator -= TICK_STEP;
      }

      draw();
    };

    animId = requestAnimationFrame(loop);
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

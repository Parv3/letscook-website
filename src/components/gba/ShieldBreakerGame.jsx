import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaBounce, playGbaScore, playGbaVictory, playGbaCrash, playGbaPowerup, playGbaLaser } from './GbaAudio';

/**
 * Game 2: SHIELD BREAKER (Overhauled)
 * Gentle, thrilling Arkanoid brick breaker.
 * Slower initial ball speed, wider paddle, and dynamic powerups:
 * Multi-Ball, Laser Cannons, Paddle Expander, and Slow-Mo!
 */
export default function ShieldBreakerGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover' | 'won'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_shield_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    lives: 3,
    bestScore: highScore,
    paddleX: 125,
    paddleW: 68,
    hasLasers: false,
    balls: [{ x: 160, y: 175, vx: 1.2, vy: -1.4, r: 5, rot: 0 }],
    bricks: [],
    powerups: [], // { x, y, type: 'multiball'|'laser'|'wide'|'slow'|'life' }
    lasers: [],   // { x, y, vy: -5 }
    particles: [],
    floaters: [],
    frame: 0
  });

  const initBricks = () => {
    const bricks = [];
    const rows = 4;
    const cols = 9;
    const brickW = 30;
    const brickH = 10;
    const startX = 14;
    const startY = 28;
    const colors = ['#ef4444', '#38bdf8', '#fbbf24', '#22c55e'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (brickW + 4),
          y: startY + r * (brickH + 4),
          w: brickW,
          h: brickH,
          color: colors[r % colors.length],
          points: (rows - r) * 10,
          alive: true
        });
      }
    }
    return bricks;
  };

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.lives = 3;
    s.paddleX = 125;
    s.paddleW = 68;
    s.hasLasers = false;
    s.balls = [{ x: 160, y: 175, vx: (Math.random() > 0.5 ? 1 : -1) * 1.3, vy: -1.35, r: 5, rot: 0 }];
    s.bricks = initBricks();
    s.powerups = [];
    s.lasers = [];
    s.particles = [];
    s.floaters = [];
    setScore(0);
    setLives(3);
    setGameState('playing');
    playGbaBounce();
  }, []);

  // Action: Shoot Lasers if armed
  const shootLaser = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'playing' && s.hasLasers) {
      s.lasers.push({ x: s.paddleX + 6, y: 188, vy: -4.5 });
      s.lasers.push({ x: s.paddleX + s.paddleW - 6, y: 188, vy: -4.5 });
      playGbaLaser();
    } else if (s.gameState !== 'playing') {
      startGame();
    }
  }, [startGame]);

  // Button triggers
  useEffect(() => {
    if (buttonA || startTrigger) {
      shootLaser();
    }
    if (buttonB) {
      if (stateRef.current.gameState === 'playing' && stateRef.current.hasLasers) {
        shootLaser();
      } else if (onExit) {
        onExit();
      }
    }
  }, [buttonA, buttonB, startTrigger, shootLaser, onExit]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'z' || e.key === 'Z' || e.code === 'Enter') {
        shootLaser();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shootLaser, onExit]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 320);
    const height = (canvas.height = 213);

    stateRef.current.bricks = initBricks();
    let animId = null;

    const render = () => {
      const s = stateRef.current;
      s.frame++;

      // 1. Radar Sky Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
      ctx.arc(width / 2, height / 2, 110, 0, Math.PI * 2);
      ctx.stroke();

      // 2. D-Pad Movement handling
      if (dpadState.left) {
        s.paddleX = Math.max(4, s.paddleX - 4.5);
      }
      if (dpadState.right) {
        s.paddleX = Math.min(width - s.paddleW - 4, s.paddleX + 4.5);
      }

      // Keyboard left/right continuous polling
      // 3. Gameplay Physics
      if (s.gameState === 'playing') {
        // Update Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.y += l.vy;

          // Check brick hit
          for (const b of s.bricks) {
            if (b.alive && l.x > b.x && l.x < b.x + b.w && l.y > b.y && l.y < b.y + b.h) {
              b.alive = false;
              s.score += b.points;
              setScore(s.score);
              s.lasers.splice(i, 1);
              playGbaScore();
              break;
            }
          }
          if (l.y < 0) s.lasers.splice(i, 1);
        }

        // Update Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.y += 1.2;

          // Check catch by paddle
          if (
            p.y >= 188 &&
            p.y <= 198 &&
            p.x >= s.paddleX - 4 &&
            p.x <= s.paddleX + s.paddleW + 4
          ) {
            // Apply Powerup!
            playGbaPowerup();
            if (p.type === 'multiball') {
              // Duplicate existing balls
              const newBalls = [];
              s.balls.forEach(b => {
                newBalls.push({ ...b, vx: -b.vx * 0.9, vy: b.vy });
                newBalls.push({ ...b, vx: b.vx * 1.1, vy: b.vy * 0.9 });
              });
              s.balls.push(...newBalls);
              s.floaters.push({ text: 'MULTI-BALL!', x: p.x, y: 175, life: 30, color: '#00f0ff' });
            } else if (p.type === 'laser') {
              s.hasLasers = true;
              s.floaters.push({ text: 'LASERS ARMED!', x: p.x, y: 175, life: 30, color: '#ef4444' });
            } else if (p.type === 'wide') {
              s.paddleW = 92;
              s.floaters.push({ text: 'WIDE SHIELD!', x: p.x, y: 175, life: 30, color: '#fbbf24' });
            } else if (p.type === 'slow') {
              s.balls.forEach(b => {
                b.vx = Math.sign(b.vx || 1) * 1.2;
                b.vy = Math.sign(b.vy || -1) * 1.2;
              });
              s.floaters.push({ text: 'SLOW-MO!', x: p.x, y: 175, life: 30, color: '#22c55e' });
            } else if (p.type === 'life') {
              s.lives = Math.min(5, s.lives + 1);
              setLives(s.lives);
              s.floaters.push({ text: '+1 LIFE!', x: p.x, y: 175, life: 30, color: '#ec4899' });
            }
            s.powerups.splice(i, 1);
          } else if (p.y > height) {
            s.powerups.splice(i, 1);
          }
        }

        // Update Balls
        for (let i = s.balls.length - 1; i >= 0; i--) {
          const ball = s.balls[i];
          ball.x += ball.vx;
          ball.y += ball.vy;
          ball.rot += 0.12;

          // Wall bounces
          if (ball.x - ball.r < 0) {
            ball.x = ball.r;
            ball.vx = Math.abs(ball.vx);
            playGbaBounce();
          } else if (ball.x + ball.r > width) {
            ball.x = width - ball.r;
            ball.vx = -Math.abs(ball.vx);
            playGbaBounce();
          }

          if (ball.y - ball.r < 0) {
            ball.y = ball.r;
            ball.vy = Math.abs(ball.vy);
            playGbaBounce();
          }

          // Paddle bounce
          const paddleY = 192;
          if (
            ball.y + ball.r >= paddleY &&
            ball.y - ball.r <= paddleY + 8 &&
            ball.x >= s.paddleX &&
            ball.x <= s.paddleX + s.paddleW &&
            ball.vy > 0
          ) {
            // Deflection angle based on impact point
            const hitOffset = (ball.x - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
            const speed = Math.hypot(ball.vx, ball.vy);
            ball.vx = hitOffset * 2.1;
            ball.vy = -Math.max(1.1, Math.sqrt(Math.max(0.2, speed * speed - ball.vx * ball.vx)));
            playGbaBounce();
          }

          // Brick collision check
          for (const b of s.bricks) {
            if (b.alive) {
              if (
                ball.x + ball.r > b.x &&
                ball.x - ball.r < b.x + b.w &&
                ball.y + ball.r > b.y &&
                ball.y - ball.r < b.y + b.h
              ) {
                b.alive = false;
                ball.vy = -ball.vy;
                s.score += b.points;
                setScore(s.score);
                playGbaScore();

                if (s.score > s.bestScore) {
                  s.bestScore = s.score;
                  setHighScore(s.score);
                  localStorage.setItem('lc_gba_shield_hi', String(s.score));
                }

                // Chance to drop power-up (32% chance!)
                if (Math.random() < 0.32) {
                  const pTypes = ['multiball', 'laser', 'wide', 'slow', 'life'];
                  const chosenType = pTypes[Math.floor(Math.random() * pTypes.length)];
                  s.powerups.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    type: chosenType
                  });
                }
                break;
              }
            }
          }

          // Bottom loss
          if (ball.y > height + 10) {
            s.balls.splice(i, 1);
          }
        }

        // If all balls lost: lose a life
        if (s.balls.length === 0) {
          s.lives--;
          setLives(s.lives);
          if (s.lives <= 0) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
          } else {
            // Respawn single ball
            s.balls = [{ x: s.paddleX + s.paddleW / 2, y: 175, vx: (Math.random() > 0.5 ? 1 : -1) * 1.3, vy: -1.35, r: 5, rot: 0 }];
            s.hasLasers = false;
            s.paddleW = 68;
            playGbaBounce();
          }
        }

        // Check Victory
        const remaining = s.bricks.filter(b => b.alive).length;
        if (remaining === 0) {
          s.gameState = 'won';
          setGameState('won');
          playGbaVictory();
        }
      }

      // 4. Render Bricks
      s.bricks.forEach(b => {
        if (b.alive) {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(b.x + 1, b.y + 1, b.w - 2, 2);
        }
      });

      // 5. Render Powerup capsules
      s.powerups.forEach(p => {
        ctx.fillStyle = p.type === 'laser' ? '#ef4444' : p.type === 'multiball' ? '#00f0ff' : p.type === 'wide' ? '#fbbf24' : p.type === 'life' ? '#ec4899' : '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        const letter = p.type === 'multiball' ? 'M' : p.type === 'laser' ? 'L' : p.type === 'wide' ? 'W' : p.type === 'life' ? '♥' : 'S';
        ctx.fillText(letter, p.x, p.y + 2.5);
      });

      // 6. Render Lasers
      ctx.fillStyle = '#ef4444';
      s.lasers.forEach(l => {
        ctx.fillRect(l.x - 1, l.y, 2, 7);
      });

      // 7. Render Floating Text
      for (let i = s.floaters.length - 1; i >= 0; i--) {
        const fl = s.floaters[i];
        fl.y -= 0.6;
        fl.life--;
        ctx.fillStyle = fl.color;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(fl.text, fl.x, fl.y);
        if (fl.life <= 0) s.floaters.splice(i, 1);
      }

      // 8. Render Balls (Vibranium Shield)
      s.balls.forEach(ball => {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rot);

        // Shield Rings (Red, White, Blue, Star)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, 0, ball.r * 0.72, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(0, 0, ball.r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, ball.r * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 9. Render Paddle
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(s.paddleX, 192, s.paddleW, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(s.paddleX + 4, 193, s.paddleW - 8, 3);

      // If lasers armed, show laser pods on edges
      if (s.hasLasers) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(s.paddleX + 2, 188, 4, 5);
        ctx.fillRect(s.paddleX + s.paddleW - 6, 188, 4, 5);
      }

      // 10. HUD Overlay
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 75, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 15, 16);

      // Lives
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('♥'.repeat(Math.max(0, s.lives)), 14, 16);

      if (s.hasLasers) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '8px monospace';
        ctx.fillText('[A] FIRE CANNONS!', 48, 15);
      }

      // Overlay screens
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD BREAKER', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO LAUNCH SHIELD', width / 2, height / 2 + 5);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('CATCH FALLING POWER-UPS & SHATTER HYDRA', width / 2, height / 2 + 25);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD LOST // DEFEAT', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO REDEPLOY SHIELD', width / 2, height / 2 + 22);
      } else if (s.gameState === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HYDRA GRID PURGED!', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText(`SCORE: ${s.score}`, width / 2, height / 2);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO PLAY AGAIN', width / 2, height / 2 + 22);
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

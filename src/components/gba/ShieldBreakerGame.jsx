import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaBounce, playGbaScore, playGbaVictory, playGbaCrash, playGbaPowerup, playGbaLaser } from './GbaAudio';
import { submitScore } from '../../services/arcadeLeaderboardService';

/**
 * Game 2: SHIELD BREAKER (Optimized)
 * Fixed 60Hz physics timestep accumulator (eliminates high refresh rate speedups).
 * Crisp 480x320 canvas, wide paddle, multi-ball, laser blasters,
 * and automatic leaderboard score synchronization!
 */
export default function ShieldBreakerGame({ onExit, onOpenLeaderboard, dpadState, buttonA, buttonB, startTrigger }) {
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
    baseSpeed: 1.5,
    paddleX: 192,
    paddleW: 96,
    hasLasers: false,
    balls: [{ x: 240, y: 260, vx: 0.8, vy: -1.3, r: 7, rot: 0 }],
    bricks: [],
    powerups: [],
    lasers: [],
    particles: [],
    floaters: [],
    frame: 0,
    keys: { left: false, right: false }
  });

  const initBricks = () => {
    const bricks = [];
    const rows = 4;
    const cols = 9;
    const brickW = 46;
    const brickH = 14;
    const startX = 26;
    const startY = 40;
    const colors = ['#ef4444', '#38bdf8', '#fbbf24', '#22c55e'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * (brickW + 5),
          y: startY + r * (brickH + 5),
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
    s.baseSpeed = 1.5;
    s.paddleX = 192;
    s.paddleW = 96;
    s.hasLasers = false;
    s.balls = [{ x: 240, y: 260, vx: (Math.random() > 0.5 ? 0.8 : -0.8), vy: -1.3, r: 7, rot: 0 }];
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

  const shootLaser = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'playing' && s.hasLasers) {
      s.lasers.push({ x: s.paddleX + 8, y: 278, vy: -6.5 });
      s.lasers.push({ x: s.paddleX + s.paddleW - 8, y: 278, vy: -6.5 });
      playGbaLaser();
    } else if (s.gameState !== 'playing') {
      startGame();
    }
  }, [startGame]);

  // Controls triggers
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

  const dpadRef = useRef(dpadState);
  useEffect(() => {
    dpadRef.current = dpadState;
  }, [dpadState]);

  // Direct Pointer / Touch / Mouse steering on Canvas
  const handlePointer = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    if (typeof clientX !== 'number') return;
    const relX = (clientX - rect.left) * (480 / rect.width);
    const s = stateRef.current;
    s.paddleX = Math.max(6, Math.min(480 - s.paddleW - 6, relX - s.paddleW / 2));
  }, []);

  // Keyboard navigation & smooth left/right holding
  useEffect(() => {
    const s = stateRef.current;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keys.right = true;
      } else if (e.code === 'Space' || e.key === 'z' || e.key === 'Z' || e.code === 'Enter') {
        shootLaser();
      } else if (e.key === 'l' || e.key === 'L') {
        if (onOpenLeaderboard) onOpenLeaderboard();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keys.right = false;
      }
    };

    const handleBlur = () => {
      s.keys.left = false;
      s.keys.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [shootLaser, onExit, onOpenLeaderboard]);

  // Main Canvas Loop: Fixed 60Hz Timestep Accumulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 480);
    const height = (canvas.height = 320);

    stateRef.current.bricks = initBricks();
    let animId = null;
    let lastTime = 0;
    const TICK_STEP = 1000 / 60;
    let accumulator = 0;

    const tickPhysics = () => {
      const s = stateRef.current;
      s.frame++;

      // D-Pad and Keyboard movement handling (always read current ref)
      const curDpad = dpadRef.current || {};
      const goLeft = Boolean(curDpad.left || s.keys.left);
      const goRight = Boolean(curDpad.right || s.keys.right);

      if (goLeft && !goRight) {
        s.paddleX = Math.max(6, s.paddleX - 7);
      } else if (goRight && !goLeft) {
        s.paddleX = Math.min(width - s.paddleW - 6, s.paddleX + 7);
      }

      if (s.gameState === 'playing') {
        // Update Lasers
        for (let i = s.lasers.length - 1; i >= 0; i--) {
          const l = s.lasers[i];
          l.y += l.vy;

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

        // Update Powerups (Gentle fall speed)
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const p = s.powerups[i];
          p.y += 1.2;

          if (
            p.y >= 278 &&
            p.y <= 294 &&
            p.x >= s.paddleX - 6 &&
            p.x <= s.paddleX + s.paddleW + 6
          ) {
            playGbaPowerup();
            if (p.type === 'multiball') {
              const newBalls = [];
              s.balls.forEach(b => {
                newBalls.push({ ...b, vx: -b.vx * 0.9, vy: b.vy });
                newBalls.push({ ...b, vx: b.vx * 1.1, vy: b.vy * 0.9 });
              });
              s.balls.push(...newBalls);
              s.floaters.push({ text: 'MULTI-SHIELD!', x: p.x, y: 255, life: 35, color: '#00f0ff' });
            } else if (p.type === 'laser') {
              s.hasLasers = true;
              s.floaters.push({ text: 'LASERS ARMED!', x: p.x, y: 255, life: 35, color: '#ef4444' });
            } else if (p.type === 'wide') {
              s.paddleW = 125;
              s.floaters.push({ text: 'WIDE SHIELD!', x: p.x, y: 255, life: 35, color: '#fbbf24' });
            } else if (p.type === 'slow') {
              s.baseSpeed = 1.4;
              s.balls.forEach(b => {
                b.vx = Math.sign(b.vx || 1) * 0.9;
                b.vy = Math.sign(b.vy || -1) * 1.1;
              });
              s.floaters.push({ text: 'SLOW-MO!', x: p.x, y: 255, life: 35, color: '#22c55e' });
            } else if (p.type === 'life') {
              s.lives = Math.min(5, s.lives + 1);
              setLives(s.lives);
              s.floaters.push({ text: '+1 LIFE!', x: p.x, y: 255, life: 35, color: '#ec4899' });
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

          // Paddle bounce - smooth deflection based on current progressive baseSpeed
          const paddleY = 282;
          if (
            ball.y + ball.r >= paddleY &&
            ball.y - ball.r <= paddleY + 12 &&
            ball.x >= s.paddleX &&
            ball.x <= s.paddleX + s.paddleW &&
            ball.vy > 0
          ) {
            const hitOffset = (ball.x - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
            const curSpd = s.baseSpeed || 1.5;
            ball.vx = hitOffset * (curSpd * 0.85);
            ball.vy = -Math.max(1.1, Math.sqrt(Math.max(0.3, curSpd * curSpd - ball.vx * ball.vx)));
            playGbaBounce();
          }

          // Brick collisions - progressively increase ball speed
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

                // Gentle progressive difficulty ramp per brick destroyed
                s.baseSpeed = Math.min(3.2, (s.baseSpeed || 1.5) + 0.04);

                if (s.score > s.bestScore) {
                  s.bestScore = s.score;
                  setHighScore(s.score);
                  localStorage.setItem('lc_gba_shield_hi', String(s.score));
                }

                if (Math.random() < 0.35) {
                  const pTypes = ['multiball', 'laser', 'wide', 'slow', 'life'];
                  s.powerups.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    type: pTypes[Math.floor(Math.random() * pTypes.length)]
                  });
                }
                break;
              }
            }
          }

          if (ball.y > height + 15) {
            s.balls.splice(i, 1);
          }
        }

        // Life loss
        if (s.balls.length === 0) {
          s.lives--;
          setLives(s.lives);
          if (s.lives <= 0) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
            submitScore('shield', s.score);
          } else {
            s.baseSpeed = Math.max(1.5, (s.baseSpeed || 1.5) - 0.2);
            s.balls = [{ x: s.paddleX + s.paddleW / 2, y: 260, vx: (Math.random() > 0.5 ? 0.8 : -0.8), vy: -1.3, r: 7, rot: 0 }];
            s.hasLasers = false;
            s.paddleW = 96;
            playGbaBounce();
          }
        }

        // Victory
        const remaining = s.bricks.filter(b => b.alive).length;
        if (remaining === 0) {
          s.gameState = 'won';
          setGameState('won');
          playGbaVictory();
          submitScore('shield', s.score);
        }
      }
    };

    const draw = () => {
      const s = stateRef.current;

      // Radar Sky
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 90, 0, Math.PI * 2);
      ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Bricks
      s.bricks.forEach(b => {
        if (b.alive) {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(b.x + 2, b.y + 1, b.w - 4, 3);
        }
      });

      // Powerups
      s.powerups.forEach(p => {
        ctx.fillStyle = p.type === 'laser' ? '#ef4444' : p.type === 'multiball' ? '#00f0ff' : p.type === 'wide' ? '#fbbf24' : p.type === 'life' ? '#ec4899' : '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        const letter = p.type === 'multiball' ? 'M' : p.type === 'laser' ? 'L' : p.type === 'wide' ? 'W' : p.type === 'life' ? '♥' : 'S';
        ctx.fillText(letter, p.x, p.y + 3.5);
      });

      // Lasers
      ctx.fillStyle = '#ef4444';
      s.lasers.forEach(l => {
        ctx.fillRect(l.x - 2, l.y, 4, 10);
      });

      // Floating text
      for (let i = s.floaters.length - 1; i >= 0; i--) {
        const fl = s.floaters[i];
        fl.y -= 0.8;
        fl.life--;
        ctx.fillStyle = fl.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(fl.text, fl.x, fl.y);
        if (fl.life <= 0) s.floaters.splice(i, 1);
      }

      // Balls (Captain America Shield)
      s.balls.forEach(ball => {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rot);

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

      // Paddle
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(s.paddleX, 282, s.paddleW, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(s.paddleX + 6, 283, s.paddleW - 12, 4);

      if (s.hasLasers) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(s.paddleX + 2, 276, 6, 8);
        ctx.fillRect(s.paddleX + s.paddleW - 8, 276, 6, 8);
      }

      // HUD
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 100, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 20, 24);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('♥'.repeat(Math.max(0, s.lives)), 18, 24);

      if (s.hasLasers) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('[A] FIRE CANNONS!', 70, 24);
      }

      // Overlay screens
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD BREAKER', width / 2, height / 2 - 20);

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

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px monospace';
        ctx.fillText('PRESS [A] TO RETRY', width / 2, height / 2 + 35);
      } else if (s.gameState === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY!', width / 2, height / 2 - 25);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px monospace';
        ctx.fillText(`SCORE: ${s.score}`, width / 2, height / 2 + 5);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '13px monospace';
        ctx.fillText('PRESS [A] TO PLAY AGAIN', width / 2, height / 2 + 35);
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
        onMouseMove={handlePointer}
        onTouchMove={handlePointer}
        onTouchStart={handlePointer}
        className="w-full h-full object-contain cursor-crosshair"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

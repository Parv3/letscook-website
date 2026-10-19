import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaScore, playGbaCrash, playGbaBip, playGbaPowerup } from './GbaAudio';

/**
 * Game 3: MATRIX SNAKE (Overhauled)
 * Relaxed, smooth CRT cybernetic snake game.
 * Comfortable initial speed (no sudden crashes!), golden bonus matrices,
 * freeze pills to slow time, and ghost chips to phase through your tail!
 */
export default function MatrixSnakeGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_snake_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    bestScore: highScore,
    gridSize: 10,
    cols: 32,
    rows: 21,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 20, y: 10 },
    bonusFood: null, // { x, y, type: 'gold'|'freeze'|'ghost', timer: 120 }
    ghostTimer: 0,
    speed: 13, // Relaxed pace! Updates every 13 frames (~4.5 moves/sec)
    frame: 0
  });

  const spawnFood = (snake, exclude = []) => {
    let newFood;
    while (!newFood) {
      const rx = Math.floor(Math.random() * 30) + 1;
      const ry = Math.floor(Math.random() * 19) + 1;
      const onSnake = snake.some(seg => seg.x === rx && seg.y === ry);
      const onExclude = exclude.some(e => e && e.x === rx && e.y === ry);
      if (!onSnake && !onExclude) newFood = { x: rx, y: ry };
    }
    return newFood;
  };

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.food = spawnFood(s.snake);
    s.bonusFood = null;
    s.ghostTimer = 0;
    s.speed = 13; // Gentle comfortable pace
    s.frame = 0;
    setScore(0);
    setGameState('playing');
    playGbaBip();
  }, []);

  // Listen to D-Pad inputs
  useEffect(() => {
    const s = stateRef.current;
    if (dpadState.up && s.dir.y === 0) s.nextDir = { x: 0, y: -1 };
    if (dpadState.down && s.dir.y === 0) s.nextDir = { x: 0, y: 1 };
    if (dpadState.left && s.dir.x === 0) s.nextDir = { x: -1, y: 0 };
    if (dpadState.right && s.dir.x === 0) s.nextDir = { x: 1, y: 0 };
  }, [dpadState]);

  // Button triggers
  useEffect(() => {
    if (buttonA || startTrigger) {
      if (stateRef.current.gameState !== 'playing') startGame();
    }
    if (buttonB) {
      if (onExit) onExit();
    }
  }, [buttonA, buttonB, startTrigger, startGame, onExit]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const s = stateRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (s.dir.y === 0) s.nextDir = { x: 0, y: -1 };
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (s.dir.y === 0) s.nextDir = { x: 0, y: 1 };
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (s.dir.x === 0) s.nextDir = { x: -1, y: 0 };
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (s.dir.x === 0) s.nextDir = { x: 1, y: 0 };
      } else if (e.code === 'Space' || e.key === 'z' || e.key === 'Z' || e.code === 'Enter') {
        if (s.gameState !== 'playing') startGame();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, onExit]);

  // Main Game Loop
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

      // 1. Matrix Background with CRT scanline effect
      ctx.fillStyle = '#040d08';
      ctx.fillRect(0, 0, width, height);

      // CRT Faint green grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Physics & Logic Step
      if (s.gameState === 'playing') {
        if (s.ghostTimer > 0) s.ghostTimer--;

        // Chance to spawn special bonus food
        if (!s.bonusFood && s.frame % 280 === 0 && Math.random() < 0.7) {
          const bTypes = ['gold', 'freeze', 'ghost'];
          const bType = bTypes[Math.floor(Math.random() * bTypes.length)];
          const bPos = spawnFood(s.snake, [s.food]);
          s.bonusFood = { ...bPos, type: bType, timer: 140 };
        }

        // Countdown bonus food
        if (s.bonusFood) {
          s.bonusFood.timer--;
          if (s.bonusFood.timer <= 0) s.bonusFood = null;
        }

        // Tick step
        if (s.frame % s.speed === 0) {
          s.dir = s.nextDir;
          const head = { ...s.snake[0] };
          head.x += s.dir.x;
          head.y += s.dir.y;

          // Wrap around boundary (very forgiving!)
          if (head.x < 0) head.x = s.cols - 1;
          if (head.x >= s.cols) head.x = 0;
          if (head.y < 0) head.y = s.rows - 1;
          if (head.y >= s.rows) head.y = 0;

          // Self-collision check (bypassed if Ghost mode is active!)
          const selfCollision = s.ghostTimer <= 0 && s.snake.some(seg => seg.x === head.x && seg.y === head.y);
          if (selfCollision) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
          } else {
            s.snake.unshift(head);

            // Check regular food
            if (head.x === s.food.x && head.y === s.food.y) {
              s.score += 10;
              setScore(s.score);
              playGbaScore();
              s.food = spawnFood(s.snake, [s.bonusFood]);

              if (s.score > s.bestScore) {
                s.bestScore = s.score;
                setHighScore(s.score);
                localStorage.setItem('lc_gba_snake_hi', String(s.score));
              }

              // Very gradual speedup, capped at speed 8
              if (s.speed > 8 && s.score % 40 === 0) {
                s.speed--;
              }
            } else if (s.bonusFood && head.x === s.bonusFood.x && head.y === s.bonusFood.y) {
              // Collected bonus food!
              playGbaPowerup();
              if (s.bonusFood.type === 'gold') {
                s.score += 50;
              } else if (s.bonusFood.type === 'freeze') {
                s.speed = 14; // slows down
                s.score += 20;
              } else if (s.bonusFood.type === 'ghost') {
                s.ghostTimer = 180; // 3 seconds ghost
                s.score += 25;
              }
              setScore(s.score);
              s.bonusFood = null;
            } else {
              s.snake.pop();
            }
          }
        }
      }

      // 3. Render Food
      // Regular Green Neural Node
      const fx = s.food.x * 10;
      const fy = s.food.y * 10;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(fx + 1, fy + 1, 8, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 3, fy + 3, 4, 4);

      // Bonus Food
      if (s.bonusFood) {
        const bx = s.bonusFood.x * 10;
        const by = s.bonusFood.y * 10;
        const pulse = Math.floor(s.frame / 4) % 2 === 0;

        if (s.bonusFood.type === 'gold') {
          ctx.fillStyle = pulse ? '#fbbf24' : '#f59e0b';
          ctx.fillRect(bx + 1, by + 1, 8, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 3, by + 3, 3, 3);
        } else if (s.bonusFood.type === 'freeze') {
          ctx.fillStyle = pulse ? '#38bdf8' : '#0284c7';
          ctx.fillRect(bx + 1, by + 1, 8, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 2, by + 4, 6, 2);
        } else if (s.bonusFood.type === 'ghost') {
          ctx.fillStyle = pulse ? '#ec4899' : '#a855f7';
          ctx.fillRect(bx + 1, by + 1, 8, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 3, by + 2, 4, 4);
        }
      }

      // 4. Render Snake Body
      s.snake.forEach((seg, idx) => {
        const sx = seg.x * 10;
        const sy = seg.y * 10;

        if (idx === 0) {
          // SNAKE HEAD WITH DIRECTIONAL EYES
          ctx.fillStyle = s.ghostTimer > 0 ? 'rgba(236, 72, 153, 0.85)' : '#4ade80';
          ctx.fillRect(sx, sy, 10, 10);

          // Eyes
          ctx.fillStyle = '#040d08';
          let ex1 = sx + 2, ey1 = sy + 2, ex2 = sx + 6, ey2 = sy + 2;
          if (s.dir.x === 1) { ex1 = sx + 6; ey1 = sy + 2; ex2 = sx + 6; ey2 = sy + 6; }
          if (s.dir.x === -1) { ex1 = sx + 2; ey1 = sy + 2; ex2 = sx + 2; ey2 = sy + 6; }
          if (s.dir.y === 1) { ex1 = sx + 2; ey1 = sy + 6; ex2 = sx + 6; ey2 = sy + 6; }
          if (s.dir.y === -1) { ex1 = sx + 2; ey1 = sy + 2; ex2 = sx + 6; ey2 = sy + 2; }

          ctx.fillRect(ex1, ey1, 2, 2);
          ctx.fillRect(ex2, ey2, 2, 2);
        } else {
          // Body segments
          ctx.fillStyle = s.ghostTimer > 0 ? 'rgba(168, 85, 247, 0.45)' : (idx % 2 === 0 ? '#22c55e' : '#16a34a');
          ctx.fillRect(sx + 1, sy + 1, 8, 8);
        }
      });

      // 5. HUD Overlay
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 75, 16);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 15, 16);

      ctx.textAlign = 'left';
      ctx.font = '8px monospace';
      if (s.ghostTimer > 0) {
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`GHOST: ACTIVE (${Math.ceil(s.ghostTimer / 30)}s)`, 12, 16);
      } else {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.7)';
        ctx.fillText('D-PAD TO STEER • WRAP-AROUND OK', 12, 16);
      }

      // Ready / Game Over Screens
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MATRIX SNAKE', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] OR [START] TO BEGIN', width / 2, height / 2 + 5);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('GRAB DATA PACKETS • BONUS GEMS AVAILABLE', width / 2, height / 2 + 25);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CIRCUIT SHORT // GAME OVER', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2);

        ctx.fillStyle = '#22c55e';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO RECONNECT TRACE', width / 2, height / 2 + 22);
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

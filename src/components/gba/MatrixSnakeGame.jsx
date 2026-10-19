import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaScore, playGbaCrash, playGbaBip, playGbaPowerup } from './GbaAudio';
import { submitScore } from '../../services/arcadeLeaderboardService';

/**
 * Game 3: MATRIX SNAKE (Optimized)
 * Fixed 60Hz physics timestep accumulator (eliminates high refresh rate speedups).
 * Crisp 480x320 canvas, bonus golden matrix gems, freeze pills,
 * and automatic leaderboard score synchronization!
 */
export default function MatrixSnakeGame({ onExit, onOpenLeaderboard, dpadState, buttonA, buttonB, startTrigger }) {
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
    gridSize: 16,
    cols: 30,
    rows: 20,
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 20, y: 10 },
    bonusFood: null,
    ghostTimer: 0,
    speed: 12, // Ticks every 12 frames at 60Hz (~5 moves/sec)
    frame: 0
  });

  const spawnFood = (snake, exclude = []) => {
    let newFood;
    while (!newFood) {
      const rx = Math.floor(Math.random() * 28) + 1;
      const ry = Math.floor(Math.random() * 18) + 1;
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
    s.speed = 12;
    s.frame = 0;
    setScore(0);
    setGameState('playing');
    playGbaBip();
  }, []);

  // Controls triggers
  useEffect(() => {
    const s = stateRef.current;
    if (dpadState.up && s.dir.y === 0) s.nextDir = { x: 0, y: -1 };
    if (dpadState.down && s.dir.y === 0) s.nextDir = { x: 0, y: 1 };
    if (dpadState.left && s.dir.x === 0) s.nextDir = { x: -1, y: 0 };
    if (dpadState.right && s.dir.x === 0) s.nextDir = { x: 1, y: 0 };
  }, [dpadState]);

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
      } else if (e.key === 'l' || e.key === 'L') {
        if (onOpenLeaderboard) onOpenLeaderboard();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, onExit, onOpenLeaderboard]);

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
        if (s.ghostTimer > 0) s.ghostTimer--;

        if (!s.bonusFood && s.frame % 300 === 0 && Math.random() < 0.75) {
          const bTypes = ['gold', 'freeze', 'ghost'];
          const bType = bTypes[Math.floor(Math.random() * bTypes.length)];
          const bPos = spawnFood(s.snake, [s.food]);
          s.bonusFood = { ...bPos, type: bType, timer: 160 };
        }

        if (s.bonusFood) {
          s.bonusFood.timer--;
          if (s.bonusFood.timer <= 0) s.bonusFood = null;
        }

        if (s.frame % s.speed === 0) {
          s.dir = s.nextDir;
          const head = { ...s.snake[0] };
          head.x += s.dir.x;
          head.y += s.dir.y;

          if (head.x < 0) head.x = s.cols - 1;
          if (head.x >= s.cols) head.x = 0;
          if (head.y < 0) head.y = s.rows - 1;
          if (head.y >= s.rows) head.y = 0;

          const selfCollision = s.ghostTimer <= 0 && s.snake.some(seg => seg.x === head.x && seg.y === head.y);
          if (selfCollision) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
            submitScore('snake', s.score);
          } else {
            s.snake.unshift(head);

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

              if (s.speed > 8 && s.score % 50 === 0) {
                s.speed--;
              }
            } else if (s.bonusFood && head.x === s.bonusFood.x && head.y === s.bonusFood.y) {
              playGbaPowerup();
              if (s.bonusFood.type === 'gold') {
                s.score += 50;
              } else if (s.bonusFood.type === 'freeze') {
                s.speed = 13;
                s.score += 20;
              } else if (s.bonusFood.type === 'ghost') {
                s.ghostTimer = 220;
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
    };

    const draw = () => {
      const s = stateRef.current;
      const cell = 16;

      // Matrix CRT background
      ctx.fillStyle = '#040d08';
      ctx.fillRect(0, 0, width, height);

      // Faint green grid
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Food
      const fx = s.food.x * cell;
      const fy = s.food.y * cell;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(fx + 2, fy + 2, cell - 4, cell - 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 5, fy + 5, cell - 10, cell - 10);

      // Render Bonus Food
      if (s.bonusFood) {
        const bx = s.bonusFood.x * cell;
        const by = s.bonusFood.y * cell;
        const pulse = Math.floor(s.frame / 4) % 2 === 0;

        if (s.bonusFood.type === 'gold') {
          ctx.fillStyle = pulse ? '#fbbf24' : '#f59e0b';
          ctx.fillRect(bx + 2, by + 2, cell - 4, cell - 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 5, by + 5, 5, 5);
        } else if (s.bonusFood.type === 'freeze') {
          ctx.fillStyle = pulse ? '#38bdf8' : '#0284c7';
          ctx.fillRect(bx + 2, by + 2, cell - 4, cell - 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 4, by + 6, cell - 8, 4);
        } else if (s.bonusFood.type === 'ghost') {
          ctx.fillStyle = pulse ? '#ec4899' : '#a855f7';
          ctx.fillRect(bx + 2, by + 2, cell - 4, cell - 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx + 5, by + 4, 6, 6);
        }
      }

      // Render Snake
      s.snake.forEach((seg, idx) => {
        const sx = seg.x * cell;
        const sy = seg.y * cell;

        if (idx === 0) {
          // Head
          ctx.fillStyle = s.ghostTimer > 0 ? 'rgba(236, 72, 153, 0.9)' : '#4ade80';
          ctx.fillRect(sx, sy, cell, cell);

          // Eyes
          ctx.fillStyle = '#040d08';
          let ex1 = sx + 3, ey1 = sy + 3, ex2 = sx + 9, ey2 = sy + 3;
          if (s.dir.x === 1) { ex1 = sx + 9; ey1 = sy + 3; ex2 = sx + 9; ey2 = sy + 9; }
          if (s.dir.x === -1) { ex1 = sx + 3; ey1 = sy + 3; ex2 = sx + 3; ey2 = sy + 9; }
          if (s.dir.y === 1) { ex1 = sx + 3; ey1 = sy + 9; ex2 = sx + 9; ey2 = sy + 9; }
          if (s.dir.y === -1) { ex1 = sx + 3; ey1 = sy + 3; ex2 = sx + 9; ey2 = sy + 3; }

          ctx.fillRect(ex1, ey1, 3, 3);
          ctx.fillRect(ex2, ey2, 3, 3);
        } else {
          // Body
          ctx.fillStyle = s.ghostTimer > 0 ? 'rgba(168, 85, 247, 0.5)' : (idx % 2 === 0 ? '#22c55e' : '#16a34a');
          ctx.fillRect(sx + 2, sy + 2, cell - 4, cell - 4);
        }
      });

      // HUD
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 100, 24);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 20, 24);

      ctx.textAlign = 'left';
      ctx.font = 'bold 11px monospace';
      if (s.ghostTimer > 0) {
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`GHOST (${Math.ceil(s.ghostTimer / 30)}s)`, 16, 24);
      }

      // Overlays
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MATRIX SNAKE', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText('PRESS [A] TO START', width / 2, height / 2 + 15);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 25);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2 + 5);

        ctx.fillStyle = '#22c55e';
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

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaScore, playGbaCrash, playGbaBip } from './GbaAudio';

/**
 * Game 3: MATRIX SNAKE
 * Retro cybernetic snake game inside a glowing CRT phosphor terminal.
 * Grow the neural circuit trace by collecting quantum data blocks.
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
    speed: 7, // updates every 7 frames
    frame: 0
  });

  const spawnFood = (snake) => {
    let newFood;
    while (!newFood) {
      const rx = Math.floor(Math.random() * 30) + 1;
      const ry = Math.floor(Math.random() * 19) + 1;
      const collision = snake.some(seg => seg.x === rx && seg.y === ry);
      if (!collision) newFood = { x: rx, y: ry };
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
    s.speed = 7;
    s.frame = 0;
    setScore(0);
    setGameState('playing');
    playGbaBip();
  }, []);

  // Listen to D-Pad changes
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

      // 1. Matrix Background with CRT scanline simulation
      ctx.fillStyle = '#040d08';
      ctx.fillRect(0, 0, width, height);

      // Faint green grid
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

      // 2. Physics / Tick Step
      if (s.gameState === 'playing' && s.frame % s.speed === 0) {
        s.dir = s.nextDir;
        const head = { ...s.snake[0] };
        head.x += s.dir.x;
        head.y += s.dir.y;

        // Wrap around boundary or collide
        if (head.x < 0) head.x = s.cols - 1;
        if (head.x >= s.cols) head.x = 0;
        if (head.y < 0) head.y = s.rows - 1;
        if (head.y >= s.rows) head.y = 0;

        // Self-collision check
        const selfCollision = s.snake.some(seg => seg.x === head.x && seg.y === head.y);
        if (selfCollision) {
          s.gameState = 'gameover';
          setGameState('gameover');
          playGbaCrash();
        } else {
          s.snake.unshift(head);

          // Food collection
          if (head.x === s.food.x && head.y === s.food.y) {
            s.score += 25;
            setScore(s.score);
            playGbaScore();
            s.food = spawnFood(s.snake);

            // Slightly increase speed
            if (s.score % 100 === 0 && s.speed > 3) {
              s.speed--;
            }

            if (s.score > s.bestScore) {
              s.bestScore = s.score;
              setHighScore(s.score);
              localStorage.setItem('lc_gba_snake_hi', String(s.score));
            }
          } else {
            s.snake.pop();
          }
        }
      }

      // 3. Draw Food (Pulsing Quantum Memory Chip)
      const pulse = Math.sin(s.frame * 0.2) * 1.5;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(s.food.x * 10 + 1 - pulse / 2, s.food.y * 10 + 1 - pulse / 2, 8 + pulse, 8 + pulse);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.food.x * 10 + 3, s.food.y * 10 + 3, 4, 4);

      // 4. Draw Snake
      s.snake.forEach((seg, idx) => {
        if (idx === 0) {
          // Head (Bright Emerald)
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(seg.x * 10 + 1, seg.y * 10 + 1, 8, 8);
          // Eyes
          ctx.fillStyle = '#022c22';
          ctx.fillRect(seg.x * 10 + 3, seg.y * 10 + 3, 2, 2);
        } else {
          // Body (Glowing green segments)
          ctx.fillStyle = idx % 2 === 0 ? '#22c55e' : '#16a34a';
          ctx.fillRect(seg.x * 10 + 1.5, seg.y * 10 + 1.5, 7, 7);
        }
      });

      // 5. In-Game HUD
      ctx.font = '900 11px monospace';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'left';
      ctx.fillText(`CIRCUITS: ${s.score}`, 8, 16);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#86efac';
      ctx.fillText(`RECORD: ${s.bestScore}`, width - 8, 16);

      // 6. Overlays
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(2, 44, 34, 0.85)';
        ctx.fillRect(20, 50, width - 40, 115);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 50, width - 40, 115);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText('MATRIX SNAKE', width / 2, 80);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('CONTROL WITH D-PAD OR WASD', width / 2, 105);
        ctx.fillStyle = '#86efac';
        ctx.fillText('PRESS [A] TO INITIATE TRACE', width / 2, 125);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('HARVEST QUANTUM CORES TO EXPAND', width / 2, 145);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(2, 44, 34, 0.9)';
        ctx.fillRect(24, 45, width - 48, 120);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 45, width - 48, 120);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('BUFFER OVERFLOW', width / 2, 75);

        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`FINAL TRACE: ${s.score}`, width / 2, 102);

        ctx.font = '900 10px monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('PRESS [A] TO RECONNECT TRACE', width / 2, 135);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="gba-game-screen-wrapper">
      <canvas ref={canvasRef} className="gba-game-canvas" />
    </div>
  );
}

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaBounce, playGbaScore, playGbaVictory, playGbaCrash } from './GbaAudio';

/**
 * Game 2: SHIELD BREAKER
 * Retro Arkanoid / Brick Breaker.
 * Bounce Captain America's Vibranium shield to shatter Hydra security blocks.
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
    paddleX: 130,
    paddleW: 55,
    ballX: 160,
    ballY: 180,
    ballVX: 2.2,
    ballVY: -2.2,
    shieldRot: 0,
    bricks: [],
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
    if (s.gameState === 'ready' || s.gameState === 'gameover' || s.gameState === 'won') {
      s.gameState = 'playing';
      s.score = 0;
      s.lives = 3;
      s.paddleX = 130;
      s.ballX = 160;
      s.ballY = 175;
      s.ballVX = (Math.random() > 0.5 ? 1 : -1) * 2.2;
      s.ballVY = -2.2;
      s.bricks = initBricks();
      setScore(0);
      setLives(3);
      setGameState('playing');
      playGbaBounce();
    }
  }, []);

  // Controls input
  useEffect(() => {
    if (buttonA || startTrigger) {
      startGame();
    }
    if (buttonB) {
      if (onExit) onExit();
    }
  }, [buttonA, buttonB, startTrigger, startGame, onExit]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'z' || e.key === 'Z' || e.code === 'Enter') {
        startGame();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, onExit]);

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

      // 1. Clear & draw background grid
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Radar rings
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 70, 0, Math.PI * 2);
      ctx.arc(width / 2, height / 2, 120, 0, Math.PI * 2);
      ctx.stroke();

      // 2. D-Pad Movement handling
      if (dpadState.left) {
        s.paddleX = Math.max(4, s.paddleX - 4.5);
      }
      if (dpadState.right) {
        s.paddleX = Math.min(width - s.paddleW - 4, s.paddleX + 4.5);
      }

      // Keyboard arrow keys polling
      // (Optional smooth handling)

      // 3. Gameplay Physics
      if (s.gameState === 'playing') {
        s.ballX += s.ballVX;
        s.ballY += s.ballVY;
        s.shieldRot += 0.15;

        // Wall collisions
        if (s.ballX - 5 < 0) {
          s.ballX = 5;
          s.ballVX = Math.abs(s.ballVX);
          playGbaBounce();
        } else if (s.ballX + 5 > width) {
          s.ballX = width - 5;
          s.ballVX = -Math.abs(s.ballVX);
          playGbaBounce();
        }

        if (s.ballY - 5 < 0) {
          s.ballY = 5;
          s.ballVY = Math.abs(s.ballVY);
          playGbaBounce();
        }

        // Paddle Collision (Tactical angle deflection)
        const paddleY = height - 16;
        if (
          s.ballY + 5 >= paddleY &&
          s.ballY - 5 <= paddleY + 8 &&
          s.ballX >= s.paddleX - 4 &&
          s.ballX <= s.paddleX + s.paddleW + 4
        ) {
          // Angle depends on where on the paddle the shield hits
          const hitOffset = (s.ballX - (s.paddleX + s.paddleW / 2)) / (s.paddleW / 2);
          s.ballVX = hitOffset * 3.5;
          s.ballVY = -Math.abs(s.ballVY);
          playGbaBounce();
        }

        // Brick Collisions
        let anyBrickAlive = false;
        for (let i = 0; i < s.bricks.length; i++) {
          const b = s.bricks[i];
          if (!b.alive) continue;
          anyBrickAlive = true;

          if (
            s.ballX + 5 > b.x &&
            s.ballX - 5 < b.x + b.w &&
            s.ballY + 5 > b.y &&
            s.ballY - 5 < b.y + b.h
          ) {
            b.alive = false;
            s.ballVY = -s.ballVY;
            s.score += b.points;
            setScore(s.score);
            playGbaScore();

            if (s.score > s.bestScore) {
              s.bestScore = s.score;
              setHighScore(s.score);
              localStorage.setItem('lc_gba_shield_hi', String(s.score));
            }
            break;
          }
        }

        // Check Victory
        if (!anyBrickAlive) {
          s.gameState = 'won';
          setGameState('won');
          playGbaVictory();
        }

        // Ball falls off screen bottom
        if (s.ballY > height + 10) {
          s.lives--;
          setLives(s.lives);
          if (s.lives <= 0) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
          } else {
            // Reset ball position
            s.ballX = s.paddleX + s.paddleW / 2;
            s.ballY = height - 30;
            s.ballVY = -2.2;
            s.ballVX = (Math.random() > 0.5 ? 1 : -1) * 2;
            playGbaBounce();
          }
        }
      }

      // 4. Render Bricks
      s.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        // Bevel highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(b.x, b.y, b.w, 2);
        ctx.fillRect(b.x, b.y, 2, b.h);
      });

      // 5. Render Tactical Paddle (Cap's Gauntlet)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(s.paddleX, height - 16, s.paddleW, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(s.paddleX + 4, height - 14, s.paddleW - 8, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.paddleX + s.paddleW / 2 - 2, height - 16, 4, 8);

      // 6. Render Vibranium Shield Ball
      ctx.save();
      ctx.translate(s.ballX, s.ballY);
      ctx.rotate(s.shieldRot);

      // Red Outer Ring
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // White Silver Ring
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();

      // Blue Core Center
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
      ctx.fill();

      // White Center Star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Render In-Game HUD
      ctx.font = '900 11px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${s.score}`, 8, 16);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`SHIELDS: ${'● '.repeat(Math.max(0, s.lives))}`, width / 2, 16);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`HI: ${s.bestScore}`, width - 8, 16);

      // 8. Overlays
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(20, 50, width - 40, 115);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 50, width - 40, 115);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD BREAKER', width / 2, 80);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('USE D-PAD OR ARROWS TO MOVE', width / 2, 105);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('PRESS [A] TO LAUNCH VIBRANIUM SHIELD', width / 2, 125);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('SMASH ALL HYDRA CIPHERS TO WIN', width / 2, 145);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.fillRect(24, 45, width - 48, 120);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 45, width - 48, 120);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('DEFENSES BREACHED', width / 2, 75);

        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`FINAL SCORE: ${s.score}`, width / 2, 102);

        ctx.font = '900 10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('PRESS [A] TO RETRY MISSION', width / 2, 135);
      } else if (s.gameState === 'won') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(24, 45, width - 48, 120);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 45, width - 48, 120);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#22c55e';
        ctx.textAlign = 'center';
        ctx.fillText('HYDRA CIPHERS NEUTRALIZED!', width / 2, 75);

        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`VICTORY SCORE: ${s.score}`, width / 2, 102);

        ctx.font = '900 10px monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('PRESS [A] TO PLAY AGAIN', width / 2, 135);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [dpadState]);

  return (
    <div className="gba-game-screen-wrapper">
      <canvas ref={canvasRef} className="gba-game-canvas" />
    </div>
  );
}

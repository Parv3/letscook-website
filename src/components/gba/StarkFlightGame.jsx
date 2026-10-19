import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaJump, playGbaScore, playGbaCrash } from './GbaAudio';

/**
 * Game 1: STARK FLIGHT
 * Retro arcade side-scrolling jetpack game.
 * Pilot Iron Man through electric cyber-grids and gather Arc Cores.
 */
export default function StarkFlightGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_stark_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    playerY: 100,
    velocity: 0,
    gravity: 0.22,
    lift: -4.2,
    pipes: [],
    arcCores: [],
    frame: 0,
    lastJump: 0,
    bestScore: highScore
  });

  const triggerThrust = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'ready') {
      s.gameState = 'playing';
      setGameState('playing');
      s.velocity = s.lift;
      playGbaJump();
    } else if (s.gameState === 'playing') {
      s.velocity = s.lift;
      playGbaJump();
    } else if (s.gameState === 'gameover') {
      // Reset
      s.gameState = 'playing';
      s.score = 0;
      s.playerY = 100;
      s.velocity = -3;
      s.pipes = [];
      s.arcCores = [];
      s.frame = 0;
      setScore(0);
      setGameState('playing');
      playGbaJump();
    }
  }, []);

  // Listen to physical GBA button triggers
  useEffect(() => {
    if (buttonA || dpadState.up || startTrigger) {
      triggerThrust();
    }
  }, [buttonA, dpadState.up, startTrigger, triggerThrust]);

  // Keyboard fallbacks inside canvas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        triggerThrust();
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerThrust, onExit]);

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

      // 1. Draw Retro Cyber Background
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, width, height);

      // Distant pixel grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = (-(s.frame * 0.5) % 30); x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Distant silhouette city skyline
      ctx.fillStyle = '#0b1124';
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 28) - (s.frame * 0.4) % (14 * 28));
        const bh = 30 + ((i * 17) % 55);
        ctx.fillRect(bx, height - bh, 24, bh);
      }

      // 2. Physics & Logic when 'playing'
      if (s.gameState === 'playing') {
        s.velocity += s.gravity;
        s.playerY += s.velocity;

        // Ground and Ceiling collision
        if (s.playerY > height - 16) {
          s.playerY = height - 16;
          s.gameState = 'gameover';
          setGameState('gameover');
          playGbaCrash();
        }
        if (s.playerY < 8) {
          s.playerY = 8;
          s.velocity = 0;
        }

        // Spawn Laser Pillars
        if (s.frame % 90 === 0) {
          const gap = 64;
          const topH = 20 + Math.random() * (height - gap - 40);
          s.pipes.push({
            x: width,
            topH,
            gap,
            passed: false
          });

          // Chance to spawn floating Arc Reactor core
          if (Math.random() < 0.65) {
            s.arcCores.push({
              x: width + 14,
              y: topH + gap / 2,
              collected: false
            });
          }
        }

        // Update & draw pipes
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= 1.8;

          // Top Pillar
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(p.x, 0, 20, p.topH);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(p.x + 4, p.topH - 5, 12, 5); // Glow emitter

          // Bottom Pillar
          const botY = p.topH + p.gap;
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(p.x, botY, 20, height - botY);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(p.x + 4, botY, 12, 5); // Glow emitter

          // Laser forcefield pulse between pillars
          ctx.fillStyle = s.frame % 6 < 3 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 0, 85, 0.25)';
          ctx.fillRect(p.x + 8, p.topH, 4, p.gap);

          // Score when passing
          if (!p.passed && p.x < 50) {
            p.passed = true;
            s.score += 10;
            setScore(s.score);
            if (s.score > s.bestScore) {
              s.bestScore = s.score;
              setHighScore(s.score);
              localStorage.setItem('lc_gba_stark_hi', String(s.score));
            }
          }

          // Player Collision box: x: 50, y: s.playerY, w: 18, h: 14
          const playerBox = { x: 50, y: s.playerY - 7, w: 18, h: 14 };
          if (
            playerBox.x + playerBox.w > p.x &&
            playerBox.x < p.x + 20 &&
            (playerBox.y < p.topH || playerBox.y + playerBox.h > botY)
          ) {
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();
          }

          // Remove offscreen
          if (p.x < -30) s.pipes.splice(i, 1);
        }

        // Update Arc Cores
        for (let i = s.arcCores.length - 1; i >= 0; i--) {
          const c = s.arcCores[i];
          c.x -= 1.8;

          // Draw Arc Core
          const pulse = Math.sin(s.frame * 0.15) * 2;
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 5 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2, 0, Math.PI * 2);
          ctx.fill();

          // Check pickup
          const dist = Math.hypot(c.x - 59, c.y - s.playerY);
          if (dist < 16 && !c.collected) {
            c.collected = true;
            s.score += 50;
            setScore(s.score);
            playGbaScore();
            s.arcCores.splice(i, 1);
          } else if (c.x < -20) {
            s.arcCores.splice(i, 1);
          }
        }
      }

      // 3. Draw Stark Mark LXXXV Sprite (Pixel Armor)
      const px = 50;
      const py = s.playerY;

      // Repulsor jet flame
      if (s.gameState === 'playing' && s.velocity < 1) {
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(px - 10, py);
        ctx.lineTo(px - 18 - (Math.random() * 8), py - 3);
        ctx.lineTo(px - 18 - (Math.random() * 8), py + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Armor Body (Red & Gold)
      ctx.fillStyle = '#d90429'; // Stark Red
      ctx.fillRect(px - 8, py - 6, 16, 12);
      ctx.fillStyle = '#f59e0b'; // Gold Faceplate & Inlay
      ctx.fillRect(px + 4, py - 4, 4, 8);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(px - 4, py - 3, 6, 6);

      // Arc Reactor Glow (Cyan)
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(px - 1, py - 1, 3, 3);

      // Eye slit
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 5, py - 3, 2, 2);

      // 4. In-Game HUD: Score & High Score
      ctx.font = '900 11px monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${s.score}`, 8, 16);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`HI: ${s.bestScore}`, width - 8, 16);

      // 5. Screen Overlays (Ready / Game Over)
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(20, 45, width - 40, 120);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 45, width - 40, 120);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'center';
        ctx.fillText('STARK FLIGHT', width / 2, 75);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('PRESS [A] OR SPACE TO THRUST', width / 2, 105);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('DODGE LASERS • COLLECT ARC CORES', width / 2, 125);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('PRESS [B] TO RETURN TO MENU', width / 2, 145);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(24, 40, width - 48, 130);
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 40, width - 48, 130);

        ctx.font = '900 18px monospace';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM OVERHEAT', width / 2, 72);

        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`FINAL SCORE: ${s.score}`, width / 2, 98);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`BEST SCORE: ${s.bestScore}`, width / 2, 118);

        ctx.font = '900 10px monospace';
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('PRESS [A] TO REBOOT PROTOCOL', width / 2, 145);
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

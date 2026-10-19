import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaScore, playGbaBounce, playGbaCrash } from './GbaAudio';

/**
 * Game 4: THOR'S URU FORGE
 * High-speed reflex falling item catch game.
 * Move Thor's Nidavellir anvil to forge falling molten Uru & Bifrost energy.
 */
export default function ThorForgeGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('lc_gba_thor_hi') || '0', 10);
  });

  const stateRef = useRef({
    gameState: 'ready',
    score: 0,
    lives: 3,
    bestScore: highScore,
    anvilX: 135,
    anvilW: 50,
    items: [],
    frame: 0
  });

  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.lives = 3;
    s.anvilX = 135;
    s.items = [];
    s.frame = 0;
    setScore(0);
    setLives(3);
    setGameState('playing');
    playGbaBounce();
  }, []);

  // Controls triggers
  useEffect(() => {
    if (buttonA || startTrigger) {
      if (stateRef.current.gameState !== 'playing') startGame();
    }
    if (buttonB) {
      if (onExit) onExit();
    }
  }, [buttonA, buttonB, startTrigger, startGame, onExit]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'z' || e.key === 'Z' || e.code === 'Enter') {
        if (stateRef.current.gameState !== 'playing') startGame();
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

    let animId = null;

    const render = () => {
      const s = stateRef.current;
      s.frame++;

      // 1. Asgardian Thunder Sky Background
      ctx.fillStyle = '#0f0c05';
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial nebula clouds
      const cloudGrad = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 60, 160);
      cloudGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      cloudGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = cloudGrad;
      ctx.fillRect(0, 0, width, 120);

      // Occasional faint lightning bolt in sky
      if (s.frame % 110 === 0 && Math.random() < 0.6) {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width / 2 + (Math.random() - 0.5) * 100, 0);
        ctx.lineTo(width / 2 + (Math.random() - 0.5) * 80, 50);
        ctx.lineTo(width / 2 + (Math.random() - 0.5) * 120, 90);
        ctx.stroke();
      }

      // 2. D-Pad Movement handling
      if (dpadState.left) {
        s.anvilX = Math.max(4, s.anvilX - 4.5);
      }
      if (dpadState.right) {
        s.anvilX = Math.min(width - s.anvilW - 4, s.anvilX + 4.5);
      }

      // 3. Gameplay Physics
      if (s.gameState === 'playing') {
        // Spawn falling items
        if (s.frame % Math.max(28, 48 - Math.floor(s.score / 200)) === 0) {
          const typeRoll = Math.random();
          let type = 'uru'; // Molten Gold Uru Ingot
          let points = 50;
          let speed = 2.2 + Math.random() * 1.5;

          if (typeRoll < 0.22) {
            type = 'lightning'; // Rare Bifrost Energy Orb
            points = 150;
            speed = 3.2;
          } else if (typeRoll < 0.45) {
            type = 'dark_matter'; // Explosive Debris (Avoid!)
            points = 0;
            speed = 2.4;
          }

          s.items.push({
            x: 16 + Math.random() * (width - 32),
            y: -10,
            type,
            points,
            speed
          });
        }

        // Update items
        const anvilY = height - 18;
        for (let i = s.items.length - 1; i >= 0; i--) {
          const item = s.items[i];
          item.y += item.speed;

          // Check Catch by Anvil
          if (
            item.y >= anvilY - 8 &&
            item.y <= anvilY + 10 &&
            item.x >= s.anvilX - 6 &&
            item.x <= s.anvilX + s.anvilW + 6
          ) {
            if (item.type === 'dark_matter') {
              // Hit bomb!
              s.lives--;
              setLives(s.lives);
              playGbaCrash();
              if (s.lives <= 0) {
                s.gameState = 'gameover';
                setGameState('gameover');
              }
            } else {
              s.score += item.points;
              setScore(s.score);
              playGbaScore();
              if (s.score > s.bestScore) {
                s.bestScore = s.score;
                setHighScore(s.score);
                localStorage.setItem('lc_gba_thor_hi', String(s.score));
              }
            }
            s.items.splice(i, 1);
            continue;
          }

          // Item missed bottom edge
          if (item.y > height + 10) {
            if (item.type === 'uru' || item.type === 'lightning') {
              // Missed good item
              // Optional penalty or fine
            }
            s.items.splice(i, 1);
          }
        }
      }

      // 4. Render Falling Items
      s.items.forEach(item => {
        if (item.type === 'uru') {
          // Molten Uru Ingot (Gold Bar)
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(item.x - 6, item.y - 4, 12, 8);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(item.x - 4, item.y - 3, 8, 3);
        } else if (item.type === 'lightning') {
          // Bifrost Lightning Core (Glowing Cyan Star)
          const pulse = Math.sin(s.frame * 0.25) * 2;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 6 + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dark Matter Bomb (Red Spiked Mine)
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(item.x - 1, item.y - 1, 2, 2);
        }
      });

      // 5. Render Thor's Nidavellir Anvil Basin
      ctx.fillStyle = '#334155'; // Dark Forge Steel
      ctx.fillRect(s.anvilX, height - 16, s.anvilW, 10);
      ctx.fillStyle = '#64748b'; // Chamfer Top
      ctx.fillRect(s.anvilX + 3, height - 16, s.anvilW - 6, 3);

      // Gold Inlay Rune on Anvil
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(s.anvilX + s.anvilW / 2 - 8, height - 11, 16, 3);

      // 6. Render HUD
      ctx.font = '900 11px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText(`FORGED: ${s.score}`, 8, 16);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`LIVES: ${'⚡ '.repeat(Math.max(0, s.lives))}`, width / 2, 16);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`HI: ${s.bestScore}`, width - 8, 16);

      // 7. Overlays
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(15, 12, 5, 0.85)';
        ctx.fillRect(20, 50, width - 40, 115);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 50, width - 40, 115);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText("THOR'S URU FORGE", width / 2, 80);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('MOVE ANVIL WITH D-PAD OR ARROWS', width / 2, 105);
        ctx.fillStyle = '#fef08a';
        ctx.fillText('CATCH GOLD URU & LIGHTNING ORBS', width / 2, 125);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('AVOID RED DARK MATTER BOMBS!', width / 2, 145);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(15, 12, 5, 0.9)';
        ctx.fillRect(24, 45, width - 48, 120);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 45, width - 48, 120);

        ctx.font = '900 16px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.textAlign = 'center';
        ctx.fillText('FORGE EXTINGUISHED', width / 2, 75);

        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`TOTAL FORGED: ${s.score}`, width / 2, 102);

        ctx.font = '900 10px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('PRESS [A] TO REIGNITE FORGE', width / 2, 135);
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

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { playGbaJump, playGbaCrash, playGbaMilestone, playGbaBip } from './GbaAudio';

/**
 * CYBER DINO RUN
 * Authentic Chrome T-Rex runner reimagined for the GBA LCD screen.
 * Jump over quantum cacti & spikes, duck under flying cyber-drones,
 * experience day/night cycles, smooth speed ramps, and 100-pt milestone chimes!
 */
export default function CyberDinoGame({ onExit, dpadState, buttonA, buttonB, startTrigger }) {
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
    speed: 2.8,
    frame: 0,
    milestoneFlash: 0,
    
    // Dino Physics
    dino: {
      x: 35,
      y: 172,
      groundY: 172,
      vy: 0,
      gravity: 0.4,
      jumpForce: -7.2,
      isGrounded: true,
      isDucking: false,
      step: 0
    },

    // Obstacles: { type: 'cactus'|'bird', x, y, w, h, birdsWingUp: false }
    obstacles: [],
    minSpawnDist: 85,
    nextSpawnIn: 70,

    // Environmental Deco (clouds, stars, ground pebbles)
    clouds: [
      { x: 50, y: 35, speed: 0.4 },
      { x: 170, y: 55, speed: 0.3 },
      { x: 280, y: 25, speed: 0.5 }
    ],
    groundPebbles: [],
    dayNightPhase: 0, // 0 = day, 1 = dusk, 2 = night, 3 = dawn
    particles: []
  });

  // Initialize ground pebbles
  useEffect(() => {
    const s = stateRef.current;
    s.groundPebbles = [];
    for (let i = 0; i < 30; i++) {
      s.groundPebbles.push({
        x: Math.random() * 320,
        y: 175 + Math.random() * 25,
        w: Math.random() > 0.5 ? 2 : 1
      });
    }
  }, []);

  const triggerJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'ready') {
      s.gameState = 'playing';
      s.score = 0;
      s.speed = 2.8;
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
      s.speed = 2.8;
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

      // Jump dust puff
      for (let i = 0; i < 4; i++) {
        s.particles.push({
          x: s.dino.x + 4,
          y: s.dino.groundY,
          vx: -(Math.random() * 1.5 + 0.5),
          vy: -(Math.random() * 1.2),
          life: 18
        });
      }
    }
  }, []);

  // Update ducking state based on inputs
  useEffect(() => {
    const s = stateRef.current;
    const shouldDuck = dpadState.down || buttonB;
    s.dino.isDucking = shouldDuck;

    // Fast-fall if ducking in air
    if (shouldDuck && !s.dino.isGrounded && s.dino.vy < 3) {
      s.dino.vy += 0.8;
    }
  }, [dpadState.down, buttonB]);

  // Jump trigger via A button or D-Pad UP
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
        if (!s.dino.isGrounded) s.dino.vy += 0.8;
      } else if (e.key === 'Escape') {
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e) => {
      const s = stateRef.current;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'x' || e.key === 'X') {
        s.dino.isDucking = false;
      }
      // Variable jump height: release early to cut jump
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'z' || e.key === 'Z') {
        if (!s.dino.isGrounded && s.dino.vy < -2.5) {
          s.dino.vy = -2.5;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerJump, onExit]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = 320);
    const height = (canvas.height = 213);
    const groundY = 172;

    let animId = null;

    const render = () => {
      const s = stateRef.current;
      s.frame++;

      // 1. Day / Night cycle logic
      // Every 450 points, alternate cycle
      const cycleProg = Math.floor(s.score / 350) % 2;
      const isNight = cycleProg === 1;

      // Clear Screen with day/night palette
      ctx.fillStyle = isNight ? '#0b0f19' : '#f4f6f8';
      ctx.fillRect(0, 0, width, height);

      // Stars in night mode
      if (isNight) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 24; i++) {
          const sx = (i * 37 + 15) % width;
          const sy = (i * 19 + 10) % 90;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }
        // Pixel Crescent Moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(260, 35, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0b0f19';
        ctx.beginPath();
        ctx.arc(264, 33, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Parallax Clouds
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.12)' : 'rgba(148, 163, 184, 0.45)';
      s.clouds.forEach(cloud => {
        if (s.gameState === 'playing') cloud.x -= cloud.speed;
        if (cloud.x < -40) cloud.x = width + Math.random() * 30;

        // Draw cute retro cloud
        ctx.fillRect(cloud.x, cloud.y, 24, 6);
        ctx.fillRect(cloud.x + 4, cloud.y - 4, 16, 4);
        ctx.fillRect(cloud.x + 8, cloud.y - 7, 8, 3);
      });

      // Horizon Ground Line
      ctx.strokeStyle = isNight ? '#38bdf8' : '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Moving Ground Pebbles
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(100, 116, 139, 0.4)';
      s.groundPebbles.forEach(p => {
        if (s.gameState === 'playing') p.x -= s.speed;
        if (p.x < 0) p.x = width + Math.random() * 20;
        ctx.fillRect(p.x, p.y, p.w * 2, 1.5);
      });

      // 2. Gameplay Physics & Logic
      if (s.gameState === 'playing') {
        // Score progression (every 3 frames = 1 point)
        if (s.frame % 3 === 0) {
          s.score++;
          setScore(s.score);

          // 100-pt milestone chime & flash!
          if (s.score > 0 && s.score % 100 === 0) {
            playGbaMilestone();
            s.milestoneFlash = 35;
          }

          if (s.score > s.bestScore) {
            s.bestScore = s.score;
            setHighScore(s.score);
            localStorage.setItem('lc_gba_dino_hi', String(s.score));
          }

          // Gradual, comfortable acceleration (never unfairly fast!)
          if (s.speed < 5.8) {
            s.speed += 0.0012;
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
            // Landing dust
            s.particles.push({ x: d.x + 6, y: groundY, vx: -1, vy: -0.5, life: 10 });
          }
        }

        // Running footstep toggle (every 6 frames)
        if (s.frame % 6 === 0) {
          d.step = (d.step + 1) % 2;
        }

        // Spawn Obstacles
        s.nextSpawnIn--;
        if (s.nextSpawnIn <= 0) {
          // Choose obstacle: Spikes/Cacti, or Flying Cyber Drone (if score > 120)
          const allowFlyers = s.score > 120;
          const roll = Math.random();

          if (allowFlyers && roll < 0.38) {
            // Flying Pterodactyl Drone!
            // 3 altitude levels:
            // High (y: 120 - safe to stand)
            // Mid (y: 140 - can duck or jump)
            // Low (y: 154 - MUST duck under!)
            const altLevels = [122, 142, 154];
            const altY = altLevels[Math.floor(Math.random() * altLevels.length)];
            s.obstacles.push({
              type: 'bird',
              x: width + 10,
              y: altY,
              w: 22,
              h: 14,
              wingUp: false
            });
          } else {
            // Quantum Cactus / Spire
            // Variety: 1 spire, 2 spires, or 3 spires
            const sizeRoll = Math.random();
            let w = 12;
            let h = 26;
            let count = 1;
            if (sizeRoll > 0.75) {
              w = 26;
              count = 3;
            } else if (sizeRoll > 0.45) {
              w = 18;
              count = 2;
            }

            s.obstacles.push({
              type: 'cactus',
              x: width + 10,
              y: groundY - h,
              w,
              h,
              count
            });
          }

          // Reset spawn counter with randomized spacing based on current speed
          s.nextSpawnIn = Math.floor(45 + Math.random() * 40 + (120 / s.speed));
        }

        // Update Obstacles & Collision Check
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          // Toggle bird flapping
          if (obs.type === 'bird' && s.frame % 10 === 0) {
            obs.wingUp = !obs.wingUp;
          }

          // Player Hitbox definition
          let pBox;
          if (d.isDucking && d.isGrounded) {
            // Ducking: low profile
            pBox = {
              x: d.x + 3,
              y: groundY - 14,
              w: 24,
              h: 14
            };
          } else {
            // Standing / Jumping
            pBox = {
              x: d.x + 4,
              y: d.y - 25,
              w: 16,
              h: 24
            };
          }

          // Obstacle Hitbox (forgiving inner bounds)
          const obsBox = {
            x: obs.x + 2,
            y: obs.y + 2,
            w: obs.w - 4,
            h: obs.h - 3
          };

          // AABB Collision Test
          if (
            pBox.x < obsBox.x + obsBox.w &&
            pBox.x + pBox.w > obsBox.x &&
            pBox.y < obsBox.y + obsBox.h &&
            pBox.y + pBox.h > obsBox.y
          ) {
            // CRASH!
            s.gameState = 'gameover';
            setGameState('gameover');
            playGbaCrash();

            // Crash particles
            for (let p = 0; p < 12; p++) {
              s.particles.push({
                x: d.x + 10,
                y: d.y - 12,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.7) * 4,
                life: 25
              });
            }
            break;
          }

          // Remove off-screen obstacles
          if (obs.x + obs.w < -20) {
            s.obstacles.splice(i, 1);
          }
        }
      }

      // 3. Render Obstacles
      s.obstacles.forEach(obs => {
        if (obs.type === 'cactus') {
          // Pixel Cacti / Quantum Spikes
          ctx.fillStyle = isNight ? '#00f0ff' : '#0f766e';
          for (let c = 0; c < (obs.count || 1); c++) {
            const cx = obs.x + c * 9;
            // Main stem
            ctx.fillRect(cx + 2, obs.y, 4, obs.h);
            // Side branches
            ctx.fillRect(cx, obs.y + 6, 2, 8);
            ctx.fillRect(cx + 6, obs.y + 4, 2, 7);
          }
        } else if (obs.type === 'bird') {
          // Cyber Pterodactyl / Drone
          ctx.fillStyle = isNight ? '#ef4444' : '#b91c1c';
          // Body
          ctx.fillRect(obs.x + 6, obs.y + 4, 12, 6);
          // Beak / Eye
          ctx.fillRect(obs.x, obs.y + 5, 6, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 7, obs.y + 5, 2, 2); // Eye

          // Wings (animated flapping)
          ctx.fillStyle = isNight ? '#f87171' : '#dc2626';
          if (obs.wingUp) {
            ctx.fillRect(obs.x + 8, obs.y - 4, 4, 8);
            ctx.fillRect(obs.x + 10, obs.y - 8, 3, 5);
          } else {
            ctx.fillRect(obs.x + 8, obs.y + 7, 4, 8);
            ctx.fillRect(obs.x + 10, obs.y + 12, 3, 5);
          }
        }
      });

      // 4. Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.fillStyle = isNight ? '#38bdf8' : '#64748b';
        ctx.fillRect(pt.x, pt.y, 2, 2);
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // 5. Render Dino Character
      const d = s.dino;
      ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';

      if (d.isDucking && d.isGrounded) {
        // DUCKING DINO SPRITE
        // Body (horizontal)
        ctx.fillRect(d.x, groundY - 12, 26, 9);
        // Head lower down
        ctx.fillRect(d.x + 20, groundY - 14, 10, 8);
        // Eye
        ctx.fillStyle = isNight ? '#ffffff' : '#f8fafc';
        ctx.fillRect(d.x + 26, groundY - 12, 2, 2);

        // Legs (ducking crawl)
        ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';
        if (d.step === 0) {
          ctx.fillRect(d.x + 4, groundY - 3, 4, 3);
          ctx.fillRect(d.x + 16, groundY - 2, 4, 2);
        } else {
          ctx.fillRect(d.x + 6, groundY - 2, 4, 2);
          ctx.fillRect(d.x + 14, groundY - 3, 4, 3);
        }
      } else {
        // STANDING / JUMPING DINO SPRITE
        const dy = d.y;
        // Head & Jaw
        ctx.fillRect(d.x + 10, dy - 26, 12, 10);
        ctx.fillRect(d.x + 14, dy - 22, 10, 6);
        // Eye
        ctx.fillStyle = isNight ? '#ffffff' : '#f8fafc';
        ctx.fillRect(d.x + 14, dy - 24, 2, 2);

        // Body & Tail
        ctx.fillStyle = isNight ? '#22c55e' : '#1e293b';
        ctx.fillRect(d.x + 4, dy - 18, 14, 12);
        ctx.fillRect(d.x, dy - 14, 4, 6); // Tail tip
        ctx.fillRect(d.x + 16, dy - 14, 3, 2); // Tiny arm

        // Legs
        if (!d.isGrounded) {
          // Mid-air jump pose (both legs tucked)
          ctx.fillRect(d.x + 6, dy - 6, 3, 4);
          ctx.fillRect(d.x + 12, dy - 6, 3, 4);
        } else {
          // Alternating running legs
          if (d.step === 0) {
            ctx.fillRect(d.x + 6, dy - 6, 3, 6);
            ctx.fillRect(d.x + 12, dy - 6, 3, 3);
          } else {
            ctx.fillRect(d.x + 6, dy - 6, 3, 3);
            ctx.fillRect(d.x + 12, dy - 6, 3, 6);
          }
        }
      }

      // 6. HUD: Scores & Milestone Flash
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'right';

      // Score blink effect on 100s milestone
      const showScore = s.milestoneFlash > 0 ? (Math.floor(s.frame / 4) % 2 === 0) : true;
      if (s.milestoneFlash > 0) s.milestoneFlash--;

      ctx.fillStyle = isNight ? '#94a3b8' : '#64748b';
      ctx.fillText(`HI ${String(s.bestScore).padStart(5, '0')}`, width - 75, 18);

      if (showScore) {
        ctx.fillStyle = isNight ? '#00f0ff' : '#0f172a';
        ctx.fillText(`${String(s.score).padStart(5, '0')}`, width - 15, 18);
      }

      // Controls helper hint on top left
      ctx.textAlign = 'left';
      ctx.fillStyle = isNight ? 'rgba(56, 189, 248, 0.6)' : 'rgba(100, 116, 139, 0.8)';
      ctx.font = '8px monospace';
      ctx.fillText('[A/▲] JUMP  [▼] DUCK', 12, 16);

      // 7. Overlay Screens: READY / GAME OVER
      if (s.gameState === 'ready') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER DINO RUN', width / 2, height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] OR [▲] TO START', width / 2, height / 2 + 5);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('JUMP OVER SPIKES • DUCK UNDER DRONES', width / 2, height / 2 + 25);
      } else if (s.gameState === 'gameover') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('G A M E   O V E R', width / 2, height / 2 - 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.fillText(`SCORE: ${s.score}   HI: ${s.bestScore}`, width / 2, height / 2 - 2);

        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px monospace';
        ctx.fillText('PRESS [A] TO RUN AGAIN', width / 2, height / 2 + 22);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText('[B / ESC] RETURN TO MENU', width / 2, height / 2 + 40);
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

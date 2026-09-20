import React, { useRef, useEffect } from 'react';

/**
 * SquadThemeCanvas: Procedural 60 FPS Canvas Background
 * Restored exactly to the Marvel Tri-Squad Demo specifications:
 * - ironman: 3D Holographic Arc Reactor Matrix & Cyan Data Telemetry
 * - captain: Vibranium Shield Shockwaves, Tactical Radar Sweep & Silver Starfield
 * - thor: Procedural Branching Fractal Lightning & Molten Rising Golden Embers
 * - core: Quantum Singularity Event Horizon, Orbit Rings & Tri-Squad Conduit Beams
 */
export default function SquadThemeCanvas({ squad = 'ironman' }) {
  const canvasRef = useRef(null);
  const squadRef = useRef(squad);
  squadRef.current = squad;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let mouse = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Ambient floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.5 + 0.3
    }));

    let globalTick = 0;
    let animId;

    // Recursive Branching Fractal Lightning Generator
    function drawLightningBranch(startX, startY, endX, endY, branchLevel, maxBranches) {
      if (branchLevel > maxBranches) return;

      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * (140 / (branchLevel + 1));
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * (140 / (branchLevel + 1));

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      if (Math.random() < 0.45 && branchLevel < maxBranches) {
        const branchEndX = midX + (Math.random() - 0.5) * 180;
        const branchEndY = midY + Math.random() * 140;
        drawLightningBranch(midX, midY, branchEndX, branchEndY, branchLevel + 1, maxBranches);
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      globalTick++;
      const currentSquad = squadRef.current;

      // 1. IRON MAN: 3D HOLOGRAPHIC ARC REACTOR MATRIX (Subtle & Uncluttered)
      if (currentSquad === 'ironman') {
        const cx = width * 0.5;
        const cy = height * 0.42;
        const rot = globalTick * 0.005;

        // Interactive mouse parallax offset
        const offsetX = (mouse.x - cx) * 0.02;
        const offsetY = (mouse.y - cy) * 0.02;

        // Concentric Holographic Rings (Soft & non-distracting)
        ctx.save();
        ctx.translate(cx + offsetX, cy + offsetY);

        // Ring 1 (Inner Cyan Arc)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.stroke();

        // Ring 2 (Dashed Counter-Rotating Crimson Arc)
        ctx.save();
        ctx.rotate(-rot);
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.12)';
        ctx.setLineDash([8, 16]);
        ctx.beginPath();
        ctx.arc(0, 0, 240, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ring 3 (Outer Cyan Track)
        ctx.save();
        ctx.rotate(rot * 1.2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.arc(0, 0, 320, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        // Ambient Nanotech Embers (Soft circular dust dots)
        particles.forEach(p => {
          p.x += p.vx * 0.4;
          p.y += p.vy * 0.4;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. CAPTAIN AMERICA: TACTICAL VIBRANIUM SONAR & STARFIELD
      else if (currentSquad === 'captain') {
        const cx = width * 0.5;
        const cy = height * 0.4;
        const time = globalTick * 0.02;

        // Expanding Vibranium Shield Wave Shockwaves
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const radius = (time * 45 + i * 140) % 900;
          const alpha = Math.max(0, 0.25 - radius / 1000);
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Tactical Radar Sweep Ray
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.8);
        const rayGrad = ctx.createLinearGradient(0, 0, 450, 0);
        rayGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 450, -0.3, 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Drifting Silver Star Particles
        particles.forEach(p => {
          p.x += p.vx * 0.5;
          p.y += p.vy * 0.5;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. THOR: PROCEDURAL BRANCHING LIGHTNING & MOLTEN URU EMBERS
      else if (currentSquad === 'thor') {
        // Intermittent Dramatic Lightning Strike
        if (globalTick % 70 === 0 && Math.random() < 0.6) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 25;

          const startX = Math.random() * width;
          const targetX = startX + (Math.random() - 0.5) * 200;
          drawLightningBranch(startX, 0, targetX, height, 0, 3);
          ctx.restore();
        }

        // Molten Rising Golden Embers with Wind Sway
        particles.forEach(p => {
          p.y -= 1.8;
          p.x += Math.sin(globalTick * 0.05 + p.y * 0.01) * 0.8;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = 'rgba(234, 179, 8, 0.65)';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 4. FOUNDRY CORE: QUANTUM SINGULARITY & S.H.I.E.L.D. CONDUITS
      else {
        const cx = width * 0.5;
        const cy = height * 0.42;

        // Core Singularity Event Horizon Pulsing Rings
        const pulse = Math.sin(globalTick * 0.04) * 15;
        ctx.strokeStyle = 'rgba(139, 0, 46, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 120 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.arc(cx, cy, 180 - pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tri-Squad Connecting Beams (Tech, PR, Events -> Core)
        const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
        const beamColors = ['#ff0055', '#3b82f6', '#eab308'];
        angles.forEach((ang, i) => {
          const bx = cx + Math.cos(ang + globalTick * 0.005) * 350;
          const by = cy + Math.sin(ang + globalTick * 0.005) * 350;
          ctx.strokeStyle = beamColors[i];
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(bx, by);
          ctx.stroke();

          ctx.fillStyle = beamColors[i];
          ctx.beginPath();
          ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Ambient drifting core particles
        particles.forEach(p => {
          p.x += p.vx * 0.6;
          p.y += p.vy * 0.6;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95
      }} 
      aria-hidden="true" 
    />
  );
}

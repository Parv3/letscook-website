import React, { useRef, useEffect } from 'react';

/**
 * SquadThemeCanvas: Procedural 60 FPS Canvas Background
 * Dynamically switches rendering algorithm based on active squad:
 * - ironman: 3D Holographic Arc Reactor Matrix & Volumetric Radiant Core
 * - captain: Vibranium Shield Shockwaves, Tactical Radar & Starlight
 * - thor: Fractal Branching Lightning, Molten Uru Embers & Asgardian Aura
 * - core: Quantum Singularity, Tri-Conduit Convergence & Matrix Pulse
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
      size: Math.random() * 2.5 + 1.2,
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
      const cx = width * 0.5;
      const cy = Math.min(height * 0.42, 380);

      // 1. IRON MAN: 3D HOLOGRAPHIC ARC REACTOR MATRIX & VOLUMETRIC CORE
      if (currentSquad === 'ironman') {
        const rot = globalTick * 0.008;

        // Volumetric Arc Reactor Atmospheric Glow
        const coreGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 520);
        coreGlow.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
        coreGlow.addColorStop(0.35, 'rgba(255, 0, 85, 0.12)');
        coreGlow.addColorStop(0.75, 'rgba(255, 0, 85, 0.03)');
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.fillRect(0, 0, width, height);

        // Mouse Parallax Offset
        const offsetX = (mouse.x - cx) * 0.025;
        const offsetY = (mouse.y - cy) * 0.025;

        ctx.save();
        ctx.translate(cx + offsetX, cy + offsetY);

        // Core Glowing Disc
        const centerDisc = ctx.createRadialGradient(0, 0, 5, 0, 0, 65);
        centerDisc.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
        centerDisc.addColorStop(0.8, 'rgba(0, 240, 255, 0.08)');
        centerDisc.addColorStop(1, 'transparent');
        ctx.fillStyle = centerDisc;
        ctx.beginPath();
        ctx.arc(0, 0, 65, 0, Math.PI * 2);
        ctx.fill();

        // Ring 1 (Inner Arc Cyan Telemetry)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.stroke();

        // Ring 2 (Dashed Crimson Counter-Rotating Ring)
        ctx.save();
        ctx.rotate(-rot);
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.45)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.setLineDash([16, 20]);
        ctx.beginPath();
        ctx.arc(0, 0, 240, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Ring 3 (Outer Arc Track)
        ctx.save();
        ctx.rotate(rot * 1.4);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.setLineDash([8, 14, 2, 14]);
        ctx.beginPath();
        ctx.arc(0, 0, 320, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Precision Reticle Crosshairs
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(-width * 0.6, 0); ctx.lineTo(width * 0.6, 0);
        ctx.moveTo(0, -height * 0.6); ctx.lineTo(0, height * 0.6);
        ctx.stroke();

        ctx.restore();

        // Floating Cyan Telemetry Data Nodes
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.fillRect(p.x, p.y, p.size * 1.5, p.size * 1.5);
        });
      }

      // 2. CAPTAIN AMERICA: TACTICAL VIBRANIUM SONAR & STARFIELD
      else if (currentSquad === 'captain') {
        const time = globalTick * 0.02;

        // Volumetric Vibranium Atmospheric Glow
        const shieldGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 550);
        shieldGlow.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
        shieldGlow.addColorStop(0.4, 'rgba(37, 99, 235, 0.12)');
        shieldGlow.addColorStop(0.8, 'rgba(239, 68, 68, 0.04)');
        shieldGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = shieldGlow;
        ctx.fillRect(0, 0, width, height);

        // Concentric Vibranium Shockwaves
        ctx.lineWidth = 2;
        ctx.shadowBlur = 14;
        for (let i = 0; i < 6; i++) {
          const radius = (time * 45 + i * 130) % 850;
          const alpha = Math.max(0, 0.38 - radius / 950);
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.shadowColor = '#3b82f6';
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Tactical Radar Sweep Ray
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.7);
        const rayGrad = ctx.createLinearGradient(0, 0, 480, 0);
        rayGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 480, -0.35, 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Silver Starfield Particles
        particles.forEach(p => {
          p.x += p.vx * 0.5;
          p.y += p.vy * 0.5;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 3. THOR: PROCEDURAL BRANCHING LIGHTNING & MOLTEN URU EMBERS
      else if (currentSquad === 'thor') {
        // Asgardian Forge Atmospheric Glow
        const forgeGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 540);
        forgeGlow.addColorStop(0, 'rgba(234, 179, 8, 0.22)');
        forgeGlow.addColorStop(0.4, 'rgba(217, 119, 6, 0.12)');
        forgeGlow.addColorStop(0.8, 'rgba(56, 189, 248, 0.05)');
        forgeGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = forgeGlow;
        ctx.fillRect(0, 0, width, height);

        // Lightning Strike
        if (globalTick % 65 === 0 && Math.random() < 0.65) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 30;

          const startX = Math.random() * width;
          const targetX = startX + (Math.random() - 0.5) * 250;
          drawLightningBranch(startX, 0, targetX, height * 0.75, 0, 4);

          // Ambient Lightning Flash
          ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // Molten Uru Embers Floating Upward
        particles.forEach(p => {
          p.y -= Math.abs(p.vy) * 1.6 + 0.8;
          p.x += Math.sin(globalTick * 0.03 + p.y * 0.01) * 0.8;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = 'rgba(234, 179, 8, 0.75)';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. FOUNDRY CORE: QUANTUM SINGULARITY & CONVERGING CONDUITS
      else {
        const time = globalTick * 0.015;

        // Singularity Atmospheric Glow
        const pulse = Math.sin(time * 2) * 25 + 75;
        const coreGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, pulse * 3.5);
        coreGrad.addColorStop(0, 'rgba(255, 0, 85, 0.4)');
        coreGrad.addColorStop(0.4, 'rgba(139, 0, 46, 0.2)');
        coreGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.06)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, 0, width, height);

        // 3 Converging Conduit Beams (Crimson, Blue, Gold)
        const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
        const conduitColors = ['#ff0055', '#2563eb', '#eab308'];

        angles.forEach((angle, idx) => {
          const currentAngle = angle + time * 0.5;
          const endX = cx + Math.cos(currentAngle) * 340;
          const endY = cy + Math.sin(currentAngle) * 340;

          ctx.strokeStyle = conduitColors[idx];
          ctx.lineWidth = 2.5;
          ctx.shadowColor = conduitColors[idx];
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Node Orb
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(endX, endY, 6, 0, Math.PI * 2);
          ctx.fill();
        });

        // Drifting Matrix Particles
        particles.forEach(p => {
          p.x += p.vx * 0.8;
          p.y += p.vy * 0.8;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = 'rgba(255, 42, 109, 0.5)';
          ctx.shadowColor = '#ff2a6d';
          ctx.shadowBlur = 6;
          ctx.fillRect(p.x, p.y, p.size, p.size);
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
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ opacity: 0.95 }} 
      aria-hidden="true" 
    />
  );
}

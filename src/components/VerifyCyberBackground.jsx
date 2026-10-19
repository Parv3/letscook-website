import React, { useRef, useEffect } from 'react';

/**
 * VerifyCyberBackground
 * High-performance 60 FPS interactive cybernetic particle grid & constellation background
 * Dynamically themed according to the active squad:
 * - ironman: Electric Cyan (#00f0ff) & Crimson Flame (#ff2e56)
 * - captain: Sky Blue (#38bdf8) & Silver/Red (#ef4444)
 * - thor: Asgardian Gold (#f59e0b) & Celestial Blue (#60a5fa)
 * - hulk: Gamma Emerald (#22c55e) & Radioactive Purple (#a855f7)
 */
const SQUAD_THEMES = {
  ironman: { primary: '#00f0ff', secondary: '#ff2e56', primaryRgb: '0, 240, 255', secondaryRgb: '255, 46, 86' },
  captain: { primary: '#38bdf8', secondary: '#ef4444', primaryRgb: '56, 189, 248', secondaryRgb: '239, 68, 68' },
  thor: { primary: '#f59e0b', secondary: '#60a5fa', primaryRgb: '245, 158, 11', secondaryRgb: '96, 165, 250' },
  hulk: { primary: '#22c55e', secondary: '#a855f7', primaryRgb: '34, 197, 94', secondaryRgb: '168, 85, 247' },
  core: { primary: '#22c55e', secondary: '#a855f7', primaryRgb: '34, 197, 94', secondaryRgb: '168, 85, 247' }
};

export default function VerifyCyberBackground({ currentSquad }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const squadKey = currentSquad || (typeof window !== 'undefined' ? localStorage.getItem('letscook_squad') : null) || 'ironman';
    const activePalette = SQUAD_THEMES[squadKey] || SQUAD_THEMES.ironman;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    let resizeTimer = null;
    const handleResize = () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let mouse = { x: width / 2, y: height / 2, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // Interactive floating constellation nodes (Optimized for smooth 60 FPS)
    const nodeCount = isMobile ? 22 : 42;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      radius: Math.random() * 2 + 1,
      isSecondary: Math.random() > 0.82,
      alpha: Math.random() * 0.5 + 0.25,
      pulse: Math.random() * Math.PI * 2
    }));

    // Floating digital cyber grid parameters
    const gridSize = isMobile ? 60 : 70;
    let gridOffset = 0;
    let scanlineY = 0;
    let animId = null;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Advance scanline & grid drift
      gridOffset = (gridOffset + 0.25) % gridSize;
      scanlineY += 1.8;
      if (scanlineY > height + 80) scanlineY = -80;

      // 1. Perspective Cybernetic Background Grid
      ctx.save();
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.strokeStyle = `rgba(${activePalette.primaryRgb}, 0.025)`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal drifting grid lines
      for (let y = gridOffset; y < height; y += gridSize) {
        ctx.strokeStyle = `rgba(${activePalette.primaryRgb}, 0.02)`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Sweeping Holographic Laser Scanline
      if (scanlineY < height) {
        const scanGrad = ctx.createLinearGradient(0, scanlineY - 40, 0, scanlineY + 40);
        scanGrad.addColorStop(0, `rgba(${activePalette.primaryRgb}, 0)`);
        scanGrad.addColorStop(0.5, `rgba(${activePalette.primaryRgb}, 0.06)`);
        scanGrad.addColorStop(1, `rgba(${activePalette.primaryRgb}, 0)`);
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanlineY - 40, width, 80);
      }

      // 3. Update & Draw Constellation Nodes & Connecting Beams
      const maxConnectDist = isMobile ? 85 : 120;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.03;

        // Wrap screen edges
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;

        // Gentle interactive mouse attraction
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 32400 && distSq > 1) { // 180^2 = 32400
            const dist = Math.sqrt(distSq);
            const force = (180 - dist) / 180 * 0.4;
            n.x += (dx / dist) * force;
            n.y += (dy / dist) * force;
          }
        }

        // Draw node with pulsing glow
        const currentAlpha = n.alpha + Math.sin(n.pulse) * 0.15;
        const colorRgb = n.isSecondary ? activePalette.secondaryRgb : activePalette.primaryRgb;
        ctx.fillStyle = `rgba(${colorRgb}, ${Math.max(0.1, currentAlpha)})`;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes without calling Math.sqrt when out of range
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxConnectDist) * 0.14;
            ctx.strokeStyle = `rgba(${activePalette.primaryRgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        animId = null;
      } else {
        if (!animId) animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [currentSquad]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.95
      }}
      aria-hidden="true"
    />
  );
}

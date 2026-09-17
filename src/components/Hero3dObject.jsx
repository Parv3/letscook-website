import React, { useRef, useEffect } from 'react';

/**
 * Hero3dObject: Fullscreen Synthwave Sunset Grid Horizon
 * Spans 100% wall-to-wall viewport. Positioned low on the horizon with a subtle setting sun
 * so foreground hero text remains 100% focused, distraction-free, and legible.
 */
export default function Hero3dObject() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let offsetZ = 0;

    // Static elevation points for subtle wireframe mountain ridges on horizon
    const terrainLeft = [25, 55, 35, 85, 60, 110, 70, 125, 45, 90, 25, 0];
    const terrainRight = [0, 25, 90, 45, 125, 70, 110, 60, 85, 35, 55, 25];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      offsetZ = (offsetZ + 0.45) % 40; // Horizon grid velocity

      const isMobile = width < 600;

      // Position horizon in the lower 60-62% of section so sun sits comfortably below hero text
      const horizonY = height * (isMobile ? 0.58 : 0.62) + mouseRef.current.y * 10;
      const sunCenterX = width / 2 + mouseRef.current.x * 20;

      // 1. SUBTLE SETTING SYNTHWAVE SUN (LOW ON HORIZON, NON-DISTRACTING)
      const sunRadius = Math.min(width * (isMobile ? 0.22 : 0.14), isMobile ? 75 : 110);
      const sunCenterY = horizonY + sunRadius * 0.15; // Setting half-sun on horizon line

      // Soft Ambient Radial Halo Glow
      const sunGlow = ctx.createRadialGradient(
        sunCenterX, sunCenterY, sunRadius * 0.2,
        sunCenterX, sunCenterY, sunRadius * 2.4
      );
      sunGlow.addColorStop(0, 'rgba(255, 42, 109, 0.28)');
      sunGlow.addColorStop(0.5, 'rgba(163, 8, 59, 0.15)');
      sunGlow.addColorStop(1, 'rgba(6, 6, 8, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Soft Setting Sun Gradient (Toned down burgundy & deep amber glow)
      const sunGrad = ctx.createLinearGradient(
        sunCenterX, sunCenterY - sunRadius,
        sunCenterX, sunCenterY + sunRadius
      );
      sunGrad.addColorStop(0, '#ff9e00');    // Soft golden amber peak
      sunGrad.addColorStop(0.35, '#a3083b'); // Deep crimson middle
      sunGrad.addColorStop(0.8, '#58001d');  // Muted burgundy base
      sunGrad.addColorStop(1, '#060608');    // Horizon shadow blend

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Retro Horizontal Scanlines across Setting Sun
      const scanlineCount = 6;
      for (let i = 0; i < scanlineCount; i++) {
        const lineY = sunCenterY - sunRadius * 0.4 + (i / scanlineCount) * sunRadius * 1.2;
        const lineHeight = 2 + i * 1.2;
        ctx.fillStyle = 'rgba(6, 6, 8, 0.95)';
        ctx.fillRect(sunCenterX - sunRadius - 10, lineY, sunRadius * 2 + 20, lineHeight);
      }
      ctx.restore();

      // 2. HORIZON WIREFRAME TERRAIN RIDGES (FLANKING SUN)
      ctx.lineWidth = 1;

      // Left Mountain Ridge
      ctx.strokeStyle = 'rgba(163, 8, 59, 0.45)';
      ctx.beginPath();
      const leftStep = (sunCenterX - sunRadius * 0.7) / (terrainLeft.length - 1);
      for (let i = 0; i < terrainLeft.length; i++) {
        const x = i * leftStep;
        const y = horizonY - terrainLeft[i];
        if (i === 0) ctx.moveTo(x, horizonY);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(sunCenterX - sunRadius * 0.7, horizonY);
      ctx.stroke();

      // Right Mountain Ridge
      const rightStart = sunCenterX + sunRadius * 0.7;
      const rightStep = (width - rightStart) / (terrainRight.length - 1);
      ctx.strokeStyle = 'rgba(163, 8, 59, 0.45)';
      ctx.beginPath();
      for (let i = 0; i < terrainRight.length; i++) {
        const x = rightStart + i * rightStep;
        const y = horizonY - terrainRight[i];
        if (i === 0) ctx.moveTo(rightStart, horizonY);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // 3. PERSPECTIVE FLOOR GRID STRETCHING TO HORIZON (FULL SECTION COVERAGE)
      const fov = 320;
      const numColumns = 36;
      const gridWidth = width * 1.8;

      // Z-axis perspective lines fanning out across full viewport width
      for (let i = -numColumns / 2; i <= numColumns / 2; i++) {
        const worldX = i * (gridWidth / numColumns) - mouseRef.current.x * 35;

        const nearZ = 35;
        const scaleNear = fov / nearZ;
        const xNear = width / 2 + worldX * scaleNear;
        const yNear = height;

        const farZ = 850;
        const scaleFar = fov / farZ;
        const xFar = sunCenterX + worldX * scaleFar * 0.35;
        const yFar = horizonY;

        const distRatio = Math.abs(i) / (numColumns / 2);
        const alpha = Math.max(0, 1 - distRatio * 0.8);

        ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.35})`;

        ctx.beginPath();
        ctx.moveTo(xNear, yNear);
        ctx.lineTo(xFar, yFar);
        ctx.stroke();
      }

      // Horizontal moving transverse grid lines
      const numRows = 18;
      for (let j = 0; j < numRows; j++) {
        const z = j * 42 + offsetZ;
        if (z <= 10) continue;

        const scale = fov / z;
        const y = horizonY + (height - horizonY) * (scale / (fov / 35));

        if (y < horizonY || y > height) continue;

        const fade = Math.pow((z - 10) / 750, 0.45) * (1 - z / 850);
        const alpha = Math.max(0, Math.min(0.5, fade * 0.65));

        if (j % 2 === 0) {
          ctx.strokeStyle = `rgba(255, 42, 109, ${alpha * 0.4})`;
        } else {
          ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.5})`;
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-synthwave-sunset-bg no-print">
      <canvas ref={canvasRef} className="synthwave-sunset-canvas" />
      <style>{`
        .hero-synthwave-sunset-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          max-width: 100vw;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
          overflow: hidden;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,1) 100%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,1) 100%);
        }

        .synthwave-sunset-canvas {
          width: 100%;
          max-width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 20px rgba(139, 0, 46, 0.3));
        }
      `}</style>
    </div>
  );
}

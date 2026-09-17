import React, { useRef, useEffect } from 'react';

/**
 * Hero3dObject: Synthwave Sunset Grid Horizon
 * Renders a glowing sun, wireframe perspective grid floor, and terrain mountain ridges on the horizon.
 * Designed to evoke retro synthwave grid aesthetics without obscuring hero text.
 */
export default function Hero3dObject() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 500);

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

    // Static terrain elevation points for wireframe mountain ridges (left and right)
    const terrainLeft = [35, 70, 45, 105, 80, 135, 85, 150, 55, 115, 30, 0];
    const terrainRight = [0, 30, 115, 55, 150, 85, 135, 80, 105, 45, 70, 35];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      offsetZ = (offsetZ + 0.45) % 40; // Horizon grid velocity

      const horizonY = height * 0.42 + mouseRef.current.y * 12;
      const sunCenterX = width / 2 + mouseRef.current.x * 25;

      // 1. GLOWING SYNTHWAVE SUN ON HORIZON
      const sunRadius = Math.min(width * 0.16, 135);
      const sunCenterY = horizonY - sunRadius * 0.35;

      // Sun Outer Ambient Radial Glow Halo
      const sunGlow = ctx.createRadialGradient(
        sunCenterX, sunCenterY, sunRadius * 0.2,
        sunCenterX, sunCenterY, sunRadius * 2.2
      );
      sunGlow.addColorStop(0, 'rgba(255, 42, 109, 0.4)');
      sunGlow.addColorStop(0.5, 'rgba(163, 8, 59, 0.22)');
      sunGlow.addColorStop(1, 'rgba(6, 6, 8, 0)');

      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Sun Gradient (Fiery Golden Amber -> Neon Crimson -> Deep Burgundy Base)
      const sunGrad = ctx.createLinearGradient(
        sunCenterX, sunCenterY - sunRadius,
        sunCenterX, sunCenterY + sunRadius
      );
      sunGrad.addColorStop(0, '#ffd000');   // Glowing amber top
      sunGrad.addColorStop(0.35, '#ff2a6d'); // Neon magenta/crimson middle
      sunGrad.addColorStop(0.8, '#8b002e');  // Deep burgundy
      sunGrad.addColorStop(1, '#3a0013');    // Shadow base

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Retro Horizontal Scanlines across Sun
      const scanlineCount = 7;
      for (let i = 0; i < scanlineCount; i++) {
        const lineY = sunCenterY + (i / scanlineCount) * sunRadius * 0.9;
        const lineHeight = 2.2 + i * 1.3;
        ctx.fillStyle = 'rgba(6, 6, 8, 0.95)';
        ctx.fillRect(sunCenterX - sunRadius - 10, lineY, sunRadius * 2 + 20, lineHeight);
      }
      ctx.restore();

      // 2. HORIZON WIREFRAME MOUNTAIN RIDGES (LEFT & RIGHT OF SUN)
      ctx.lineWidth = 1.2;

      // Left Ridge
      ctx.strokeStyle = 'rgba(163, 8, 59, 0.55)';
      ctx.beginPath();
      const leftStep = (sunCenterX - sunRadius * 0.75) / (terrainLeft.length - 1);
      for (let i = 0; i < terrainLeft.length; i++) {
        const x = i * leftStep;
        const y = horizonY - terrainLeft[i];
        if (i === 0) ctx.moveTo(x, horizonY);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(sunCenterX - sunRadius * 0.75, horizonY);
      ctx.stroke();

      // Left Ridge Internal Wireframe Mesh Lines
      for (let i = 0; i < terrainLeft.length - 1; i++) {
        const x1 = i * leftStep;
        const y1 = horizonY - terrainLeft[i];
        const x2 = (i + 1) * leftStep;
        ctx.strokeStyle = 'rgba(255, 42, 109, 0.22)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, horizonY);
        ctx.stroke();
      }

      // Right Ridge
      const rightStart = sunCenterX + sunRadius * 0.75;
      const rightStep = (width - rightStart) / (terrainRight.length - 1);
      ctx.strokeStyle = 'rgba(163, 8, 59, 0.55)';
      ctx.beginPath();
      for (let i = 0; i < terrainRight.length; i++) {
        const x = rightStart + i * rightStep;
        const y = horizonY - terrainRight[i];
        if (i === 0) ctx.moveTo(rightStart, horizonY);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Right Ridge Internal Wireframe Mesh Lines
      for (let i = 0; i < terrainRight.length - 1; i++) {
        const x1 = rightStart + i * rightStep;
        const y1 = horizonY - terrainRight[i];
        const x2 = rightStart + (i + 1) * rightStep;
        ctx.strokeStyle = 'rgba(255, 42, 109, 0.22)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, horizonY);
        ctx.stroke();
      }

      // 3. PERSPECTIVE FLOOR GRID STRETCHING TO HORIZON
      const fov = 300;
      const numColumns = 30;
      const gridWidth = 1800;

      // Z-axis perspective lines converging to horizon sun
      for (let i = -numColumns / 2; i <= numColumns / 2; i++) {
        const worldX = i * (gridWidth / numColumns) - mouseRef.current.x * 40;

        const nearZ = 35;
        const scaleNear = fov / nearZ;
        const xNear = width / 2 + worldX * scaleNear;
        const yNear = height;

        const farZ = 850;
        const scaleFar = fov / farZ;
        const xFar = sunCenterX + worldX * scaleFar * 0.4;
        const yFar = horizonY;

        const distRatio = Math.abs(i) / (numColumns / 2);
        const alpha = Math.max(0, 1 - distRatio * 0.85);

        ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.42})`;

        ctx.beginPath();
        ctx.moveTo(xNear, yNear);
        ctx.lineTo(xFar, yFar);
        ctx.stroke();
      }

      // Horizontal moving transverse grid lines
      const numRows = 20;
      for (let j = 0; j < numRows; j++) {
        const z = j * 40 + offsetZ;
        if (z <= 10) continue;

        const scale = fov / z;
        const y = horizonY + (height - horizonY) * (scale / (fov / 35));

        if (y < horizonY || y > height) continue;

        const fade = Math.pow((z - 10) / 750, 0.45) * (1 - z / 850);
        const alpha = Math.max(0, Math.min(0.55, fade * 0.75));

        if (j % 2 === 0) {
          ctx.strokeStyle = `rgba(255, 42, 109, ${alpha * 0.5})`;
        } else {
          ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.6})`;
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
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.55;
          mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 85%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 85%);
        }

        .synthwave-sunset-canvas {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 25px rgba(139, 0, 46, 0.4));
        }
      `}</style>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';

/**
 * Hero3dObject: 3D Disappearing Wireframe Grid Horizon
 * Renders a perspective grid that flows into a vanishing horizon with radial vignetting.
 * Fits seamlessly into hero background without taking layout space or obscuring text.
 */
export default function Hero3dObject() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 450);

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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth parallax mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      offsetZ = (offsetZ + 0.6) % 45; // Smooth grid animation velocity

      const fov = 320;
      const horizonY = height * 0.35 + mouseRef.current.y * 18;
      const cameraX = mouseRef.current.x * 50;

      ctx.lineWidth = 1;

      // 1. Z-axis Perspective Lines (Disappearing towards horizon)
      const numColumns = 28;
      const gridWidth = 1600;

      for (let i = -numColumns / 2; i <= numColumns / 2; i++) {
        const worldX = i * (gridWidth / numColumns) - cameraX;

        // Near point (z = 40)
        const nearZ = 40;
        const scaleNear = fov / nearZ;
        const xNear = width / 2 + worldX * scaleNear;
        const yNear = height;

        // Far point (vanishing horizon, z = 850)
        const farZ = 850;
        const scaleFar = fov / farZ;
        const xFar = width / 2 + worldX * scaleFar;
        const yFar = horizonY;

        const distRatio = Math.abs(i) / (numColumns / 2);
        const alpha = Math.max(0, 1 - distRatio);
        
        ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.38})`;

        ctx.beginPath();
        ctx.moveTo(xNear, yNear);
        ctx.lineTo(xFar, yFar);
        ctx.stroke();
      }

      // 2. Horizontal X-axis Transverse Lines (Fading into distance)
      const numRows = 18;
      for (let j = 0; j < numRows; j++) {
        const z = j * 45 + offsetZ;
        if (z <= 12) continue;

        const scale = fov / z;
        const y = horizonY + (height - horizonY) * (scale / (fov / 40));

        if (y < horizonY || y > height) continue;

        const fade = Math.pow((z - 10) / 750, 0.45) * (1 - z / 850);
        const alpha = Math.max(0, Math.min(0.55, fade * 0.75));

        // Alternating burgundy and white wireframe grid accents
        if (j % 2 === 0) {
          ctx.strokeStyle = `rgba(163, 8, 59, ${alpha * 0.65})`;
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`;
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
    <div className="hero-3d-disappearing-grid no-print">
      <canvas ref={canvasRef} className="disappearing-grid-canvas" />
      <style>{`
        .hero-3d-disappearing-grid {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.65;
          mask-image: radial-gradient(ellipse at 50% 60%, black 15%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 60%, black 15%, transparent 75%);
        }

        .disappearing-grid-canvas {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 25px rgba(139, 0, 46, 0.35));
        }
      `}</style>
    </div>
  );
}

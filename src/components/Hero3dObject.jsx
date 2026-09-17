import React, { useRef, useEffect } from 'react';

export default function Hero3dObject() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = 300);
    let height = (canvas.height = 300);

    // Generate 3D Torus Vertices
    const vertices = [];
    const R = 75; // Major radius
    const r = 35; // Minor radius
    const segmentsU = 24;
    const segmentsV = 16;

    for (let i = 0; i < segmentsU; i++) {
      const u = (i / segmentsU) * Math.PI * 2;
      for (let j = 0; j < segmentsV; j++) {
        const v = (j / segmentsV) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        vertices.push({ x, y, z, uIndex: i, vIndex: j });
      }
    }

    let rotX = 0.4;
    let rotY = 0.6;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseRef.current.targetX = (e.clientX - centerX) * 0.001;
      mouseRef.current.targetY = (e.clientY - centerY) * 0.001;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      rotY += 0.01 + mouseRef.current.x;
      rotX += 0.005 + mouseRef.current.y;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = [];

      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];

        // 3D Rotation
        let y1 = v.y * cosX - v.z * sinX;
        let z1 = v.y * sinX + v.z * cosX;

        let x2 = v.x * cosY + z1 * sinY;
        let z2 = -v.x * sinY + z1 * cosY;

        // Perspective Projection
        const fov = 260;
        const scale = fov / (fov + z2 + 180);
        const px = x2 * scale + width / 2;
        const py = y1 * scale + height / 2;

        projected.push({ x: px, y: py, scale, z: z2, uIndex: v.uIndex, vIndex: v.vIndex });
      }

      // Draw Wireframe Mesh Edges
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];

        // Connect along U ring
        const nextU = (i + segmentsV) % projected.length;
        const pU = projected[nextU];

        // Connect along V ring
        const nextV = (p1.vIndex + 1) % segmentsV + p1.uIndex * segmentsV;
        const pV = projected[nextV];

        const alpha = Math.max(0.15, Math.min(0.85, (p1.z + 100) / 200));

        // Draw line U
        ctx.strokeStyle = `rgba(163, 8, 59, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(pU.x, pU.y);
        ctx.stroke();

        // Draw line V
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(pV.x, pV.y);
        ctx.stroke();
      }

      // Draw Glowing Vertex Nodes
      for (let i = 0; i < projected.length; i += 3) {
        const p = projected[i];
        if (p.z < 0) {
          ctx.fillStyle = '#ff2a6d';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-3d-wrapper no-print">
      <canvas ref={canvasRef} className="hero-3d-canvas" />
      <style>{`
        .hero-3d-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 240px;
          height: 240px;
          flex-shrink: 0;
        }

        .hero-3d-canvas {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 25px rgba(139, 0, 46, 0.5));
        }

        @media (max-width: 868px) {
          .hero-3d-wrapper {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

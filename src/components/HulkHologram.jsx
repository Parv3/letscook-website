import React, { useEffect, useRef } from 'react';
import { playGammaSmashSound } from '../utils/soundEngine';

/**
 * HulkHologram
 * Triggered by the "HULK // PROTOCOL" button in Design Team (Gamma Design Labs).
 * Renders twin Gamma Hulk sentries on BOTH sides of the screen.
 * Features:
 * - Real-time WebGL Blue Screen Chroma Keying (blue screen removed on GPU at 60 FPS)
 * - Sentry on Left (mirrored inward) and Sentry on Right (facing inward)
 * - Emerald & Violet gamma radiation aura glow
 * - Loops seamlessly and stays active while protocol is toggled on
 * - Dismiss button to deactivate
 */
export default function HulkHologram({ isActive, onClose }) {
  const videoRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    try {
      playGammaSmashSound();
    } catch (e) {}

    const video = videoRef.current;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!video || !leftCanvas || !rightCanvas) return;

    video.muted = true;
    video.currentTime = 0;
    const startPlay = () => {
      video.play().catch(e => console.warn('Hulk play error:', e));
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('canplay', startPlay, { once: true });
      video.load();
    }

    let animId = null;

    // Initialize WebGL Blue Screen Chroma Key Pipeline
    const setupGL = (canvas) => {
      const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
                 canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
      if (!gl) return null;

      const vsSource = `
        attribute vec2 a_pos;
        attribute vec2 a_uv;
        varying vec2 v_uv;
        void main() {
          gl_Position = vec4(a_pos, 0.0, 1.0);
          v_uv = a_uv;
        }
      `;

      // Real-time Blue Screen Chroma Key with Edge Despill
      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        varying vec2 v_uv;

        void main() {
          vec4 color = texture2D(u_video, v_uv);
          float maxRG = max(color.r, color.g);
          float diff = color.b - maxRG;

          // Key out blue screen background
          float thresholdLow = 0.08;
          float thresholdHigh = 0.22;
          float alpha = 1.0 - smoothstep(thresholdLow, thresholdHigh, diff);

          // Edge despill: suppress blue fringe on Hulk's edges
          vec3 cleanColor = color.rgb;
          if (cleanColor.b > maxRG) {
            cleanColor.b = maxRG;
          }

          gl_FragColor = vec4(cleanColor, alpha);
        }
      `;

      const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

      gl.useProgram(program);

      const vertices = new Float32Array([
        -1, -1,  0, 1,
         1, -1,  1, 1,
        -1,  1,  0, 0,
        -1,  1,  0, 0,
         1, -1,  1, 1,
         1,  1,  1, 0,
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(program, 'a_pos');
      const aUv = gl.getAttribLocation(program, 'a_uv');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0.0, 0.0, 0.0, 0.0);

      return { gl, program, texture };
    };

    const leftGL = setupGL(leftCanvas);
    const rightGL = setupGL(rightCanvas);

    let lastVideoTime = -1;

    const renderLoop = () => {
      if (!document.hidden && video.readyState >= 2 && !video.paused) {
        const isNewFrame = Math.abs(video.currentTime - lastVideoTime) > 0.02;

        if (leftGL) {
          leftGL.gl.viewport(0, 0, leftCanvas.width, leftCanvas.height);
          leftGL.gl.clear(leftGL.gl.COLOR_BUFFER_BIT);
          leftGL.gl.useProgram(leftGL.program);
          leftGL.gl.bindTexture(leftGL.gl.TEXTURE_2D, leftGL.texture);
          if (isNewFrame) {
            leftGL.gl.texImage2D(leftGL.gl.TEXTURE_2D, 0, leftGL.gl.RGBA, leftGL.gl.RGBA, leftGL.gl.UNSIGNED_BYTE, video);
          }
          leftGL.gl.drawArrays(leftGL.gl.TRIANGLES, 0, 6);
        }

        if (rightGL) {
          rightGL.gl.viewport(0, 0, rightCanvas.width, rightCanvas.height);
          rightGL.gl.clear(rightGL.gl.COLOR_BUFFER_BIT);
          rightGL.gl.useProgram(rightGL.program);
          rightGL.gl.bindTexture(rightGL.gl.TEXTURE_2D, rightGL.texture);
          if (isNewFrame) {
            rightGL.gl.texImage2D(rightGL.gl.TEXTURE_2D, 0, rightGL.gl.RGBA, rightGL.gl.RGBA, rightGL.gl.UNSIGNED_BYTE, video);
          }
          rightGL.gl.drawArrays(rightGL.gl.TRIANGLES, 0, 6);
        }

        if (isNewFrame) {
          lastVideoTime = video.currentTime;
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        if (video) video.pause();
      } else {
        if (video && isActive) video.play().catch(() => {});
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animId) cancelAnimationFrame(animId);
      if (video) video.pause();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="hulk-sentries-root animate-fade-in">
      {/* Looping video source */}
      <video
        ref={videoRef}
        src="/easter-egg/hulk.mp4"
        playsInline
        loop
        muted
        autoPlay
        preload="auto"
        className="hulk-hidden-video"
      />

      {/* LEFT SENTRY (Mirrored inward towards content) */}
      <div className="hulk-sentry hulk-sentry-left">
        <div className="hulk-sentry-inner">
          <div className="hulk-canvas-wrap sentry-mirrored">
            <canvas 
              ref={leftCanvasRef} 
              width={360} 
              height={412} 
              className="hulk-sentry-canvas" 
            />
            <div className="hulk-gamma-glow" />
          </div>
        </div>
      </div>

      {/* RIGHT SENTRY (Facing inward towards content) */}
      <div className="hulk-sentry hulk-sentry-right">
        <div className="hulk-sentry-inner">
          {/* Dismiss button */}
          <button 
            onClick={onClose} 
            className="hulk-dismiss-btn"
            title="Deactivate Hulk Protocol"
            aria-label="Deactivate Hulk Protocol"
          >
            ✕
          </button>

          <div className="hulk-canvas-wrap">
            <canvas 
              ref={rightCanvasRef} 
              width={360} 
              height={412} 
              className="hulk-sentry-canvas" 
            />
            <div className="hulk-gamma-glow" />
          </div>
        </div>
      </div>

      <style>{`
        .hulk-sentries-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99999;
        }

        .hulk-hidden-video {
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .hulk-sentry {
          position: fixed;
          bottom: 24px;
          width: clamp(260px, 28vw, 440px);
          max-height: 85vh;
          aspect-ratio: 720 / 824;
          pointer-events: auto;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          filter: drop-shadow(0 0 35px rgba(34, 197, 94, 0.45));
          animation: hulkFloat 4s ease-in-out infinite alternate;
        }

        .hulk-sentry-left {
          left: 20px;
        }

        .hulk-sentry-right {
          right: 20px;
        }

        @media (max-width: 1024px) {
          .hulk-sentry-left {
            display: none;
          }
          .hulk-sentry-right {
            right: 8px;
            bottom: 12px;
            width: clamp(220px, 45vw, 340px);
          }
        }

        @keyframes hulkFloat {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }

        .hulk-sentry-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hulk-canvas-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .sentry-mirrored {
          transform: scaleX(-1);
        }

        .hulk-sentry-canvas {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          filter: contrast(1.1) brightness(1.05);
        }

        .hulk-gamma-glow {
          position: absolute;
          inset: 15% 10% 5% 10%;
          background: radial-gradient(circle at 50% 60%, rgba(34, 197, 94, 0.35) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 75%);
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(20px);
          animation: gammaPulse 2.5s ease-in-out infinite alternate;
        }

        @keyframes gammaPulse {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 0.9; transform: scale(1.05); }
        }

        .hulk-dismiss-btn {
          position: absolute;
          top: -12px;
          right: 10px;
          background: rgba(14, 20, 16, 0.9);
          border: 1px solid #22c55e;
          color: #22c55e;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          pointer-events: auto;
          z-index: 10;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
          transition: all 0.2s ease;
        }

        .hulk-dismiss-btn:hover {
          background: #22c55e;
          color: #040805;
          transform: scale(1.15) rotate(90deg);
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { playRepulsorSound } from '../utils/soundEngine';

/**
 * IronManHologram
 * Triggered by the "IRON MAN // PROTOCOL" button in Tech Labs.
 * Renders twin Stark Mark LXXXV holographic sentries on BOTH sides of the screen.
 * Features:
 * - Real-time WebGL chroma keying (green screen removed on GPU)
 * - Sentry on Left (mirrored inward) and Sentry on Right (facing inward)
 * - Guaranteed padding from viewport edges so neither side is cut off
 * - Loops seamlessly and stays on while the protocol is active
 * - Dismiss button to deactivate
 */
export default function IronManHologram({ isActive, onClose }) {
  const videoRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Play repulsor sound effect on activation
    try {
      playRepulsorSound();
    } catch (e) {
      // Audio fallback
    }

    const video = videoRef.current;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!video || !leftCanvas || !rightCanvas) return;

    video.muted = true;
    video.currentTime = 0;
    const startPlay = () => {
      video.play().catch(e => console.warn('Iron Man play error:', e));
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('canplay', startPlay, { once: true });
      video.load();
    }

    let animId = null;

    // Helper to initialize WebGL Chroma Key Pipeline on a canvas
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

      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        varying vec2 v_uv;

        void main() {
          vec4 color = texture2D(u_video, v_uv);
          float maxRB = max(color.r, color.b);
          float diff = color.g - maxRB;

          // Key out green background
          float thresholdLow = 0.12;
          float thresholdHigh = 0.28;
          float alpha = 1.0 - smoothstep(thresholdLow, thresholdHigh, diff);

          // Edge despill: remove green fringe
          vec3 cleanColor = color.rgb;
          if (cleanColor.g > maxRB) {
            cleanColor.g = maxRB;
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
      gl.viewport(0, 0, 540, 960);

      return {
        render: () => {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      };
    };

    const leftGL = setupGL(leftCanvas);
    const rightGL = setupGL(rightCanvas);

    const renderLoop = () => {
      if (!video.paused && video.readyState >= 2) {
        if (leftGL) leftGL.render();
        if (rightGL) rightGL.render();
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (video) video.pause();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="ironman-sentries-root animate-fade-in">
      {/* Hidden high-res looping video */}
      <video
        ref={videoRef}
        src="/easter-egg/ironman.mp4"
        playsInline
        loop
        muted
        autoPlay
        preload="auto"
        className="ironman-hidden-video"
      />

      {/* LEFT SENTRY (Mirrored inward towards the content) */}
      <div className="ironman-sentry ironman-sentry-left">
        <div className="ironman-sentry-inner">
          <div className="ironman-canvas-wrap sentry-mirrored">
            <canvas 
              ref={leftCanvasRef} 
              width={540} 
              height={960} 
              className="ironman-sentry-canvas" 
            />
            <div className="ironman-repulsor-glow" />
          </div>
        </div>
      </div>

      {/* RIGHT SENTRY (Facing inward towards the content) */}
      <div className="ironman-sentry ironman-sentry-right">
        <div className="ironman-sentry-inner">
          {/* Dismiss button on the primary right sentry */}
          <button 
            onClick={onClose} 
            className="ironman-dismiss-btn"
            title="Deactivate Iron Man Protocol"
            aria-label="Deactivate Iron Man Protocol"
          >
            ✕
          </button>

          <div className="ironman-canvas-wrap">
            <canvas 
              ref={rightCanvasRef} 
              width={540} 
              height={960} 
              className="ironman-sentry-canvas" 
            />
            <div className="ironman-repulsor-glow" />
          </div>
        </div>
      </div>

      <style>{`
        .ironman-sentries-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99999;
        }

        .ironman-hidden-video {
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        /* Common Sentry Styling: perfectly bounded so they NEVER get cut off */
        .ironman-sentry {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: 
            drop-shadow(0 0 24px rgba(0, 240, 255, 0.45)) 
            drop-shadow(0 0 45px rgba(255, 46, 86, 0.28));
          animation: sentryFloat 3.5s ease-in-out infinite alternate;
        }

        @keyframes sentryFloat {
          0% { transform: translateY(-50%) translateY(0px); }
          100% { transform: translateY(-50%) translateY(-12px); }
        }

        /* LEFT SENTRY */
        .ironman-sentry-left {
          left: clamp(12px, 2.2vw, 42px);
          animation-delay: -1.75s;
        }

        /* RIGHT SENTRY */
        .ironman-sentry-right {
          right: clamp(12px, 2.2vw, 42px);
        }

        .ironman-sentry-inner {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ironman-dismiss-btn {
          position: absolute;
          top: -8px;
          right: 0px;
          z-index: 20;
          background: rgba(10, 14, 24, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.6);
          color: #00f0ff;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.2s ease;
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
        }

        .ironman-dismiss-btn:hover {
          background: rgba(255, 46, 86, 0.9);
          border-color: #ff2e56;
          color: #ffffff;
          transform: scale(1.15);
        }

        .ironman-canvas-wrap {
          position: relative;
          width: clamp(200px, 16vw, 290px);
          aspect-ratio: 9 / 16;
          max-height: 82vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mirrored inward for the left sentry */
        .sentry-mirrored {
          transform: scaleX(-1);
        }

        .ironman-sentry-canvas {
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: transparent;
        }

        .ironman-repulsor-glow {
          position: absolute;
          bottom: 20px;
          width: 70%;
          height: 24px;
          background: radial-gradient(ellipse, rgba(0, 240, 255, 0.65) 0%, rgba(255, 46, 86, 0.35) 50%, transparent 80%);
          filter: blur(8px);
          border-radius: 50%;
          pointer-events: none;
          animation: repulsorPulse 1.8s ease-in-out infinite alternate;
        }

        @keyframes repulsorPulse {
          0% { opacity: 0.55; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1.12); }
        }

        /* Responsive adaptation for smaller laptop/tablet screens */
        @media (max-width: 1024px) {
          .ironman-sentry-left {
            display: none; /* Keep single primary sentry on smaller screens so content isn't crowded */
          }
          .ironman-sentry-right {
            right: 10px;
            bottom: 20px;
            top: auto;
            transform: none;
            animation: none;
          }
          .ironman-canvas-wrap {
            width: clamp(170px, 42vw, 240px);
          }
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { playRepulsorSound } from '../utils/soundEngine';

/**
 * IronManHologram
 * Triggered by the "IRON MAN // PROTOCOL" button in Tech Labs.
 * Features:
 * - Real-time WebGL green screen chroma-key removal
 * - Loops smoothly and stays on in the designated right-side area
 * - Responsive sizing and subtle holographic repulsor glow
 * - Can be toggled on/off or closed via dismiss button
 */
export default function IronManHologram({ isActive, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Play repulsor sound effect
    try {
      playRepulsorSound();
    } catch (e) {
      // Audio fallback
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If unmuted autoplay is blocked by browser policy, fallback to muted loop
        video.muted = true;
        setIsAudioMuted(true);
        video.play().catch(() => {});
      });
    }

    // Hardware-accelerated WebGL Chroma Key Renderer
    let animId = null;
    let gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      gl = canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
    }

    if (gl) {
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

          // Edge despill
          vec3 cleanColor = color.rgb;
          if (cleanColor.g > maxRB) {
            cleanColor.g = maxRB;
          }

          gl_FragColor = vec4(cleanColor * alpha, alpha);
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

      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);

        // Standard quad
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

        const renderFrame = () => {
          if (!video.paused && !video.ended && video.readyState >= 2) {
            canvas.width = 540;
            canvas.height = 960;
            gl.viewport(0, 0, 540, 960);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
          animId = requestAnimationFrame(renderFrame);
        };

        animId = requestAnimationFrame(renderFrame);
      }
    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d');
      const render2d = () => {
        if (!video.paused && !video.ended && video.readyState >= 2) {
          canvas.width = 540;
          canvas.height = 960;
          ctx.drawImage(video, 0, 0, 540, 960);
        }
        animId = requestAnimationFrame(render2d);
      };
      animId = requestAnimationFrame(render2d);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (video) {
        video.pause();
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="ironman-hologram-root animate-fade-in">
      {/* Hidden source video looping offscreen */}
      <video
        ref={videoRef}
        src="/easter-egg/ironman.mp4"
        playsInline
        loop
        preload="auto"
        className="ironman-hidden-video"
      />

      {/* Floating Holographic Container */}
      <div className="ironman-floating-body">
        {/* Top Controls Badge */}
        <div className="ironman-header-pill">
          <div className="ironman-status-dot" />
          <span className="ironman-status-text">STARK MARK LXXXV // ONLINE</span>
          <button 
            onClick={onClose} 
            className="ironman-close-btn"
            title="Deactivate Iron Man Protocol"
            aria-label="Deactivate Iron Man Protocol"
          >
            ✕
          </button>
        </div>

        {/* Real-time Green-Screen Removed Canvas */}
        <div className="ironman-canvas-wrap">
          <canvas ref={canvasRef} className="ironman-chromakey-canvas" />
          <div className="ironman-ground-repulsor-glow" />
        </div>
      </div>

      <style>{`
        .ironman-hologram-root {
          position: fixed;
          right: clamp(10px, 2.5vw, 40px);
          bottom: clamp(10px, 2vh, 40px);
          z-index: 99999;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          animation: ironmanSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes ironmanSlideIn {
          0% {
            opacity: 0;
            transform: translateX(50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
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

        .ironman-floating-body {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.35)) drop-shadow(0 0 40px rgba(255, 46, 86, 0.2));
        }

        .ironman-header-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(12, 16, 26, 0.9);
          border: 1px solid rgba(0, 240, 255, 0.4);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
          backdrop-filter: blur(12px);
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: -15px;
          z-index: 10;
          pointer-events: auto;
        }

        .ironman-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00f0ff;
          box-shadow: 0 0 8px #00f0ff;
          animation: pulseDot 1.2s infinite alternate;
        }

        @keyframes pulseDot {
          0% { opacity: 0.5; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.2); }
        }

        .ironman-status-text {
          font-family: 'Space Grotesk', monospace;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #00f0ff;
        }

        .ironman-close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          cursor: pointer;
          margin-left: 4px;
          transition: all 0.2s ease;
        }

        .ironman-close-btn:hover {
          background: rgba(255, 46, 86, 0.3);
          border-color: #ff2e56;
          color: #ffffff;
          transform: scale(1.1);
        }

        .ironman-canvas-wrap {
          position: relative;
          width: clamp(260px, 20vw, 380px);
          aspect-ratio: 9 / 16;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ironman-chromakey-canvas {
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: transparent;
        }

        .ironman-ground-repulsor-glow {
          position: absolute;
          bottom: 15px;
          width: 70%;
          height: 25px;
          background: radial-gradient(ellipse, rgba(0, 240, 255, 0.5) 0%, rgba(255, 46, 86, 0.25) 45%, transparent 75%);
          filter: blur(10px);
          border-radius: 50%;
          pointer-events: none;
          animation: repulsorPulse 2s ease-in-out infinite alternate;
        }

        @keyframes repulsorPulse {
          0% { opacity: 0.6; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .ironman-hologram-root {
            right: 5px;
            bottom: 5px;
          }
          .ironman-canvas-wrap {
            width: clamp(200px, 55vw, 280px);
          }
        }
      `}</style>
    </div>
  );
}

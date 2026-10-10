import React, { useEffect, useRef, useState } from 'react';
import { playRepulsorSound } from '../utils/soundEngine';

/**
 * IronManHologram
 * Triggered by the "IRON MAN // PROTOCOL" button in Tech Labs.
 * Renders the green-screen-removed Iron Man video (oug7G_OlDFI) in real-time
 * via WebGL chroma keying, positioned right next to the protocol card.
 */
export default function IronManHologram({ isActive, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Play initial repulsor blast SFX
    try {
      playRepulsorSound();
    } catch (e) {
      // Audio fallback
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Video playback
    video.muted = true; // Guaranteed autoplay without browser rejection
    video.currentTime = 0;
    const startPlay = () => {
      video.play().catch(e => console.warn('Iron Man video play:', e));
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('canplay', startPlay, { once: true });
      video.load();
    }

    // Hardware-accelerated WebGL Chroma Key
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

          // Key out green background (threshold diff: > 0.15 is green screen)
          float thresholdLow = 0.12;
          float thresholdHigh = 0.28;
          float alpha = 1.0 - smoothstep(thresholdLow, thresholdHigh, diff);

          // Edge despill: prevent green light bleeding onto edges of armor
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

        // Quad geometry matching HTML video coordinates
        const vertices = new Float32Array([
          // x, y, u, v
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

        const renderFrame = () => {
          if (!video.paused && video.readyState >= 2) {
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
      // Canvas 2D Fallback
      const ctx = canvas.getContext('2d');
      const render2d = () => {
        if (!video.paused && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 540, 960);
          const imgData = ctx.getImageData(0, 0, 540, 960);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            const maxRB = Math.max(r, b);
            const diff = g - maxRB;
            if (diff > 35) {
              d[i + 3] = 0;
            } else if (diff > 15) {
              d[i + 3] = Math.max(0, 255 - (diff - 15) * 12);
              if (g > maxRB) d[i + 1] = maxRB;
            }
          }
          ctx.putImageData(imgData, 0, 0);
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
    <div className="ironman-hologram-anchor animate-fade-in">
      {/* Hidden source video element looping */}
      <video
        ref={videoRef}
        src="/easter-egg/ironman.mp4"
        playsInline
        loop
        muted
        autoPlay
        preload="auto"
        className="ironman-source-video"
      />

      {/* Floating Holographic Container */}
      <div className="ironman-hologram-card">
        {/* Top Dismiss Button */}
        <button 
          onClick={onClose} 
          className="ironman-hologram-close-btn"
          title="Deactivate Iron Man Protocol"
          aria-label="Deactivate Iron Man Protocol"
        >
          ✕
        </button>

        {/* Real-time Green-Screen Removed Canvas */}
        <div className="ironman-canvas-container">
          <canvas 
            ref={canvasRef} 
            width={540} 
            height={960} 
            className="ironman-gl-canvas" 
          />
          <div className="ironman-repulsor-beam-glow" />
        </div>
      </div>

      <style>{`
        /* Anchored directly next to the IRON MAN PROTOCOL card in Tech Labs */
        .ironman-hologram-anchor {
          position: absolute;
          left: calc(100% + 20px);
          top: 50%;
          transform: translateY(-50%);
          z-index: 100;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: ironmanFadeScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes ironmanFadeScale {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(25px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }

        .ironman-source-video {
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .ironman-hologram-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 0 20px rgba(0, 240, 255, 0.45)) drop-shadow(0 0 40px rgba(255, 46, 86, 0.3));
        }

        .ironman-hologram-close-btn {
          position: absolute;
          top: -10px;
          right: 10px;
          z-index: 10;
          background: rgba(10, 14, 22, 0.85);
          border: 1px solid rgba(0, 240, 255, 0.5);
          color: #00f0ff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }

        .ironman-hologram-close-btn:hover {
          background: rgba(255, 46, 86, 0.8);
          border-color: #ff2e56;
          color: #ffffff;
          transform: scale(1.15);
        }

        .ironman-canvas-container {
          position: relative;
          width: clamp(260px, 22vw, 360px);
          aspect-ratio: 9 / 16;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ironman-gl-canvas {
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: transparent;
        }

        .ironman-repulsor-beam-glow {
          position: absolute;
          bottom: 25px;
          width: 65%;
          height: 22px;
          background: radial-gradient(ellipse, rgba(0, 240, 255, 0.6) 0%, rgba(255, 46, 86, 0.3) 50%, transparent 80%);
          filter: blur(8px);
          border-radius: 50%;
          pointer-events: none;
          animation: repulsorFlicker 1.8s ease-in-out infinite alternate;
        }

        @keyframes repulsorFlicker {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.1); }
        }

        /* On screens narrower than 1340px: float on the bottom right so he never collides or overflows */
        @media (max-width: 1340px) {
          .ironman-hologram-anchor {
            position: fixed;
            left: auto;
            right: 15px;
            bottom: 20px;
            top: auto;
            transform: none;
          }

          @keyframes ironmanFadeScale {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.92);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .ironman-canvas-container {
            width: clamp(200px, 45vw, 290px);
          }
        }
      `}</style>
    </div>
  );
}

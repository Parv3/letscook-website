import React, { useEffect, useRef } from 'react';
import { playThunderStrike } from '../utils/soundEngine';

/**
 * ThorHologram
 * Triggered by the "SUMMON STORMBREAKER" or Thor protocol in Events Team.
 * Renders twin Asgardian Stormbreaker holographic relics on BOTH sides of the screen.
 * Features:
 * - Real-time WebGL Black Screen Removal (black background keyed out on GPU at 60 FPS)
 * - Movie-accurate 3D rotating Stormbreaker axe with Groot handle & glowing uru energy
 * - Asgardian Bifrost & celestial lightning particle glow
 * - Loops seamlessly while the protocol is toggled on
 * - Dismiss button to deactivate
 */
export default function ThorHologram({ isActive, onClose }) {
  const videoRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    try {
      playThunderStrike();
    } catch (e) {}

    const video = videoRef.current;
    const leftCanvas = leftCanvasRef.current;
    const rightCanvas = rightCanvasRef.current;
    if (!video || !leftCanvas || !rightCanvas) return;

    video.muted = true;
    video.currentTime = 0;
    const startPlay = () => {
      video.play().catch(e => console.warn('Stormbreaker play error:', e));
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('canplay', startPlay, { once: true });
      video.load();
    }

    let animId = null;

    // Initialize WebGL Black Screen Keying Pipeline
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
          
          float maxVal = max(color.r, max(color.g, color.b));
          float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          float metric = max(maxVal, luma * 1.15);

          // Key out black screen background
          float lowThresh = 0.04;
          float highThresh = 0.16;
          float alpha = smoothstep(lowThresh, highThresh, metric);

          // Edge radiance boost for uru energy
          vec3 cleanRgb = color.rgb;
          if (alpha > 0.01 && alpha < 0.98) {
            cleanRgb = color.rgb * (1.0 + (1.0 - alpha) * 0.25);
          }

          gl_FragColor = vec4(cleanRgb, alpha);
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
      if (!vs || !fs) return null;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

      // Crop slightly to frame the entire axe dynamically
      const vertices = new Float32Array([
        -1.0,  1.0,  0.0, 0.16,
         1.0,  1.0,  1.0, 0.16,
        -1.0, -1.0,  0.0, 0.98,
         1.0, -1.0,  1.0, 0.98,
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

    const renderLoop = () => {
      if (video.readyState >= 2) {
        if (leftGL) {
          leftGL.gl.viewport(0, 0, leftCanvas.width, leftCanvas.height);
          leftGL.gl.clear(leftGL.gl.COLOR_BUFFER_BIT);
          leftGL.gl.useProgram(leftGL.program);
          leftGL.gl.bindTexture(leftGL.gl.TEXTURE_2D, leftGL.texture);
          leftGL.gl.texImage2D(leftGL.gl.TEXTURE_2D, 0, leftGL.gl.RGBA, leftGL.gl.RGBA, leftGL.gl.UNSIGNED_BYTE, video);
          leftGL.gl.drawArrays(leftGL.gl.TRIANGLE_STRIP, 0, 4);
        }

        if (rightGL) {
          rightGL.gl.viewport(0, 0, rightCanvas.width, rightCanvas.height);
          rightGL.gl.clear(rightGL.gl.COLOR_BUFFER_BIT);
          rightGL.gl.useProgram(rightGL.program);
          rightGL.gl.bindTexture(rightGL.gl.TEXTURE_2D, rightGL.texture);
          rightGL.gl.texImage2D(rightGL.gl.TEXTURE_2D, 0, rightGL.gl.RGBA, rightGL.gl.RGBA, rightGL.gl.UNSIGNED_BYTE, video);
          rightGL.gl.drawArrays(rightGL.gl.TRIANGLE_STRIP, 0, 4);
        }
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
    <div className="thor-sentries-root animate-fade-in">
      {/* Looping video source */}
      <video
        ref={videoRef}
        src="/easter-egg/stormbreaker.mp4"
        playsInline
        loop
        muted
        autoPlay
        preload="auto"
        className="thor-hidden-video"
      />

      {/* LEFT SENTRY (Mirrored inward towards content) */}
      <div className="thor-sentry thor-sentry-left">
        <div className="thor-sentry-inner">
          <div className="thor-canvas-wrap sentry-mirrored">
            <canvas 
              ref={leftCanvasRef} 
              width={720} 
              height={980} 
              className="thor-sentry-canvas" 
            />
            <div className="thor-bifrost-glow" />
          </div>
        </div>
      </div>

      {/* RIGHT SENTRY (Facing inward towards content) */}
      <div className="thor-sentry thor-sentry-right">
        <div className="thor-sentry-inner">
          {/* Dismiss button */}
          <button 
            onClick={onClose} 
            className="thor-dismiss-btn"
            title="Deactivate Stormbreaker Protocol"
            aria-label="Deactivate Stormbreaker Protocol"
          >
            ✕
          </button>

          <div className="thor-canvas-wrap">
            <canvas 
              ref={rightCanvasRef} 
              width={720} 
              height={980} 
              className="thor-sentry-canvas" 
            />
            <div className="thor-bifrost-glow" />
          </div>
        </div>
      </div>

      <style>{`
        .thor-sentries-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 99999;
        }

        .thor-hidden-video {
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .thor-sentry {
          position: fixed;
          bottom: 24px;
          width: clamp(240px, 26vw, 420px);
          max-height: 85vh;
          aspect-ratio: 720 / 980;
          pointer-events: auto;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          filter: drop-shadow(0 0 35px rgba(56, 189, 248, 0.45)) drop-shadow(0 0 50px rgba(245, 158, 11, 0.3));
          animation: thorFloat 4.2s ease-in-out infinite alternate;
        }

        .thor-sentry-left {
          left: 20px;
        }

        .thor-sentry-right {
          right: 20px;
        }

        @media (max-width: 1024px) {
          .thor-sentry-left {
            display: none;
          }
          .thor-sentry-right {
            right: 8px;
            bottom: 12px;
            width: clamp(200px, 42vw, 320px);
          }
        }

        @keyframes thorFloat {
          0% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }

        .thor-sentry-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .thor-canvas-wrap {
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

        .thor-sentry-canvas {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          filter: contrast(1.15) brightness(1.1);
        }

        .thor-bifrost-glow {
          position: absolute;
          inset: 15% 10% 10% 10%;
          background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.35) 0%, rgba(245, 158, 11, 0.2) 45%, transparent 75%);
          pointer-events: none;
          mix-blend-mode: screen;
          filter: blur(25px);
          animation: bifrostPulse 2.8s ease-in-out infinite alternate;
        }

        @keyframes bifrostPulse {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 0.95; transform: scale(1.08); }
        }

        .thor-dismiss-btn {
          position: absolute;
          top: -12px;
          right: 10px;
          background: rgba(14, 18, 28, 0.9);
          border: 1px solid #38bdf8;
          color: #38bdf8;
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
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.6);
          transition: all 0.2s ease;
        }

        .thor-dismiss-btn:hover {
          background: #38bdf8;
          color: #040810;
          transform: scale(1.15) rotate(90deg);
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { 
  playThunderStrike, 
  playCinematicShatterSound 
} from '../utils/soundEngine';

/**
 * SiteExplosionEasterEgg
 * Triggered by secret passkey "300406".
 * Features:
 * - Green screen removed in real-time via hardware-accelerated WebGL chroma-key shader
 * - No sub-web page, no text, no countdown timer
 * - Renders the pure explosion seamlessly over the website
 * - Automatically disappears after exactly 6 seconds (matching the 5.92s video length)
 */
export default function SiteExplosionEasterEgg({ isActive, onComplete }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // 1. Play native explosive audio FX as immediate backup
    try {
      playThunderStrike();
      setTimeout(() => playCinematicShatterSound(), 140);
    } catch (e) {
      // Audio fallback
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // 2. Start Video Playback
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Unmuted video play blocked, falling back to muted video:', err);
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    // 3. WebGL Real-time Green Screen Chroma-Keying
    let animId = null;
    let gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      gl = canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
    }

    if (gl) {
      // Vertex shader: Fullscreen quad
      const vsSource = `
        attribute vec2 a_pos;
        attribute vec2 a_uv;
        varying vec2 v_uv;
        void main() {
          gl_Position = vec4(a_pos, 0.0, 1.0);
          v_uv = a_uv;
        }
      `;

      // Fragment shader: Green screen removal with edge despill
      const fsSource = `
        precision mediump float;
        uniform sampler2D u_video;
        varying vec2 v_uv;

        void main() {
          vec4 color = texture2D(u_video, v_uv);

          // Calculate difference between green channel and max(red, blue)
          float maxRB = max(color.r, color.b);
          float diff = color.g - maxRB;

          // Key out green background (green screen diff is ~0.78, flame/smoke is <= 0.05)
          float thresholdLow = 0.12;
          float thresholdHigh = 0.28;
          float alpha = 1.0 - smoothstep(thresholdLow, thresholdHigh, diff);

          // Despill green fringe on edges so fire/smoke has no green hue
          vec3 cleanColor = color.rgb;
          if (cleanColor.g > maxRB) {
            cleanColor.g = maxRB;
          }

          gl_FragColor = vec4(cleanColor, color.a * alpha);
        }
      `;

      const createShader = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compile error:', gl.getShaderInfoLog(shader));
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

        // Quad geometry
        const vertices = new Float32Array([
          // pos(x, y), uv(u, v)
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

        // Video texture
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
            const w = (canvas.width = window.innerWidth);
            const h = (canvas.height = window.innerHeight);

            // Maintain 16:9 aspect ratio centered cover/contain
            const screenAspect = w / h;
            const videoAspect = 16 / 9;
            let drawW = w;
            let drawH = h;
            let offsetX = 0;
            let offsetY = 0;

            if (screenAspect > videoAspect) {
              drawW = w;
              drawH = w / videoAspect;
              offsetY = (h - drawH) / 2;
            } else {
              drawH = h;
              drawW = h * videoAspect;
              offsetX = (w - drawW) / 2;
            }

            gl.viewport(offsetX, offsetY, drawW, drawH);
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
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        animId = requestAnimationFrame(render2d);
      };
      animId = requestAnimationFrame(render2d);
    }

    // 4. Automatically disappear after 6 seconds (exact video duration)
    const timer = setTimeout(() => {
      if (video) {
        video.pause();
      }
      if (onComplete) onComplete();
    }, 6000);

    const handleVideoEnd = () => {
      clearTimeout(timer);
      if (onComplete) onComplete();
    };
    video.addEventListener('ended', handleVideoEnd);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      clearTimeout(timer);
      video.removeEventListener('ended', handleVideoEnd);
      if (video) {
        video.pause();
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="site-explosion-root">
      {/* Hidden high-res video decoded by GPU */}
      <video
        ref={videoRef}
        src="/easter-egg/explosion.mp4"
        playsInline
        preload="auto"
        className="hidden-source-video"
      />

      {/* Fullscreen transparent canvas displaying keyed explosion over the site */}
      <canvas ref={canvasRef} className="explosion-chromakey-canvas" />

      <style>{`
        .site-explosion-root {
          position: fixed;
          inset: 0;
          z-index: 999999;
          pointer-events: none;
          overflow: hidden;
          background: transparent;
        }

        .hidden-source-video {
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .explosion-chromakey-canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          background: transparent;
        }
      `}</style>
    </div>
  );
}

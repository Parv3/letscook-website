import React, { useEffect, useRef, useState } from 'react';

/**
 * StormbreakerVisual
 * Renders the photorealistic 3D Stormbreaker axe from the VFX capture
 * with the solid black background removed in real-time GPU WebGL.
 * Replaces cartoonish SVG graphics with cinematic 60 FPS Asgardian uru visuals.
 */
export default function StormbreakerVisual({
  width = 80,
  height = 80,
  className = '',
  crop = true,
  glow = true,
  onClick,
  style = {}
}) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const startPlay = () => {
      video.play().then(() => {
        setIsVideoReady(true);
      }).catch(err => {
        console.warn('Stormbreaker autoPlay deferred:', err);
      });
    };

    if (video.readyState >= 2) {
      startPlay();
    } else {
      video.addEventListener('canplay', startPlay, { once: true });
      video.load();
    }

    // Initialize WebGL Black Screen Removal Pipeline
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false }) ||
               canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });

    if (!gl) {
      console.warn('WebGL not supported for Stormbreaker chroma key.');
      return;
    }

    const vsSource = `
      attribute vec2 a_pos;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
        v_uv = a_uv;
      }
    `;

    // Real-time Black Screen Removal with Edge Glow Compensation
    const fsSource = `
      precision mediump float;
      uniform sampler2D u_video;
      varying vec2 v_uv;

      void main() {
        vec4 color = texture2D(u_video, v_uv);
        
        // Calculate max channel and luminance to preserve glowing lightning & reflections
        float maxVal = max(color.r, max(color.g, color.b));
        float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        float metric = max(maxVal, luma * 1.15);

        // Smoothstep key out of pure black screen background
        float lowThresh = 0.04;
        float highThresh = 0.16;
        float alpha = smoothstep(lowThresh, highThresh, metric);

        // Slight edge vibrance boost on semi-transparent uru energy
        vec3 cleanRgb = color.rgb;
        if (alpha > 0.01 && alpha < 0.98) {
          cleanRgb = color.rgb * (1.0 + (1.0 - alpha) * 0.25);
        }

        gl_FragColor = vec4(cleanRgb, alpha);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Quad geometry: crop vertically if crop=true to eliminate empty top & bottom space
    const yTop = crop ? 0.18 : 0.0;
    const yBottom = crop ? 0.98 : 1.0;

    const vertices = new Float32Array([
      // a_pos.x, a_pos.y, a_uv.x, a_uv.y
      -1.0,  1.0,  0.0, yTop,
       1.0,  1.0,  1.0, yTop,
      -1.0, -1.0,  0.0, yBottom,
       1.0, -1.0,  1.0, yBottom,
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

    // Video Texture setup
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Alpha blending configuration
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    let animId = null;
    const render = () => {
      if (video && video.readyState >= 2) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (video) video.pause();
    };
  }, [crop]);

  return (
    <div 
      className={`stormbreaker-visual-wrap ${className}`} 
      style={{ 
        position: 'relative', 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}
      onClick={onClick}
    >
      {/* Hidden Looping Source Video */}
      <video
        ref={videoRef}
        src="/easter-egg/stormbreaker.mp4"
        playsInline
        loop
        muted
        autoPlay
        preload="auto"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Atmospheric Bifrost / Lightning Core Glow */}
      {glow && (
        <div 
          className="stormbreaker-bifrost-aura" 
          style={{
            position: 'absolute',
            inset: '-15%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(245, 158, 11, 0.18) 45%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* Real-time WebGL Keyed Canvas */}
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.45)) drop-shadow(0 0 24px rgba(245, 158, 11, 0.25))'
        }}
      />
    </div>
  );
}

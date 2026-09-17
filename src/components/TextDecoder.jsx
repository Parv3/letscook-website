import React, { useState, useEffect, useRef } from 'react';
import { playDecodeTick } from '../utils/soundEngine';

const MATRIX_CHARS = '0123456789ABCDEF#$@&*!%/<>[]{}';

/**
 * TextDecoder: Highly Optimized Matrix Scramble Decoding Component
 * Uses requestAnimationFrame with frame throttling to prevent main thread lag.
 */
export default function TextDecoder({ text, className = '' }) {
  const [displayText, setDisplayText] = useState(text);
  const [isDecoding, setIsDecoding] = useState(false);
  const animFrameRef = useRef(null);

  const startDecode = () => {
    if (isDecoding) return;
    setIsDecoding(true);

    let frame = 0;
    const totalFrames = text.length * 2.2;

    const animate = () => {
      frame++;

      // Update scramble text every 2 frames
      if (frame % 2 === 0) {
        setDisplayText(
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < frame / 2.2) {
                return text[index];
              }
              return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            })
            .join('')
        );

        // Play audio micro-tick only once every 6 frames to prevent Web Audio overload
        if (frame % 6 === 0) {
          playDecodeTick();
        }
      }

      if (frame < totalFrames) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setIsDecoding(false);
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <span 
      className={`text-decoder ${className} ${isDecoding ? 'decoding' : ''}`}
      onMouseEnter={startDecode}
      onTouchStart={startDecode}
    >
      {displayText}
      <style>{`
        .text-decoder {
          cursor: pointer;
          transition: color 0.2s ease;
          user-select: none;
        }
        .text-decoder.decoding {
          color: var(--accent-burgundy-hover);
          text-shadow: 0 0 10px rgba(255, 42, 109, 0.6);
        }
      `}</style>
    </span>
  );
}

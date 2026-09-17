import React, { useState, useEffect, useRef } from 'react';
import { playDecodeTick } from '../utils/soundEngine';

const MATRIX_CHARS = '0123456789ABCDEF#$@&*!%/<>[]{}';

export default function TextDecoder({ text, className = '' }) {
  const [displayText, setDisplayText] = useState(text);
  const [isDecoding, setIsDecoding] = useState(false);
  const intervalRef = useRef(null);

  const startDecode = () => {
    if (isDecoding) return;
    setIsDecoding(true);

    let iteration = 0;
    const maxIterations = text.length * 3;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 3) {
              return text[index];
            }
            return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          })
          .join('')
      );

      playDecodeTick();

      iteration += 1;

      if (iteration >= maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsDecoding(false);
      }
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span 
      className={`text-decoder ${className} ${isDecoding ? 'decoding' : ''}`}
      onMouseEnter={startDecode}
      title="Hover to trigger text matrix decode"
    >
      {displayText}
      <style>{`
        .text-decoder {
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .text-decoder.decoding {
          color: var(--accent-burgundy-hover);
          text-shadow: 0 0 10px rgba(255, 42, 109, 0.6);
        }
      `}</style>
    </span>
  );
}

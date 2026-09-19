import React, { useState, useEffect } from 'react';
import { playTechClick } from '../utils/soundEngine';

const SECTIONS = [
  { id: 'hero-top', label: '01 // HERO', targetId: null },
  { id: 'monolith-3d', label: '02 // 3D CONSOLE', targetId: 'monolith-3d' },
  { id: 'pillars', label: '03 // INITIATIVES', targetId: 'pillars' },
  { id: 'access', label: '04 // ACCESS', targetId: 'access' },
  { id: 'faq', label: '05 // FAQ', targetId: 'faq' },
];

export default function ScrollCircuitRail() {
  const [activeSection, setActiveSection] = useState('hero-top');
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            setScrollPercent(Math.min(100, Math.max(0, (scrollY / docHeight) * 100)));
          }

          // Section detection
          const scrollPos = scrollY + window.innerHeight * 0.35;
          let current = 'hero-top';

          for (const sec of SECTIONS) {
            if (!sec.targetId) continue;
            const el = document.getElementById(sec.targetId);
            if (el && el.offsetTop <= scrollPos) {
              current = sec.id;
            }
          }
          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sec) => {
    playTechClick();
    if (!sec.targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sec.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <aside className="scroll-circuit-rail no-print" aria-label="Page Section Navigation">
      <div className="circuit-rail-track">
        {/* Background circuit line */}
        <div className="rail-line-bg" />
        {/* Active illuminated circuit trace */}
        <div className="rail-line-fill" style={{ height: `${scrollPercent}%` }} />

        {/* Section Solder Nodes */}
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec)}
              className={`circuit-node-btn ${isActive ? 'active' : ''}`}
              title={`Jump to ${sec.label}`}
              aria-label={`Jump to ${sec.label}`}
            >
              <div className="node-square" />
              <span className="node-label">{sec.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .scroll-circuit-rail {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 4500;
          pointer-events: none;
        }

        .circuit-rail-track {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          height: 220px;
          pointer-events: auto;
        }

        .rail-line-bg {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          background-color: var(--border-color);
          z-index: 1;
        }

        .rail-line-fill {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          background: linear-gradient(180deg, var(--logo-accent-color, #ff2a6d), var(--accent-burgundy-hover, #a3083b));
          box-shadow: 0 0 8px var(--logo-accent-color, #ff2a6d);
          z-index: 2;
          transition: height 0.15s ease-out;
        }

        .circuit-node-btn {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .node-square {
          width: 8px;
          height: 8px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          transform: rotate(45deg);
          transition: all var(--transition-fast);
        }

        .circuit-node-btn:hover .node-square {
          border-color: var(--logo-accent-color, #ff2a6d);
          background-color: var(--accent-burgundy-hover);
          transform: rotate(45deg) scale(1.3);
          box-shadow: 0 0 8px var(--logo-accent-color, #ff2a6d);
        }

        .circuit-node-btn.active .node-square {
          background-color: var(--logo-accent-color, #ff2a6d);
          border-color: #ffffff;
          transform: rotate(45deg) scale(1.4);
          box-shadow: 0 0 10px var(--logo-accent-color, #ff2a6d), 0 0 4px #ffffff;
        }

        .node-label {
          position: absolute;
          left: 18px;
          font-family: var(--font-display);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-6px);
          transition: all var(--transition-fast);
          pointer-events: none;
          background-color: var(--bg-surface);
          padding: 2px 8px;
          border-radius: var(--radius-badge);
          border: 1px solid var(--border-color);
        }

        .circuit-node-btn:hover .node-label,
        .circuit-node-btn.active .node-label {
          opacity: 1;
          transform: translateX(0);
          color: var(--text-main);
          border-color: var(--logo-accent-color, #ff2a6d);
        }

        @media (max-width: 1140px) {
          .scroll-circuit-rail {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}

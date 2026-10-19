import React, { useState, useEffect } from 'react';
import { playGbaBip, playGbaBoot } from './GbaAudio';

const CARTRIDGES = [
  {
    id: 'dino',
    title: 'CYBER DINO RUN',
    hero: 'BLACK PANTHER // RAPTOR',
    type: 'ENDLESS HORIZON RUNNER',
    color: '#22c55e',
    secondary: '#00f0ff',
    desc: 'Jump over spikes & duck under cyber-drones! Chrome Dino style.',
    storageKey: 'lc_gba_dino_hi'
  },
  {
    id: 'stark',
    title: 'STARK FLIGHT',
    hero: 'IRON MAN',
    type: 'BLASTER JETPACK',
    color: '#ef4444',
    secondary: '#fbbf24',
    desc: 'Glide gently, fire repulsor blasters & collect shield bubbles.',
    storageKey: 'lc_gba_stark_hi'
  },
  {
    id: 'shield',
    title: 'SHIELD BREAKER',
    hero: 'CAPTAIN AMERICA',
    type: 'VIBRANIUM BRICK BREAKER',
    color: '#38bdf8',
    secondary: '#ef4444',
    desc: 'Relaxed speed, Multi-Ball, paddle lasers & power-ups!',
    storageKey: 'lc_gba_shield_hi'
  },
  {
    id: 'snake',
    title: 'MATRIX SNAKE',
    hero: 'HULK // TECH LABS',
    type: 'CYBER NEURAL TRACE',
    color: '#a855f7',
    secondary: '#22c55e',
    desc: 'Smooth speed, bonus golden matrix gems & ghost chip wrap.',
    storageKey: 'lc_gba_snake_hi'
  },
  {
    id: 'leaderboard',
    title: 'HALL OF FAME',
    hero: 'LEADERBOARD',
    type: 'ALL PLAYERS & STATS',
    color: '#fbbf24',
    secondary: '#00f0ff',
    desc: 'View real high scores & rankings of all community players.',
    storageKey: null
  },
  {
    id: 'terminal',
    title: 'TERMINAL CLI',
    hero: 'S.H.I.E.L.D. COMMAND',
    type: 'SYSTEM SHELL',
    color: '#00f0ff',
    secondary: '#ffffff',
    desc: 'Access kernel shell, easter eggs, squad directives & stats.',
    storageKey: null
  }
];

export default function GbaCartridgeMenu({ onSelectGame, dpadState, buttonA, buttonB, startTrigger }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const moveSelection = (delta) => {
    playGbaBip();
    setSelectedIdx(prev => {
      const next = (prev + delta + CARTRIDGES.length) % CARTRIDGES.length;
      return next;
    });
  };

  const prevDpadRef = useRef({});
  // Physical D-Pad triggers (only trigger on initial press edge)
  useEffect(() => {
    const prev = prevDpadRef.current;
    if ((dpadState.down && !prev.down) || (dpadState.right && !prev.right)) {
      moveSelection(1);
    } else if ((dpadState.up && !prev.up) || (dpadState.left && !prev.left)) {
      moveSelection(-1);
    }
    prevDpadRef.current = { ...dpadState };
  }, [dpadState]);

  // A button or Start to launch
  useEffect(() => {
    if (buttonA || startTrigger) {
      playGbaBoot();
      onSelectGame(CARTRIDGES[selectedIdx].id);
    }
  }, [buttonA, startTrigger, selectedIdx, onSelectGame]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 's' || e.key === 'd') {
        moveSelection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'w' || e.key === 'a') {
        moveSelection(-1);
      } else if (e.code === 'Space' || e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
        playGbaBoot();
        onSelectGame(CARTRIDGES[selectedIdx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, onSelectGame]);

  return (
    <div className="gba-menu-screen animate-fade-in">
      {/* Top Header */}
      <div className="gba-menu-header">
        <div className="gba-header-brand">
          <span className="brand-dot" />
          <span>GAMES & SHELL</span>
        </div>
      </div>

      {/* Cartridge List */}
      <div className="gba-cartridges-list">
        {CARTRIDGES.map((cart, idx) => {
          const isSelected = selectedIdx === idx;
          const hiScore = cart.storageKey ? localStorage.getItem(cart.storageKey) || '0' : null;

          return (
            <div
              key={cart.id}
              onClick={() => {
                playGbaBip();
                setSelectedIdx(idx);
                onSelectGame(cart.id);
              }}
              className={`gba-cart-row ${isSelected ? 'active-cart' : ''}`}
              style={{
                borderColor: isSelected ? cart.color : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isSelected ? `0 0 16px ${cart.color}35` : 'none'
              }}
            >
              <div className="cart-num-badge" style={{ background: isSelected ? cart.color : 'rgba(255, 255, 255, 0.06)', color: isSelected ? '#040711' : '#94a3b8' }}>
                {idx + 1}
              </div>

              <div className="cart-meta-group">
                <div className="cart-title-row">
                  <span className="cart-title" style={{ color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                    {cart.title}
                  </span>
                </div>
                <div className="cart-desc">{cart.desc}</div>
              </div>

              {hiScore !== null && (
                <div className="cart-hi-score">
                  <span className="hi-label">HI</span>
                  <span className="hi-val">{hiScore}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .gba-menu-screen {
          width: 100%;
          height: 100%;
          background: #040711;
          color: #ffffff;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 8px 10px;
          position: relative;
          user-select: none;
        }

        .gba-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 6px;
        }

        .gba-header-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #f59e0b;
        }

        .brand-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }

        .gba-header-track {
          font-size: 0.62rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .gba-cartridges-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .gba-cartridges-list::-webkit-scrollbar {
          width: 3px;
        }
        .gba-cartridges-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .gba-cart-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gba-cart-row:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .gba-cart-row.active-cart {
          background: rgba(255, 255, 255, 0.08);
          transform: scale(1.01);
        }

        .cart-num-badge {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.68rem;
          flex-shrink: 0;
        }

        .cart-meta-group {
          flex: 1;
          min-width: 0;
        }

        .cart-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .cart-title {
          font-weight: 800;
          font-size: 0.76rem;
          letter-spacing: 0.04em;
        }

        .cart-hero-tag {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .cart-desc {
          font-size: 0.6rem;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cart-hi-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.1;
          flex-shrink: 0;
        }

        .hi-label {
          font-size: 0.5rem;
          color: #64748b;
          font-weight: 800;
        }

        .hi-val {
          font-size: 0.68rem;
          color: #fbbf24;
          font-weight: 900;
        }

        .gba-menu-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 5px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.58rem;
          color: #64748b;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
}

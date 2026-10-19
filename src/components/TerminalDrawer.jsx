import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Terminal as TerminalIcon, Gamepad2, RotateCcw, Trophy, Maximize2, Minimize2 } from 'lucide-react';
import { isSoundMuted, setSoundMuted, playTechClick } from '../utils/soundEngine';
import { playGbaBoot, playGbaBip } from './gba/GbaAudio';

import CyberDinoGame from './gba/CyberDinoGame';
import StarkFlightGame from './gba/StarkFlightGame';
import ShieldBreakerGame from './gba/ShieldBreakerGame';
import MatrixSnakeGame from './gba/MatrixSnakeGame';
import ThorForgeGame from './gba/ThorForgeGame';
import GbaLeaderboardScreen from './gba/GbaLeaderboardScreen';
import GbaCartridgeMenu from './gba/GbaCartridgeMenu';
import GbaShellTerminal from './gba/GbaShellTerminal';

/**
 * TerminalDrawer: Replaced with the "LET'S COOK ADVANCE // S.H.I.E.L.D. SP"
 * An interactive Game Boy Advance Handheld Console Terminal with 4 playable retro games:
 * 1. Stark Flight (Iron Man Jetpack side-scroller)
 * 2. Shield Breaker (Captain America Vibranium Breakout)
 * 3. Matrix Snake (Cyber Matrix glowing trace)
 * 4. Thor's Uru Forge (Reflex falling catch)
 * Plus embedded CRT S.H.I.E.L.D. CLI Terminal mode!
 */
export default function TerminalDrawer({ 
  isOpen, 
  onClose, 
  onOpenPitchModal, 
  onTriggerEasterEgg, 
  onSelectSquad 
}) {
  // Active ROM screen: 'menu' | 'dino' | 'stark' | 'shield' | 'snake' | 'leaderboard' | 'terminal'
  const [activeCartridge, setActiveCartridge] = useState('menu');
  const [muted, setMuted] = useState(() => isSoundMuted());
  const [isMaximized, setIsMaximized] = useState(false);

  // Physical GBA Button States for on-screen touch/click + keyboard
  const [dpadState, setDpadState] = useState({ up: false, down: false, left: false, right: false });
  const [buttonA, setButtonA] = useState(false);
  const [buttonB, setButtonB] = useState(false);
  const [startTrigger, setStartTrigger] = useState(0);

  // Play boot chime on open
  useEffect(() => {
    if (isOpen) {
      playGbaBoot();
    }
  }, [isOpen]);

  // Global Keyboard event handler mapped to GBA hardware
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't intercept typing if user is typing in the terminal text input!
      if (activeCartridge === 'terminal' && e.target.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          setActiveCartridge('menu');
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setDpadState(p => ({ ...p, up: true }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setDpadState(p => ({ ...p, down: true }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setDpadState(p => ({ ...p, left: true }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setDpadState(p => ({ ...p, right: true }));
      } else if (e.code === 'Space' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setButtonA(true);
      } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
        e.preventDefault();
        setButtonB(true);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setStartTrigger(prev => prev + 1);
      } else if (e.key === 'Shift' || e.key === 'Tab') {
        e.preventDefault();
        // SELECT button toggles between Games Menu and Terminal CLI
        playGbaBip();
        setActiveCartridge(prev => (prev === 'terminal' ? 'menu' : 'terminal'));
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setDpadState(p => ({ ...p, up: false }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setDpadState(p => ({ ...p, down: false }));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setDpadState(p => ({ ...p, left: false }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setDpadState(p => ({ ...p, right: false }));
      } else if (e.code === 'Space' || e.key === 'z' || e.key === 'Z') {
        setButtonA(false);
      } else if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
        setButtonB(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, activeCartridge]);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) playGbaBoot();
  };

  const handleSelectGame = (gameId) => {
    playGbaBip();
    setActiveCartridge(gameId);
  };

  if (!isOpen) return null;

  return (
    <div className="gba-console-backdrop animate-fade-in" onClick={onClose}>
      <div className={`gba-console-outer-wrap ${isMaximized ? 'is-maximized' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Top Console Shoulder Triggers */}
        <div className="gba-top-shoulder-bar">
          <button 
            type="button"
            className="gba-shoulder-btn gba-shoulder-left"
            onClick={toggleSound}
            title="L Trigger: Toggle Audio"
          >
            <span>[L] {muted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          <button 
            type="button"
            className={`gba-shoulder-btn gba-shoulder-leaderboard ${activeCartridge === 'leaderboard' ? 'active-lb' : ''}`}
            onClick={() => {
              playGbaBip();
              setActiveCartridge(prev => (prev === 'leaderboard' ? 'menu' : 'leaderboard'));
            }}
            title="Toggle Global Hall of Fame Leaderboard"
          >
            <Trophy size={13} className="inline mr-1 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              playGbaBip();
              setActiveCartridge('menu');
            }}
            className="gba-cartridge-slot-ridge cursor-pointer hover:bg-slate-800 transition-colors"
            title="Open Multicart BIOS Menu"
          >
            <span className="cart-slot-label">▲ INSERT CARTRIDGE ▲</span>
          </button>

          <button 
            type="button"
            className="gba-shoulder-btn gba-shoulder-right"
            onClick={() => {
              playGbaBip();
              setActiveCartridge('menu');
            }}
            title="R Trigger: Reset to Cartridge Menu"
          >
            <span>[R] MENU</span>
          </button>
        </div>

        {/* Sculpted Handheld GBA Shell */}
        <div className="gba-hardware-chassis">
          
          {/* Top Bezel Utility Bar: Power LED & Exit */}
          <div className="gba-bezel-top-strip">
            <div className="gba-power-indicator">
              <span className="power-led-dot" />
              <span className="power-text">POWER</span>
            </div>

            <div className="gba-hardware-brand">
              <span className="brand-cook">LET'S COOK</span>
              <span className="brand-advance">ADVANCE</span>
              <span className="brand-sp">SP</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setIsMaximized(prev => !prev)} 
                className="gba-console-zoom-btn"
                aria-label="Toggle Theater / Maximized Screen"
                title={isMaximized ? "Standard GBA View" : "Maximize Screen"}
              >
                {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

              <button 
                type="button" 
                onClick={onClose} 
                className="gba-console-close-btn"
                aria-label="Power off and close console"
                title="Close Console"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Handheld Layout Grid: Left D-Pad | Center LCD Screen | Right A/B */}
          <div className="gba-controls-and-screen-grid">
            
            {/* LEFT CONTROLS: METALLIC D-PAD */}
            <div className="gba-left-controls">
              <div className="dpad-mount">
                {/* D-Pad Up */}
                <button
                  type="button"
                  onMouseDown={() => setDpadState(p => ({ ...p, up: true }))}
                  onMouseUp={() => setDpadState(p => ({ ...p, up: false }))}
                  onTouchStart={() => setDpadState(p => ({ ...p, up: true }))}
                  onTouchEnd={() => setDpadState(p => ({ ...p, up: false }))}
                  className={`dpad-btn dpad-up ${dpadState.up ? 'active-pressed' : ''}`}
                  aria-label="D-Pad Up"
                >
                  ▲
                </button>

                {/* D-Pad Left */}
                <button
                  type="button"
                  onMouseDown={() => setDpadState(p => ({ ...p, left: true }))}
                  onMouseUp={() => setDpadState(p => ({ ...p, left: false }))}
                  onTouchStart={() => setDpadState(p => ({ ...p, left: true }))}
                  onTouchEnd={() => setDpadState(p => ({ ...p, left: false }))}
                  className={`dpad-btn dpad-left ${dpadState.left ? 'active-pressed' : ''}`}
                  aria-label="D-Pad Left"
                >
                  ◀
                </button>

                {/* D-Pad Center Pivot */}
                <div className="dpad-center-pivot" />

                {/* D-Pad Right */}
                <button
                  type="button"
                  onMouseDown={() => setDpadState(p => ({ ...p, right: true }))}
                  onMouseUp={() => setDpadState(p => ({ ...p, right: false }))}
                  onTouchStart={() => setDpadState(p => ({ ...p, right: true }))}
                  onTouchEnd={() => setDpadState(p => ({ ...p, right: false }))}
                  className={`dpad-btn dpad-right ${dpadState.right ? 'active-pressed' : ''}`}
                  aria-label="D-Pad Right"
                >
                  ▶
                </button>

                {/* D-Pad Down */}
                <button
                  type="button"
                  onMouseDown={() => setDpadState(p => ({ ...p, down: true }))}
                  onMouseUp={() => setDpadState(p => ({ ...p, down: false }))}
                  onTouchStart={() => setDpadState(p => ({ ...p, down: true }))}
                  onTouchEnd={() => setDpadState(p => ({ ...p, down: false }))}
                  className={`dpad-btn dpad-down ${dpadState.down ? 'active-pressed' : ''}`}
                  aria-label="D-Pad Down"
                >
                  ▼
                </button>
              </div>

              <div className="dpad-legend">D-PAD // WASD</div>
            </div>

            {/* CENTER: WIDESCREEN LCD DISPLAY BEZEL */}
            <div className="gba-center-screen-unit">
              <div className="gba-screen-glass-lens">
                <div className="gba-glass-glare-strip" />
                
                {/* LCD Content Display */}
                <div className="gba-lcd-monitor">
                  {activeCartridge === 'menu' && (
                    <GbaCartridgeMenu 
                      onSelectGame={handleSelectGame}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'dino' && (
                    <CyberDinoGame 
                      onExit={() => setActiveCartridge('menu')}
                      onOpenLeaderboard={() => setActiveCartridge('leaderboard')}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'stark' && (
                    <StarkFlightGame 
                      onExit={() => setActiveCartridge('menu')}
                      onOpenLeaderboard={() => setActiveCartridge('leaderboard')}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'shield' && (
                    <ShieldBreakerGame 
                      onExit={() => setActiveCartridge('menu')}
                      onOpenLeaderboard={() => setActiveCartridge('leaderboard')}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'snake' && (
                    <MatrixSnakeGame 
                      onExit={() => setActiveCartridge('menu')}
                      onOpenLeaderboard={() => setActiveCartridge('leaderboard')}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'leaderboard' && (
                    <GbaLeaderboardScreen 
                      onExit={() => setActiveCartridge('menu')}
                      onSelectGame={handleSelectGame}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                    />
                  )}

                  {activeCartridge === 'thor' && (
                    <ThorForgeGame 
                      onExit={() => setActiveCartridge('menu')}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                      startTrigger={startTrigger}
                    />
                  )}

                  {activeCartridge === 'terminal' && (
                    <GbaShellTerminal 
                      onSelectGame={handleSelectGame}
                      onTriggerEasterEgg={onTriggerEasterEgg}
                      onSelectSquad={onSelectSquad}
                      onClose={onClose}
                      dpadState={dpadState}
                      buttonA={buttonA}
                      buttonB={buttonB}
                    />
                  )}
                </div>
              </div>

              {/* Bottom Bezel Sub-Logo */}
              <div className="gba-lens-subline">
                <span>COMMUNITY RECREATION UNIT</span>
                <span className="dot-sep">•</span>
                <span>WIDE COLOR LCD</span>
              </div>
            </div>

            {/* RIGHT CONTROLS: A & B SLANTED PILL BUTTONS */}
            <div className="gba-right-controls">
              <div className="action-buttons-cluster">
                {/* Button B */}
                <div className="action-button-slot slot-b">
                  <button
                    type="button"
                    onMouseDown={() => setButtonB(true)}
                    onMouseUp={() => setButtonB(false)}
                    onTouchStart={() => setButtonB(true)}
                    onTouchEnd={() => setButtonB(false)}
                    className={`gba-round-btn btn-b ${buttonB ? 'active-pressed' : ''}`}
                    aria-label="Button B: Back / Exit"
                  >
                    B
                  </button>
                  <span className="btn-sub-label">[X / ESC]</span>
                </div>

                {/* Button A */}
                <div className="action-button-slot slot-a">
                  <button
                    type="button"
                    onMouseDown={() => setButtonA(true)}
                    onMouseUp={() => setButtonA(false)}
                    onTouchStart={() => setButtonA(true)}
                    onTouchEnd={() => setButtonA(false)}
                    className={`gba-round-btn btn-a ${buttonA ? 'active-pressed' : ''}`}
                    aria-label="Button A: Action / Jump / Select"
                  >
                    A
                  </button>
                  <span className="btn-sub-label">[Z / SPACE]</span>
                </div>
              </div>

              {/* Speaker Grille Holes */}
              <div className="gba-speaker-holes" aria-hidden="true">
                <div className="hole" /><div className="hole" /><div className="hole" />
                <div className="hole" /><div className="hole" /><div className="hole" />
              </div>
            </div>

          </div>

          {/* Bottom Console Deck: SELECT and START buttons */}
          <div className="gba-bottom-deck">
            <div className="gba-meta-buttons">
              <div className="meta-btn-item">
                <button
                  type="button"
                  onClick={() => {
                    playGbaBip();
                    setActiveCartridge(prev => (prev === 'terminal' ? 'menu' : 'terminal'));
                  }}
                  className="gba-pill-meta-btn"
                  title="SELECT: Toggle CLI Shell"
                >
                  SELECT
                </button>
                <span className="meta-subtext">[CLI / SHIFT]</span>
              </div>

              <div className="meta-btn-item">
                <button
                  type="button"
                  onClick={() => {
                    playGbaBip();
                    setStartTrigger(prev => prev + 1);
                  }}
                  className="gba-pill-meta-btn"
                  title="START: Play / Pause"
                >
                  START
                </button>
                <span className="meta-subtext">[PAUSE / ENTER]</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .gba-console-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(4, 6, 12, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          user-select: none;
        }

        .gba-console-outer-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 960px;
          transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gba-console-outer-wrap.is-maximized {
          max-width: 1140px;
        }

        /* Top L/R Shoulder Triggers */
        .gba-top-shoulder-bar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 92%;
          margin-bottom: -4px;
          z-index: 2;
          gap: 6px;
        }

        .gba-shoulder-btn {
          background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          padding: 6px 18px 8px 18px;
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
        }

        .gba-shoulder-btn:hover {
          color: #ffffff;
          background: linear-gradient(180deg, #475569 0%, #334155 100%);
        }

        .gba-shoulder-leaderboard {
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.35);
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 16px 8px 16px;
        }

        .gba-shoulder-leaderboard:hover,
        .gba-shoulder-leaderboard.active-lb {
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
          color: #040906;
          border-color: #fbbf24;
          font-weight: 900;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
        }

        .gba-cartridge-slot-ridge {
          padding: 4px 18px;
          background: #0f131f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }

        .cart-slot-label {
          font-family: monospace;
          font-size: 0.62rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.1em;
        }

        /* Sculpted Handheld Hardware Body */
        .gba-hardware-chassis {
          width: 100%;
          background: linear-gradient(145deg, #161a29 0%, #0d101a 100%);
          border: 2px solid rgba(255, 255, 255, 0.18);
          border-radius: 36px;
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.95), 
            0 0 45px rgba(0, 240, 255, 0.18),
            inset 0 2px 4px rgba(255, 255, 255, 0.15);
          padding: 20px 28px 18px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        /* Top Bezel Utility Strip */
        .gba-bezel-top-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
        }

        .gba-power-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .power-led-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
        }

        .power-text {
          font-family: monospace;
          font-size: 0.68rem;
          font-weight: 900;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }

        .gba-hardware-brand {
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-family: var(--font-display, 'Space Grotesk', sans-serif);
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .brand-cook {
          color: #ffffff;
          font-size: 0.95rem;
        }

        .brand-advance {
          color: #f59e0b;
          font-style: italic;
          font-size: 1.05rem;
          letter-spacing: 0.02em;
        }

        .brand-sp {
          font-size: 0.72rem;
          color: #38bdf8;
          border: 1px solid #38bdf8;
          padding: 0 4px;
          border-radius: 4px;
        }

        .gba-console-zoom-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gba-console-zoom-btn:hover {
          background: rgba(0, 240, 255, 0.2);
          color: #00f0ff;
          border-color: #00f0ff;
          transform: scale(1.08);
        }

        .gba-console-close-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gba-console-close-btn:hover {
          background: rgba(239, 68, 68, 0.8);
          color: #ffffff;
          border-color: #ef4444;
          transform: scale(1.1);
        }

        /* Controls & Screen Horizontal Layout */
        .gba-controls-and-screen-grid {
          display: grid;
          grid-template-columns: 125px 1fr 125px;
          align-items: center;
          gap: 16px;
        }

        /* LEFT CONTROLS: D-PAD */
        .gba-left-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .dpad-mount {
          position: relative;
          width: 106px;
          height: 106px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dpad-btn {
          position: absolute;
          background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #64748b;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
          transition: all 0.1s ease;
        }

        .dpad-btn:hover {
          color: #ffffff;
          background: #334155;
        }

        .dpad-btn.active-pressed {
          background: #38bdf8;
          color: #040711;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.7);
        }

        .dpad-up {
          top: 0;
          width: 34px;
          height: 38px;
          border-radius: 8px 8px 0 0;
        }
        .dpad-down {
          bottom: 0;
          width: 34px;
          height: 38px;
          border-radius: 0 0 8px 8px;
        }
        .dpad-left {
          left: 0;
          width: 38px;
          height: 34px;
          border-radius: 8px 0 0 8px;
        }
        .dpad-right {
          right: 0;
          width: 38px;
          height: 34px;
          border-radius: 0 8px 8px 0;
        }

        .dpad-center-pivot {
          width: 34px;
          height: 34px;
          background: #0f172a;
          border-radius: 50%;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.9);
          z-index: 1;
        }

        .dpad-legend {
          font-family: monospace;
          font-size: 0.62rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        /* CENTER: RETRO LCD BEZEL */
        .gba-center-screen-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .gba-screen-glass-lens {
          position: relative;
          background: #000000;
          border: 4px solid #334155;
          border-radius: 14px;
          box-shadow: 
            inset 0 0 24px rgba(0, 240, 255, 0.22), 
            0 12px 36px rgba(0, 0, 0, 0.95),
            0 0 0 1px rgba(255, 255, 255, 0.12);
          overflow: hidden;
          width: 100%;
          max-width: 620px;
          aspect-ratio: 3 / 2;
          transition: max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gba-console-outer-wrap.is-maximized .gba-screen-glass-lens {
          max-width: 800px;
        }

        .gba-glass-glare-strip {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 14%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, transparent 100%);
          pointer-events: none;
          z-index: 5;
        }

        .gba-lcd-monitor {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .gba-game-screen-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
        }

        .gba-game-canvas {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }

        .gba-lens-subline {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          font-family: monospace;
          font-size: 0.6rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .dot-sep {
          color: #f59e0b;
        }

        /* RIGHT CONTROLS: ACTION BUTTONS (A / B) */
        .gba-right-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .action-buttons-cluster {
          position: relative;
          width: 110px;
          height: 85px;
        }

        .action-button-slot {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .slot-b {
          left: 4px;
          bottom: 0px;
        }

        .slot-a {
          right: 4px;
          top: 0px;
        }

        .gba-round-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-family: monospace;
          font-size: 1.1rem;
          font-weight: 900;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.7);
          transition: all 0.1s ease;
        }

        .btn-b {
          background: linear-gradient(145deg, #ef4444 0%, #b91c1c 100%);
        }
        .btn-b:hover {
          filter: brightness(1.15);
        }
        .btn-b.active-pressed {
          transform: translateY(2px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
          background: #dc2626;
        }

        .btn-a {
          background: linear-gradient(145deg, #00f0ff 0%, #0284c7 100%);
          color: #040711;
        }
        .btn-a:hover {
          filter: brightness(1.15);
        }
        .btn-a.active-pressed {
          transform: translateY(2px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
          background: #38bdf8;
        }

        .btn-sub-label {
          font-family: monospace;
          font-size: 0.58rem;
          font-weight: 800;
          color: #64748b;
        }

        .gba-speaker-holes {
          display: grid;
          grid-template-columns: repeat(3, 4px);
          gap: 4px;
          transform: rotate(20deg);
        }

        .gba-speaker-holes .hole {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #080c17;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.9);
        }

        /* Bottom Deck: START & SELECT */
        .gba-bottom-deck {
          display: flex;
          justify-content: center;
          margin-top: 4px;
        }

        .gba-meta-buttons {
          display: flex;
          gap: 28px;
        }

        .meta-btn-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .gba-pill-meta-btn {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 12px;
          transform: rotate(-22deg);
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        }

        .gba-pill-meta-btn:hover {
          background: #334155;
          color: #ffffff;
        }

        .meta-subtext {
          font-family: monospace;
          font-size: 0.55rem;
          color: #64748b;
          font-weight: 700;
        }

        /* Mobile Adaptations */
        @media (max-width: 768px) {
          .gba-hardware-chassis {
            padding: 14px 12px;
            border-radius: 24px;
          }

          .gba-controls-and-screen-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .gba-left-controls,
          .gba-right-controls {
            flex-direction: row;
            justify-content: space-around;
            width: 100%;
          }

          .action-buttons-cluster {
            height: 60px;
          }
          .gba-round-btn {
            width: 38px;
            height: 38px;
          }
          .dpad-mount {
            width: 86px;
            height: 86px;
          }
          .dpad-up, .dpad-down {
            width: 28px;
            height: 32px;
          }
          .dpad-left, .dpad-right {
            width: 32px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}

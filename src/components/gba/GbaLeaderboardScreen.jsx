import React, { useState, useEffect, useMemo } from 'react';
import { getLeaderboard } from '../../services/arcadeLeaderboardService';
import { playGbaBip, playGbaBoot } from './GbaAudio';

const TABS = [
  { id: 'all', label: 'ALL GAMES', icon: '🏆' },
  { id: 'dino', label: 'CYBER DINO', icon: '🦖' },
  { id: 'stark', label: 'STARK FLIGHT', icon: '🚀' },
  { id: 'shield', label: 'SHIELD BRK', icon: '🛡️' },
  { id: 'snake', label: 'MATRIX SNAKE', icon: '🐍' }
];

export default function GbaLeaderboardScreen({ onExit, onSelectGame, dpadState, buttonA, buttonB }) {
  const [activeTab, setActiveTab] = useState('all');
  const [scrollIndex, setScrollIndex] = useState(0);

  const leaderboard = useMemo(() => {
    return getLeaderboard(activeTab);
  }, [activeTab]);

  // Handle D-Pad left/right for tabs
  useEffect(() => {
    if (dpadState.left) {
      playGbaBip();
      setActiveTab(prev => {
        const curIdx = TABS.findIndex(t => t.id === prev);
        const nextIdx = (curIdx - 1 + TABS.length) % TABS.length;
        return TABS[nextIdx].id;
      });
      setScrollIndex(0);
    } else if (dpadState.right) {
      playGbaBip();
      setActiveTab(prev => {
        const curIdx = TABS.findIndex(t => t.id === prev);
        const nextIdx = (curIdx + 1) % TABS.length;
        return TABS[nextIdx].id;
      });
      setScrollIndex(0);
    }
  }, [dpadState.left, dpadState.right]);

  // Handle D-Pad up/down for scrolling
  useEffect(() => {
    if (dpadState.up) {
      setScrollIndex(prev => Math.max(0, prev - 1));
    } else if (dpadState.down) {
      setScrollIndex(prev => Math.min(Math.max(0, leaderboard.length - 6), prev + 1));
    }
  }, [dpadState.up, dpadState.down, leaderboard.length]);

  // Button B to return to menu
  useEffect(() => {
    if (buttonB) {
      if (onExit) onExit();
    }
  }, [buttonB, onExit]);

  // Button A to launch selected game if tab is a specific game
  useEffect(() => {
    if (buttonA && activeTab !== 'all' && onSelectGame) {
      playGbaBoot();
      onSelectGame(activeTab);
    }
  }, [buttonA, activeTab, onSelectGame]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        playGbaBip();
        setActiveTab(prev => {
          const curIdx = TABS.findIndex(t => t.id === prev);
          const nextIdx = (curIdx - 1 + TABS.length) % TABS.length;
          return TABS[nextIdx].id;
        });
        setScrollIndex(0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        playGbaBip();
        setActiveTab(prev => {
          const curIdx = TABS.findIndex(t => t.id === prev);
          const nextIdx = (curIdx + 1) % TABS.length;
          return TABS[nextIdx].id;
        });
        setScrollIndex(0);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setScrollIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setScrollIndex(prev => Math.min(Math.max(0, leaderboard.length - 6), prev + 1));
      } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X') {
        if (onExit) onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit, leaderboard.length]);

  const visibleEntries = leaderboard.slice(scrollIndex, scrollIndex + 6);

  return (
    <div className="gba-leaderboard-screen select-none">
      {/* Top Header */}
      <div className="lb-header">
        <div className="lb-title">
          <span className="trophy-pulse">🏆</span>
          <span>LEADERBOARD</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="lb-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              playGbaBip();
              setActiveTab(tab.id);
              setScrollIndex(0);
            }}
            className={`lb-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span className="tab-name">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="lb-table-container">
        <div className="lb-table-header">
          <span className="col-rank">#</span>
          <span className="col-player">CALLSIGN</span>
          <span className="col-squad">SQUAD</span>
          <span className="col-game">GAME</span>
          <span className="col-score">SCORE</span>
        </div>

        <div className="lb-rows-wrap">
          {visibleEntries.length === 0 ? (
            <div className="lb-empty-msg">No high scores recorded yet. Be the first!</div>
          ) : (
            visibleEntries.map((item, idx) => {
              const actualRank = scrollIndex + idx + 1;
              const isGold = actualRank === 1;
              const isSilver = actualRank === 2;
              const isBronze = actualRank === 3;

              return (
                <div 
                  key={item.id} 
                  className={`lb-row ${isGold ? 'row-gold' : isSilver ? 'row-silver' : isBronze ? 'row-bronze' : ''}`}
                >
                  <span className="col-rank">
                    {isGold ? '🥇 1' : isSilver ? '🥈 2' : isBronze ? '🥉 3' : `#${actualRank}`}
                  </span>
                  <span className="col-player" title={item.fullName || item.callsign}>
                    {item.callsign}
                  </span>
                  <span className="col-squad">
                    <span className={`squad-pill squad-${item.squad || 'ironman'}`}>
                      {(item.squad || 'CORE').toUpperCase().slice(0, 7)}
                    </span>
                  </span>
                  <span className="col-game">
                    {item.gameId === 'dino' ? '🦖 DINO' : item.gameId === 'stark' ? '🚀 STARK' : item.gameId === 'shield' ? '🛡️ SHIELD' : '🐍 SNAKE'}
                  </span>
                  <span className="col-score">
                    {String(item.score).padStart(5, '0')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Strip */}
      <div className="lb-footer">
        <div className="lb-action-hint">
          {activeTab !== 'all' ? (
            <span>[A] PLAY {TABS.find(t => t.id === activeTab)?.label}</span>
          ) : (
            <span />
          )}
        </div>
        <button onClick={onExit} className="lb-back-btn">
          [B] BACK
        </button>
      </div>

      <style>{`
        .gba-leaderboard-screen {
          width: 100%;
          height: 100%;
          background: #040711;
          color: #f8fafc;
          font-family: monospace;
          display: flex;
          flex-direction: column;
          padding: 8px 12px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }

        .lb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 240, 255, 0.25);
          padding-bottom: 5px;
          margin-bottom: 6px;
        }

        .lb-title {
          font-size: 0.76rem;
          font-weight: 900;
          color: #00f0ff;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.04em;
        }

        .trophy-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }

        .lb-hint {
          font-size: 0.58rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .lb-tabs-bar {
          display: flex;
          gap: 4px;
          margin-bottom: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .lb-tabs-bar::-webkit-scrollbar {
          display: none;
        }

        .lb-tab-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-family: inherit;
          font-size: 0.58rem;
          font-weight: 800;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .lb-tab-btn:hover {
          background: rgba(0, 240, 255, 0.15);
          color: #ffffff;
        }

        .lb-tab-btn.active {
          background: #00f0ff;
          color: #040906;
          border-color: #00f0ff;
          font-weight: 900;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
        }

        .lb-table-container {
          flex: 1;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .lb-table-header {
          display: grid;
          grid-template-columns: 36px 75px 65px 65px 1fr;
          font-size: 0.58rem;
          font-weight: 900;
          color: #64748b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 3px;
          margin-bottom: 3px;
        }

        .lb-rows-wrap {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .lb-row {
          display: grid;
          grid-template-columns: 36px 75px 65px 65px 1fr;
          align-items: center;
          font-size: 0.64rem;
          padding: 2px 0;
          border-radius: 3px;
        }

        .row-gold {
          background: rgba(251, 191, 36, 0.12);
          color: #fef08a;
          font-weight: 800;
        }

        .row-silver {
          background: rgba(226, 232, 240, 0.1);
          color: #f1f5f9;
          font-weight: 700;
        }

        .row-bronze {
          background: rgba(217, 119, 6, 0.1);
          color: #fcd34d;
        }

        .col-rank {
          font-weight: 900;
        }

        .col-player {
          font-weight: 800;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .col-score {
          text-align: right;
          font-weight: 900;
          color: #00f0ff;
        }

        .squad-pill {
          font-size: 0.5rem;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 900;
          display: inline-block;
        }

        .squad-ironman { background: rgba(239, 68, 68, 0.25); color: #fca5a5; }
        .squad-captain { background: rgba(56, 189, 248, 0.25); color: #7dd3fc; }
        .squad-hulk { background: rgba(34, 197, 94, 0.25); color: #86efac; }
        .squad-thor { background: rgba(245, 158, 11, 0.25); color: #fde68a; }
        .squad-tech { background: rgba(168, 85, 247, 0.25); color: #d8b4fe; }
        .squad-pr { background: rgba(236, 72, 153, 0.25); color: #f472b6; }

        .lb-empty-msg {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          color: #64748b;
        }

        .lb-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 6px;
          padding-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.58rem;
        }

        .lb-action-hint {
          color: #00f0ff;
          font-weight: 800;
        }

        .lb-back-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          font-weight: 800;
        }
        .lb-back-btn:hover {
          color: #ffffff;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { playGbaBip } from './GbaAudio';
import { 
  playTechClick, 
  playAssembleFanfare, 
  playRepulsorSound, 
  playVibraniumPing, 
  playThunderStrike 
} from '../../utils/soundEngine';

const GBA_COMMANDS_HELP = [
  { cmd: 'games', desc: 'Exit to GBA Cartridge Selector Menu' },
  { cmd: 'play <1-4>', desc: 'Launch: 1=Dino, 2=Stark, 3=Shield, 4=Snake' },
  { cmd: 'help', desc: 'List all operational directives' },
  { cmd: 'squad <id>', desc: 'Deploy squad theme: ironman, captain, thor, hulk' },
  { cmd: 'assemble', desc: 'Execute Avengers protocol + orchestral fanfare' },
  { cmd: 'whoami', desc: 'Inspect current builder clearance & tier' },
  { cmd: 'verify <id>', desc: 'Verify certificate credential hash' },
  { cmd: 'lore', desc: 'The Foundry / Let\'s Cook founding philosophy' },
  { cmd: 'clear', desc: 'Flush screen buffer' },
  { cmd: 'exit', desc: 'Close console' }
];

export default function GbaShellTerminal({ 
  onSelectGame, 
  onTriggerEasterEgg, 
  onSelectSquad, 
  onClose,
  dpadState,
  buttonA,
  buttonB
}) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { 
      type: 'head', 
      text: 'LET\'S COOK ADVANCE // S.H.I.E.L.D. OS v3.2\n' +
            '=================================================\n' +
            'GBA EMBEDDED CYBER CLI READY. TYPE "help" OR "games".'
    }
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIndex, setCmdIndex] = useState(-1);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    playGbaBip();

    setCmdHistory(prev => [...prev, trimmed]);
    setCmdIndex(-1);

    const newHistory = [...history, { type: 'user', text: `> ${trimmed}` }];
    const cmd = trimmed.toLowerCase();

    if (cmd === 'help') {
      newHistory.push({
        type: 'sys',
        text: 'COMMAND DIRECTIVES:\n' + GBA_COMMANDS_HELP.map(c => `  ${c.cmd.padEnd(12)} - ${c.desc}`).join('\n')
      });
    } else if (cmd === 'games' || cmd === 'menu') {
      onSelectGame('menu');
      return;
    } else if (cmd === 'play 1' || cmd === 'dino' || cmd === 'play dino') {
      onSelectGame('dino');
      return;
    } else if (cmd === 'play 2' || cmd === 'stark' || cmd === 'play stark') {
      onSelectGame('stark');
      return;
    } else if (cmd === 'play 3' || cmd === 'shield' || cmd === 'play shield') {
      onSelectGame('shield');
      return;
    } else if (cmd === 'play 4' || cmd === 'snake' || cmd === 'play snake') {
      onSelectGame('snake');
      return;
    } else if (cmd === 'play 5' || cmd === 'thor') {
      onSelectGame('thor');
      return;
    } else if (cmd === 'assemble') {
      playAssembleFanfare();
      if (onTriggerEasterEgg) onTriggerEasterEgg('assemble');
      newHistory.push({ type: 'accent', text: '"AVENGERS... ASSEMBLE!" Full initiative active.' });
    } else if (cmd === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (cmd.startsWith('squad ')) {
      const sq = cmd.replace('squad ', '').trim();
      if (['ironman', 'captain', 'thor', 'hulk', 'tech', 'pr', 'events', 'design'].includes(sq)) {
        const mapped = sq === 'tech' ? 'ironman' : sq === 'pr' ? 'captain' : sq === 'events' ? 'thor' : sq === 'design' ? 'hulk' : sq;
        if (onSelectSquad) onSelectSquad(mapped);
        newHistory.push({ type: 'accent', text: `Synchronized global squad theme to: ${mapped.toUpperCase()}` });
      } else {
        newHistory.push({ type: 'err', text: 'Unknown squad. Valid options: ironman, captain, thor, hulk' });
      }
    } else if (cmd === 'whoami') {
      const userRaw = localStorage.getItem('letscook_portal_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          newHistory.push({
            type: 'sys',
            text: `CALLSIGN: ${user.fullName || 'Builder'}\nEMAIL: ${user.email}\nSQUAD: ${(user.targetSquad || 'ironman').toUpperCase()}\nCLEARANCE: ${user.role || 'Member'}`
          });
        } catch {
          newHistory.push({ type: 'sys', text: 'GUEST BUILDER // Public Terminal Clearance' });
        }
      } else {
        newHistory.push({ type: 'sys', text: 'GUEST BUILDER // Public Clearance. Login at /portal.' });
      }
    } else if (cmd === 'lore') {
      newHistory.push({
        type: 'sys',
        text: 'LET\'S COOK (THE FOUNDRY):\nStop watching tutorials. Start shipping code. A student-led collective building production software, hackathon MVPs, and community open-source.'
      });
    } else if (cmd === 'exit') {
      if (onClose) onClose();
      return;
    } else {
      newHistory.push({
        type: 'err',
        text: `Command not recognized: "${trimmed}". Type "help" or "games".`
      });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = cmdIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1);
        setCmdIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex !== -1) {
        const nextIdx = cmdIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setCmdIndex(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        } else {
          setCmdIndex(-1);
          setInputVal('');
        }
      }
    }
  };

  return (
    <div className="gba-terminal-screen animate-fade-in" onClick={() => inputRef.current?.focus()}>
      <div className="gba-terminal-output">
        {history.map((line, idx) => (
          <div key={idx} className={`gba-term-line line-${line.type}`}>
            <pre>{line.text}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="gba-terminal-input-row">
        <span className="gba-term-prompt">&gt;</span>
        <input 
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="gba-term-input"
          placeholder="Type command..."
          autoFocus
          spellCheck={false}
        />
        <button 
          onClick={() => handleCommand(inputVal)}
          className="gba-term-send-btn"
        >
          RUN
        </button>
      </div>

      {/* Quick Command Chips */}
      <div className="gba-term-chips">
        {['dino', 'games', 'help', 'assemble', 'whoami', 'clear'].map(c => (
          <button 
            key={c}
            onClick={() => handleCommand(c)}
            className="gba-chip-btn"
          >
            {c}
          </button>
        ))}
      </div>

      <style>{`
        .gba-terminal-screen {
          width: 100%;
          height: 100%;
          background: #040906;
          color: #22c55e;
          font-family: monospace;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          font-size: 0.72rem;
          line-height: 1.35;
          position: relative;
        }

        .gba-terminal-output {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 8px;
          padding-right: 4px;
        }

        .gba-terminal-output::-webkit-scrollbar {
          width: 4px;
        }
        .gba-terminal-output::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 2px;
        }

        .gba-term-line pre {
          margin: 0 0 4px 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: inherit;
        }

        .line-head {
          color: #4ade80;
          font-weight: 800;
        }
        .line-user {
          color: #ffffff;
          font-weight: 700;
        }
        .line-accent {
          color: #00f0ff;
        }
        .line-err {
          color: #f87171;
        }
        .line-sys {
          color: #86efac;
        }

        .gba-terminal-input-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 6px;
          padding: 2px 6px;
          margin-bottom: 6px;
        }

        .gba-term-prompt {
          color: #4ade80;
          font-weight: 800;
        }

        .gba-term-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #ffffff;
          font-family: inherit;
          font-size: 0.72rem;
          outline: none;
        }

        .gba-term-send-btn {
          background: #22c55e;
          color: #040906;
          border: none;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .gba-term-chips {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }

        .gba-chip-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #86efac;
          font-family: inherit;
          font-size: 0.62rem;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }
        .gba-chip-btn:hover {
          background: rgba(34, 197, 94, 0.2);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}

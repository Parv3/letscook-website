import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2, Send, CornerDownLeft } from 'lucide-react';
import { playTechClick, playNeonIgniteSound, playDecodeTick } from '../utils/soundEngine';

const COMMANDS_HELP = [
  { cmd: 'help', desc: 'Display list of available commands' },
  { cmd: 'squad <id>', desc: 'Deploy squad theme: tech, pr, events, core' },
  { cmd: 'projects', desc: 'List active open-source project initiatives' },
  { cmd: 'stack', desc: 'Output community core engineering stack' },
  { cmd: 'lore', desc: 'The origins and philosophy of Let\'s Cook' },
  { cmd: 'pitch', desc: 'Launch project proposal transmission terminal' },
  { cmd: 'whoami', desc: 'Display your current builder clearance tier' },
  { cmd: 'snap', desc: 'Execute the Decimation (Thanos snap with Time Stone reversal)' },
  { cmd: 'bifrost', desc: 'Summon the Rainbow Bridge from Asgard' },
  { cmd: 'jarvis', desc: 'Engage Stark Mark LXXXV Nanotech HUD' },
  { cmd: 'worthy', desc: 'Attempt to wield Mjolnir' },
  { cmd: 'assemble', desc: 'Broadcast priority Avengers Initiative beacon' },
  { cmd: 'clear', desc: 'Flush current terminal buffer' },
  { cmd: 'sudo cook', desc: 'Trigger community hardware overdrive' },
];

export default function TerminalDrawer({ 
  isOpen, 
  onClose, 
  onOpenPitchModal, 
  theme, 
  onToggleTheme,
  onTriggerEasterEgg,
  onSelectSquad
}) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { type: 'sys', text: 'LET\'S COOK S.H.I.E.L.D. SHELL v3.0.0 [x86_64-avengers-kernel]' },
    { type: 'sys', text: 'Type "help" to display operational directives or "squad tech" to deploy Stark Labs.' },
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (rawCmd) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    playTechClick();
    setCmdHistory(prev => [...prev, trimmed]);
    setCmdHistoryIdx(-1);

    const newHistory = [...history, { type: 'user', text: trimmed }];
    const cmdLower = trimmed.toLowerCase();

    if (cmdLower === 'help') {
      newHistory.push({
        type: 'sys',
        text: 'AVAILABLE DIRECTIVES:\n' + COMMANDS_HELP.map(c => `  ${c.cmd.padEnd(14)} - ${c.desc}`).join('\n')
      });
    } else if (cmdLower.startsWith('squad')) {
      const parts = cmdLower.split(' ');
      const target = parts[1];
      if (target === 'tech' || target === 'ironman' || target === 'stark') {
        if (onSelectSquad) onSelectSquad('ironman');
        newHistory.push({ type: 'accent', text: '🔴 STARK TECH LABS DEPLOYED // Arc Reactor Online' });
      } else if (target === 'pr' || target === 'cap' || target === 'captain' || target === 'vibranium') {
        if (onSelectSquad) onSelectSquad('captain');
        newHistory.push({ type: 'accent', text: '🔵 VIBRANIUM ALLIANCE DEPLOYED // Shield Sonar Online' });
      } else if (target === 'events' || target === 'event' || target === 'thor' || target === 'mjolnir') {
        if (onSelectSquad) onSelectSquad('thor');
        newHistory.push({ type: 'accent', text: '🟡 MJOLNIR OPS DEPLOYED // Asgardian Lightning Charged' });
      } else if (target === 'core' || target === 'shield' || target === 'foundry') {
        if (onSelectSquad) onSelectSquad('core');
        newHistory.push({ type: 'accent', text: '🟣 FOUNDRY COMMAND DEPLOYED // Quantum Singularity Synchronized' });
      } else {
        newHistory.push({ type: 'error', text: 'Usage: squad <tech | pr | events | core>' });
      }
    } else if (cmdLower === 'snap' || cmdLower === 'thanos') {
      newHistory.push({ type: 'accent', text: '💀 "Dread it. Run from it. Destiny arrives all the same." [Executing Decimation...]' });
      if (onTriggerEasterEgg) onTriggerEasterEgg('snap');
      onClose();
    } else if (cmdLower === 'bifrost' || cmdLower === 'heimdall') {
      newHistory.push({ type: 'accent', text: '🌈 "Heimdall, open the Bifrost!" [Cosmic Gateway Incoming...]' });
      if (onTriggerEasterEgg) onTriggerEasterEgg('bifrost');
      onClose();
    } else if (cmdLower === 'jarvis' || cmdLower === 'friday' || cmdLower === 'ironman') {
      newHistory.push({ type: 'accent', text: '🤖 "Welcome home, sir. Nanotech flight systems initialized."' });
      if (onTriggerEasterEgg) onTriggerEasterEgg('jarvis');
      onClose();
    } else if (cmdLower === 'worthy' || cmdLower === 'mjolnir' || cmdLower === 'thor') {
      newHistory.push({ type: 'accent', text: '⚡ "Whosoever holds this hammer, if they be worthy, shall possess the power of Thor."' });
      if (onTriggerEasterEgg) onTriggerEasterEgg('worthy');
      onClose();
    } else if (cmdLower === 'assemble' || cmdLower === 'avengers') {
      newHistory.push({ type: 'accent', text: '🛡️ "AVENGERS... ASSEMBLE!" [Initiative Priority Signal Broadcasted]' });
      if (onTriggerEasterEgg) onTriggerEasterEgg('assemble');
      onClose();
    } else if (cmdLower === 'sprints' || cmdLower === 'projects' || cmdLower === 'initiatives') {
      newHistory.push({
        type: 'sys',
        text: 'ACTIVE INITIATIVES & CODE LABS:\n' +
          '  [01] SYSTEMS & RUNTIMES  - High-throughput tooling, micro-benchmarks & CLI\n' +
          '  [02] CAMPUSMESH P2P      - Decentralized peer-to-peer Wi-Fi network\n' +
          '  [03] NEUROPROMPT STUDIO  - Local model quantization & agent evaluation\n' +
          'Type "pitch" to propose a new architecture.'
      });
    } else if (cmdLower === 'stack') {
      newHistory.push({
        type: 'sys',
        text: 'PRIMARY SYSTEM ARSENAL:\n' +
          '  Languages: Rust, Go, Python, TypeScript, C++\n' +
          '  Frameworks: FastAPI, Next.js, Tokio, PyTorch, React\n' +
          '  Infrastructure: Docker, WebAssembly, WebRTC, SQLite, Supabase'
      });
    } else if (cmdLower === 'lore') {
      newHistory.push({
        type: 'sys',
        text: 'LET\'S COOK PHILOSOPHY:\n' +
          '  "Codere, Aedificare, Vincere" — Code, Build, Conquer.\n' +
          '  We are a student-run technology collective rejecting bloated\n' +
          '  corporate frameworks in favor of lean, high-velocity engineering.'
      });
    } else if (cmdLower === 'pitch') {
      newHistory.push({ type: 'sys', text: 'Launching project proposal transmission interface...' });
      if (onOpenPitchModal) onOpenPitchModal();
      onClose();
    } else if (cmdLower === 'whoami') {
      newHistory.push({
        type: 'sys',
        text: 'CLEARANCE: S.H.I.E.L.D. LEVEL 7 // BUILDER TIER 01\nSTATUS: OPERATIONAL · ELIGIBLE FOR AVENGERS INITIATIVE'
      });
    } else if (cmdLower.startsWith('theme')) {
      if (onToggleTheme) onToggleTheme();
      newHistory.push({ type: 'sys', text: 'System theme toggled successfully.' });
    } else if (cmdLower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (cmdLower === 'sudo cook') {
      playNeonIgniteSound();
      newHistory.push({
        type: 'accent',
        text: '⚡ [OVERDRIVE ENGAGED] ALL CORES RUNNING AT MAXIMUM CLOCK FREQUENCY. LET\'S COOK!'
      });
    } else {
      newHistory.push({
        type: 'error',
        text: `zsh: command not found: ${trimmed}. Type "help" for available commands.`
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
      if (cmdHistory.length === 0) return;
      const nextIdx = cmdHistoryIdx === -1 ? cmdHistory.length - 1 : Math.max(0, cmdHistoryIdx - 1);
      setCmdHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistoryIdx === -1) return;
      const nextIdx = cmdHistoryIdx + 1;
      if (nextIdx >= cmdHistory.length) {
        setCmdHistoryIdx(-1);
        setInputVal('');
      } else {
        setCmdHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="terminal-drawer-overlay no-print" onClick={onClose}>
      <div className="terminal-drawer-window" onClick={(e) => e.stopPropagation()}>
        {/* Titlebar */}
        <div className="terminal-drawer-titlebar">
          <div className="titlebar-controls">
            <button onClick={onClose} className="win-btn red" title="Close Shell" />
            <button onClick={onClose} className="win-btn yellow" title="Minimize" />
            <button className="win-btn green" title="Maximize" />
          </div>

          <div className="titlebar-title">
            <TerminalIcon size={13} className="titlebar-icon" />
            <span>letscook-shell -- interactive zsh (Ctrl + ~)</span>
          </div>

          <button onClick={onClose} className="titlebar-close-btn" aria-label="Close">
            <X size={14} />
          </button>
        </div>

        {/* Output Area */}
        <div className="terminal-drawer-body">
          {history.map((line, idx) => (
            <div key={idx} className={`log-line ${line.type}`}>
              {line.type === 'user' ? (
                <span className="user-prompt">
                  <span className="prompt-at">builder@letscook</span>
                  <span className="prompt-sym">:~$</span> {line.text}
                </span>
              ) : (
                <pre className="sys-output">{line.text}</pre>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Row */}
        <div className="terminal-input-bar">
          <span className="input-prompt">builder@letscook:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type directive (e.g. 'help', 'projects', 'sudo cook')..."
            className="terminal-text-input"
            autoFocus
            spellCheck={false}
          />
          <button onClick={() => handleCommand(inputVal)} className="btn-term-send" title="Execute">
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .terminal-drawer-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          z-index: 5500;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          animation: fadeIn 0.2s ease forwards;
        }

        .terminal-drawer-window {
          width: 100%;
          max-width: 900px;
          height: 480px;
          background-color: #0c0c10;
          border: 1px solid var(--border-color);
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          animation: slideUpDrawer 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpDrawer {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .terminal-drawer-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background-color: #16161e;
          border-bottom: 1px solid #22222e;
          user-select: none;
        }

        .titlebar-controls {
          display: flex;
          gap: 7px;
        }

        .win-btn {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }

        .win-btn.red { background-color: #ff5f56; }
        .win-btn.yellow { background-color: #ffbd2e; }
        .win-btn.green { background-color: #27c93f; }

        .titlebar-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 0.76rem;
          color: #a1a1aa;
        }

        .titlebar-icon {
          color: var(--logo-accent-color, #ff2a6d);
        }

        .titlebar-close-btn {
          color: #71717a;
          background: none;
          border: none;
          cursor: pointer;
        }

        .titlebar-close-btn:hover {
          color: #ffffff;
        }

        .terminal-drawer-body {
          flex: 1;
          padding: 16px 20px;
          overflow-y: auto;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.84rem;
          line-height: 1.55;
          color: #f4f4f6;
          background-color: #0a0a0e;
        }

        .log-line {
          margin-bottom: 8px;
        }

        .log-line.user {
          color: #ffffff;
        }

        .user-prompt {
          font-weight: 600;
        }

        .prompt-at {
          color: #22c55e;
        }

        .prompt-sym {
          color: var(--logo-accent-color, #ff2a6d);
        }

        .sys-output {
          font-family: inherit;
          font-size: inherit;
          color: #a1a1aa;
          white-space: pre-wrap;
          margin: 0;
        }

        .log-line.accent .sys-output {
          color: var(--logo-accent-color, #ff2a6d);
          font-weight: 700;
        }

        .log-line.error .sys-output {
          color: #ef4444;
        }

        .terminal-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: #121218;
          border-top: 1px solid #22222e;
        }

        .input-prompt {
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: #22c55e;
          white-space: nowrap;
        }

        .terminal-text-input {
          flex: 1;
          background: none;
          border: none;
          color: #ffffff;
          font-family: monospace;
          font-size: 0.88rem;
          outline: none;
        }

        .btn-term-send {
          color: #a1a1aa;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .btn-term-send:hover {
          color: #ffffff;
        }

        @media (max-width: 600px) {
          .terminal-drawer-window {
            height: 70vh;
          }
          .input-prompt {
            display: none;
          }
          .terminal-text-input {
            font-size: 16px; /* Prevents iOS auto-zoom */
          }
        }
      `}</style>
    </div>
  );
}

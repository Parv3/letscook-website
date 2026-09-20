import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2, Send, CornerDownLeft } from 'lucide-react';
import { 
  playTechClick, 
  playNeonIgniteSound, 
  playDecodeTick,
  playAssembleFanfare,
  playRepulsorSound,
  playVibraniumPing,
  playThunderStrike
} from '../utils/soundEngine';

const COMMANDS_HELP = [
  { cmd: 'help', desc: 'Display list of available operational directives' },
  { cmd: 'assemble', desc: 'Initiate full Foundry Avengers protocol with heroic synthesizer chord' },
  { cmd: 'jarvis', desc: 'Display Stark Diagnostics telemetry status report & HUD' },
  { cmd: 'cap', desc: 'Steve Rogers\' code of conduct ("I can do this all day")' },
  { cmd: 'worthy', desc: 'Test terminal clearance against the Mjolnir worthiness oath' },
  { cmd: 'bifrost', desc: 'Teleport straight to the live community Discord via cosmic gate' },
  { cmd: 'snap', desc: 'Thanos Decimation dust disintegration with Doctor Strange Time Heist' },
  { cmd: 'shawarma', desc: 'Unlock secret post-sprint food break memo from Tony Stark' },
  { cmd: 'level7', desc: 'Access S.H.I.E.L.D. Director Nick Fury\'s confidential memo' },
  { cmd: 'squad <id>', desc: 'Deploy squad theme: tech, pr, events, core' },
  { cmd: 'projects', desc: 'List active open-source project initiatives' },
  { cmd: 'stack', desc: 'Output community core engineering stack' },
  { cmd: 'lore', desc: 'The origins and philosophy of Let\'s Cook' },
  { cmd: 'pitch', desc: 'Launch project proposal transmission terminal' },
  { cmd: 'whoami', desc: 'Display your current builder clearance tier' },
  { cmd: 'sudo cook', desc: 'Trigger community hardware overdrive' },
  { cmd: 'clear', desc: 'Flush current terminal buffer' },
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
    { type: 'sys', text: 'Type "help" to display operational directives or "assemble" to initiate Avengers protocol.' },
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
        text: 'AVAILABLE OPERATIONAL DIRECTIVES:\n' + COMMANDS_HELP.map(c => `  ${c.cmd.padEnd(14)} - ${c.desc}`).join('\n')
      });
    } 
    // 1. ASSEMBLE: Initiates the full Foundry Avengers protocol with a heroic synthesizer chord
    else if (cmdLower === 'assemble' || cmdLower === 'avengers') {
      playAssembleFanfare();
      newHistory.push({
        type: 'accent',
        text: '🛡️ "AVENGERS... ASSEMBLE!"\n' +
          '--------------------------------------------------\n' +
          'INITIATIVE DIRECTIVE: LEVEL 7 BROADCAST\n' +
          'Tri-Squad conduits unified: Tech, PR, and Events online.\n' +
          'Switching system telemetry to THE AVENGERS INITIATIVE (Foundry Command).\n' +
          '--------------------------------------------------\n' +
          '[STATUS: 100% SQUAD OVERDRIVE ENGAGED · MINIMIZING TERMINAL FOR CINEMATIC]'
      });
      if (onSelectSquad) onSelectSquad('core');
      if (onTriggerEasterEgg) onTriggerEasterEgg('assemble');
      onClose();
    }
    // 2. JARVIS / FRIDAY: Displays a Stark Diagnostics telemetry status report
    else if (cmdLower === 'jarvis' || cmdLower === 'friday' || cmdLower === 'stark') {
      playRepulsorSound();
      newHistory.push({
        type: 'accent',
        text: '🤖 MARK LXXXV // STARK DIAGNOSTICS & TELEMETRY REPORT\n' +
          '--------------------------------------------------\n' +
          '· F.R.I.D.A.Y. CORE RUNTIME  : NOMINAL (99.98% UPTIME)\n' +
          '· ARC REACTOR CORE           : 3.2 GIGAWATTS [100% OPERATIONAL]\n' +
          '· NANOTECH REPOSITORIES      : ARSENAL LEVEL 9 LOADED\n' +
          '· REPULSOR CAPACITORS        : CALIBRATED & FULLY CHARGED\n' +
          '· AVIONICS & FLIGHT ENGINES  : MACH 3 READY // STABILIZERS NOMINAL\n' +
          '· HEAD-UP DISPLAY (HUD)      : MARK LXXXV RETICLE TARGET LOCK\n' +
          '· STARK INDUSTRIES MOTTO     : "PROOF THAT TONY STARK HAS A HEART"\n' +
          '--------------------------------------------------\n' +
          '[STATUS: TACTICAL HUD ONLINE · MINIMIZING TERMINAL FOR CINEMATIC]'
      });
      if (onSelectSquad) onSelectSquad('ironman');
      if (onTriggerEasterEgg) onTriggerEasterEgg('jarvis');
      onClose();
    }
    // 3. CAP / STAMINA: Prints Steve Rogers' code of conduct ("I can do this all day") and launches shield ricochet
    else if (cmdLower === 'cap' || cmdLower === 'stamina' || cmdLower === 'rogers' || cmdLower === 'captain' || cmdLower === 'shield') {
      playVibraniumPing();
      newHistory.push({
        type: 'accent',
        text: '★ CAPTAIN AMERICA // STEVE ROGERS\' CODE OF CONDUCT (SSR-1941)\n' +
          '--------------------------------------------------\n' +
          '"I don\'t like bullies; I don\'t care where they\'re from."\n' +
          '"I can do this all day."\n\n' +
          'TACTICAL SPRINT PRINCIPLES:\n' +
          '[01] STAND FIRM        - Plant yourself like a tree when the world says move.\n' +
          '[02] NO BUILDER BEHIND - Every teammate crosses the deployment line together.\n' +
          '[03] INTEGRITY FIRST   - Real engineering strength is in character, not hype.\n' +
          '--------------------------------------------------\n' +
          'Clearance: Vibranium Alliance Tier 1 Active.\n' +
          'Vibranium shield ricochet deployed · MINIMIZING TERMINAL FOR CINEMATIC'
      });
      if (onSelectSquad) onSelectSquad('captain');
      if (onTriggerEasterEgg) onTriggerEasterEgg('shield');
      onClose();
    }
    // 4. THOR / WORTHY: Tests the user's terminal clearance against the Mjolnir worthiness oath
    else if (cmdLower === 'worthy' || cmdLower === 'mjolnir' || cmdLower === 'thor' || cmdLower === 'odinson') {
      playThunderStrike();
      newHistory.push({
        type: 'accent',
        text: '⚡ MJOLNIR WORTHINESS CLEARANCE PROTOCOL // REALM: ASGARD FORGE\n' +
          '--------------------------------------------------\n' +
          'OATH OF ODIN ALL-FATHER:\n' +
          '"Whosoever holds this hammer, if they be worthy,\n' +
          ' shall possess the power of Thor."\n\n' +
          'RUNNING TERMINAL CLEARANCE SCAN...\n' +
          '· BUILDER COMMIT INTEGRITY : [VERIFIED]\n' +
          '· OPEN SOURCE NOBILITY    : [VERIFIED]\n' +
          '· ZERO HUBRIS / HIGH GRIT  : [VERIFIED]\n' +
          '· ASGARDIAN LIGHTNING SYNC : [100% CHARGE]\n\n' +
          'RESULT: CLEARANCE GRANTED. YOU ARE DEEMED WORTHY!\n' +
          '--------------------------------------------------\n' +
          '⚡ Unleashing Asgardian lightning blast · MINIMIZING TERMINAL FOR CINEMATIC'
      });
      if (onSelectSquad) onSelectSquad('thor');
      if (onTriggerEasterEgg) onTriggerEasterEgg('worthy');
      onClose();
    }
    // 5. BIFROST: Teleports the user straight to the live community Discord
    else if (cmdLower === 'bifrost' || cmdLower === 'heimdall') {
      playThunderStrike();
      newHistory.push({
        type: 'accent',
        text: '🌈 ASGARDIAN BIFROST CONDUIT // HEIMDALL ACTIVATION\n' +
          '--------------------------------------------------\n' +
          'Heimdall aligns the cosmic observatory bridge...\n' +
          'Conduit Energy Surge: 1.21 Gigawatts.\n' +
          'Destination Coordinates: Let\'s Cook Community Discord Gateway.\n\n' +
          '⚡ TELEPORTING STRAIGHT TO LIVE COMMUNITY DISCORD...\n' +
          '--------------------------------------------------\n' +
          '[STATUS: COSMIC BEAM DISCHARGE · MINIMIZING TERMINAL FOR CINEMATIC]'
      });
      if (onSelectSquad) onSelectSquad('thor');
      if (onTriggerEasterEgg) onTriggerEasterEgg('bifrost');
      onClose();
    }
    // 6. THANOS / SNAP: Playfully dissolves terminal text before a "Time Heist" restores it
    else if (cmdLower === 'snap' || cmdLower === 'thanos') {
      playThunderStrike();
      newHistory.push({
        type: 'accent',
        text: '💀 "DREAD IT. RUN FROM IT. DESTINY ARRIVES ALL THE SAME."\n' +
          '--------------------------------------------------\n' +
          '[Snap registered]: Physical ash dust particles unleashed!\n' +
          'Disintegrating terminal buffer and 50% of website content...\n' +
          'Doctor Strange initiating Time Heist reversal in 3 seconds...\n' +
          '--------------------------------------------------\n' +
          '[STATUS: ENTROPY ACTIVE · MINIMIZING TERMINAL FOR CINEMATIC]'
      });
      if (onTriggerEasterEgg) onTriggerEasterEgg('snap');
      onClose();
    }
    // 7. SHAWARMA: Unlocks the secret post-sprint food break memo
    else if (cmdLower === 'shawarma' || cmdLower === 'food') {
      playTechClick();
      newHistory.push({
        type: 'accent',
        text: '🌯 THE FOUNDRY // POST-BATTLE MEMO: SHAWARMA PROTOCOL\n' +
          '--------------------------------------------------\n' +
          'FROM: Tony Stark (Stark Tower Penthouse)\n' +
          'TO  : The Avengers & Let\'s Cook Builders\n' +
          'DATE: Post-Sprint Sunday, 18:00 IST\n\n' +
          '"Alright people, incredible build sprint. Nobody talk to me\n' +
          ' about merge conflicts or Docker containers for the next 45\n' +
          ' minutes.\n\n' +
          ' There\'s a shawarma joint two blocks down. I don\'t know\n' +
          ' what it is, but I wanna try it.\n\n' +
          ' Sprint retro can wait. Put down the keyboards.\n' +
          ' First round of shawarmas is on Stark Labs."\n' +
          '--------------------------------------------------\n' +
          '[CLEARANCE: ALL BUILDERS DISMISSED TO REFUEL]'
      });
    }
    // 8. LEVEL7: S.H.I.E.L.D. director's confidential memo
    else if (cmdLower === 'level7' || cmdLower === 'fury' || cmdLower === 'shield-memo') {
      playNeonIgniteSound();
      newHistory.push({
        type: 'accent',
        text: '📁 S.H.I.E.L.D. LEVEL 7 // CONFIDENTIAL EXECUTIVE DIRECTIVE\n' +
          '--------------------------------------------------\n' +
          'SECURITY CLASSIFICATION: EYES-ONLY // DIRECTOR\'S DESK\n' +
          'AUTHOR: NICK FURY, EXECUTIVE DIRECTOR\n' +
          'DOCUMENT ID: SHIELD-DIR-MEMO-7701\n\n' +
          '"There was an idea, Stark knows this, called the Avengers\n' +
          ' Initiative. The idea was to bring together a group of\n' +
          ' remarkable people, see if they could become something more.\n' +
          ' See if they could work together when we needed them to,\n' +
          ' to build and fight the battles that we never could.\n\n' +
          ' To every student engineer and builder reading this:\n' +
          ' Stop asking for permission to build something great.\n' +
          ' Write the code. Ship the product. Protect the vision.\n\n' +
          ' Let\'s cook."\n' +
          '--------------------------------------------------\n' +
          'VERIFICATION HASH: 0x7F4A99C2B · S.H.I.E.L.D. LEVEL 7 ACTIVE'
      });
    }
    // SQUAD SELECTION
    else if (cmdLower.startsWith('squad')) {
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
      e.preventDefault();
      e.stopPropagation();
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
    <div 
      className="terminal-drawer-overlay no-print" 
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={onClose}
    >
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
            placeholder="type directive (e.g. 'help', 'assemble', 'jarvis', 'worthy')..."
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
          gap: 8px;
          font-family: monospace;
          font-size: 0.76rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .titlebar-icon {
          color: var(--accent-burgundy);
        }

        .titlebar-close-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          transition: color 0.15s;
        }

        .titlebar-close-btn:hover {
          color: #ffffff;
        }

        .terminal-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          font-family: monospace;
          font-size: 0.82rem;
          line-height: 1.55;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background-color: #0c0c10;
        }

        .log-line.user .user-prompt {
          color: #ffffff;
        }

        .prompt-at {
          color: var(--accent-burgundy);
          font-weight: 700;
        }

        .prompt-sym {
          color: #38bdf8;
          font-weight: 700;
        }

        .log-line.sys .sys-output {
          color: #94a3b8;
          margin: 0;
          white-space: pre-wrap;
          font-family: inherit;
        }

        .log-line.accent .sys-output {
          color: #f59e0b;
          margin: 0;
          white-space: pre-wrap;
          font-family: inherit;
          font-weight: 700;
        }

        .log-line.error .sys-output {
          color: #ef4444;
          margin: 0;
          white-space: pre-wrap;
          font-family: inherit;
        }

        .terminal-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background-color: #121218;
          border-top: 1px solid #22222e;
        }

        .input-prompt {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--accent-burgundy);
          font-weight: 700;
          white-space: nowrap;
        }

        .terminal-text-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: monospace;
          font-size: 0.85rem;
        }

        .btn-term-send {
          background: none;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .btn-term-send:hover {
          color: var(--accent-burgundy);
        }
      `}</style>
    </div>
  );
}

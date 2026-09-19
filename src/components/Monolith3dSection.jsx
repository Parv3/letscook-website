import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  ArrowUpRight, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Compass 
} from 'lucide-react';
import { playTechClick, playInversionSound, playDecodeTick } from '../utils/soundEngine';
import { getTrackedUrl } from '../utils/utmTracker';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

const FACE_ANGLES = {
  front:  { x: 0,    y: 0,   label: '01 // ORIGIN', color: '#00ffcc' },
  bottom: { x: 90,   y: 0,   label: '02 // TRACKS', color: '#ff007f' },
  back:   { x: 180,  y: 0,   label: '03 // ACCESS', color: '#ffb800' },
  top:    { x: -90,  y: 0,   label: '04 // FAQ',    color: '#00ffcc' },
  right:  { x: 0,    y: -90, label: '05 // SHELL',  color: '#00ffcc' },
  left:   { x: 0,    y: 90,  label: '06 // MATRIX', color: '#ff007f' }
};

export default function Monolith3dSection({ onOpenPitchModal, onOpenJoinModal }) {
  const [rotX, setRotX] = useState(-10);
  const [rotY, setRotY] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFace, setActiveFace] = useState('front');
  const [explodeDist, setExplodeDist] = useState(180);
  const [zoomScale, setZoomScale] = useState(1);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // FAQ expansion states on face 4
  const [openFaq, setOpenFaq] = useState(null);

  // Terminal state on face 5
  const [termInput, setTermInput] = useState('');
  const [termLogs, setTermLogs] = useState([
    { type: 'sys', text: "LET'S COOK MONOLITH SHELL v3.2" },
    { type: 'sys', text: "Type 'help', 'tracks', 'pitch', 'stack', or 'cook'." }
  ]);
  const termLogsEndRef = useRef(null);

  const stageRef = useRef(null);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const autoSpinTimerRef = useRef(null);
  const wheelCooldownRef = useRef(false);

  // Auto-Orbit Logic
  useEffect(() => {
    if (isAutoOrbit) {
      autoSpinTimerRef.current = setInterval(() => {
        setRotY(prev => (prev + 0.6) % 360);
        setRotX(prev => -10 + Math.sin(Date.now() * 0.001) * 7);
      }, 25);
    } else {
      if (autoSpinTimerRef.current) clearInterval(autoSpinTimerRef.current);
    }
    return () => {
      if (autoSpinTimerRef.current) clearInterval(autoSpinTimerRef.current);
    };
  }, [isAutoOrbit]);

  // Scroll to bottom of terminal when logs change
  useEffect(() => {
    termLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLogs]);

  // Snap directly to a specific cube face
  const snapToFace = (faceKey) => {
    playTechClick();
    if (isAutoOrbit) setIsAutoOrbit(false);
    const target = FACE_ANGLES[faceKey];
    if (!target) return;
    setRotX(target.x);
    setRotY(target.y);
    setActiveFace(faceKey);
  };

  // Trackball pointer drag handling
  const handlePointerDown = (e) => {
    if (e.target.closest('button, input, a, .interactive-item')) return;
    setIsDragging(true);
    if (isAutoOrbit) setIsAutoOrbit(false);
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startRotRef.current = { x: rotX, y: rotY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPointerRef.current.x;
    const dy = e.clientY - startPointerRef.current.y;
    setRotY(startRotRef.current.y + dx * 0.45);
    setRotX(startRotRef.current.x - dy * 0.45);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Scroll Wheel Snap Handling
  const handleWheel = (e) => {
    // Only capture wheel when hovering the 3D stage
    if (wheelCooldownRef.current) return;
    e.preventDefault();
    wheelCooldownRef.current = true;
    setTimeout(() => { wheelCooldownRef.current = false; }, 320);

    const faceSequence = ['front', 'bottom', 'back', 'top'];
    let idx = faceSequence.indexOf(activeFace);
    if (idx === -1) idx = 0;

    if (e.deltaY > 0) {
      idx = (idx + 1) % faceSequence.length;
    } else {
      idx = (idx - 1 + faceSequence.length) % faceSequence.length;
    }
    snapToFace(faceSequence[idx]);
  };

  // Copy Portal Link
  const handleCopyLink = () => {
    playTechClick();
    navigator.clipboard?.writeText(LINKTREE_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mini Terminal execution on Face 5
  const handleTermCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = termInput.trim().toLowerCase();
    if (!cmd) return;

    playDecodeTick();
    const newLogs = [...termLogs, { type: 'user', text: `$ ${cmd}` }];

    if (cmd === 'help') {
      newLogs.push({ type: 'sys', text: 'DIRECTIVES: tracks, pitch, stack, lore, cook, clear' });
    } else if (cmd === 'tracks') {
      newLogs.push({ type: 'sys', text: 'ACTIVE: [1] Systems (Rust) [2] AI (PyTorch) [3] Cloud (FastAPI)' });
    } else if (cmd === 'pitch') {
      newLogs.push({ type: 'sys', text: 'TRANSMITTING: Launching Project Pitch Modal...' });
      if (onOpenPitchModal) onOpenPitchModal();
    } else if (cmd === 'stack') {
      newLogs.push({ type: 'sys', text: 'STACK: Rust, Go, PyTorch, Docker, Next.js, Tokio' });
    } else if (cmd === 'lore') {
      newLogs.push({ type: 'sys', text: 'LORE: Student-governed engineering guild shipping code at letscook.co.in.' });
    } else if (cmd === 'cook') {
      playInversionSound();
      newLogs.push({ type: 'sys', text: '🔥 HARDWARE OVERDRIVE: ALL PEER NODES SYNCHRONIZED!' });
    } else if (cmd === 'clear') {
      setTermLogs([]);
      setTermInput('');
      return;
    } else {
      newLogs.push({ type: 'error', text: `zsh: command not found: ${cmd}` });
    }

    setTermLogs(newLogs);
    setTermInput('');
  };

  const explodePercent = Math.round(((explodeDist - 180) / (320 - 180)) * 100);

  return (
    <section 
      id="monolith-3d" 
      className={`monolith-section ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      <div className="monolith-container">
        
        {/* Section Header */}
        <div className="monolith-header">
          <div className="monolith-badge">
            <Compass size={14} className="badge-icon spin-slow" />
            <span>DIMENSIONAL CONSOLE // V3.2</span>
          </div>
          <h2 className="monolith-title">
            INTERACTIVE 3D ARTIFACT
          </h2>
          <p className="monolith-subtitle">
            Orbit the monolith in true 3D space. Scroll to flip faces, peel open the tesseract core, or execute directives on the live shell.
          </p>

          {/* Quick Snap Face Selector Tabs */}
          <div className="face-tabs-row">
            {Object.entries(FACE_ANGLES).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => snapToFace(key)}
                className={`face-tab-btn ${activeFace === key ? 'active' : ''}`}
                style={{ '--tab-color': data.color }}
              >
                <span className="dot" /> {data.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Scene Viewport */}
        <div 
          ref={stageRef}
          className="monolith-stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Ambient Orbital Rings */}
          <div className="ambient-orbit-ring ring-1" />
          <div className="ambient-orbit-ring ring-2" />

          {/* Central Pulsing Plasma Core (Exposed during explode) */}
          <div 
            className="monolith-plasma-core"
            style={{
              transform: `scale(${1 + (explodePercent / 100) * 1.8})`,
              opacity: 0.3 + (explodePercent / 100) * 0.7
            }}
          />

          {/* Floating Monolith Cube Entity */}
          <div 
            className={`monolith-cube-entity ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: `scale(${zoomScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
            }}
          >

            {/* =========================================================
                FACE 1: FRONT -> HERO / ORIGIN
            ========================================================= */}
            <div 
              className={`cube-facet facet-front ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar">
                <span className="pill-indicator">
                  <span className="live-dot" /> FACE 01 // ORIGIN
                </span>
                <span className="domain-tag">letscook.co.in</span>
              </div>

              <div className="facet-body">
                <span className="builder-pill">STUDENT BUILDER NETWORK</span>
                <h3 className="hero-punchline">
                  CODE, BUILD <span className="highlight-text">&amp; SHIP.</span>
                </h3>
                <p className="hero-desc">
                  Open-source infrastructure, high-throughput systems, and national hackathon squads governed 100% by students.
                </p>

                <div className="quick-metrics">
                  <div className="metric-cell">
                    <span className="val">100%</span>
                    <span className="lbl">PEER LED</span>
                  </div>
                  <div className="metric-cell">
                    <span className="val">0.00</span>
                    <span className="lbl">MEMBERSHIP COST</span>
                  </div>
                  <div className="metric-cell">
                    <span className="val">4</span>
                    <span className="lbl">TECH TRACKS</span>
                  </div>
                </div>
              </div>

              <div className="facet-actions">
                <button 
                  type="button"
                  onClick={() => { playTechClick(); if (onOpenJoinModal) onOpenJoinModal(); }}
                  className="btn-facet-primary interactive-item"
                >
                  JOIN SQUAD <ArrowUpRight size={14} />
                </button>
                <button 
                  type="button"
                  onClick={() => snapToFace('bottom')}
                  className="btn-facet-secondary interactive-item"
                >
                  TRACKS ⬇
                </button>
              </div>
            </div>

            {/* =========================================================
                FACE 2: BOTTOM -> INITIATIVES & LAB TRACKS
            ========================================================= */}
            <div 
              className={`cube-facet facet-bottom ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `rotateX(-90deg) translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar magenta">
                <span className="pill-indicator">FACE 02 // LAB TRACKS</span>
                <span className="domain-tag">COLLABORATIVE</span>
              </div>

              <div className="facet-body tracks-list">
                <div 
                  className="track-strip interactive-item"
                  onClick={() => { playTechClick(); if (onOpenJoinModal) onOpenJoinModal(); }}
                >
                  <div className="track-head">
                    <span className="num">[01] SYSTEMS &amp; RUNTIMES</span>
                    <span className="tech">Rust / Tokio</span>
                  </div>
                  <p className="track-info">Low-level engines, micro-benchmarks, and CLI tooling.</p>
                </div>

                <div 
                  className="track-strip interactive-item"
                  onClick={() => { playTechClick(); if (onOpenJoinModal) onOpenJoinModal(); }}
                >
                  <div className="track-head">
                    <span className="num">[02] APPLIED AI &amp; QUANTIZATION</span>
                    <span className="tech">PyTorch / ONNX</span>
                  </div>
                  <p className="track-info">Edge evaluation &amp; local-first intelligence runners.</p>
                </div>

                <div 
                  className="track-strip interactive-item"
                  onClick={() => { playTechClick(); if (onOpenJoinModal) onOpenJoinModal(); }}
                >
                  <div className="track-head">
                    <span className="num">[03] FULL-STACK &amp; CLOUD</span>
                    <span className="tech">Next.js / FastAPI</span>
                  </div>
                  <p className="track-info">Scalable web backends, microservices &amp; cloud deploy.</p>
                </div>
              </div>

              <div className="facet-actions">
                <span className="hint-txt">TAP TRACK TO SELECT DISCIPLINE</span>
                <button 
                  type="button"
                  onClick={() => snapToFace('back')}
                  className="btn-facet-secondary interactive-item"
                >
                  ACCESS ➔
                </button>
              </div>
            </div>

            {/* =========================================================
                FACE 3: BACK -> ACCESS PORTAL & NETWORKS
            ========================================================= */}
            <div 
              className={`cube-facet facet-back ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `rotateX(-180deg) translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar amber">
                <span className="pill-indicator">FACE 03 // SQUAD ACCESS</span>
                <span className="domain-tag">ONLINE</span>
              </div>

              <div className="facet-body access-layout">
                <h4 className="access-h4">DIRECT COMMUNITY PORTAL</h4>
                <p className="access-p">
                  Jump into our WhatsApp announcements, Discord channels, and project sprint boards via official Linktree.
                </p>

                <div className="link-copy-box">
                  <span className="copy-url">linktr.ee/letscookfoundry</span>
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className="copy-btn interactive-item"
                    title="Copy Linktree URL"
                  >
                    {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="status-item">
                  <ShieldCheck size={14} className="text-amber" />
                  <span>Zero gatekeeping • Open access for student coders</span>
                </div>
              </div>

              <div className="facet-actions">
                <a 
                  href={getTrackedUrl(LINKTREE_URL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playTechClick}
                  className="btn-facet-primary amber-btn interactive-item w-full"
                >
                  OPEN LINKTREE PORTAL <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* =========================================================
                FACE 4: TOP -> INTERACTIVE INTEL & FAQ ACCORDION
            ========================================================= */}
            <div 
              className={`cube-facet facet-top ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `rotateX(90deg) translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar cyan">
                <span className="pill-indicator">FACE 04 // INTEL &amp; FAQ</span>
                <span className="domain-tag">EXPANDABLE</span>
              </div>

              <div className="facet-body faq-body">
                <div 
                  className={`faq-block interactive-item ${openFaq === 1 ? 'open' : ''}`}
                  onClick={() => { playTechClick(); setOpenFaq(openFaq === 1 ? null : 1); }}
                >
                  <div className="faq-q">
                    <span>Is Let's Cook free to join?</span>
                    <span className="icon">{openFaq === 1 ? '—' : '+'}</span>
                  </div>
                  {openFaq === 1 && (
                    <p className="faq-a">Yes, 100% free forever. We operate as an open peer community with zero fees.</p>
                  )}
                </div>

                <div 
                  className={`faq-block interactive-item ${openFaq === 2 ? 'open' : ''}`}
                  onClick={() => { playTechClick(); setOpenFaq(openFaq === 2 ? null : 2); }}
                >
                  <div className="faq-q">
                    <span>What if I am a beginner?</span>
                    <span className="icon">{openFaq === 2 ? '—' : '+'}</span>
                  </div>
                  {openFaq === 2 && (
                    <p className="faq-a">Beginners are paired directly with senior builders through guided code reviews and hackathon pods.</p>
                  )}
                </div>

                <div 
                  className={`faq-block interactive-item ${openFaq === 3 ? 'open' : ''}`}
                  onClick={() => { playTechClick(); setOpenFaq(openFaq === 3 ? null : 3); }}
                >
                  <div className="faq-q">
                    <span>Can I pitch my own idea?</span>
                    <span className="icon">{openFaq === 3 ? '—' : '+'}</span>
                  </div>
                  {openFaq === 3 && (
                    <p className="faq-a">Yes! Use the project pitch portal to submit your architecture to the squad.</p>
                  )}
                </div>
              </div>

              <div className="facet-actions">
                <span className="hint-txt">CLICK QUESTIONS TO TOGGLE</span>
                <button 
                  type="button"
                  onClick={() => snapToFace('front')}
                  className="btn-facet-secondary interactive-item"
                >
                  HERO ⬆
                </button>
              </div>
            </div>

            {/* =========================================================
                FACE 5: RIGHT -> LIVE 3D HACKER SHELL
            ========================================================= */}
            <div 
              className={`cube-facet facet-right ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `rotateY(90deg) translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar terminal-bar">
                <span className="pill-indicator">
                  <TerminalIcon size={12} /> MONOLITH SHELL
                </span>
                <span className="domain-tag">ZSH 5.9</span>
              </div>

              <div className="facet-body terminal-body">
                <div className="terminal-logs">
                  {termLogs.map((log, idx) => (
                    <div key={idx} className={`term-line ${log.type}`}>
                      {log.text}
                    </div>
                  ))}
                  <div ref={termLogsEndRef} />
                </div>
              </div>

              <div className="facet-terminal-input">
                <span className="prompt-symbol">$</span>
                <input 
                  type="text"
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  onKeyDown={handleTermCommand}
                  placeholder="type directive (e.g. 'help', 'cook')..."
                  className="term-input interactive-item"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* =========================================================
                FACE 6: LEFT -> HARDWARE TELEMETRY MATRIX
            ========================================================= */}
            <div 
              className={`cube-facet facet-left ${isWireframe ? 'wireframe' : ''}`}
              style={{ transform: `rotateY(-90deg) translateZ(${explodeDist}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar magenta">
                <span className="pill-indicator">
                  <Cpu size={12} /> HARDWARE MATRIX
                </span>
                <span className="status-live">● ONLINE</span>
              </div>

              <div className="facet-body telemetry-body">
                <div className="telemetry-row">
                  <div className="row-info">
                    <span>STUDENT GPU CLUSTER ALLOC</span>
                    <span className="val-hi">88.4%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill cyan" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="telemetry-row">
                  <div className="row-info">
                    <span>PEER CODE REVIEWS COMPLETED</span>
                    <span className="val-hi">148 CYCLES</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill magenta" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="telemetry-row">
                  <div className="row-info">
                    <span>CAMPUS P2P SUBNET LATENCY</span>
                    <span className="val-hi">3.8ms</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill amber" style={{ width: '22%' }} />
                  </div>
                </div>

                <div className="telemetry-stat-chips">
                  <div className="chip">
                    <Zap size={11} /> 100% LOCAL COMPUTE
                  </div>
                  <div className="chip">
                    <Layers size={11} /> 4 SQUAD CORES
                  </div>
                </div>
              </div>

              <div className="facet-actions">
                <span className="hint-txt">TELEMETRY STREAM VERIFIED</span>
                <button 
                  type="button"
                  onClick={() => snapToFace('front')}
                  className="btn-facet-secondary interactive-item"
                >
                  RETURN ➔
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Interactive HUD Controls Bar */}
        <div className="monolith-controls-bar">
          
          {/* Tesseract Explode Slider */}
          <div className="control-slider-group">
            <span className="slider-label magenta">
              <Sparkles size={12} /> TESSERACT EXPLODE:
            </span>
            <input 
              type="range"
              min="180"
              max="320"
              value={explodeDist}
              onChange={(e) => setExplodeDist(parseInt(e.target.value, 10))}
              className="hud-slider magenta"
            />
            <span className="slider-val">{explodePercent}%</span>
          </div>

          {/* Optical Zoom Slider */}
          <div className="control-slider-group">
            <span className="slider-label cyan">
              OPTICAL ZOOM:
            </span>
            <input 
              type="range"
              min="75"
              max="130"
              value={Math.round(zoomScale * 100)}
              onChange={(e) => setZoomScale(parseInt(e.target.value, 10) / 100)}
              className="hud-slider cyan"
            />
            <span className="slider-val">{Math.round(zoomScale * 100)}%</span>
          </div>

          {/* Action Buttons */}
          <div className="control-buttons-row">
            <button 
              type="button"
              onClick={() => { playTechClick(); setIsAutoOrbit(!isAutoOrbit); }}
              className={`btn-hud ${isAutoOrbit ? 'active-cyan' : ''}`}
            >
              {isAutoOrbit ? '⏹ HALT ORBIT' : '▶ AUTO-ORBIT'}
            </button>
            <button 
              type="button"
              onClick={() => { playTechClick(); setIsWireframe(!isWireframe); }}
              className={`btn-hud ${isWireframe ? 'active-magenta' : ''}`}
            >
              WIREFRAME
            </button>
            <button 
              type="button"
              onClick={() => { playTechClick(); snapToFace('front'); }}
              className="btn-hud"
              title="Reset View"
            >
              <RotateCcw size={13} />
            </button>
            <button 
              type="button"
              onClick={() => { playTechClick(); setIsFullscreen(!isFullscreen); }}
              className="btn-hud"
              title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>

        </div>

      </div>

      <style>{`
        .monolith-section {
          position: relative;
          padding: 80px 24px 60px 24px;
          border-bottom: 1px solid var(--border-color);
          background: radial-gradient(circle at 50% 30%, rgba(0, 255, 204, 0.03) 0%, transparent 70%), var(--bg-main);
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .monolith-section.fullscreen-mode {
          position: fixed;
          inset: 0;
          z-index: 6000;
          background: #050508;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .monolith-container {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .monolith-header {
          text-align: center;
          margin-bottom: 30px;
          max-width: 750px;
        }

        .monolith-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(0, 255, 204, 0.08);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: 4px;
          color: var(--accent-cyan);
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }

        .monolith-title {
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 10px 0;
        }

        .monolith-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        /* Face selector tabs */
        .face-tabs-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          background: rgba(14, 14, 22, 0.6);
          padding: 6px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .face-tab-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .face-tab-btn .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--tab-color);
          opacity: 0.5;
        }

        .face-tab-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.04);
        }

        .face-tab-btn.active {
          color: #000;
          background: var(--tab-color);
          border-color: var(--tab-color);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
        }

        .face-tab-btn.active .dot {
          background: #000;
          opacity: 1;
        }

        /* 3D Stage Area */
        .monolith-stage {
          position: relative;
          width: 100%;
          height: 480px;
          perspective: 1400px;
          perspective-origin: 50% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: none;
          cursor: grab;
        }

        .monolith-stage:active {
          cursor: grabbing;
        }

        /* Ambient Orbit Rings */
        .ambient-orbit-ring {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .ambient-orbit-ring.ring-1 {
          width: 520px;
          height: 520px;
          border: 1px dashed rgba(0, 255, 204, 0.12);
        }

        .ambient-orbit-ring.ring-2 {
          width: 680px;
          height: 680px;
          border: 1px solid rgba(255, 0, 127, 0.07);
        }

        /* Central Plasma Core */
        .monolith-plasma-core {
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: radial-gradient(circle, #00ffcc 0%, #ff007f 60%, #ffb800 100%);
          filter: blur(28px);
          pointer-events: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        /* 3D Cube Container */
        .monolith-cube-entity {
          position: relative;
          width: 360px;
          height: 360px;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .monolith-cube-entity.is-dragging {
          transition: none;
        }

        /* Common Facet Card Styles */
        .cube-facet {
          position: absolute;
          width: 360px;
          height: 360px;
          left: 0;
          top: 0;
          background: #0d0d16;
          border: 2px solid var(--accent-cyan);
          border-radius: 8px;
          box-sizing: border-box;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backface-visibility: visible;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8), 0 10px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .cube-facet.wireframe {
          background: rgba(10, 12, 20, 0.25) !important;
          backdrop-filter: blur(2px);
          border-style: dashed;
        }

        /* Chamfered Sci-Fi Corner Brackets */
        .corner-bracket {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: currentColor;
          pointer-events: none;
        }
        .corner-bracket.tl { top: 4px; left: 4px; border-top: 2px solid; border-left: 2px solid; }
        .corner-bracket.tr { top: 4px; right: 4px; border-top: 2px solid; border-right: 2px solid; }
        .corner-bracket.bl { bottom: 4px; left: 4px; border-bottom: 2px solid; border-left: 2px solid; }
        .corner-bracket.br { bottom: 4px; right: 4px; border-bottom: 2px solid; border-right: 2px solid; }

        .facet-specular {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Facet Topbar */
        .facet-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-cyan);
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .facet-topbar.magenta { color: var(--accent-pink); }
        .facet-topbar.amber { color: var(--accent-amber); }
        .facet-topbar.cyan { color: var(--accent-cyan); }

        .facet-topbar .pill-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .facet-topbar .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-cyan);
          box-shadow: 0 0 8px var(--accent-cyan);
        }

        .facet-topbar .domain-tag {
          color: var(--text-muted);
          font-size: 10px;
        }

        .facet-topbar .status-live {
          color: #00ff66;
          font-size: 10px;
        }

        /* Facet Body Styles */
        .facet-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 12px 0;
        }

        .builder-pill {
          display: inline-block;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(0, 255, 204, 0.1);
          padding: 2px 8px;
          border-radius: 3px;
          margin-bottom: 6px;
          width: fit-content;
        }

        .hero-punchline {
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .highlight-text {
          color: var(--accent-pink);
        }

        .hero-desc {
          font-size: 12px;
          color: #b0b0c5;
          line-height: 1.5;
          margin: 0 0 12px 0;
        }

        .quick-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 10px;
        }

        .metric-cell .val {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          font-weight: 800;
          color: var(--accent-cyan);
        }

        .metric-cell .lbl {
          font-size: 9px;
          color: #88889c;
          font-weight: 600;
        }

        /* Facet Actions */
        .facet-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 10px;
        }

        .btn-facet-primary {
          background: var(--accent-cyan);
          color: #000;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 800;
          padding: 8px 14px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
          transition: all 0.2s ease;
        }

        .btn-facet-primary:hover {
          filter: brightness(1.15);
          box-shadow: 0 0 15px rgba(0, 255, 204, 0.4);
        }

        .btn-facet-primary.amber-btn {
          background: var(--accent-amber);
        }

        .btn-facet-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-facet-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #fff;
        }

        .hint-txt {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          color: #77778c;
          flex: 1;
        }

        /* Specific Facet Details */
        .tracks-list {
          gap: 6px;
          margin: 6px 0;
        }

        .track-strip {
          background: rgba(255, 0, 127, 0.06);
          border: 1px solid rgba(255, 0, 127, 0.25);
          border-radius: 4px;
          padding: 8px 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .track-strip:hover {
          border-color: var(--accent-pink);
          transform: translateX(3px);
          background: rgba(255, 0, 127, 0.12);
        }

        .track-head {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-pink);
          margin-bottom: 2px;
        }

        .track-head .tech {
          color: #fff;
        }

        .track-info {
          font-size: 10px;
          color: #b0b0c5;
          margin: 0;
        }

        /* Access Facet */
        .access-layout {
          gap: 10px;
        }

        .access-h4 {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          margin: 0;
        }

        .access-p {
          font-size: 11px;
          color: #b0b0c5;
          line-height: 1.4;
          margin: 0;
        }

        .link-copy-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #000;
          border: 1px solid rgba(255, 184, 0, 0.3);
          border-radius: 4px;
          padding: 6px 10px;
        }

        .copy-url {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #ffb800;
        }

        .copy-btn {
          background: rgba(255, 184, 0, 0.15);
          border: 1px solid rgba(255, 184, 0, 0.4);
          color: #ffb800;
          border-radius: 3px;
          padding: 4px 6px;
          cursor: pointer;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #9999ac;
        }

        /* FAQ Facet */
        .faq-body {
          gap: 6px;
        }

        .faq-block {
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: 4px;
          padding: 7px 10px;
          cursor: pointer;
        }

        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
        }

        .faq-q .icon {
          color: var(--accent-cyan);
          font-family: var(--font-mono, monospace);
        }

        .faq-a {
          font-size: 10px;
          color: #b0b0c5;
          margin: 4px 0 0 0;
          padding-top: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          line-height: 1.4;
        }

        /* Live Terminal Facet */
        .terminal-body {
          margin: 6px 0;
          background: #050508;
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: 4px;
          padding: 8px;
          overflow-y: auto;
          max-height: 200px;
        }

        .terminal-logs {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          line-height: 1.5;
        }

        .term-line.sys { color: #88889c; }
        .term-line.user { color: var(--accent-cyan); font-weight: 700; }
        .term-line.error { color: #ff3366; }

        .facet-terminal-input {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #000;
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: 4px;
          padding: 6px 8px;
        }

        .prompt-symbol {
          color: var(--accent-cyan);
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 800;
        }

        .term-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          outline: none;
        }

        /* Telemetry Facet */
        .telemetry-body {
          gap: 10px;
        }

        .telemetry-row .row-info {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          color: #9999ac;
          margin-bottom: 3px;
        }

        .telemetry-row .val-hi {
          color: #fff;
          font-weight: 700;
        }

        .bar-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill { height: 100%; }
        .bar-fill.cyan { background: var(--accent-cyan); }
        .bar-fill.magenta { background: var(--accent-pink); }
        .bar-fill.amber { background: var(--accent-amber); }

        .telemetry-stat-chips {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }

        .chip {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          color: #fff;
          background: rgba(255, 0, 127, 0.1);
          border: 1px solid rgba(255, 0, 127, 0.3);
          border-radius: 3px;
          padding: 3px 6px;
        }

        /* Bottom HUD Controls Bar */
        .monolith-controls-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(14, 14, 22, 0.7);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 18px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 20px;
        }

        .control-slider-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 220px;
        }

        .slider-label {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .slider-label.magenta { color: var(--accent-pink); }
        .slider-label.cyan { color: var(--accent-cyan); }

        .hud-slider {
          flex: 1;
          cursor: pointer;
        }

        .hud-slider.magenta { accent-color: var(--accent-pink); }
        .hud-slider.cyan { accent-color: var(--accent-cyan); }

        .slider-val {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: var(--text-muted);
          width: 36px;
          text-align: right;
        }

        .control-buttons-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-hud {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
        }

        .btn-hud:hover {
          color: var(--text-main);
          border-color: var(--text-muted);
          background: rgba(255, 255, 255, 0.08);
        }

        .btn-hud.active-cyan {
          background: rgba(0, 255, 204, 0.15);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }

        .btn-hud.active-magenta {
          background: rgba(255, 0, 127, 0.15);
          border-color: var(--accent-pink);
          color: var(--accent-pink);
        }

        .spin-slow {
          animation: spin 12s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .monolith-cube-entity {
            width: 290px;
            height: 290px;
          }

          .cube-facet {
            width: 290px;
            height: 290px;
            padding: 14px;
          }

          .hero-punchline {
            font-size: 18px;
          }

          .monolith-stage {
            height: 420px;
          }

          .control-slider-group {
            min-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

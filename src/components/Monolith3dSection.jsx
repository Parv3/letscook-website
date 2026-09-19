import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  ArrowUpRight, 
  ChevronLeft,
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

// 6 Upright Facets arranged along a 3D Cylindrical Hexagonal Prism
// Every face is strictly oriented along the Y-axis so text is NEVER upside down
const FACETS = [
  { id: 'origin',    angle: 0,   label: '01 // ORIGIN', color: '#00ffcc', name: 'HERO' },
  { id: 'tracks',    angle: 60,  label: '02 // TRACKS', color: '#ff007f', name: 'TRACKS' },
  { id: 'access',    angle: 120, label: '03 // ACCESS', color: '#ffb800', name: 'ACCESS' },
  { id: 'faq',       angle: 180, label: '04 // FAQ',    color: '#00ffcc', name: 'FAQ' },
  { id: 'shell',     angle: 240, label: '05 // SHELL',  color: '#00ffcc', name: 'SHELL' },
  { id: 'telemetry', angle: 300, label: '06 // MATRIX', color: '#ff007f', name: 'MATRIX' }
];

export default function Monolith3dSection({ onOpenPitchModal, onOpenJoinModal }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(0); // Subtly clamped on desktop, locked upright on mobile
  const [isDragging, setIsDragging] = useState(false);
  const [explodeDist, setExplodeDist] = useState(0); // 0 to 80px additional outward radial expansion
  const [zoomScale, setZoomScale] = useState(1);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // FAQ expansion states on Face 4
  const [openFaq, setOpenFaq] = useState(null);

  // Terminal state on Face 5
  const [termInput, setTermInput] = useState('');
  const [termLogs, setTermLogs] = useState([
    { type: 'sys', text: "LET'S COOK MONOLITH SHELL v3.2" },
    { type: 'sys', text: "Type 'help', 'tracks', 'pitch', 'stack', or 'cook'." }
  ]);
  const termLogsEndRef = useRef(null);

  const stageRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchStartTimeRef = useRef(0);
  const startRotRef = useRef({ x: 0, y: 0 });
  const autoSpinTimerRef = useRef(null);

  // Synchronize rotation with active facet index
  const snapToIndex = (newIndex) => {
    playTechClick();
    if (isAutoOrbit) setIsAutoOrbit(false);
    const normalized = (newIndex + FACETS.length) % FACETS.length;
    setActiveIndex(normalized);
    // Target Y angle to bring face to the front
    setRotY(-normalized * 60);
    setRotX(0); // Always snap upright
  };

  const nextFacet = () => snapToIndex(activeIndex + 1);
  const prevFacet = () => snapToIndex(activeIndex - 1);

  // Auto-Orbit Logic
  useEffect(() => {
    if (isAutoOrbit) {
      autoSpinTimerRef.current = setInterval(() => {
        setRotY(prev => prev - 0.45);
      }, 25);
    } else {
      if (autoSpinTimerRef.current) clearInterval(autoSpinTimerRef.current);
    }
    return () => {
      if (autoSpinTimerRef.current) clearInterval(autoSpinTimerRef.current);
    };
  }, [isAutoOrbit]);

  // Keep active index aligned during continuous orbit
  useEffect(() => {
    if (isAutoOrbit) {
      const currentNorm = Math.round((-rotY / 60) % FACETS.length + FACETS.length) % FACETS.length;
      if (currentNorm !== activeIndex) {
        setActiveIndex(currentNorm);
      }
    }
  }, [rotY, isAutoOrbit, activeIndex]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    termLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLogs]);

  // Touch Swipe & Drag Handling (Mobile-optimized with swipe detection)
  const handleTouchStart = (e) => {
    if (e.target.closest('button, input, a, .interactive-item')) return;
    const touch = e.touches ? e.touches[0] : e;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = Date.now();
    startRotRef.current = { x: rotX, y: rotY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Horizontal drag controls Y rotation directly
    setRotY(startRotRef.current.y + dx * 0.4);

    // Vertical drag subtly tilts X but strictly clamps between -8 and +8 degrees to avoid flipping
    const clampedX = Math.max(-8, Math.min(8, startRotRef.current.x - dy * 0.15));
    setRotX(clampedX);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const dx = touch.clientX - touchStartRef.current.x;
    const duration = Date.now() - touchStartTimeRef.current;

    // Fast flick / swipe detection
    if (Math.abs(dx) > 45 && duration < 350) {
      if (dx < 0) {
        nextFacet();
      } else {
        prevFacet();
      }
    } else {
      // Snap to nearest 60-degree facet
      const nearestIdx = Math.round(-rotY / 60);
      const normalized = ((nearestIdx % FACETS.length) + FACETS.length) % FACETS.length;
      snapToIndex(normalized);
    }
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

  // Calculate dynamic radius based on screen width
  // Base radius around 270px on desktop, ~220px on mobile
  const baseRadius = 260 + explodeDist;

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
            <span>DIMENSIONAL ARTIFACT // CYBER CYLINDER</span>
          </div>
          <h2 className="monolith-title">
            3D HOLOGRAPHIC CONSOLE
          </h2>
          <p className="monolith-subtitle">
            Swipe left or right to rotate through the 6 operational sectors. Upright geometry calibrated for all screens.
          </p>

          {/* Quick Mobile Carousel Nav Bar */}
          <div className="mobile-nav-stepper">
            <button 
              type="button" 
              onClick={prevFacet}
              className="stepper-arrow-btn" 
              aria-label="Previous Sector"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="stepper-center-info">
              <span className="stepper-tag" style={{ color: FACETS[activeIndex].color }}>
                {FACETS[activeIndex].label}
              </span>
              <div className="stepper-dots">
                {FACETS.map((f, i) => (
                  <span 
                    key={f.id} 
                    className={`stepper-dot ${i === activeIndex ? 'active' : ''}`}
                    style={{ '--dot-color': f.color }}
                    onClick={() => snapToIndex(i)}
                  />
                ))}
              </div>
            </div>
            <button 
              type="button" 
              onClick={nextFacet}
              className="stepper-arrow-btn" 
              aria-label="Next Sector"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Desktop Face Selector Tabs */}
          <div className="face-tabs-scroll">
            {FACETS.map((facet, idx) => (
              <button
                key={facet.id}
                type="button"
                onClick={() => snapToIndex(idx)}
                className={`face-tab-btn ${activeIndex === idx ? 'active' : ''}`}
                style={{ '--tab-color': facet.color }}
              >
                <span className="dot" /> {facet.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Scene Viewport */}
        <div 
          ref={stageRef}
          className="monolith-stage"
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Ambient Orbital Grid Halo */}
          <div className="ambient-orbit-ring ring-1" />
          <div className="ambient-orbit-ring ring-2" />

          {/* Central Pulsing Plasma Reactor */}
          <div 
            className="monolith-plasma-core"
            style={{
              transform: `scale(${1 + (explodeDist / 80) * 1.5})`,
              opacity: 0.35 + (explodeDist / 80) * 0.65
            }}
          />

          {/* Upright Rotating 3D Hexagonal Prism Entity */}
          <div 
            className={`monolith-prism-entity ${isDragging ? 'is-dragging' : ''}`}
            style={{
              transform: `scale(${zoomScale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`
            }}
          >

            {/* =========================================================
                FACET 01: ORIGIN / HERO
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 0 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(0deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar">
                <span className="pill-indicator">
                  <span className="live-dot" /> 01 // ORIGIN
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
                  onClick={nextFacet}
                  className="btn-facet-secondary interactive-item"
                >
                  TRACKS ➔
                </button>
              </div>
            </div>

            {/* =========================================================
                FACET 02: INITIATIVES & LAB TRACKS
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 1 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(60deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar magenta">
                <span className="pill-indicator">02 // LAB TRACKS</span>
                <span className="domain-tag">ACTIVE INITIATIVES</span>
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
                <span className="hint-txt">TAP TRACK TO SELECT</span>
                <button 
                  type="button"
                  onClick={nextFacet}
                  className="btn-facet-secondary interactive-item"
                >
                  ACCESS ➔
                </button>
              </div>
            </div>

            {/* =========================================================
                FACET 03: ACCESS PORTAL & NETWORKS
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 2 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(120deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar amber">
                <span className="pill-indicator">03 // SQUAD ACCESS</span>
                <span className="domain-tag">ONLINE PORTAL</span>
              </div>

              <div className="facet-body access-layout">
                <h4 className="access-h4">DIRECT COMMUNITY ACCESS</h4>
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
                FACET 04: INTEL & FAQ ACCORDION
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 3 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(180deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar cyan">
                <span className="pill-indicator">04 // INTEL &amp; FAQ</span>
                <span className="domain-tag">INTERACTIVE</span>
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
                <span className="hint-txt">TAP QUESTION TO READ</span>
                <button 
                  type="button"
                  onClick={nextFacet}
                  className="btn-facet-secondary interactive-item"
                >
                  SHELL ➔
                </button>
              </div>
            </div>

            {/* =========================================================
                FACET 05: LIVE 3D HACKER SHELL
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 4 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(240deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar terminal-bar">
                <span className="pill-indicator">
                  <TerminalIcon size={12} /> 05 // CYBER SHELL
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
                  placeholder="type (e.g. 'help', 'cook')..."
                  className="term-input interactive-item"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* =========================================================
                FACET 06: HARDWARE TELEMETRY MATRIX
            ========================================================= */}
            <div 
              className={`prism-facet ${isWireframe ? 'wireframe' : ''} ${activeIndex === 5 ? 'is-active-facet' : ''}`}
              style={{ transform: `rotateY(300deg) translateZ(${baseRadius}px)` }}
            >
              <div className="facet-specular" />
              <div className="corner-bracket tl" />
              <div className="corner-bracket tr" />
              <div className="corner-bracket bl" />
              <div className="corner-bracket br" />

              <div className="facet-topbar magenta">
                <span className="pill-indicator">
                  <Cpu size={12} /> 06 // HARDWARE MATRIX
                </span>
                <span className="status-live">● ONLINE</span>
              </div>

              <div className="facet-body telemetry-body">
                <div className="telemetry-row">
                  <div className="row-info">
                    <span>STUDENT GPU ALLOCATION</span>
                    <span className="val-hi">88.4%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill cyan" style={{ width: '88%' }} />
                  </div>
                </div>

                <div className="telemetry-row">
                  <div className="row-info">
                    <span>CODE REVIEWS COMPLETE</span>
                    <span className="val-hi">148 CYCLES</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill magenta" style={{ width: '94%' }} />
                  </div>
                </div>

                <div className="telemetry-row">
                  <div className="row-info">
                    <span>CAMPUS P2P LATENCY</span>
                    <span className="val-hi">3.8ms</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill amber" style={{ width: '22%' }} />
                  </div>
                </div>

                <div className="telemetry-stat-chips">
                  <div className="chip">
                    <Zap size={11} /> LOCAL COMPUTE
                  </div>
                  <div className="chip">
                    <Layers size={11} /> 4 SQUAD NODES
                  </div>
                </div>
              </div>

              <div className="facet-actions">
                <span className="hint-txt">TELEMETRY STREAM ACTIVE</span>
                <button 
                  type="button"
                  onClick={() => snapToIndex(0)}
                  className="btn-facet-secondary interactive-item"
                >
                  ORIGIN ➔
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Swipe Guidance */}
        <div className="mobile-swipe-hint">
          <span>👈 SWIPE HORIZONTALLY TO ROTATE 👉</span>
        </div>

        {/* Bottom HUD Controls Bar */}
        <div className="monolith-controls-bar">
          
          {/* Radial Aperture / Explode Slider */}
          <div className="control-slider-group desktop-only">
            <span className="slider-label magenta">
              <Sparkles size={12} /> APERTURE:
            </span>
            <input 
              type="range"
              min="0"
              max="80"
              value={explodeDist}
              onChange={(e) => setExplodeDist(parseInt(e.target.value, 10))}
              className="hud-slider magenta"
            />
            <span className="slider-val">{Math.round((explodeDist / 80) * 100)}%</span>
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
              onClick={() => snapToIndex(0)}
              className="btn-hud"
              title="Reset to Origin"
            >
              <RotateCcw size={13} />
            </button>
            <button 
              type="button"
              onClick={() => { playTechClick(); setIsFullscreen(!isFullscreen); }}
              className="btn-hud desktop-only"
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
          padding: 60px 16px 50px 16px;
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
          padding: 20px;
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
          box-sizing: border-box;
        }

        .monolith-header {
          text-align: center;
          margin-bottom: 24px;
          max-width: 750px;
          width: 100%;
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
          margin-bottom: 10px;
        }

        .monolith-title {
          font-size: clamp(22px, 5vw, 34px);
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
        }

        .monolith-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        /* Mobile Stepper Navigation */
        .mobile-nav-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(14, 14, 22, 0.8);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 6px 12px;
          margin-bottom: 12px;
          width: 100%;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        .stepper-arrow-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stepper-arrow-btn:hover, .stepper-arrow-btn:active {
          background: var(--accent-cyan);
          color: #000;
          border-color: var(--accent-cyan);
        }

        .stepper-center-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stepper-tag {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .stepper-dots {
          display: flex;
          gap: 5px;
        }

        .stepper-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stepper-dot.active {
          background: var(--dot-color);
          box-shadow: 0 0 8px var(--dot-color);
          transform: scale(1.25);
        }

        /* Desktop Face selector tabs */
        .face-tabs-scroll {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
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
          padding: 5px 12px;
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
          height: 440px;
          perspective: 1200px;
          perspective-origin: 50% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: pan-y pinch-zoom;
          cursor: grab;
          overflow: hidden;
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
          width: 480px;
          height: 480px;
          border: 1px dashed rgba(0, 255, 204, 0.12);
        }

        .ambient-orbit-ring.ring-2 {
          width: 620px;
          height: 620px;
          border: 1px solid rgba(255, 0, 127, 0.07);
        }

        /* Central Plasma Reactor */
        .monolith-plasma-core {
          position: absolute;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle, #00ffcc 0%, #ff007f 60%, #ffb800 100%);
          filter: blur(24px);
          pointer-events: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        /* 3D Hexagonal Prism Entity */
        .monolith-prism-entity {
          position: relative;
          width: 320px;
          height: 380px;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .monolith-prism-entity.is-dragging {
          transition: none;
        }

        /* Common Facet Card Styles */
        .prism-facet {
          position: absolute;
          width: 320px;
          height: 380px;
          left: 0;
          top: 0;
          background: #0d0d16;
          border: 2px solid var(--accent-cyan);
          border-radius: 8px;
          box-sizing: border-box;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backface-visibility: hidden; /* Critical for clean mobile rendering: hides reverse side */
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.85), 0 10px 40px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          transition: opacity 0.3s ease, border-color 0.2s ease, filter 0.3s ease;
          opacity: 0.25;
          filter: brightness(0.6);
        }

        .prism-facet.is-active-facet {
          opacity: 1 !important;
          filter: brightness(1) !important;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 255, 204, 0.25);
        }

        .prism-facet.wireframe {
          background: rgba(10, 12, 20, 0.25) !important;
          backdrop-filter: blur(2px);
          border-style: dashed;
        }

        /* Chamfered Sci-Fi Corner Brackets */
        .corner-bracket {
          position: absolute;
          width: 9px;
          height: 9px;
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
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .facet-topbar.magenta { color: var(--accent-pink); }
        .facet-topbar.amber { color: var(--accent-amber); }
        .facet-topbar.cyan { color: var(--accent-cyan); }

        .facet-topbar .pill-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
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
          margin: 8px 0;
        }

        .builder-pill {
          display: inline-block;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(0, 255, 204, 0.1);
          padding: 2px 6px;
          border-radius: 3px;
          margin-bottom: 4px;
          width: fit-content;
        }

        .hero-punchline {
          font-size: 19px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .highlight-text {
          color: var(--accent-pink);
        }

        .hero-desc {
          font-size: 11px;
          color: #b0b0c5;
          line-height: 1.4;
          margin: 0 0 8px 0;
        }

        .quick-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 8px;
        }

        .metric-cell .val {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          font-weight: 800;
          color: var(--accent-cyan);
        }

        .metric-cell .lbl {
          font-size: 8px;
          color: #88889c;
          font-weight: 600;
        }

        /* Facet Actions */
        .facet-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 8px;
        }

        .btn-facet-primary {
          background: var(--accent-cyan);
          color: #000;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 800;
          padding: 7px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
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
          padding: 7px 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hint-txt {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          color: #77778c;
          flex: 1;
        }

        /* Specific Facet Details */
        .tracks-list {
          gap: 5px;
          margin: 4px 0;
        }

        .track-strip {
          background: rgba(255, 0, 127, 0.06);
          border: 1px solid rgba(255, 0, 127, 0.25);
          border-radius: 4px;
          padding: 6px 8px;
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
          font-size: 9px;
          font-weight: 700;
          color: var(--accent-pink);
          margin-bottom: 2px;
        }

        .track-head .tech {
          color: #fff;
        }

        .track-info {
          font-size: 9px;
          color: #b0b0c5;
          margin: 0;
        }

        /* Access Facet */
        .access-layout {
          gap: 8px;
        }

        .access-h4 {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          margin: 0;
        }

        .access-p {
          font-size: 10px;
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
          padding: 5px 8px;
        }

        .copy-url {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: #ffb800;
        }

        .copy-btn {
          background: rgba(255, 184, 0, 0.15);
          border: 1px solid rgba(255, 184, 0, 0.4);
          color: #ffb800;
          border-radius: 3px;
          padding: 3px 5px;
          cursor: pointer;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 9px;
          color: #9999ac;
        }

        /* FAQ Facet */
        .faq-body {
          gap: 5px;
        }

        .faq-block {
          background: rgba(0, 255, 204, 0.05);
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: 4px;
          padding: 6px 8px;
          cursor: pointer;
        }

        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
        }

        .faq-q .icon {
          color: var(--accent-cyan);
          font-family: var(--font-mono, monospace);
        }

        .faq-a {
          font-size: 9px;
          color: #b0b0c5;
          margin: 3px 0 0 0;
          padding-top: 3px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          line-height: 1.35;
        }

        /* Live Terminal Facet */
        .terminal-body {
          margin: 4px 0;
          background: #050508;
          border: 1px solid rgba(0, 255, 204, 0.2);
          border-radius: 4px;
          padding: 6px;
          overflow-y: auto;
          max-height: 180px;
        }

        .terminal-logs {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          line-height: 1.45;
        }

        .term-line.sys { color: #88889c; }
        .term-line.user { color: var(--accent-cyan); font-weight: 700; }
        .term-line.error { color: #ff3366; }

        .facet-terminal-input {
          display: flex;
          align-items: center;
          gap: 5px;
          background: #000;
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: 4px;
          padding: 5px 6px;
        }

        .prompt-symbol {
          color: var(--accent-cyan);
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 800;
        }

        .term-input {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          outline: none;
        }

        /* Telemetry Facet */
        .telemetry-body {
          gap: 8px;
        }

        .telemetry-row .row-info {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono, monospace);
          font-size: 8.5px;
          color: #9999ac;
          margin-bottom: 2px;
        }

        .telemetry-row .val-hi {
          color: #fff;
          font-weight: 700;
        }

        .bar-track {
          width: 100%;
          height: 5px;
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
          gap: 5px;
          margin-top: 4px;
        }

        .chip {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-mono, monospace);
          font-size: 8.5px;
          color: #fff;
          background: rgba(255, 0, 127, 0.1);
          border: 1px solid rgba(255, 0, 127, 0.3);
          border-radius: 3px;
          padding: 2px 5px;
        }

        /* Mobile Swipe Hint */
        .mobile-swipe-hint {
          text-align: center;
          margin-top: 6px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: rgba(0, 255, 204, 0.7);
          letter-spacing: 0.08em;
          animation: pulseFade 2s ease infinite alternate;
        }

        @keyframes pulseFade {
          from { opacity: 0.45; }
          to { opacity: 1; }
        }

        /* Bottom HUD Controls Bar */
        .monolith-controls-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(14, 14, 22, 0.75);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 14px;
          width: 100%;
          max-width: 480px;
          box-sizing: border-box;
          margin-top: 14px;
          margin-bottom: 20px;
        }

        .control-slider-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .slider-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .slider-label.magenta { color: var(--accent-pink); }
        .hud-slider.magenta { accent-color: var(--accent-pink); }

        .slider-val {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: var(--text-muted);
          width: 30px;
        }

        .control-buttons-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-hud {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
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

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }

          .face-tabs-scroll {
            display: none !important; /* On mobile, the sleek stepper is used instead */
          }

          .monolith-stage {
            height: 410px;
          }

          .monolith-prism-entity {
            width: 290px;
            height: 360px;
          }

          .prism-facet {
            width: 290px;
            height: 360px;
            padding: 14px;
          }

          .hero-punchline {
            font-size: 17px;
          }

          .ambient-orbit-ring.ring-1 {
            width: 360px;
            height: 360px;
          }

          .ambient-orbit-ring.ring-2 {
            width: 440px;
            height: 440px;
          }
        }

        @media (min-width: 769px) {
          .mobile-nav-stepper {
            display: none !important; /* Use tabs on desktop */
          }

          .mobile-swipe-hint {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

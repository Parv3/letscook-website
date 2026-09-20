import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Shield, Rocket, Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import FaqSection from './FaqSection';
import PasswordInput from './PasswordInput';
import TextDecoder from './TextDecoder';
import LogoMark from './LogoMark';
import ScrollCircuitRail from './ScrollCircuitRail';
import { getTrackedUrl } from '../utils/utmTracker';
import { 
  playTechClick, 
  playInversionSound, 
  playHoverRumbleTick,
  playRepulsorSound,
  playVibraniumPing,
  playThunderStrike,
  playAssembleFanfare
} from '../utils/soundEngine';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export const SQUADS_DATA = {
  ironman: {
    key: 'ironman',
    team: 'TECH TEAM',
    hero: 'IRON MAN',
    title: 'STARK TECH LABS',
    badge: 'CLEARANCE: STARK LEVEL 9',
    status: 'ONLINE // ARC REACTOR 100%',
    quote: '"Sometimes you gotta run before you can walk."',
    desc: 'Systems architecture, high-performance web tooling, distributed compilers, and autonomous AI agents. We build production tools and developer infrastructure.',
    color: '#ff0055',
    secondaryColor: '#00f0ff',
    linktree: `${LINKTREE_URL}&utm_source=squad_tech_ironman`,
    initiatives: [
      { title: 'AI & Local Inference Runtimes', desc: 'On-device LLM quantization and low-latency agentic pipelines.' },
      { title: 'Systems & Micro-Compilers', desc: 'Rust, WASM, and high-throughput network engines.' },
      { title: 'Open-Source Developer Stack', desc: 'Real tools built and deployed by student engineers.' }
    ],
    arsenal: ['Rust', 'Python', 'WASM', 'FastAPI', 'Docker', 'PyTorch'],
    sound: playRepulsorSound,
    insigniaSvg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ff0055" strokeWidth="3" opacity="0.85" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="8 6" />
        <polygon points="50,22 74,64 26,64" fill="none" stroke="#00f0ff" strokeWidth="3" />
        <circle cx="50" cy="50" r="10" fill="#00f0ff" />
      </svg>
    )
  },
  captain: {
    key: 'captain',
    team: 'PR & MEDIA TEAM',
    hero: 'CAPTAIN AMERICA',
    title: 'VIBRANIUM ALLIANCE',
    badge: 'SECURITY TIER: VIBRANIUM CLASSIFIED',
    status: 'ACTIVE // TACTICAL SHIELD READY',
    quote: '"I can do this all day."',
    desc: 'Global campus outreach, strategic industry partnerships, high-impact storytelling, brand narrative, and developer community expansion.',
    color: '#2563eb',
    secondaryColor: '#ef4444',
    linktree: `${LINKTREE_URL}&utm_source=squad_pr_captain`,
    initiatives: [
      { title: 'Global Tech Alliances', desc: 'Partnerships with student developer clubs and industry leaders.' },
      { title: 'Brand Narrative & Media Ops', desc: 'Cinematic visual engineering, developer journalism, and press.' },
      { title: 'Community Growth Strategy', desc: 'Expanding Let\'s Cook chapters across universities nationwide.' }
    ],
    arsenal: ['Public Relations', 'Alliances', 'Growth', 'Storytelling', 'Media', 'Comms'],
    sound: playVibraniumPing,
    insigniaSvg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ef4444" strokeWidth="4" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="#ef4444" strokeWidth="3" />
        <circle cx="50" cy="50" r="14" fill="#2563eb" />
        <polygon points="50,38 53,46 61,46 55,51 57,59 50,54 43,59 45,51 39,46 47,46" fill="#ffffff" />
      </svg>
    )
  },
  thor: {
    key: 'thor',
    team: 'EVENTS TEAM',
    hero: 'THOR',
    title: 'MJOLNIR OPS',
    badge: 'REALM: ASGARD FORGE',
    status: 'HIGH VOLTAGE // THUNDER SURGE',
    quote: '"Bring me Thanos!"',
    desc: 'High-octane 48-hour national hackathons, live code tournaments, campus speaker arenas, and lightning sprint demo stages.',
    color: '#d97706',
    secondaryColor: '#38bdf8',
    linktree: `${LINKTREE_URL}&utm_source=squad_events_thor`,
    initiatives: [
      { title: '48-Hour Hackathon Sprints', desc: 'High-voltage hackathons where builders ship real products in 2 days.' },
      { title: 'Live Stage & Keynote Arenas', desc: 'Campus tech conferences, live demos, and builder speaker sessions.' },
      { title: 'Lightning Code Tournaments', desc: 'Speed coding battles, algorithmic duels, and prize bounties.' }
    ],
    arsenal: ['Hackathons', 'Keynotes', 'Live Arenas', 'Workshops', 'Tournaments', 'Demo Days'],
    sound: playThunderStrike,
    insigniaSvg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <rect x="26" y="22" width="48" height="26" rx="4" fill="none" stroke="#eab308" strokeWidth="3.5" />
        <line x1="50" y1="48" x2="50" y2="82" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="42" y1="82" x2="58" y2="82" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
        <path d="M36 35 L64 35" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 4" />
      </svg>
    )
  },
  core: {
    key: 'core',
    team: 'CORE TEAM',
    hero: 'FOUNDRY COMMAND',
    title: 'THE AVENGERS INITIATIVE',
    badge: 'CLEARANCE: S.H.I.E.L.D. LEVEL 7',
    status: 'GOVERNANCE // LEVEL 7 ACTIVE',
    quote: '"There was an idea, to bring together a group of remarkable people."',
    desc: 'Executive council coordinating cross-squad logistics, treasury micro-grants, national expansion, and overarching community governance.',
    color: '#8b002e',
    secondaryColor: '#f59e0b',
    linktree: `${LINKTREE_URL}&utm_source=squad_core_command`,
    initiatives: [
      { title: 'Community Governance', desc: 'Meritocratic council elections, operational bylaws, and quality standards.' },
      { title: 'Treasury & Micro-Grants', desc: 'Funding student prototypes, server hosting, and event hardware.' },
      { title: 'Cross-Squad Operations', desc: 'Direct coordination between Tech, PR, and Events leadership.' }
    ],
    arsenal: ['Governance', 'Micro-Grants', 'Operations', 'Leadership', 'Strategy', 'Auditing'],
    sound: playAssembleFanfare,
    insigniaSvg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 5" />
        <circle cx="50" cy="50" r="34" fill="#0d0d14" stroke="#ff0055" strokeWidth="2.5" />
        <path d="M48 22 L32 68 L42 68 L47 52 L60 52 L60 44 L48 44 L52 30 Z" fill="#f59e0b" />
        <path d="M60 44 L72 68 L64 68 L60 60 L56 60 Z" fill="#f59e0b" />
        <polygon points="56,52 78,52 68,44" fill="#ff0055" />
      </svg>
    )
  }
};

export default function HomePage({ setCurrentPage, onOpenPitchModal, currentSquad = 'ironman', onSelectSquad }) {
  const [accessCode, setAccessCode] = useState('');
  const activeSquad = SQUADS_DATA[currentSquad] || SQUADS_DATA.ironman;

  // Progressive Shake & Invert Easter Egg State
  const [isCreateInverted, setIsCreateInverted] = useState(false);
  const boxRef = useRef(null);
  const hoverIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const tickCounterRef = useRef(0);

  const setBoxShakeClass = (className) => {
    if (!boxRef.current) return;
    boxRef.current.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    if (className !== 'none') {
      boxRef.current.classList.add(className);
    }
  };

  const handleSquadClick = (squadKey) => {
    playTechClick();
    if (onSelectSquad) {
      onSelectSquad(squadKey);
    }
    const targetSquad = SQUADS_DATA[squadKey];
    if (targetSquad && targetSquad.sound) {
      targetSquad.sound();
    }
  };

  // Progressive Shake & 5-Second Hover Logic with Zero Re-render Lag
  const handleCreateMouseEnter = () => {
    if (isCreateInverted) return;
    startTimeRef.current = Date.now();
    tickCounterRef.current = 0;
    setBoxShakeClass('shake-light');

    if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);

    hoverIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      tickCounterRef.current += 1;

      if (elapsed >= 5000) {
        clearInterval(hoverIntervalRef.current);
        setBoxShakeClass('none');
        setIsCreateInverted(true);
        playInversionSound();
      } else if (elapsed >= 3500) {
        setBoxShakeClass('shake-heavy');
        if (tickCounterRef.current % 2 === 0) playHoverRumbleTick('heavy');
      } else if (elapsed >= 1500) {
        setBoxShakeClass('shake-medium');
        if (tickCounterRef.current % 3 === 0) playHoverRumbleTick('medium');
      } else {
        setBoxShakeClass('shake-light');
        if (tickCounterRef.current % 4 === 0) playHoverRumbleTick('light');
      }
    }, 100);
  };

  const handleCreateMouseLeave = () => {
    if (isCreateInverted) return;
    setBoxShakeClass('none');
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
    }
  };

  const handleCreateDoubleClick = () => {
    if (isCreateInverted) {
      setIsCreateInverted(false);
      setBoxShakeClass('none');
      playInversionSound();
    }
  };

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) clearInterval(hoverIntervalRef.current);
    };
  }, []);

  return (
    <div className="home-page animate-fade-in">
      {/* Dynamic Scroll Circuit Rail */}
      <ScrollCircuitRail />

      {/* ========================================================= */}
      {/* 1. HERO SECTION (TIGHT COMPOSITION & PROMINENT LIGHTING)  */}
      {/* ========================================================= */}
      <section id="hero-top" className="hero-section">
        <div className="hero-container">
          
          {/* Top Anchor Badge - Establishes Instant Visual Focal Point */}
          <div className="hero-top-badge">
            <span className="badge-pulse-dot" />
            <span className="badge-brand">THE FOUNDRY // LET'S COOK</span>
            <span className="badge-divider">•</span>
            <span className="badge-squad">{activeSquad.hero} PROTOCOL ONLINE</span>
          </div>

          {/* Main Headline */}
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-line-1">
                CODE, BUILD,{' '}
                <span 
                  ref={boxRef}
                  className={`highlight-box ${isCreateInverted ? 'inverted-mode' : ''}`}
                  onMouseEnter={handleCreateMouseEnter}
                  onMouseLeave={handleCreateMouseLeave}
                  onTouchStart={handleCreateMouseEnter}
                  onTouchEnd={handleCreateMouseLeave}
                  onDoubleClick={handleCreateDoubleClick}
                  onClick={() => {
                    if (isCreateInverted) handleCreateDoubleClick();
                  }}
                  title={isCreateInverted ? "Tap or double-click to reset back to CREATE!" : "Hold or hover to break into LETS COOK!"}
                >
                  {isCreateInverted ? 'LETS COOK' : 'CREATE'}
                </span>
              </span>{' '}
              <span className="hero-line-2">AND SHIP PRODUCTS</span>
            </h1>

            <p className="hero-subtitle">
              Let's Cook is a student-run technology community for engineers, builders, and designers at <strong>letscook.co.in</strong>. We collaborate on open-source code, hackathons, and real-world software.
            </p>

            <div className="hero-cta-group">
              <a 
                href={getTrackedUrl(activeSquad.linktree)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary btn-lg glow-btn"
                onClick={playTechClick}
              >
                JOIN THE SQUAD <ArrowUpRight size={18} />
              </a>
              <button 
                onClick={() => { playTechClick(); onOpenPitchModal(); }}
                className="btn-secondary btn-lg"
              >
                <Lightbulb size={18} /> PITCH A PROJECT
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid (Completely Visible Above The Fold) */}
          <div className="hero-stats-row">
            <div className="stat-card hover-glow">
              <Sparkles size={22} className="stat-icon pulse-icon" />
              <div>
                <h4>STUDENT RUN</h4>
                <p>100% peer led and community governed</p>
              </div>
            </div>
            <div className="stat-card hover-glow">
              <Rocket size={22} className="stat-icon pulse-icon" />
              <div>
                <h4>PRODUCTION FIRST</h4>
                <p>Focusing on deployed, working applications</p>
              </div>
            </div>
            <div className="stat-card hover-glow">
              <Shield size={22} className="stat-icon pulse-icon" />
              <div>
                <h4>ZERO COST</h4>
                <p>Free open access for all student builders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MARVEL TRI-SQUAD UNIVERSE & CORE COMMAND TRACK         */}
      {/* ========================================================= */}
      <section id="squads" className="squads-section">
        <div className="squads-container">
          
          {/* Section Header */}
          <div className="section-header-box">
            <div className="section-label-badge">// MARVEL SQUAD UNIVERSE</div>
            <h2>
              <TextDecoder text="CHOOSE YOUR SQUAD DIVISION" />
            </h2>
            <p className="section-desc">
              Each squad commands a specialized engineering vertical. Switching squads dynamically transforms the entire website's operational telemetry, live canvas background, and synthesized audio.
            </p>
          </div>

          {/* Interactive Squad Selector Tabs with Vibrant High-Contrast Focus */}
          <div className="squad-tabs-nav">
            {Object.values(SQUADS_DATA).map(sq => {
              const isActive = currentSquad === sq.key;
              return (
                <button
                  key={sq.key}
                  type="button"
                  onClick={() => handleSquadClick(sq.key)}
                  className={`squad-tab-btn ${isActive ? 'active-squad-tab' : ''}`}
                >
                  <div className="tab-top-row">
                    <span className="tab-team-name">{sq.team}</span>
                    {isActive && <span className="tab-active-pill">● ACTIVE</span>}
                  </div>
                  <span className="tab-hero-tag">{sq.hero}</span>
                  {isActive && <div className="tab-active-indicator" />}
                </button>
              );
            })}
          </div>

          {/* Spotlight Active Squad Showcase Card */}
          <div className="active-squad-spotlight">
            <div className="spotlight-top-bar">
              <div className="spotlight-badge">{activeSquad.badge}</div>
              <div className="spotlight-status">
                <span className="live-status-dot" />
                {activeSquad.status}
              </div>
            </div>

            <div className="spotlight-main-grid">
              <div className="spotlight-info">
                <h3 className="spotlight-title">{activeSquad.title}</h3>
                <p className="spotlight-quote">{activeSquad.quote}</p>
                <p className="spotlight-desc">{activeSquad.desc}</p>

                {/* Key Initiatives */}
                <div className="initiatives-subgrid">
                  {activeSquad.initiatives.map((init, i) => (
                    <div key={i} className="initiative-mini-card">
                      <h5>{init.title}</h5>
                      <p>{init.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Technical Arsenal Badges */}
                <div className="arsenal-row">
                  <span className="arsenal-label">CORE ARSENAL:</span>
                  <div className="arsenal-tags">
                    {activeSquad.arsenal.map((item, i) => (
                      <span key={i} className="arsenal-tag">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="spotlight-cta-row">
                  <a
                    href={getTrackedUrl(activeSquad.linktree)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary glow-btn"
                    onClick={playTechClick}
                  >
                    ENLIST IN {activeSquad.team} <ArrowUpRight size={16} />
                  </a>
                  <span className="spotlight-cta-subtext">Direct Linktree community onboarding</span>
                </div>
              </div>

              {/* Insignia & Telemetry Display */}
              <div className="spotlight-insignia-panel">
                <div className="insignia-wrapper">
                  <div className="insignia-glow-ring">
                    {activeSquad.insigniaSvg}
                  </div>
                  <div className="insignia-label">{activeSquad.hero} // PROTOCOL</div>
                  <div className="insignia-sublabel">SYSTEM NOMINAL</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Squad Cards Grid for Direct Theme Selection */}
          <div className="squads-cards-grid">
            {Object.values(SQUADS_DATA).map(sq => {
              const isSelected = currentSquad === sq.key;
              return (
                <div
                  key={sq.key}
                  className={`squad-card ${isSelected ? 'selected-squad-card' : ''}`}
                  onClick={() => handleSquadClick(sq.key)}
                >
                  <div className="squad-card-header">
                    <span className="card-team-label">{sq.team}</span>
                    <span className="card-hero-badge">{sq.hero}</span>
                  </div>
                  <h4>{sq.title}</h4>
                  <p>{sq.desc}</p>
                  <div className="card-footer-action">
                    <span>{isSelected ? '● ACTIVE THEME' : 'ACTIVATE THEME'}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. ACCESS / FORM SHOWCASE SECTION                         */}
      {/* ========================================================= */}
      <section id="access" className="access-section">
        <div className="access-container">
          <div className="access-box hover-glow">
            <div className="access-info">
              <h3>JOIN THE LET'S COOK NETWORK</h3>
              <p>Ready to build? Access our WhatsApp community, Discord server, and upcoming sprint schedules via Linktree.</p>
              <ul className="checklist">
                <li><CheckCircle2 size={16} className="check-icon" /> Active peer code reviews</li>
                <li><CheckCircle2 size={16} className="check-icon" /> Weekly hackathon team forming</li>
                <li><CheckCircle2 size={16} className="check-icon" /> Workshop series & project demos</li>
              </ul>
            </div>

            <div className="access-form-box">
              <label htmlFor="member-pw" className="form-label">COMMUNITY ACCESS CODE (DEMO)</label>
              <PasswordInput 
                id="member-pw"
                placeholder="Enter password code..."
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
              />
              <p className="form-hint">Feature demonstration of instant password visibility toggle.</p>

              <a 
                href={getTrackedUrl(activeSquad.linktree || LINKTREE_URL)}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full mt-4 glow-btn"
                onClick={playTechClick}
              >
                OPEN LINKTREE PORTAL <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. EXPANDABLE FAQS SECTION                                */}
      {/* ========================================================= */}
      <FaqSection />

      {/* ========================================================= */}
      {/* 5. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <LogoMark size={32} className="footer-logo pulse-logo" />
              <span className="footer-title">LET'S COOK</span>
            </div>
            <p className="footer-desc">Student-run software & technology community operating at letscook.co.in.</p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>NAVIGATION</h5>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
              <button onClick={() => {
                const el = document.getElementById('squads');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>Squads</button>
              <button onClick={() => {
                const el = document.getElementById('access');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>Access</button>
              <button onClick={() => {
                const el = document.getElementById('faq');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>FAQs</button>
            </div>

            <div className="footer-col">
              <h5>LEGAL</h5>
              <button onClick={() => { setCurrentPage('privacy'); window.scrollTo(0, 0); }}>Privacy Policy</button>
              <button onClick={() => { setCurrentPage('terms'); window.scrollTo(0, 0); }}>Terms & Conditions</button>
            </div>

            <div className="footer-col">
              <h5>CONNECT</h5>
              <a href={getTrackedUrl(activeSquad.linktree)} target="_blank" rel="noopener noreferrer">
                Official Linktree <ArrowUpRight size={12} />
              </a>
              <span className="footer-domain">Domain: letscook.co.in</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Let's Cook Community. All rights reserved.</p>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* COMPONENT STYLES WITH TIGHT VERTICAL HIERARCHY            */}
      {/* ========================================================= */}
      <style>{`
        .home-page {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
        }

        /* 1. HERO SECTION */
        .hero-section {
          position: relative;
          padding: 24px 20px 48px 20px;
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
          max-width: 100vw;
          min-height: calc(100vh - 65px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          background: radial-gradient(circle at 50% 32%, var(--accent-burgundy-light) 0%, transparent 65%);
        }

        .hero-container {
          position: relative;
          z-index: 10;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* Hero Top Badge */
        .hero-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-badge);
          font-family: monospace;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-main);
          box-shadow: 0 4px 18px var(--accent-burgundy-light);
          margin-bottom: 18px;
          backdrop-filter: blur(8px);
        }

        .badge-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent-burgundy);
          box-shadow: 0 0 10px var(--accent-burgundy);
          animation: statusDotPulse 1.8s infinite ease-in-out;
        }

        @keyframes statusDotPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        .badge-divider {
          color: var(--text-dim);
        }

        .badge-squad {
          color: var(--badge-text);
          font-weight: 800;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 34px;
          max-width: 900px;
          position: relative;
          z-index: 10;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.3rem, 5.5vw, 4.4rem);
          font-weight: 900;
          line-height: 1.14;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
          color: #ffffff;
          text-shadow: 0 2px 24px rgba(0, 0, 0, 0.85);
        }

        .highlight-box {
          display: inline-block;
          background-color: var(--accent-burgundy);
          color: var(--hero-highlight-text);
          padding: 2px 14px;
          margin: 0 4px;
          border-radius: var(--radius-badge);
          font-weight: 900;
          box-shadow: 0 0 24px var(--accent-burgundy);
          cursor: pointer;
          user-select: none;
          transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .highlight-box.inverted-mode {
          background-color: #ffffff !important;
          color: #060608 !important;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.9) !important;
        }

        .hero-subtitle {
          font-size: clamp(0.95rem, 1.8vw, 1.18rem);
          color: #cbd5e1;
          max-width: 680px;
          margin-bottom: 28px;
          line-height: 1.6;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.7);
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hero-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          width: 100%;
          max-width: 1000px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-card);
          text-align: left;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .stat-card:hover {
          border-color: var(--accent-burgundy);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px var(--accent-burgundy-light);
        }

        .stat-icon {
          color: var(--accent-burgundy);
          flex-shrink: 0;
        }

        .stat-card h4 {
          font-family: var(--font-display);
          font-size: 0.92rem;
          font-weight: 700;
          margin-bottom: 3px;
          color: var(--text-main);
          letter-spacing: 0.02em;
        }

        .stat-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        /* 2. SQUADS SECTION */
        .squads-section {
          padding: 80px 24px;
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          width: 100%;
          box-sizing: border-box;
          position: relative;
        }

        .squads-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-header-box {
          margin-bottom: 36px;
        }

        .section-label-badge {
          display: inline-block;
          font-family: monospace;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--badge-text);
          background-color: var(--badge-bg);
          border: 1px solid var(--badge-border);
          padding: 4px 10px;
          border-radius: var(--radius-badge);
          margin-bottom: 12px;
        }

        .squads-section h2 {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.7rem);
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--text-main);
        }

        .section-desc {
          color: var(--text-muted);
          max-width: 680px;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Squad Tabs with Active Indicator Bar & Accent Lighting */
        .squad-tabs-nav {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .squad-tab-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 16px 18px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          overflow: hidden;
        }

        .squad-tab-btn:hover {
          border-color: var(--border-focus);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .squad-tab-btn.active-squad-tab {
          border-color: var(--accent-burgundy);
          background: linear-gradient(135deg, var(--bg-surface-hover) 0%, var(--bg-main) 100%);
          box-shadow: 0 0 25px var(--accent-glow);
          transform: translateY(-3px);
        }

        .tab-top-row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tab-team-name {
          font-family: var(--font-display);
          font-size: 0.86rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 0.02em;
        }

        .tab-active-pill {
          font-family: monospace;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-burgundy);
          letter-spacing: 0.05em;
        }

        .tab-hero-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--badge-text);
          margin-top: 4px;
        }

        .tab-active-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--accent-burgundy);
          box-shadow: 0 0 10px var(--accent-burgundy);
        }

        /* Active Spotlight Card */
        .active-squad-spotlight {
          background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-main) 100%);
          border: 1.5px solid var(--accent-burgundy);
          border-radius: var(--radius-card);
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 0 40px var(--accent-burgundy-light), 0 16px 36px rgba(0, 0, 0, 0.6);
        }

        .spotlight-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .spotlight-badge {
          font-family: monospace;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 5px 12px;
          border-radius: var(--radius-badge);
          background-color: var(--badge-bg);
          color: var(--badge-text);
          border: 1px solid var(--badge-border);
          letter-spacing: 0.06em;
        }

        .spotlight-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: monospace;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .live-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-burgundy);
          box-shadow: 0 0 10px var(--accent-burgundy);
          animation: statusDotPulse 1.8s infinite ease-in-out;
        }

        .spotlight-main-grid {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 36px;
          align-items: center;
        }

        .spotlight-title {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3.2vw, 2.4rem);
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .spotlight-quote {
          font-style: italic;
          color: var(--badge-text);
          font-size: 0.94rem;
          margin-bottom: 14px;
          font-weight: 600;
        }

        .spotlight-desc {
          color: var(--text-muted);
          font-size: 0.96rem;
          line-height: 1.6;
          margin-bottom: 22px;
        }

        .initiatives-subgrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .initiative-mini-card {
          background-color: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 14px;
          transition: border-color var(--transition-fast), transform var(--transition-fast);
        }

        .initiative-mini-card:hover {
          border-color: var(--accent-burgundy-border);
          transform: translateY(-2px);
        }

        .initiative-mini-card h5 {
          font-size: 0.84rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .initiative-mini-card p {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .arsenal-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .arsenal-label {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-dim);
        }

        .arsenal-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .arsenal-tag {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-badge);
          color: var(--text-main);
        }

        .spotlight-cta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .spotlight-cta-subtext {
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        .spotlight-insignia-panel {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insignia-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 28px 20px;
          background-color: var(--bg-main);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-card);
          width: 100%;
          text-align: center;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.6);
        }

        .insignia-glow-ring {
          padding: 12px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-burgundy-light) 0%, transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insignia-label {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-main);
        }

        .insignia-sublabel {
          font-family: monospace;
          font-size: 0.65rem;
          color: var(--accent-burgundy);
          letter-spacing: 0.08em;
        }

        /* 4 Squad Cards Grid */
        .squads-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .squad-card {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 20px;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .squad-card:hover {
          border-color: var(--border-focus);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        }

        .squad-card.selected-squad-card {
          border-color: var(--accent-burgundy);
          box-shadow: 0 0 20px var(--accent-burgundy-light);
        }

        .squad-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .card-team-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .card-hero-badge {
          font-family: monospace;
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--accent-burgundy);
        }

        .squad-card h4 {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .squad-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin-bottom: 16px;
        }

        .card-footer-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-burgundy);
          border-top: 1px solid var(--border-color);
          padding-top: 10px;
        }

        /* 3. ACCESS SECTION */
        .access-section {
          padding: 80px 24px;
          background-color: var(--bg-main);
          border-bottom: 1px solid var(--border-color);
          width: 100%;
          box-sizing: border-box;
        }

        .access-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .access-box {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          padding: 40px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          align-items: center;
        }

        .access-info h3 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 14px;
          color: var(--text-main);
        }

        .access-info p {
          color: var(--text-muted);
          margin-bottom: 24px;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .checklist {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checklist li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .check-icon {
          color: var(--accent-burgundy);
        }

        .access-form-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 24px;
        }

        .form-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .form-hint {
          font-size: 0.78rem;
          color: var(--text-dim);
          margin-top: 8px;
        }

        /* 4. FOOTER */
        .site-footer {
          padding: 60px 24px 30px 24px;
          background-color: var(--bg-main);
          border-top: 1px solid var(--border-color);
          width: 100%;
          box-sizing: border-box;
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .footer-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }

        .footer-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .footer-links-group {
          display: flex;
          gap: 48px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-col h5 {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .footer-col button, .footer-col a {
          background: none;
          border: none;
          color: var(--text-dim);
          font-size: 0.85rem;
          text-align: left;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          transition: color var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .footer-col button:hover, .footer-col a:hover {
          color: var(--accent-burgundy);
        }

        .footer-domain {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .footer-bottom {
          max-width: 1100px;
          margin: 0 auto;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-dim);
        }

        /* BUTTONS */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: var(--accent-burgundy);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: var(--radius-btn);
          font-weight: 700;
          font-size: 0.92rem;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .btn-primary:hover {
          background-color: var(--accent-burgundy-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px var(--accent-burgundy);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: var(--bg-surface);
          color: var(--text-main);
          padding: 12px 24px;
          border-radius: var(--radius-btn);
          font-weight: 700;
          font-size: 0.92rem;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-secondary:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--border-focus);
          transform: translateY(-2px);
        }

        .btn-lg {
          padding: 14px 30px;
          font-size: 1rem;
        }

        .glow-btn {
          box-shadow: 0 0 20px var(--accent-burgundy);
        }

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 900px) {
          .squad-tabs-nav {
            grid-template-columns: repeat(2, 1fr);
          }
          .spotlight-main-grid {
            grid-template-columns: 1fr;
          }
          .initiatives-subgrid {
            grid-template-columns: 1fr;
          }
          .squads-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-stats-row {
            grid-template-columns: 1fr;
          }
          .access-box {
            grid-template-columns: 1fr;
          }
          .footer-container {
            flex-direction: column;
          }
          .footer-links-group {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .squad-tabs-nav {
            grid-template-columns: 1fr;
          }
          .squads-cards-grid {
            grid-template-columns: 1fr;
          }
          .hero-section {
            padding: 30px 16px 36px 16px;
          }
          .squads-section, .access-section, .site-footer {
            padding: 40px 16px;
          }
          .active-squad-spotlight {
            padding: 20px 16px;
          }
          .access-box {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}

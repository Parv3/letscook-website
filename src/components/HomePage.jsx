import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Code2, Terminal, Cpu, Users, Sparkles, Shield, Rocket, CheckCircle2, Lightbulb } from 'lucide-react';
import FaqSection from './FaqSection';
import PasswordInput from './PasswordInput';
import Hero3dObject from './Hero3dObject';
import TextDecoder from './TextDecoder';
import LogoMark from './LogoMark';
import ScrollCircuitRail from './ScrollCircuitRail';
import { getTrackedUrl } from '../utils/utmTracker';
import { playTechClick, playInversionSound, playHoverRumbleTick } from '../utils/soundEngine';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export default function HomePage({ setCurrentPage, onOpenPitchModal, onOpenJoinModal }) {
  const [accessCode, setAccessCode] = useState('');
  const [hoveredPillar, setHoveredPillar] = useState(null);

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

  const pillars = [
    {
      icon: Code2,
      title: 'OPEN SOURCE LABS',
      desc: 'Collaborative student teams building real tools, developer utilities, and public infrastructure.'
    },
    {
      icon: Terminal,
      title: 'HACKATHON SQUAD',
      desc: 'Sprint teams competing in national and global hackathons with dedicated mentorship.'
    },
    {
      icon: Cpu,
      title: 'AI & HARDWARE STACK',
      desc: 'Exploring machine learning models, embedded devices, and production software architectures.'
    },
    {
      icon: Users,
      title: 'PEER MENTORSHIP',
      desc: 'Direct code reviews, resume tear-downs, and technical interview workshops led by senior students.'
    }
  ];

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

  // Double Click Reset Handler with Sound (LETS COOK -> CREATE)
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

      {/* Hero Section */}
      <section id="hero-top" className="hero-section">
        {/* Wall-to-Wall Fullscreen Synthwave Sunset Grid Background Layer */}
        <Hero3dObject />

        <div className="hero-container">
          {/* Main Headline with Progressive Shake & Double-Click/Touch Reset */}
          <div className="hero-content">
            <h1 className="hero-title">
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
              </span>{' '}
              AND SHIP PRODUCTS
            </h1>

            <p className="hero-subtitle">
              Let's Cook is a student-run technology community for engineers, builders, and designers at <strong>letscook.co.in</strong>. We collaborate on open-source code, hackathons, and real-world software.
            </p>

            <div className="hero-cta-group">
              <button 
                type="button"
                className="btn-primary btn-lg glow-btn"
                onClick={() => {
                  playTechClick();
                  if (onOpenJoinModal) {
                    onOpenJoinModal();
                  } else {
                    window.open(getTrackedUrl(LINKTREE_URL), '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                JOIN THE SQUAD <ArrowUpRight size={18} />
              </button>
              <button 
                onClick={() => { playTechClick(); onOpenPitchModal(); }}
                className="btn-secondary btn-lg"
              >
                <Lightbulb size={18} /> PITCH A PROJECT
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="hero-stats-row">
            <div className="stat-card hover-glow">
              <Sparkles size={20} className="stat-icon pulse-icon" />
              <div>
                <h4>STUDENT RUN</h4>
                <p>100% peer led and community governed</p>
              </div>
            </div>
            <div className="stat-card hover-glow">
              <Rocket size={20} className="stat-icon pulse-icon" />
              <div>
                <h4>PRODUCTION FIRST</h4>
                <p>Focusing on deployed, working applications</p>
              </div>
            </div>
            <div className="stat-card hover-glow">
              <Shield size={20} className="stat-icon pulse-icon" />
              <div>
                <h4>ZERO COST</h4>
                <p>Free open access for all student builders</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Initiatives / Pillars Section */}
      <section id="pillars" className="pillars-section">
        <div className="pillars-container">
          <div className="section-label">COMMUNITY TRACKS</div>
          <h2>
            <TextDecoder text="OUR CORE BUILD INITIATIVES" />
          </h2>
          <p className="section-desc">Structured tracks designed to move students from tutorials to shipping production software.</p>

          <div className="asymmetric-grid pillars-grid">
            {pillars.map((item, idx) => {
              const IconComp = item.icon;
              const isHovered = hoveredPillar === idx;
              return (
                <div 
                  key={idx} 
                  className={`pillar-card ${isHovered ? 'active-card' : ''}`}
                  onMouseEnter={() => { playTechClick(); setHoveredPillar(idx); }}
                  onMouseLeave={() => setHoveredPillar(null)}
                >
                  {isHovered && (
                    <div className="card-crack-line" />
                  )}

                  <div className={`pillar-icon-box ${isHovered ? 'icon-glow' : ''}`}>
                    <IconComp size={24} />
                  </div>
                  <h3>
                    <TextDecoder text={item.title} />
                  </h3>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member Access / Form Showcase Section with PW Visibility Toggle */}
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
                href={getTrackedUrl(LINKTREE_URL)}
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

      {/* Expandable FAQs Section */}
      <FaqSection />

      {/* Footer */}
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
                const el = document.getElementById('monolith-3d');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>3D Console</button>
              <button onClick={() => {
                const el = document.getElementById('pillars');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>Initiatives</button>
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
              <a href={getTrackedUrl(LINKTREE_URL)} target="_blank" rel="noopener noreferrer">
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

      <style>{`
        .home-page {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .hero-section {
          position: relative;
          padding: 80px 24px 60px 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-main);
          overflow: hidden;
          width: 100%;
          max-width: 100vw;
          min-height: 80vh;
          display: flex;
          align-items: center;
          box-sizing: border-box;
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

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 40px;
          max-width: 880px;
          position: relative;
          z-index: 10;
          padding: 10px 20px;
          background: radial-gradient(ellipse at 50% 50%, rgba(6, 6, 8, 0.75) 0%, rgba(6, 6, 8, 0) 75%);
          border-radius: var(--radius-card);
        }

        html.light .hero-content {
          background: radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 75%);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          margin-bottom: 24px;
          letter-spacing: -0.03em;
          text-align: center;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9), 0 0 35px rgba(6, 6, 8, 0.85);
        }

        html.light .hero-title {
          color: var(--text-main);
          text-shadow: none;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          max-width: 740px;
          margin: 0 auto 32px auto;
          line-height: 1.6;
          text-align: center;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
        }

        html.light .hero-subtitle {
          color: var(--text-muted);
          text-shadow: none;
        }

        html.light .glow-btn {
          box-shadow: 0 4px 18px rgba(114, 9, 44, 0.3);
        }

        html.light .stat-card {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        html.light .stat-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        html.light .pillar-card {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        html.light .pillar-card:hover {
          box-shadow: 0 12px 30px rgba(114, 9, 44, 0.12);
        }

        html.light .access-box {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        html.light .access-box:hover {
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
        }

        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
        }

        .btn-lg {
          padding: 14px 30px;
          font-size: 1rem;
        }

        .glow-btn {
          box-shadow: 0 4px 20px rgba(139, 0, 46, 0.4);
        }

        .hero-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          transition: all var(--transition-fast);
        }

        .stat-card:hover {
          border-color: var(--accent-burgundy-border);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .stat-icon {
          color: var(--accent-burgundy);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .pulse-icon {
          animation: pulseIcon 3s infinite ease-in-out;
        }

        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); color: var(--accent-burgundy-hover); }
        }

        .stat-card h4 {
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .stat-card p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Pillars Section */
        .pillars-section {
          padding: 80px 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-main);
        }

        .pillars-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-burgundy-hover);
          margin-bottom: 8px;
        }

        .pillars-section h2 {
          font-size: 2.2rem;
          margin-bottom: 12px;
        }

        .section-desc {
          color: var(--text-muted);
          margin-bottom: 40px;
          font-size: 1rem;
        }

        .pillars-grid {
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }

        .pillar-card {
          position: relative;
          grid-column: span 3;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 28px 24px;
          transition: all var(--transition-fast);
          overflow: hidden;
        }

        .pillar-card:hover {
          border-color: var(--accent-burgundy);
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 12px 30px rgba(139, 0, 46, 0.25);
        }

        .card-crack-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-burgundy-hover), transparent);
          animation: scanLine 1.5s ease infinite;
        }

        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .pillar-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-btn);
          background-color: var(--accent-burgundy-light);
          color: var(--accent-burgundy);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all var(--transition-fast);
        }

        .icon-glow {
          background-color: var(--accent-burgundy);
          color: #ffffff;
          box-shadow: 0 0 18px rgba(163, 8, 59, 0.8);
          transform: scale(1.08);
        }

        .pillar-card h3 {
          font-size: 1.05rem;
          margin-bottom: 10px;
        }

        .pillar-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Access Section */
        .access-section {
          padding: 80px 24px;
          background-color: var(--bg-main);
          border-bottom: 1px solid var(--border-color);
        }

        .access-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .access-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 40px;
          transition: all var(--transition-fast);
        }

        .access-box:hover {
          border-color: var(--accent-burgundy-border);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }

        .access-info h3 {
          font-size: 1.6rem;
          margin-bottom: 14px;
        }

        .access-info p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .checklist {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checklist li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .check-icon {
          color: var(--accent-burgundy-hover);
        }

        .access-form-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .form-hint {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .mt-4 {
          margin-top: 16px;
        }

        /* Footer */
        .site-footer {
          background-color: var(--bg-main);
          border-top: 1px solid var(--border-color);
          padding: 60px 24px 30px 24px;
        }

        .footer-container {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
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
          gap: 10px;
          margin-bottom: 12px;
        }

        .footer-logo {
          height: 32px;
        }

        .pulse-logo {
          animation: pulseIcon 4s infinite ease-in-out;
        }

        .footer-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .footer-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .footer-links-group {
          display: flex;
          flex-wrap: wrap;
          gap: 48px;
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-col h5 {
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .footer-col button, .footer-col a {
          text-align: left;
          font-size: 0.85rem;
          color: var(--text-muted);
          transition: color var(--transition-fast), transform var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .footer-col button:hover, .footer-col a:hover {
          color: var(--accent-burgundy-hover);
          transform: translateX(3px);
        }

        .footer-domain {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .footer-bottom {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .home-page {
            padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
          }
          .hero-section {
            padding: 24px 16px 20px 16px;
            min-height: auto;
          }
          .hero-content {
            padding: 4px 0;
            margin-bottom: 20px;
          }
          .hero-title {
            font-size: clamp(1.65rem, 6.8vw, 2.25rem);
            line-height: 1.25;
            margin-bottom: 14px;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 14px rgba(0, 0, 0, 0.95);
          }
          .highlight-box {
            display: inline-block;
            vertical-align: baseline;
            line-height: 1.05;
            padding: 2px 7px;
            font-size: 0.9em;
            margin: 0 2px;
            border-radius: 4px;
          }
          .hero-subtitle {
            font-size: 0.88rem;
            line-height: 1.55;
            margin-bottom: 20px;
            padding: 0;
            max-width: 100%;
          }
          .hero-cta-group {
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            gap: 10px;
          }
          .btn-lg {
            width: 100%;
            padding: 13px 18px;
            min-height: 48px;
            font-size: 0.9rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            justify-content: center;
          }
          .hero-stats-row {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 10px;
            margin-top: 20px;
            padding: 12px 2px 6px 2px;
            border-top: 1px solid var(--border-color);
            scrollbar-width: none;
          }
          .hero-stats-row::-webkit-scrollbar {
            display: none;
          }
          .stat-card {
            flex: 0 0 78%;
            scroll-snap-align: start;
            padding: 12px 14px;
            box-sizing: border-box;
          }
          .stat-card h4 {
            font-size: 0.82rem;
            margin-bottom: 2px;
          }
          .stat-card p {
            font-size: 0.75rem;
            line-height: 1.35;
          }
          .access-box {
            grid-template-columns: 1fr;
            padding: 20px 14px;
          }
          .pillar-card {
            grid-column: span 12;
            padding: 18px 14px;
          }
          .pillars-section {
            padding: 40px 16px;
          }
          .access-section {
            padding: 40px 16px;
          }
          .footer-container {
            flex-direction: column;
            gap: 24px;
            padding: 0 16px;
          }
          .footer-links-group {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}

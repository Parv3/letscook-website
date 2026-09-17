import React, { useState } from 'react';
import { ArrowUpRight, Code2, Terminal, Cpu, Users, Sparkles, Shield, Rocket, CheckCircle2 } from 'lucide-react';
import FaqSection from './FaqSection';
import PasswordInput from './PasswordInput';
import { getTrackedUrl } from '../utils/utmTracker';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export default function HomePage({ setCurrentPage }) {
  const [accessCode, setAccessCode] = useState('');

  const techBadges = [
    { name: 'REACT', desc: 'Web Apps' },
    { name: 'TYPESCRIPT', desc: 'Type Safety' },
    { name: 'NODE.JS', desc: 'Backend Services' },
    { name: 'PYTHON', desc: 'AI & Systems' },
    { name: 'DOCKER', desc: 'Cloud DevOps' }
  ];

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

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section inspired by reference design */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Tech Stack Badges Row */}
          <div className="tech-bar">
            {techBadges.map((badge, idx) => (
              <div key={idx} className="tech-tag">
                <span className="tech-name">{badge.name}</span>
                <span className="tech-dot">•</span>
                <span className="tech-desc">{badge.desc}</span>
              </div>
            ))}
          </div>

          {/* Main Headline with Highlight Box */}
          <div className="hero-content">
            <h1 className="hero-title">
              CODE, BUILD <span className="highlight-box">FOUNDRY</span> AND SHIP PRODUCTS
            </h1>

            <p className="hero-subtitle">
              Let's Cook is a student-run technology community for engineers, builders, and designers at <strong>letscook.co.in</strong>. We collaborate on open-source code, hackathons, and real-world software.
            </p>

            <div className="hero-cta-group">
              <a 
                href={getTrackedUrl(LINKTREE_URL)}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary btn-lg"
              >
                JOIN THE FOUNDRY <ArrowUpRight size={18} />
              </a>
              <button 
                onClick={() => {
                  const el = document.getElementById('pillars');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary btn-lg"
              >
                EXPLORE INITIATIVES
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="hero-stats-row">
            <div className="stat-card">
              <Sparkles size={20} className="stat-icon" />
              <div>
                <h4>STUDENT RUN</h4>
                <p>100% peer led and community governed</p>
              </div>
            </div>
            <div className="stat-card">
              <Rocket size={20} className="stat-icon" />
              <div>
                <h4>PRODUCTION FIRST</h4>
                <p>Focusing on deployed, working applications</p>
              </div>
            </div>
            <div className="stat-card">
              <Shield size={20} className="stat-icon" />
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
          <h2>OUR CORE BUILD INITIATIVES</h2>
          <p className="section-desc">Structured tracks designed to move students from tutorials to shipping production software.</p>

          <div className="asymmetric-grid pillars-grid">
            {pillars.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="pillar-card">
                  <div className="pillar-icon-box">
                    <IconComp size={24} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member Access / Form Showcase Section with PW Visibility Toggle */}
      <section className="access-section">
        <div className="access-container">
          <div className="access-box">
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
                className="btn-primary w-full mt-4"
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
              <img src="/the-foundry-logo-removebg-preview.png" alt="Let's Cook Logo" className="footer-logo" />
              <span className="footer-title">LET'S COOK</span>
            </div>
            <p className="footer-desc">Student-run software & technology community operating at letscook.co.in.</p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h5>NAVIGATION</h5>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
              <button onClick={() => {
                const el = document.getElementById('pillars');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>Initiatives</button>
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
        }

        .hero-section {
          padding: 80px 24px 60px 24px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-main);
        }

        .hero-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .tech-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 32px;
        }

        .tech-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tech-name {
          color: var(--text-main);
          letter-spacing: 0.05em;
        }

        .tech-dot {
          color: var(--accent-burgundy);
        }

        .tech-desc {
          color: var(--text-muted);
        }

        .hero-content {
          margin-bottom: 50px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          margin-bottom: 24px;
          letter-spacing: -0.03em;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          max-width: 720px;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .btn-lg {
          padding: 14px 30px;
          font-size: 1rem;
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
        }

        .stat-icon {
          color: var(--accent-burgundy);
          flex-shrink: 0;
          margin-top: 2px;
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
          color: var(--accent-burgundy);
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
          grid-column: span 3;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 28px 24px;
          transition: all var(--transition-fast);
        }

        .pillar-card:hover {
          border-color: var(--accent-burgundy);
          transform: translateY(-2px);
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
          color: var(--accent-burgundy);
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
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .footer-col button:hover, .footer-col a:hover {
          color: var(--accent-burgundy-hover);
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

        @media (max-width: 768px) {
          .access-box {
            grid-template-columns: 1fr;
          }
          .pillar-card {
            grid-column: span 12;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Search, ArrowUpRight, Lightbulb, Menu, X, Terminal } from 'lucide-react';
import { isSoundMuted, setSoundMuted, playTechClick } from '../utils/soundEngine';
import { getTrackedUrl } from '../utils/utmTracker';
import LogoMark from './LogoMark';

export default function Navbar({ onOpenSearch, onOpenPitchModal, onOpenTerminal, theme, onToggleTheme, currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [muted, setMuted] = useState(() => isSoundMuted());

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const currentScroll = window.scrollY;
          if (totalScroll > 0) {
            setScrollProgress((currentScroll / totalScroll) * 100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const nextState = !muted;
    setMuted(nextState);
    setSoundMuted(nextState);
    if (!nextState) playTechClick();
  };

  const navItems = [
    { label: 'HOME', page: 'home' },
    { label: 'FAQ', page: 'home', section: 'faq' },
    { label: 'LINKS', page: 'links' },
    { label: 'PRIVACY', page: 'privacy' },
    { label: 'TERMS', page: 'terms' }
  ];

  const handleNavClick = (item) => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', item.page === 'home' ? '/' : `/${item.page}`);
    }
    setCurrentPage(item.page);
    setMobileMenuOpen(false);

    if (item.section && item.page === 'home') {
      setTimeout(() => {
        const el = document.getElementById(item.section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky-header">
        {/* Scroll Progress Bar */}
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        />

      <nav className="navbar-container">
        {/* Brand Logo & Name */}
        <div className="brand-group" onClick={() => handleNavClick({ page: 'home' })}>
          <div className="brand-logo-wrap">
            <LogoMark size={36} className="brand-logo" />
          </div>
          <div className="brand-text">
            <span className="brand-title">LET'S COOK</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleNavClick(item)}
              className={`nav-link ${currentPage === item.page && !item.section ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Actions: Sound, Search, Theme, Pitch, Join, Mobile */}
        <div className="nav-actions">
          <button 
            onClick={toggleSound} 
            className="icon-btn" 
            title={muted ? "Unmute Cyber Audio Effects" : "Mute Cyber Audio Effects"}
            aria-label="Toggle sound"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button 
            onClick={() => { playTechClick(); onOpenSearch(); }} 
            className="icon-btn" 
            title="Search site (Ctrl+K)"
            aria-label="Search site"
          >
            <Search size={18} />
          </button>

          <button 
            onClick={() => { playTechClick(); if (onOpenTerminal) onOpenTerminal(); }} 
            className="icon-btn terminal-btn" 
            title="Open Interactive Shell (Ctrl + ~)"
            aria-label="Open Interactive Shell"
          >
            <Terminal size={17} />
          </button>

          <button 
            onClick={() => { playTechClick(); onOpenPitchModal(); }} 
            className="btn-secondary desktop-cta"
          >
            <Lightbulb size={16} /> PITCH IDEA
          </button>

          <button 
            onClick={() => {
              playTechClick();
              if (window.history && window.history.pushState) {
                window.history.pushState(null, '', '/links');
              }
              setCurrentPage('links');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-primary desktop-cta"
          >
            JOIN US <ArrowUpRight size={16} />
          </button>

          <button 
            className="mobile-menu-btn icon-btn"
            onClick={() => { playTechClick(); setMobileMenuOpen(!mobileMenuOpen); }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          <div className="mobile-drawer-content">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavClick(item)}
                className="mobile-nav-link"
              >
                {item.label}
              </button>
            ))}

            <button 
              onClick={() => { playTechClick(); setMobileMenuOpen(false); onOpenPitchModal(); }}
              className="btn-secondary w-full"
            >
              <Lightbulb size={16} /> PITCH A PROJECT IDEA
            </button>

            <button 
              onClick={() => { playTechClick(); setMobileMenuOpen(false); if (onOpenTerminal) onOpenTerminal(); }}
              className="btn-secondary w-full"
            >
              <Terminal size={16} /> OPEN TERMINAL SHELL
            </button>

            <div className="mobile-drawer-footer">
              <button 
                onClick={() => {
                  playTechClick();
                  setMobileMenuOpen(false);
                  if (window.history && window.history.pushState) {
                    window.history.pushState(null, '', '/links');
                  }
                  setCurrentPage('links');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-primary w-full"
              >
                JOIN COMMUNITY <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sticky-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
          background-color: var(--navbar-bg);
          border-bottom: 1px solid var(--border-color);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          height: 64px;
        }

        html.light .sticky-header {
          box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
        }

        .navbar-spacer {
          height: 64px;
          width: 100%;
          flex-shrink: 0;
        }

        .scroll-progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 3px;
          background-color: var(--accent-burgundy);
          transition: width 0.1s ease-out;
          z-index: 1001;
        }

        .navbar-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .brand-logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(8px);
          transition: all var(--transition-fast);
        }

        .brand-logo-wrap:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 42, 109, 0.4);
          box-shadow: 0 0 14px rgba(255, 42, 109, 0.25);
        }

        html.light .brand-logo-wrap {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        html.light .brand-logo-wrap:hover {
          background: rgba(0, 0, 0, 0.06);
          border-color: rgba(225, 29, 72, 0.3);
        }

        .brand-logo {
          height: 34px;
          width: auto;
          display: block;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          line-height: 1.1;
          color: var(--text-main);
        }

        .brand-subtitle {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .nav-link {
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-main);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-btn);
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          color: var(--text-main);
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--accent-burgundy-border);
          color: var(--accent-burgundy-hover);
        }

        .mobile-menu-btn {
          display: none;
        }

        .mobile-drawer {
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          padding: 24px;
        }

        .mobile-drawer-content {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .mobile-nav-link {
          text-align: left;
          font-size: 1.1rem;
          font-weight: 600;
          padding: 10px 0;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-main);
        }

        .mobile-drawer-footer {
          margin-top: 8px;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 960px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-cta {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        @media (max-width: 600px) {
          .sticky-header {
            height: 56px;
          }
          .navbar-spacer {
            height: 56px;
          }
          .navbar-container {
            padding: 0 12px;
          }
          .terminal-btn {
            display: none !important; /* Accessible inside mobile menu drawer */
          }
          .brand-logo-wrap {
            padding: 2px 4px;
            gap: 6px;
          }
          .brand-logo {
            height: 26px;
            width: auto;
          }
          .brand-title {
            font-size: 0.92rem;
            letter-spacing: 0.04em;
          }
          .brand-subtitle {
            display: none;
          }
          .nav-actions {
            gap: 6px;
          }
          .icon-btn {
            width: 36px;
            height: 36px;
            padding: 0;
            border-radius: var(--radius-btn);
          }
        }
      `}</style>
    </header>
    <div className="navbar-spacer" aria-hidden="true" />
  </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Search, ArrowUpRight, Lightbulb, Menu, X, Terminal, User, LogOut, Sparkles } from 'lucide-react';
import { isSoundMuted, setSoundMuted, playTechClick } from '../utils/soundEngine';
import { getStoredUser, clearSession } from '../services/portalService';
import { getTrackedUrl } from '../utils/utmTracker';
import LogoMark from './LogoMark';

export default function Navbar({ onOpenSearch, onOpenPitchModal, onOpenTerminal, theme, onToggleTheme, currentPage, setCurrentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [muted, setMuted] = useState(() => isSoundMuted());
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Listen for login/logout/profile updates to reactively update top-right circular avatar
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('letscook_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('letscook_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSound = () => {
    const nextState = !muted;
    setMuted(nextState);
    setSoundMuted(nextState);
    if (!nextState) playTechClick();
  };

  const navItems = [
    { label: 'HOME', page: 'home' },
    { label: 'CERTIFICATIONS', page: 'verify' },
    { label: 'LINKS', page: 'links' }
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

        {/* Right Actions: Sound, Search, Terminal, Profile/Join, Mobile */}
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

          {/* Profile Circle Avatar / Dropdown or Login CTA */}
          {currentUser ? (
            <div className="nav-profile-wrapper" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  playTechClick();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className="nav-profile-circle-btn"
                title={`${currentUser.fullName || 'Builder'} (${currentUser.email})`}
                aria-label="User Profile"
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Profile" className="nav-profile-avatar-img" />
                ) : (
                  <div className="nav-profile-initials">
                    {(currentUser.fullName ? currentUser.fullName[0] : currentUser.email[0]).toUpperCase()}
                  </div>
                )}
                <span className="nav-profile-active-pulse" />
              </button>

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <div className="nav-profile-dropdown animate-fade-in">
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar-circle">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="Avatar" className="nav-profile-avatar-img" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="dropdown-meta">
                      <div className="dropdown-user-name">{currentUser.fullName || 'Builder'}</div>
                      <div className="dropdown-user-email">{currentUser.email}</div>
                      <span className={`dropdown-role-badge ${currentUser.role === 'admin' ? 'role-admin' : 'role-member'}`}>
                        {currentUser.roleTitle || (currentUser.role === 'admin' ? 'Core Admin' : 'Member')}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-actions">
                    <button
                      type="button"
                      onClick={() => {
                        playTechClick();
                        setProfileDropdownOpen(false);
                        if (window.history && window.history.pushState) window.history.pushState(null, '', '/join');
                        setCurrentPage('portal');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="dropdown-btn"
                    >
                      <Sparkles size={15} /> Open Portal Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playTechClick();
                        setProfileDropdownOpen(false);
                        if (window.history && window.history.pushState) window.history.pushState(null, '', '/join');
                        setCurrentPage('portal');
                        window.dispatchEvent(new Event('open_profile_edit'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="dropdown-btn"
                    >
                      <User size={15} /> Edit Profile & Avatar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playTechClick();
                        clearSession();
                        setCurrentUser(null);
                        setProfileDropdownOpen(false);
                        window.dispatchEvent(new Event('letscook_auth_change'));
                      }}
                      className="dropdown-btn dropdown-signout-btn"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => {
                playTechClick();
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', '/join');
                }
                setCurrentPage('portal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary desktop-cta"
            >
              JOIN US <ArrowUpRight size={16} />
            </button>
          )}

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
            {currentUser && (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="nav-profile-avatar-img" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{currentUser.fullName || 'Builder'}</span>
                  <span className="mobile-user-email">{currentUser.email}</span>
                </div>
              </div>
            )}

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
              {currentUser ? (
                <button 
                  onClick={() => {
                    playTechClick();
                    clearSession();
                    setCurrentUser(null);
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new Event('letscook_auth_change'));
                  }}
                  className="btn-secondary w-full"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={16} /> SIGN OUT
                </button>
              ) : (
                <button 
                  onClick={() => {
                    playTechClick();
                    setMobileMenuOpen(false);
                    if (window.history && window.history.pushState) {
                      window.history.pushState(null, '', '/join');
                    }
                    setCurrentPage('portal');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-primary w-full"
                >
                  JOIN US <ArrowUpRight size={16} />
                </button>
              )}
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
          background: var(--navbar-bg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.4);
          height: 64px;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        html.light .sticky-header {
          background: var(--navbar-bg);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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
          gap: 44px;
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding: 6px 14px;
          border-radius: 8px;
          transition: all var(--transition-fast);
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-main);
          background-color: rgba(255, 255, 255, 0.06);
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

        /* Profile Avatar & Dropdown */
        .nav-profile-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .nav-profile-circle-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--accent-burgundy);
          background: rgba(255, 255, 255, 0.08);
          cursor: pointer;
          overflow: hidden;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all var(--transition-fast);
          box-shadow: 0 0 14px var(--accent-burgundy-light);
        }

        .nav-profile-circle-btn:hover {
          transform: scale(1.06);
          border-color: #ffffff;
          box-shadow: 0 0 20px var(--accent-burgundy);
        }

        .nav-profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .nav-profile-initials {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.95rem;
          color: #ffffff;
        }

        .nav-profile-active-pulse {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
          border: 1.5px solid #000;
        }

        .nav-profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 260px;
          background: rgba(12, 14, 20, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
          z-index: 1010;
        }

        .dropdown-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid var(--accent-burgundy);
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-burgundy);
          flex-shrink: 0;
        }

        .dropdown-meta {
          overflow: hidden;
          flex: 1;
        }

        .dropdown-user-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-user-email {
          font-size: 0.74rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-role-badge {
          display: inline-block;
          margin-top: 4px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .dropdown-role-badge.role-admin {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }

        .dropdown-role-badge.role-member {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.35);
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 12px 0;
        }

        .dropdown-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dropdown-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-main);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .dropdown-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .dropdown-signout-btn {
          color: #ef4444;
        }

        .dropdown-signout-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          color: #f87171;
        }

        .mobile-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          margin-bottom: 6px;
        }

        .mobile-user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid var(--accent-burgundy);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mobile-user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mobile-user-name {
          font-weight: 700;
          font-size: 0.9rem;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mobile-user-email {
          font-size: 0.74rem;
          color: var(--text-dim);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

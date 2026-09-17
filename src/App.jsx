import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchModal from './components/SearchModal';
import HomePage from './components/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import FloatingContact from './components/FloatingContact';
import CookieBanner from './components/CookieBanner';
import ScrollTopButton from './components/ScrollTopButton';
import LaunchOverlay from './components/LaunchOverlay';
import MacOsTimerWindow from './components/MacOsTimerWindow';
import { captureUtmParams } from './utils/utmTracker';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('letscook_theme') || 'dark';
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Launch Experience States
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(true);
  const [showMacOsWindow, setShowMacOsWindow] = useState(false);

  useEffect(() => {
    captureUtmParams();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('letscook_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRevealLaunch = () => {
    setShowLaunchOverlay(false);
    setShowMacOsWindow(true);
  };

  return (
    <div className="app-root">
      {/* Dramatic Yet Non-Distracting Background (Nebula Glows + Laser Rays + Embers) */}
      <div className="live-glowing-lines-bg no-print" aria-hidden="true">
        {/* Ambient Burgundy Energy Nebulas */}
        <div className="nebula-orb nebula-1" />
        <div className="nebula-orb nebula-2" />

        {/* Laser Lines SVG */}
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="glowing-laser-svg">
          <path d="M-100 150 Q 400 450 1540 100" fill="none" className="glow-line glow-line-1" />
          <path d="M-100 700 Q 700 200 1540 800" fill="none" className="glow-line glow-line-2" />
          <path d="M200 -100 Q 900 500 400 1000" fill="none" className="glow-line glow-line-3" />
          <path d="M1200 -100 Q 500 500 1300 1000" fill="none" className="glow-line glow-line-4" />
        </svg>

        {/* Floating Embers */}
        <div className="bg-particle" style={{ left: '15%', animationDuration: '14s', animationDelay: '0s' }} />
        <div className="bg-particle" style={{ left: '35%', animationDuration: '18s', animationDelay: '3s' }} />
        <div className="bg-particle" style={{ left: '60%', animationDuration: '11s', animationDelay: '1s' }} />
        <div className="bg-particle" style={{ left: '80%', animationDuration: '16s', animationDelay: '5s' }} />
      </div>

      {/* 1. Full-Screen Launch Overlay */}
      {showLaunchOverlay && (
        <LaunchOverlay onReveal={handleRevealLaunch} />
      )}

      {/* 2. Sticky Navigation Header */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* 3. Main Content Views */}
      <main>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'privacy' && <PrivacyPolicyPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'terms' && <TermsPage setCurrentPage={setCurrentPage} />}
      </main>

      {/* 4. Floating Movable macOS Countdown Timer Window */}
      <MacOsTimerWindow
        isVisible={showMacOsWindow}
        onClose={() => setShowMacOsWindow(false)}
      />

      {/* 5. Global Interactive Overlays & Widgets */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setCurrentPage={setCurrentPage}
      />
      <FloatingContact />
      <CookieBanner />
      <ScrollTopButton />
    </div>
  );
}

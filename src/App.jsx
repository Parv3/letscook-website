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
      {/* 1. Full-Screen Scratch-To-Reveal Launch Overlay */}
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

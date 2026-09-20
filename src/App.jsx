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
import PitchIdeaModal from './components/PitchIdeaModal';
import TerminalDrawer from './components/TerminalDrawer';
import SquadThemeCanvas from './components/SquadThemeCanvas';
import CinematicEasterEggOverlay from './components/CinematicEasterEggOverlay';
import { captureUtmParams } from './utils/utmTracker';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('letscook_theme') || 'dark';
  });
  
  // Marvel Tri-Squad Universe State ('ironman' | 'captain' | 'thor' | 'core')
  const [activeSquad, setActiveSquad] = useState(() => {
    return localStorage.getItem('letscook_squad') || 'ironman';
  });

  // Active Cinematic Easter Egg ('snap' | 'bifrost' | 'jarvis' | 'worthy' | 'assemble' | null)
  const [activeEasterEgg, setActiveEasterEgg] = useState(null);

  const [currentPage, setCurrentPage] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  // Launch Experience States
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(true);
  const [showMacOsWindow, setShowMacOsWindow] = useState(false);

  useEffect(() => {
    captureUtmParams();

    // Global Terminal Shortcut: Ctrl + ~ or Cmd + ~
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Ensure the website permanently stays in dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.classList.remove('light');
    localStorage.setItem('letscook_theme', 'dark');
  }, []);

  // Synchronize Marvel Tri-Squad Global Universe Theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-ironman', 'theme-captain', 'theme-thor', 'theme-core');
    root.classList.add(`theme-${activeSquad}`);
    localStorage.setItem('letscook_squad', activeSquad);
  }, [activeSquad]);

  const handleRevealLaunch = () => {
    setShowLaunchOverlay(false);
    setShowMacOsWindow(true);
  };

  return (
    <div className="app-root">
      {/* 1. Live Procedural 60 FPS Squad Theme Background Canvas */}
      <SquadThemeCanvas squad={activeSquad} />

      {/* 2. Full-Screen Cinematic Marvel Easter Egg FX Overlay */}
      <CinematicEasterEggOverlay 
        effect={activeEasterEgg} 
        onComplete={() => setActiveEasterEgg(null)} 
      />

      {/* 3. Dramatic Background Laser Layer */}
      <div className="live-glowing-lines-bg no-print" aria-hidden="true">
        <div className="nebula-orb nebula-1" />
        <div className="nebula-orb nebula-2" />

        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="glowing-laser-svg">
          <path d="M-100 150 Q 400 450 1540 100" fill="none" className="glow-line glow-line-1" />
          <path d="M-100 700 Q 700 200 1540 800" fill="none" className="glow-line glow-line-2" />
          <path d="M200 -100 Q 900 500 400 1000" fill="none" className="glow-line glow-line-3" />
          <path d="M1200 -100 Q 500 500 1300 1000" fill="none" className="glow-line glow-line-4" />
        </svg>

        <div className="bg-particle" style={{ left: '15%', animationDuration: '14s', animationDelay: '0s' }} />
        <div className="bg-particle" style={{ left: '35%', animationDuration: '18s', animationDelay: '3s' }} />
        <div className="bg-particle" style={{ left: '60%', animationDuration: '11s', animationDelay: '1s' }} />
        <div className="bg-particle" style={{ left: '80%', animationDuration: '16s', animationDelay: '5s' }} />
      </div>

      {/* 4. Full-Screen Launch Overlay */}
      {showLaunchOverlay && (
        <LaunchOverlay onReveal={handleRevealLaunch} />
      )}

      {/* Main Site Container: Access strictly blocked until launch countdown finishes */}
      <div 
        className="site-main-wrapper" 
        style={showLaunchOverlay ? { pointerEvents: 'none', userSelect: 'none' } : undefined}
        aria-hidden={showLaunchOverlay ? "true" : undefined}
        inert={showLaunchOverlay ? "" : undefined}
      >
        {/* 5. Sticky Navigation Header */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenPitchModal={() => setIsPitchModalOpen(true)}
          onOpenTerminal={() => setIsTerminalOpen(true)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {/* 6. Main Content Views */}
        <main>
          {currentPage === 'home' && (
            <HomePage 
              setCurrentPage={setCurrentPage} 
              onOpenPitchModal={() => setIsPitchModalOpen(true)}
              currentSquad={activeSquad}
              onSelectSquad={setActiveSquad}
            />
          )}
          {currentPage === 'privacy' && <PrivacyPolicyPage setCurrentPage={setCurrentPage} />}
          {currentPage === 'terms' && <TermsPage setCurrentPage={setCurrentPage} />}
        </main>

        {/* 7. Floating Movable macOS Countdown Timer Window */}
        <MacOsTimerWindow
          isVisible={showMacOsWindow}
          onClose={() => setShowMacOsWindow(false)}
        />

        {/* 8. Global Interactive Overlays & Modals */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          setCurrentPage={setCurrentPage}
        />
        <PitchIdeaModal
          isOpen={isPitchModalOpen}
          onClose={() => setIsPitchModalOpen(false)}
        />
        <TerminalDrawer
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          onOpenPitchModal={() => setIsPitchModalOpen(true)}
          onTriggerEasterEgg={setActiveEasterEgg}
          onSelectSquad={setActiveSquad}
        />
        <FloatingContact />
        <CookieBanner />
        <ScrollTopButton />
      </div>
    </div>
  );
}

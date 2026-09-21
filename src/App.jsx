import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SearchModal from './components/SearchModal';
import HomePage from './components/HomePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import LinksPage from './pages/LinksPage';
import FloatingContact from './components/FloatingContact';
import CookieBanner from './components/CookieBanner';
import ScrollTopButton from './components/ScrollTopButton';
import LaunchOverlay from './components/LaunchOverlay';
import MacOsTimerWindow from './components/MacOsTimerWindow';
import PitchIdeaModal from './components/PitchIdeaModal';
import TerminalDrawer from './components/TerminalDrawer';
import SquadThemeCanvas from './components/SquadThemeCanvas';
import CinematicEasterEggOverlay from './components/CinematicEasterEggOverlay';
import ClickSpark from './components/ClickSpark';
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

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('links') || hash.includes('links') || search.includes('links')) {
        return 'links';
      }
      if (path.includes('privacy') || hash.includes('privacy')) {
        return 'privacy';
      }
      if (path.includes('terms') || hash.includes('terms')) {
        return 'terms';
      }
    }
    return 'home';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  
  // Launch Experience States: Prevent entry to the website until 6:00 PM today.
  // Access is granted via the ` (backtick) key on the overlay, or automatically after 6:00 PM today.
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(() => {
    if (typeof window !== 'undefined') {
      const now = Date.now();
      const targetTime = new Date();
      targetTime.setHours(18, 0, 0, 0); // 6:00 PM today
      if (now >= targetTime.getTime()) {
        return false; // Automatically unlock when past 6:00 PM today
      }

      // Explicit bypass query param only: e.g. ?unlock=1 or ?bypass=1
      const search = window.location.search.toLowerCase();
      if (search.includes('unlock=1') || search.includes('bypass=1')) {
        return false;
      }
    }
    return true;
  });
  const [showMacOsWindow, setShowMacOsWindow] = useState(false);

  useEffect(() => {
    captureUtmParams();

    // Browser navigation (Back / Forward) support
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('links') || hash.includes('links')) {
        setCurrentPage('links');
      } else if (path.includes('privacy') || hash.includes('privacy')) {
        setCurrentPage('privacy');
      } else if (path.includes('terms') || hash.includes('terms')) {
        setCurrentPage('terms');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Global Terminal Shortcut: Ctrl + ~ or Cmd + ~
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
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

  const sparkColor = activeSquad === 'thor' 
    ? '#f59e0b' 
    : activeSquad === 'captain' 
      ? '#38bdf8' 
      : activeSquad === 'core' 
        ? '#a855f7' 
        : '#00f0ff';

  return (
    <ClickSpark
      sparkColor={sparkColor}
      sparkSize={10}
      sparkRadius={16}
      sparkCount={8}
      duration={400}
    >
      <div className="app-root">
        {/* 1. Live Procedural 60 FPS Squad Theme Background Canvas */}
        <SquadThemeCanvas squad={activeSquad} />

        {/* 2. Full-Screen Cinematic Marvel Easter Egg FX Overlay */}
        <CinematicEasterEggOverlay 
          effect={activeEasterEgg} 
          onComplete={() => setActiveEasterEgg(null)} 
        />


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
                onTriggerEasterEgg={setActiveEasterEgg}
              />
            )}
            {currentPage === 'privacy' && <PrivacyPolicyPage setCurrentPage={setCurrentPage} />}
            {currentPage === 'terms' && <TermsPage setCurrentPage={setCurrentPage} />}
            {currentPage === 'links' && <LinksPage setCurrentPage={setCurrentPage} />}
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
    </ClickSpark>
  );
}

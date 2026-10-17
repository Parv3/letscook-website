import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import FloatingContact from './components/FloatingContact';
import CookieBanner from './components/CookieBanner';
import ScrollTopButton from './components/ScrollTopButton';
import SquadThemeCanvas from './components/SquadThemeCanvas';
import ClickSpark from './components/ClickSpark';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { captureUtmParams } from './utils/utmTracker';

// Lazy-loaded routes & heavy overlays for optimal initial load time
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const LinksPage = lazy(() => import('./pages/LinksPage'));
const PortalPage = lazy(() => import('./pages/PortalPage'));
const SearchModal = lazy(() => import('./components/SearchModal'));
const PitchIdeaModal = lazy(() => import('./components/PitchIdeaModal'));
const TerminalDrawer = lazy(() => import('./components/TerminalDrawer'));
const CinematicEasterEggOverlay = lazy(() => import('./components/CinematicEasterEggOverlay'));

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
      if (path.includes('verify') || hash.includes('verify') || path.includes('certificate')) {
        return 'verify';
      }
      if (path.includes('portal') || hash.includes('portal') || path.includes('register') || path.includes('login') || path.includes('admin') || path.includes('join')) {
        return 'portal';
      }
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
  

  useEffect(() => {
    captureUtmParams();

    // Browser navigation (Back / Forward) support
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('verify') || hash.includes('verify') || path.includes('certificate')) {
        setCurrentPage('verify');
      } else if (path.includes('portal') || hash.includes('portal') || path.includes('register') || path.includes('login') || path.includes('admin') || path.includes('join')) {
        setCurrentPage('portal');
      } else if (path.includes('links') || hash.includes('links')) {
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
    root.classList.remove('theme-ironman', 'theme-captain', 'theme-thor', 'theme-core', 'theme-hulk');
    root.classList.add(`theme-${activeSquad}`);
    localStorage.setItem('letscook_squad', activeSquad);
  }, [activeSquad]);

  const sparkColor = activeSquad === 'thor' 
    ? '#f59e0b' 
    : activeSquad === 'captain' 
      ? '#38bdf8' 
      : (activeSquad === 'hulk' || activeSquad === 'core') 
        ? '#22c55e' 
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
        {activeEasterEgg && (
          <Suspense fallback={null}>
            <CinematicEasterEggOverlay 
              effect={activeEasterEgg} 
              onComplete={() => setActiveEasterEgg(null)} 
            />
          </Suspense>
        )}

        {/* Main Site Container */}
        <div className="site-main-wrapper">
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
            <Suspense fallback={null}>
              {currentPage === 'privacy' && <PrivacyPolicyPage setCurrentPage={setCurrentPage} />}
              {currentPage === 'terms' && <TermsPage setCurrentPage={setCurrentPage} />}
              {currentPage === 'links' && <LinksPage setCurrentPage={setCurrentPage} currentSquad={activeSquad} onSelectSquad={setActiveSquad} />}
              {currentPage === 'verify' && <CertificateVerifyPage setCurrentPage={setCurrentPage} currentSquad={activeSquad} />}
              {currentPage === 'portal' && <PortalPage setCurrentPage={setCurrentPage} currentSquad={activeSquad} onSelectSquad={setActiveSquad} />}
            </Suspense>
          </main>

          {/* 8. Global Interactive Overlays & Modals */}
          <Suspense fallback={null}>
            {isSearchOpen && (
              <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                setCurrentPage={setCurrentPage}
              />
            )}
            {isPitchModalOpen && (
              <PitchIdeaModal
                isOpen={isPitchModalOpen}
                onClose={() => setIsPitchModalOpen(false)}
              />
            )}
            {isTerminalOpen && (
              <TerminalDrawer
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
                onOpenPitchModal={() => setIsPitchModalOpen(true)}
                onTriggerEasterEgg={setActiveEasterEgg}
                onSelectSquad={setActiveSquad}
              />
            )}
          </Suspense>
          <FloatingContact />
          <CookieBanner />
          <ScrollTopButton />
          <Analytics />
          <SpeedInsights />
        </div>
      </div>
    </ClickSpark>
  );
}

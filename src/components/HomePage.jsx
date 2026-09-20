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
  playAssembleFanfare,
  playCinematicShatterSound
} from '../utils/soundEngine';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

// Realistic Movie-Accurate Asgardian Stormbreaker Battle-Axe Component
export function StormbreakerSVG({ idPrefix = 'sb', className = '', width = 80, height = 80, withLightning = true }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      width={width} 
      height={height} 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Nidavellir Forged Dark Uru Metal Gradient */}
        <linearGradient id={`${idPrefix}-uruBody`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="30%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Razor Edge Bifrost Energy Gleam */}
        <linearGradient id={`${idPrefix}-bladeEdge`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#e0f2fe" />
          <stop offset="65%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* 3D Hammer Mallet Top Chamfer Facet */}
        <linearGradient id={`${idPrefix}-hammerTop`} x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="60%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* 3D Hammer Striking Face */}
        <linearGradient id={`${idPrefix}-hammerFace`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0b1120" />
        </linearGradient>

        {/* Asgardian Gold / Bronze Forge Bands */}
        <linearGradient id={`${idPrefix}-forgeGold`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Groot's Gnarled Living Wood Bark 1 */}
        <linearGradient id={`${idPrefix}-grootBark1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="40%" stopColor="#451a03" />
          <stop offset="80%" stopColor="#2e1002" />
          <stop offset="100%" stopColor="#1c0a01" />
        </linearGradient>

        {/* Groot's Gnarled Living Wood Bark 2 */}
        <linearGradient id={`${idPrefix}-grootBark2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="50%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>

        {/* High-Voltage Asgardian Glow Filter */}
        <filter id={`${idPrefix}-bifrostGlow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* GROOT'S LIVING WOOD HANDLE (Entwined branches with natural contours) */}
      <g className="groot-handle-group">
        {/* Base shadow of the handle */}
        <path 
          d="M48,50 C44,61 54,71 47,81 C43,87 49,94 46,99 C49,101 54,99 53,96 C56,88 50,81 54,73 C58,63 51,55 52,50 Z" 
          fill="#1c0a01" 
        />
        {/* Main twisted branch 1 */}
        <path 
          d="M47,51 C43,62 53,70 47,80 C42,86 48,93 45,98 C46,99 50,99 49,96 C52,90 47,82 51,74 C56,64 49,56 50,51 Z" 
          fill={`url(#${idPrefix}-grootBark1)`} 
          stroke="#2e1002" 
          strokeWidth="0.8" 
        />
        {/* Second entwined branch 2 coiling over trunk 1 */}
        <path 
          d="M50,51 C54,59 46,68 53,78 C56,84 50,92 53,97 C54,97 56,96 55,94 C52,87 58,81 55,72 C49,62 56,55 53,51 Z" 
          fill={`url(#${idPrefix}-grootBark2)`} 
          stroke="#451a03" 
          strokeWidth="0.8" 
        />
        {/* Groot's severed root flare & jagged branch end (Avengers: Infinity War) */}
        <path 
          d="M44,97 C46,101 55,101 57,96 L53,93 L47,94 Z" 
          fill="#53270c" 
          stroke="#2e1002" 
          strokeWidth="0.9" 
        />
        {/* Organic bark striations & fibrous wood ridges */}
        <path d="M48,56 C46,64 51,72 48,79" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
        <path d="M51,64 C53,72 49,81 52,89" stroke="#b45309" strokeWidth="0.7" strokeLinecap="round" opacity="0.85" />
        <path d="M47,84 C45,89 49,94 47,97" stroke="#78350f" strokeWidth="0.8" strokeLinecap="round" />

        {/* Living vine tendril cords coiled around socket eye */}
        <path d="M44,51 C48,53 52,53 56,51" stroke="#ca8a04" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M44,54 C48,56 52,56 56,54" stroke="#854d0e" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M45,58 C49,60 52,60 55,58" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" />
        {/* Budding leaf tendril knot */}
        <circle cx="54" cy="62" r="1.2" fill="#65a30d" />
        <circle cx="47" cy="73" r="1.1" fill="#4d7c0f" />
      </g>

      {/* FACETED 3D HAMMER MALLET POLL (Right Wing) */}
      <g className="storm-hammer-group">
        {/* Hammer Top Chamfer Facet */}
        <polygon 
          points="54,26 84,19 90,23 54,31" 
          fill={`url(#${idPrefix}-hammerTop)`} 
          stroke="#64748b" 
          strokeWidth="0.8" 
          strokeLinejoin="round" 
        />
        {/* Main Hammer Body / Side Facet */}
        <polygon 
          points="54,31 84,23 84,49 54,47" 
          fill={`url(#${idPrefix}-uruBody)`} 
          stroke="#475569" 
          strokeWidth="1" 
          strokeLinejoin="round" 
        />
        {/* Hammer Bottom Chamfer Facet */}
        <polygon 
          points="54,47 84,49 90,53 54,51" 
          fill="#0f172a" 
          stroke="#334155" 
          strokeWidth="0.8" 
          strokeLinejoin="round" 
        />
        {/* Heavy Textured Front Striking Face (3D Impact Mallet) */}
        <polygon 
          points="84,19 92,23 92,53 84,49" 
          fill={`url(#${idPrefix}-hammerFace)`} 
          stroke="#94a3b8" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />
        {/* Striking Face Inset Grid / Nidavellir Forged Notches */}
        <line x1="86" y1="26" x2="90" y2="28" stroke="#64748b" strokeWidth="1" />
        <line x1="86" y1="36" x2="90" y2="38" stroke="#64748b" strokeWidth="1" />
        <line x1="86" y1="46" x2="90" y2="48" stroke="#64748b" strokeWidth="1" />

        {/* Asgardian Forge Reinforcement Brackets */}
        <rect x="76" y="24" width="3.5" height="25" fill={`url(#${idPrefix}-forgeGold)`} rx="0.5" />
        <circle cx="77.7" cy="27" r="0.9" fill="#fef08a" />
        <circle cx="77.7" cy="46" r="0.9" fill="#fef08a" />
      </g>

      {/* SWEPT BEARDED AXE BLADE (Left Wing - Nidavellir Uru Battle Blade) */}
      <g className="storm-axe-group">
        {/* Main Axe Blade Body (Dark Uru Metal with Full Beard) */}
        <path 
          d="M50,22 C32,20 18,24 8,36 C5,45 10,58 20,64 C25,66 38,65 50,56 L50,47 C37,53 28,52 23,48 C18,43 18,36 28,30 C35,27 44,26 50,26 Z" 
          fill={`url(#${idPrefix}-uruBody)`} 
          stroke="#334155" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />

        {/* Razor-Sharp Crystalline Cutting Edge (Bevel Grind Line) */}
        <path 
          d="M50,22 C32,20 18,24 8,36 C5,45 10,58 20,64 C25,66 38,65 50,56" 
          stroke={`url(#${idPrefix}-bladeEdge)`} 
          strokeWidth="2.4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter={`url(#${idPrefix}-bifrostGlow)`} 
        />
        {/* Extreme Edge Gleam Line */}
        <path 
          d="M42,21.5 C28,21.5 16,25.5 8,36 C6,43 10,55 19,63" 
          stroke="#ffffff" 
          strokeWidth="0.9" 
          strokeLinecap="round" 
          opacity="0.9" 
        />

        {/* Top Spine Horn / Spike of the Axe */}
        <polygon points="50,22 42,18 30,19 36,22" fill="#64748b" stroke="#94a3b8" strokeWidth="0.6" />

        {/* Etched Asgardian Norse Runes on Blade Cheek */}
        <g stroke="#38bdf8" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" filter={`url(#${idPrefix}-bifrostGlow)`}>
          <path d="M26,34 L32,38 L26,42 M29,36 L29,48" />
          <path d="M35,33 L40,37 L35,41 M38,35 L38,47" />
          <line x1="22" y1="44" x2="30" y2="50" />
          <line x1="28" y1="45" x2="24" y2="52" />
        </g>
      </g>

      {/* CENTRAL FORGED EYE SOCKET & ASGARDIAN RUNE CORE */}
      <g className="storm-socket-group">
        {/* Forged Heavy Collar Sleeve */}
        <rect 
          x="44" 
          y="21" 
          width="12" 
          height="32" 
          rx="2" 
          fill="#1e293b" 
          stroke="#64748b" 
          strokeWidth="1.8" 
        />
        {/* Gold Inlay Forge Rings on Socket */}
        <line x1="44" y1="26" x2="56" y2="26" stroke="#f59e0b" strokeWidth="1.4" />
        <line x1="44" y1="48" x2="56" y2="48" stroke="#f59e0b" strokeWidth="1.4" />

        {/* Pulsing Celestial Bifrost Rune Node Core */}
        <g className="bifrost-rune-node">
          <circle cx="50" cy="37" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
          <circle cx="50" cy="37" r="4.2" fill="#0284c7" filter={`url(#${idPrefix}-bifrostGlow)`} />
          {/* Asgardian Core Star / Iris */}
          <polygon points="50,33 51.5,36 54.5,37 51.5,38 50,41 48.5,38 45.5,37 48.5,36" fill="#ffffff" />
          <circle cx="50" cy="37" r="1.5" fill="#fef08a" />
        </g>
      </g>

      {/* DYNAMIC ASGARDIAN ELECTROSTATIC LIGHTNING ARCS */}
      {withLightning && (
        <g filter={`url(#${idPrefix}-bifrostGlow)`} className="stormbreaker-electric-arcs">
          {/* Arc 1: Dancing along the axe blade */}
          <path 
            d="M6,38 L12,32 L9,26 L16,21 L12,16" 
            stroke="#38bdf8" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lightning-spark-1"
          />
          {/* Arc 2: Bearded hook spark leaping down */}
          <path 
            d="M18,63 L14,70 L20,74 L16,80" 
            stroke="#00f0ff" 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lightning-spark-2"
          />
          {/* Arc 3: Leaping across hammer poll */}
          <path 
            d="M86,21 L93,27 L88,34 L95,41 L89,48" 
            stroke="#facc15" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lightning-spark-3"
          />
          {/* Arc 4: Coiling around Groot's handle */}
          <path 
            d="M45,68 L53,74 L46,82 L54,88 L48,94" 
            stroke="#38bdf8" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="lightning-spark-4"
          />
        </g>
      )}
    </svg>
  );
}

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
      <svg viewBox="0 0 100 100" className="w-20 h-20" width="80" height="80">
        <defs>
          <radialGradient id="arcCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#00f0ff" />
            <stop offset="85%" stopColor="#0077aa" />
            <stop offset="100%" stopColor="#051525" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="#070c14" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="6 3" className="spin-slow" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ff0055" strokeWidth="2" opacity="0.6" />
        <circle cx="50" cy="50" r="30" fill="#0a1828" stroke="#00f0ff" strokeWidth="2" />
        <polygon points="50,26 71,62 29,62" fill="none" stroke="#00f0ff" strokeWidth="3" className="pulse-slow" />
        <polygon points="50,34 64,58 36,58" fill="url(#arcCoreGlow)" />
        <circle cx="50" cy="50" r="6" fill="#ffffff" filter="drop-shadow(0 0 6px #00f0ff)" />
      </svg>
    )
  },
  captain: {
    key: 'captain',
    team: 'PR TEAM',
    hero: 'CAPTAIN AMERICA',
    title: 'VIBRANIUM ALLIANCE',
    badge: 'CLEARANCE: STRATEGIC SHIELD',
    status: 'DEPLOYED // STAMINA 100%',
    quote: '"I can do this all day."',
    desc: 'Public relations, community diplomacy, university outreach, brand partnerships, and social storytelling across national developer ecosystems.',
    color: '#0055ff',
    secondaryColor: '#ffffff',
    linktree: `${LINKTREE_URL}&utm_source=squad_pr_captain`,
    initiatives: [
      { title: 'Global Campus Outreach', desc: 'Active student ambassador hubs across 40+ engineering colleges.' },
      { title: 'Storytelling & Public Relations', desc: 'Showcasing student-shipped software to thousands of founders & devs.' },
      { title: 'Ecosystem Alliances', desc: 'Partnering with top developer tooling platforms, hackathons, and VCs.' }
    ],
    arsenal: ['Community', 'Keynotes', 'Alliances', 'Outreach', 'Branding', 'Diplomacy'],
    sound: playVibraniumPing,
    insigniaSvg: (
      <svg viewBox="0 0 100 100" className="w-20 h-20 cap-shield-insignia" width="80" height="80">
        <circle cx="50" cy="50" r="46" fill="#b91c1c" stroke="#dc2626" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="37" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        <circle cx="50" cy="50" r="28" fill="#b91c1c" stroke="#dc2626" strokeWidth="1" />
        <circle cx="50" cy="50" r="19" fill="#1d4ed8" stroke="#2563eb" strokeWidth="1" />
        <polygon points="50,38 53,46 61,46 55,51 57,59 50,54 43,59 45,51 39,46 47,46" fill="#ffffff" className="shield-star-spin" />
      </svg>
    )
  },
  thor: {
    key: 'thor',
    team: 'EVENTS TEAM',
    hero: 'THOR',
    title: 'STORMBREAKER OPS',
    badge: 'REALM: NIDAVELLIR FORGE',
    status: 'HIGH VOLTAGE // BIFROST SURGE',
    quote: '"Bring me Thanos!"',
    desc: 'High-octane 48-hour national hackathons, live code tournaments, campus speaker arenas, and lightning sprint demo stages powered by Asgardian energy.',
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
      <StormbreakerSVG idPrefix="sb_insignia" className="w-20 h-20" width={80} height={80} withLightning={true} />
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
      <svg viewBox="0 0 100 100" className="w-20 h-20 avengers-anim" width="80" height="80">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 5" className="spin-slow" />
        <circle cx="50" cy="50" r="34" fill="#0d0d14" stroke="#ff0055" strokeWidth="2.5" />
        <path d="M48 22 L32 68 L42 68 L47 52 L60 52 L60 44 L48 44 L52 30 Z" fill="#f59e0b" />
        <path d="M60 44 L72 68 L64 68 L60 60 L56 60 Z" fill="#f59e0b" />
        <polygon points="56,52 78,52 68,44" fill="#ff0055" />
      </svg>
    )
  }
};

// 3D Holographic Stark Arc Reactor Component
function ArcReactor3D() {
  return (
    <div className="arc-reactor-3d-container" aria-label="3D Stark Arc Reactor">
      {/* 3D Holographic Outer Ring with Rotating Gimbal */}
      <div className="arc-3d-outer-gimbal">
        <div className="arc-3d-ring-outer" />
        <div className="arc-3d-ring-middle" />
        {/* Floating Concentric Energy Triangle & Unibeam Core */}
        <div className="arc-3d-core-triangle">
          <svg viewBox="0 0 100 100" className="arc-3d-triangle-svg">
            <polygon 
              points="50,22 74,64 26,64" 
              fill="rgba(0, 240, 255, 0.35)" 
              stroke="#00f0ff" 
              strokeWidth="4" 
              filter="drop-shadow(0 0 12px #00f0ff)"
            />
            <circle cx="50" cy="50" r="12" fill="#ffffff" filter="drop-shadow(0 0 15px #ffffff)" />
          </svg>
        </div>
      </div>
      {/* Rotating 3D Particle Light Rings */}
      <div className="arc-3d-orbit-ring-1" />
      <div className="arc-3d-orbit-ring-2" />
    </div>
  );
}

export default function HomePage({ 
  setCurrentPage, 
  onOpenPitchModal, 
  currentSquad = 'ironman', 
  onSelectSquad,
  onTriggerEasterEgg 
}) {
  const [accessCode, setAccessCode] = useState('');
  const activeSquad = SQUADS_DATA[currentSquad] || SQUADS_DATA.ironman;

  // Stark Arc Flux & 3D Holographic State
  const [isTestingFlux, setIsTestingFlux] = useState(false);
  const [fluxTested, setFluxTested] = useState(false);
  const [isArcFlickering, setIsArcFlickering] = useState(false);
  const [isArc3D, setIsArc3D] = useState(false);

  const handleTestArcFlux = () => {
    playRepulsorSound();
    setIsTestingFlux(true);
    setFluxTested(false);
    setIsArcFlickering(true);
    setIsArc3D(false);

    if (onTriggerEasterEgg) {
      onTriggerEasterEgg('jarvis');
    }

    // Violent electrical plasma flicker for 500ms
    setTimeout(() => {
      setIsArcFlickering(false);
      setIsArc3D(true);
      setIsTestingFlux(false);
      setFluxTested(true);

      setTimeout(() => setFluxTested(false), 7000);
      // 3D holographic mode remains active for 9s
      setTimeout(() => setIsArc3D(false), 9000);
    }, 500);
  };

  // Captain America Vibranium Shield State
  const [isDeployingShield, setIsDeployingShield] = useState(false);
  const [shieldDeployed, setShieldDeployed] = useState(false);

  const handleDeployShield = () => {
    playVibraniumPing();
    document.body.classList.add('seismic-shake');
    setIsDeployingShield(true);
    setShieldDeployed(false);

    if (onTriggerEasterEgg) {
      onTriggerEasterEgg('shield');
    }

    setTimeout(() => {
      document.body.classList.remove('seismic-shake');
      setIsDeployingShield(false);
      setShieldDeployed(true);
      setTimeout(() => setShieldDeployed(false), 5000);
    }, 5200);
  };

  // Asgardian Stormbreaker Jammed State
  const [isSummoningStorm, setIsSummoningStorm] = useState(false);
  const [stormSummoned, setStormSummoned] = useState(false);
  const [stormbreakerJammed, setStormbreakerJammed] = useState(false);

  const handleSummonStormbreaker = () => {
    playThunderStrike();
    setIsSummoningStorm(true);
    setStormSummoned(false);
    setStormbreakerJammed(false);

    // Hypersonic descent along Bifrost conduit, slams into button at 500ms
    setTimeout(() => {
      document.body.classList.add('seismic-shake');
      playThunderStrike();
      playCinematicShatterSound();
      setIsSummoningStorm(false);
      setStormbreakerJammed(true);
      setStormSummoned(true);

      setTimeout(() => {
        document.body.classList.remove('seismic-shake');
      }, 600);

      // Remains wedged in button for 8 seconds
      setTimeout(() => {
        setStormbreakerJammed(false);
        setStormSummoned(false);
      }, 8000);
    }, 500);
  };

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

      {/* Dynamic Full-Screen Bifrost Sky Conduit & Lightning Summon */}
      {isSummoningStorm && (
        <div className="bifrost-summon-screen" aria-hidden="true">
          <div className="bifrost-sky-storm-bg" />
          <div className="bifrost-lightning-strobe-overlay" />
          <div className="bifrost-sky-conduit-pillar">
            <div className="bifrost-sky-rainbow-column" />
            <div className="bifrost-sky-lightning-core" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HERO SECTION (TIGHT COMPOSITION & PROMINENT LIGHTING)  */}
      {/* ========================================================= */}
      <section id="hero-top" className="hero-section">
        <div className="hero-container">
          


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

                  {activeSquad.key === 'ironman' && (
                    <button
                      type="button"
                      onClick={handleTestArcFlux}
                      disabled={isTestingFlux}
                      className="btn-secondary glow-btn"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: '1px solid rgba(0, 240, 255, 0.6)',
                        color: '#ffffff',
                        background: 'rgba(0, 240, 255, 0.12)'
                      }}
                      title="Initialize Stark J.A.R.V.I.S. HUD & Nanotech Swarm Assembly"
                    >
                      {isTestingFlux ? 'INITIALIZING HUD...' : isArc3D ? 'J.A.R.V.I.S. & NANOTECH ACTIVE' : 'INITIALIZE J.A.R.V.I.S. & NANOTECH'}
                    </button>
                  )}

                  {fluxTested && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      color: '#00f0ff',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      STARK J.A.R.V.I.S. & NANOTECH MATRIX ONLINE // ARC FLUX 3.2 GW
                    </span>
                  )}

                  {activeSquad.key === 'captain' && (
                    <button
                      type="button"
                      onClick={handleDeployShield}
                      disabled={isDeployingShield}
                      className="btn-secondary glow-btn"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: '1px solid rgba(59, 130, 246, 0.6)',
                        color: '#ffffff',
                        background: 'rgba(59, 130, 246, 0.15)'
                      }}
                      title="Deploy Vibranium Shield Ricochet Protocol"
                    >
                      {isDeployingShield ? 'RICOCHETING SHIELD...' : 'DEPLOY VIBRANIUM SHIELD'}
                    </button>
                  )}

                  {shieldDeployed && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      color: '#38bdf8',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      VIBRANIUM SHIELD DEPLOYED // KINETIC ABSORPTION 100%
                    </span>
                  )}

                  {activeSquad.key === 'thor' && (
                    <div className="stormbreaker-btn-wrap">
                      <button
                        type="button"
                        onClick={handleSummonStormbreaker}
                        disabled={isSummoningStorm}
                        className={`btn-secondary glow-btn stormbreaker-summon-btn ${
                          stormbreakerJammed ? 'stormbreaker-jammed-btn' : ''
                        }`}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          border: '1px solid rgba(255, 170, 0, 0.6)',
                          color: '#ffffff',
                          background: 'rgba(255, 170, 0, 0.15)'
                        }}
                        title="Summon Stormbreaker with Asgardian Lightning"
                      >
                        {/* Molten impact fracture cracks radiating through button surface when jammed */}
                        {stormbreakerJammed && (
                          <svg className="button-molten-fractures" viewBox="0 0 200 60" preserveAspectRatio="none">
                            <path d="M195,6 L175,18 L152,14 L138,26" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.9" />
                            <path d="M185,15 L168,32 L146,38 L130,30" stroke="#00f0ff" strokeWidth="1.6" fill="none" opacity="0.85" />
                            <path d="M192,12 L180,24 L164,48 L142,54" stroke="#facc15" strokeWidth="1.5" fill="none" opacity="0.8" />
                          </svg>
                        )}

                        {isSummoningStorm ? (
                          'CHANNELING BIFROST...'
                        ) : stormbreakerJammed ? (
                          'STORMBREAKER EMBEDDED // BIFROST ACTIVE'
                        ) : (
                          'SUMMON STORMBREAKER'
                        )}
                      </button>

                      {/* Animated Stormbreaker Axe Jamming Into Button */}
                      {(isSummoningStorm || stormbreakerJammed) && (
                        <div className={`stormbreaker-strike-wedge ${
                          isSummoningStorm ? 'axe-striking' : 'axe-lodged'
                        }`}>
                          {/* Blinding Supernova Impact Blast */}
                          {stormbreakerJammed && <div className="impact-supernova-blast" />}
                          {/* Concentric Expanding Shockwave Ring */}
                          {stormbreakerJammed && <div className="impact-shockwave-ring" />}

                          {/* Authentic Movie-Accurate Stormbreaker SVG */}
                          <div className="embedded-stormbreaker-container">
                            <StormbreakerSVG 
                              idPrefix="sb_jammed" 
                              className="embedded-stormbreaker-svg" 
                              width={70} 
                              height={70} 
                              withLightning={true} 
                            />
                          </div>

                          {/* Live Electrostatic Lightning Bolts jumping into button */}
                          {stormbreakerJammed && (
                            <div className="live-electrostatic-arcs">
                              <svg viewBox="0 0 100 100" className="live-lightning-arcs-svg">
                                <path d="M50,40 L65,55 L58,68 L72,82" stroke="#00f0ff" strokeWidth="2.2" strokeLinecap="round" fill="none" className="arc-pulse-1" />
                                <path d="M40,48 L26,60 L34,74 L20,86" stroke="#facc15" strokeWidth="1.8" strokeLinecap="round" fill="none" className="arc-pulse-2" />
                                <path d="M52,36 L44,48 L48,60 L38,72" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" className="arc-pulse-3" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {stormSummoned && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      color: '#ffbb00',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      STORMBREAKER READY // BIFROST CHANNEL ACTIVE
                    </span>
                  )}

                  <span className="spotlight-cta-subtext">Direct Linktree community onboarding</span>
                </div>
              </div>

              {/* Insignia & Telemetry Display */}
              <div className="spotlight-insignia-panel">
                <div 
                  className="insignia-wrapper"
                  onClick={activeSquad.key === 'ironman' ? handleTestArcFlux : undefined}
                  style={activeSquad.key === 'ironman' ? { cursor: 'pointer' } : undefined}
                  title={activeSquad.key === 'ironman' ? "Click to deploy J.A.R.V.I.S. HUD & Nanotech Swarm" : undefined}
                >
                  <div className={`insignia-glow-ring ${
                    activeSquad.key === 'ironman' && isArcFlickering ? 'arc-reactor-flickering' : ''
                  } ${
                    activeSquad.key === 'ironman' && isArc3D ? 'arc-reactor-3d-active' : ''
                  }`}>
                    {activeSquad.key === 'ironman' && isArc3D ? (
                      <ArcReactor3D />
                    ) : (
                      activeSquad.insigniaSvg
                    )}
                  </div>
                  <div className="insignia-label">{activeSquad.hero} // PROTOCOL</div>
                  <div className="insignia-sublabel">
                    {activeSquad.key === 'thor'
                      ? 'STORMBREAKER // BIFROST READY'
                      : activeSquad.key === 'captain'
                        ? 'VIBRANIUM ALLIANCE // SHIELD ACTIVE'
                        : activeSquad.key === 'ironman'
                          ? (isArc3D ? 'HOLOGRAPHIC 3D ARC MATRIX ONLINE' : 'ARC FLUX: 3.2 GW · CLICK TO DEPLOY HUD')
                          : 'SYSTEM NOMINAL'}
                  </div>
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
          padding: 36px 20px 56px 20px;
          border-bottom: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
          max-width: 100vw;
          box-sizing: border-box;
          background: radial-gradient(circle at 50% 32%, var(--accent-burgundy-light) 0%, transparent 65%);
        }

        .hero-container {
          position: relative;
          z-index: 10;
          max-width: 1000px;
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
          font-size: clamp(1.75rem, 6vw, 4.4rem);
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
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .squad-tab-btn {
            padding: 10px 8px;
            font-size: 0.82rem;
          }
          .squads-cards-grid {
            grid-template-columns: 1fr;
          }
          .hero-section {
            padding: 24px 14px 32px 14px;
          }
          .hero-cta-group {
            flex-direction: column;
            width: 100%;
          }
          .hero-cta-group .btn {
            width: 100%;
            justify-content: center;
          }
          .spotlight-cta-row {
            flex-direction: column;
            width: 100%;
            align-items: stretch;
          }
          .spotlight-cta-row .btn-primary,
          .spotlight-cta-row .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .squads-section, .access-section, .site-footer {
            padding: 36px 14px;
          }
          .active-squad-spotlight {
            padding: 18px 12px;
          }
          .access-box {
            padding: 22px 14px;
          }
          .stat-card {
            padding: 14px 14px;
          }
        }
      `}</style>
    </div>
  );
}

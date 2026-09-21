# RECREATION SPECIFICATION & AI AGENT CONTEXT: LET'S COOK WEBSITE

> **Target Audience:** Autonomous AI Coding Agent / Senior Full-Stack Engineer  
> **Mission:** Recreate the entire **Let's Cook** website from scratch with peak performance, 120 FPS GPU-accelerated animations, zero memory leaks, and clean modular code—while preserving **100% of all visual designs, audio frequencies, Marvel Tri-Squad mechanics, circuit-board links page, and gatekeeper parameters**.

---

## 1. Project Overview & Core Brand Identity

- **Platform Name:** Let's Cook (`letscook.co.in`)
- **Tagline:** *"A student-run tech community. Stop watching tutorials. Start shipping."*
- **Latin Motto:** `CODERE · AEDIFICARE · VINCERE` (Code, Build, Conquer)
- **Organization:** The Foundry (Student Software Engineering & Builder Team)
- **Base Location:** Mathura, U.P., India
- **Core Tech Stack:**
  - Runtime: Vite 5 + React 18 (SPA)
  - Icons: `lucide-react`
  - Audio: Native Web Audio API (100% synthesized procedural sound effects, **zero external audio assets**)
  - Styling: Pure modern CSS with custom design tokens, hardware-accelerated transforms, and CSS Grid/Flexbox
  - Hosting/Routing: Vercel with clean rewrites for `/links`

---

## 2. Global Design System & Strict Parameters

### 2.1 Color Palette & Theme Tokens
The website is permanently anchored in dark mode with Marvel Tri-Squad universe theme variants:

```css
:root {
  /* Core Brand Tokens */
  --bg-main: #060608;
  --bg-surface: #0e0e12;
  --bg-card: #141418;
  --card-hover: #1a1a20;
  --border-color: #24242d;
  --border-subtle: #1a1a22;
  --text-main: #f4f4f6;
  --text-dim: #d1d1db;
  --text-muted: #8a8a98;

  /* Primary Accent: Foundry Crimson */
  --accent-burgundy: #b70e32;
  --accent-deep: #8e0a26;
  --accent-glow: rgba(183, 14, 50, 0.4);
  --accent-border: #ff2a6d;

  /* Marvel Squad Dynamic Tokens */
  --squad-ironman: #ff0055;
  --squad-ironman-secondary: #00f0ff;
  --squad-captain: #0055ff;
  --squad-captain-secondary: #38bdf8;
  --squad-thor: #d97706;
  --squad-thor-secondary: #f59e0b;
  --squad-core: #8b002e;
  --squad-core-secondary: #f59e0b;
}

/* Squad Dynamic Classes on <html> */
html.theme-ironman { --accent-primary: #ff0055; --accent-secondary: #00f0ff; }
html.theme-captain { --accent-primary: #0055ff; --accent-secondary: #38bdf8; }
html.theme-thor    { --accent-primary: #d97706; --accent-secondary: #f59e0b; }
html.theme-core    { --accent-primary: #8b002e; --accent-secondary: #f59e0b; }
```

### 2.2 Typography
- **Headings & Badges:** `Space Grotesk`, system-ui, -apple-system, sans-serif
- **Body Text:** `Inter`, -apple-system, Roboto, sans-serif
- **Links Hub:** `Poppins`, system-ui, sans-serif (Weights: 400, 500, 600, 700, 800)
- **Terminal & Telemetry:** `JetBrains Mono`, `Fira Code`, `Consolas`, monospace

---

## 3. Subsystem 1: Launch Lockout Gate & Countdown

### 3.1 Functionality & Gate Conditions
- **Target Time:** **6:00 PM today IST** (`18:00:00 IST`).
- **Condition:**
  ```javascript
  const target = new Date();
  target.setHours(18, 0, 0, 0); // 6:00 PM today
  const isLocked = Date.now() < target.getTime();
  ```
- If `isLocked === true`, render `<LaunchOverlay onReveal={handleRevealLaunch} />`.
- **CRITICAL BUG TO AVOID:** Do NOT check `url.includes('cook')` or `url.includes('dev')` for bypasses! The domain is `letscook.co.in`, so checking `url.includes('cook')` will falsely unlock the gate for all users! Only check explicit search params: `new URLSearchParams(window.location.search).get('unlock') === '1'`.
- At 6:00 PM (`difference <= 0`), the timer automatically triggers the cinematic shatter and unlocks the site.

### 3.2 Backtick (`` ` ``) Key Access Mechanism
- Listen on `window` in **capture phase** (`addEventListener('keydown', handleKeyDown, true)`):
  ```javascript
  if (
    e.key === '`' || 
    e.key === '~' || 
    e.code === 'Backquote' || 
    e.keyCode === 192 || 
    e.which === 192
  ) {
    e.preventDefault();
    if (animPhase === 'idle') {
      playCinematicShatter();
    } else {
      onReveal(); // Double-tap immediately enters
    }
  }
  ```

### 3.3 Cinematic Shatter Animation Sequence
Total Duration: **5900ms**
1. **0ms - 1000ms (`charging`)**: Sub-bass boom & physical screen rumble (`animation: rumble 1s ease infinite`).
2. **1000ms - 2100ms (`cracking`)**: Spiderweb glass crack SVG overlay drawn with stroke-dashoffset animation; audio crackle.
3. **2100ms - 3100ms (`logo-flicker`)**: Central squircle logo reveals with neon CRT electric flicker (`playNeonIgniteSound()`).
4. **3100ms - 4500ms (`logo-present`)**: Logo pulse with Latin motto `CODERE · AEDIFICARE · VINCERE`.
5. **4500ms - 5900ms (`dissolve`)**: Radial scale zoom (1.15x) + blur (12px) + fade out.
6. **5900ms**: Unmount overlay, call `onReveal()`, and spawn movable `MacOsTimerWindow`.

---

## 4. Subsystem 2: Custom Circuit-Style Community Links Hub (Zero Linktree)

### 4.1 Requirements & Elimination of Linktree
- Every single reference to `linktr.ee/letscookfoundry` is **permanently eliminated**.
- Direct URL access to `/links` and `/links/` serves a standalone, ultra-fast static HTML file (`public/links/index.html`) in `<50ms` with zero JS bundle overhead.
- In-app navigation renders `LinksPage.jsx` with full browser history `popstate` support.

### 4.2 Exact Visual Specs (Circuit Board Theme)
- **Container:** `max-width: 460px`, rounded squircle card (`border-radius: 24px`, background `#161214`, border `1px solid #3A2A2F`).
- **Corner SVG Circuit Traces:**
  - Top-Right:
    ```html
    <svg class="trace tr" viewBox="0 0 150 120" fill="none" stroke="#6B2A38" stroke-width="2.5">
      <path d="M20 10 H70 L100 40 V80 L130 110"/><circle cx="14" cy="10" r="6"/>
      <path d="M60 30 L85 55 V100"/><circle cx="55" cy="26" r="5"/><circle cx="85" cy="106" r="5"/>
    </svg>
    ```
  - Bottom-Left:
    ```html
    <svg class="trace bl" viewBox="0 0 130 110" fill="none" stroke="#6B2A38" stroke-width="2.5" style="transform: rotate(180deg)">
      <path d="M10 10 H60 L90 40 V90"/><circle cx="90" cy="96" r="6"/><path d="M40 30 L60 50 H110"/><circle cx="116" cy="50" r="5"/>
    </svg>
    ```
- **Circuit Bus Wire & Solder Nodes:**
  - Main Bus: `nav::before` (vertical line: `left: 11px`, `width: 2px`, background `#B70E32`).
  - Branch trace: `.link::before` (`left: -23px`, `width: 22px`, `height: 2px`, background `#B70E32`).
  - Solder node: `.link::after` (`left: -29px`, `width: 12px`, `height: 12px`, circle with `border: 2px solid #B70E32`).
  - Hover effect: Card translates right (`transform: translateX(4px)`), node fills solid `#B70E32`.

### 4.3 Link Roster:
1. **Website**: `/` (Subtitle: `letscook.co.in`)
2. **WhatsApp Community**: `https://chat.whatsapp.com/Gogg1uWXakiEPFmmtQrTHL`
3. **Instagram**: `https://www.instagram.com/letscook_com/` (`@letscook_com`)
4. **LinkedIn**: `https://www.linkedin.com/company/let-s-cook-community-the-foundry/`
5. **GitHub**: `https://github.com/letscook-community`
6. **Social Chips Grid:**
   - X: `https://x.com/letscook_com`
   - Threads: `https://www.threads.com/@letscook_com`
   - Facebook: `https://www.facebook.com/profile.php?id=61594453651601`
   - Email: `mailto:foundry@letscook.co.in`

---

## 5. Subsystem 3: Marvel Tri-Squad Universe & Live Canvas

The application maintains an active squad state: `'ironman' | 'captain' | 'thor' | 'core'`.

### 5.1 Squad Profiles
| Squad Key | Hero Identity | Team Name | Primary / Secondary Colors | Arsenal / Tech Highlights | Audio Signature |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ironman` | Iron Man | Tech Squad | `#ff0055` / `#00f0ff` | Rust, PyTorch, WASM, J.A.R.V.I.S. HUD, 200mm Nanotech Target Matrix | `playRepulsorSound()` |
| `captain` | Captain America | PR Team | `#0055ff` / `#38bdf8` | Diplomacy, Storytelling, Rotating Star Vibranium Shield | `playVibraniumPing()` |
| `thor` | Thor | Events Team | `#d97706` / `#f59e0b` | Hackathons, 48h Sprints, Stormbreaker Forge SVG with lightning arcs | `playThunderStrike()` |
| `core` | Avengers Initiative | Core Command | `#8b002e` / `#f59e0b` | Governance, Micro-Grants, Treasury, S.H.I.E.L.D. Level 7 | `playAssembleFanfare()` |

### 5.2 Procedural 60 FPS Background Canvas (`SquadThemeCanvas.jsx`)
- **Particle Count:** 22 on mobile (`<768px`), 50 on desktop.
- **Rendering Modes:**
  - `ironman`: 3D cyan/crimson wireframe grid matrix + mouse parallax data telemetry.
  - `captain`: Circular expanding Vibranium shockwaves + 360-degree radar sweep line.
  - `thor`: Recursive fractal lightning branches (`drawLightningBranch`) + rising molten golden ember particles.
  - `core`: Quantum singularity gravitational lensing rings + cross-squad energy conduits.
- **Optimization:** Throttled `mousemove` with `requestAnimationFrame`, throttled window resize, and `ctx.clearRect` loop.

---

## 6. Subsystem 4: Web Audio API Procedural Sound Engine (`soundEngine.js`)

All sound effects are synthesized mathematically in realtime. Zero audio files (`.mp3`, `.wav`) are needed:

### 6.1 Sound Synthesis Specifications
1. **`playTechClick()`**:
   - Primary: Sine wave from 1100 Hz ramping down to 500 Hz over 90ms.
   - Sub-harmonic: Triangle wave from 300 Hz ramping to 120 Hz over 90ms.
   - Gain: 0.45 decaying exponentially to 0.001.
2. **`playDecodeTick()`**:
   - High micro-beep: Sine wave 2400 Hz -> 1800 Hz over 25ms, gain 0.15.
3. **`playRepulsorSound()`**:
   - Charging repulsor blast: Sawtooth wave sweeping 180 Hz up to 880 Hz with resonant bandpass filter (Q=6), followed by high-frequency burst.
4. **`playVibraniumPing()`**:
   - Metallic chime: Dual sine wave ringing at 2093 Hz (C7) and 3135 Hz with long decay (1.2s).
5. **`playThunderStrike()`**:
   - Dual noise burst buffer + low-pass filter at 120 Hz with heavy distortion + sub-bass drop at 45 Hz.
6. **`playAssembleFanfare()`**:
   - Harmonic brass chords: Triangle oscillators playing Fifth intervals (C4, G4, C5, E5) over 1.8s.
7. **`playCinematicShatterSound()`**:
   - Sub-bass boom (55 Hz -> 20 Hz) + modulated pink noise burst simulating fracturing glass.
8. **`playNeonIgniteSound()`**:
   - Electric arc flicker: Triple pulse burst at 60 Hz buzz ramping into high-frequency neon hum (3200 Hz).

---

## 7. Subsystem 5: Interactive Overlays & Modals

### 7.1 Terminal Shell Drawer (`TerminalDrawer.jsx`)
- **Activation:** Shortcut `Ctrl + ~` / `Cmd + ~`, or click "Open Terminal" in Navbar.
- **Command Engine:**
  - `help`: Lists all available commands with syntax.
  - `squad [ironman|captain|thor|core]`: Instantly switches universe theme & canvas.
  - `snap`: Triggers Thanos snap disintegration easter egg.
  - `bifrost`: Triggers Asgardian rainbow lightning storm.
  - `jarvis`: Triggers Stark nanotech targeting HUD optics.
  - `worthy`: Plays Mjolnir thunder strike.
  - `assemble`: Plays Avengers assemble fanfare.
  - `pitch`: Opens the pitch modal.
  - `clear`: Clears the shell history.
  - `exit`: Closes the drawer.

### 7.2 Draggable macOS Project Pitch Desk (`PitchIdeaModal.jsx`)
- **Structure:** Styled after macOS window with traffic light buttons (red close, yellow minimize, green expand) and drag handle bar.
- **Submission Pipeline:** Headless submission via hidden `<iframe>` to Google Forms without triggering page navigation.
- **Post-Submission:** On success, displays `[SUCCESS 200 OK]` and provides a direct CTA to `/links`.

### 7.3 Instant Search Palette (`SearchModal.jsx`)
- **Activation:** `Ctrl + K` / `Cmd + K`, or Navbar Search icon.
- **Indexing:** Fast fuzzy search across Initiatives, FAQs, Community Links, Legal, and hidden founder credits.

### 7.4 Click Particle Sparks (`ClickSpark.jsx`)
- Canvas overlay capturing click coordinates.
- Radiates 8 radial particle sparks with ease-out physics matching the active squad's signature color.

---

## 8. Performance Optimization Directives for Rebuilding

To ensure **120 FPS buttery smooth animation** and zero UI latency, follow these strict engineering rules:

1. **GPU Layer Promotion:**
   - Use `transform: translate3d(0, 0, 0)` or `will-change: transform` on `.cinematic-backdrop`, `.flow-node`, `.modal-window`, and canvas overlays.
2. **Canvas Memory Safety:**
   - Pre-allocate particle objects in typed arrays or fixed pools. Avoid allocating new objects inside `requestAnimationFrame` loops to prevent Garbage Collection (GC) pauses.
3. **Passive Scroll & Resize Listeners:**
   - All window scroll and resize listeners must use `{ passive: true }`.
   - Throttle mousemove and scroll handlers with `requestAnimationFrame`.
4. **Clean Component Unmounting:**
   - Always cancel `requestAnimationFrame`, `clearInterval`, `clearTimeout`, and remove event listeners in `useEffect` cleanup returns.
5. **No Layout Thrashing:**
   - Never query `getBoundingClientRect()`, `offsetWidth`, or `innerHeight` inside render loops. Read layout once, cache in a ref, and update only on resize.

---

## 9. File Structure Map

```
├── public/
│   ├── links.html              # Standalone fast links hub (17.5 KB)
│   ├── links/
│   │   └── index.html          # Clean rewrite target for /links
│   ├── letscook-logo.png       # High-res squircle logo
│   ├── letscook-logo.svg       # Official vector insignia
│   └── manifest.json
├── src/
│   ├── App.jsx                 # App root, 6 PM Gatekeeper, Page routing, Global states
│   ├── main.jsx                # React root & ErrorBoundary
│   ├── index.css               # Global CSS variables, animations, and typography
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky header, Audio toggle, CTAs
│   │   ├── HomePage.jsx        # Landing view, Tri-Squad universe, Hero
│   │   ├── LaunchOverlay.jsx   # 6 PM lockout overlay, Backtick bypass, Shatter VFX
│   │   ├── MacOsTimerWindow.jsx# Movable floating macOS timer window
│   │   ├── SquadThemeCanvas.jsx# 60 FPS particle background canvas
│   │   ├── CinematicEasterEggOverlay.jsx # Fullscreen Marvel cinematic VFX
│   │   ├── JarvisNanotechHUD.jsx # Stark targeting reticle matrix
│   │   ├── TerminalDrawer.jsx  # CLI developer drawer
│   │   ├── PitchIdeaModal.jsx  # Draggable macOS pitch desk
│   │   ├── SearchModal.jsx     # Ctrl+K search palette
│   │   ├── FloatingContact.jsx # Popover contact widget
│   │   ├── ClickSpark.jsx      # Cursor click particle emitter
│   │   ├── FaqSection.jsx      # Expandable accordion
│   │   └── LogoMark.jsx        # Vector brand logo component
│   ├── pages/
│   │   ├── LinksPage.jsx       # Circuit board links React SPA page
│   │   ├── PrivacyPolicyPage.jsx # Compliance privacy documentation
│   │   └── TermsPage.jsx       # Terms of service
│   └── utils/
│       ├── countdown.js        # 6:00 PM today calculation logic
│       ├── soundEngine.js      # Procedural Web Audio API synthesizer
│       ├── pitchSubmission.js  # Headless Google Forms dispatcher
│       └── utmTracker.js       # UTM campaign parameter session persistence
├── vercel.json                 # Vercel deployment rewrites for /links & SPA
└── package.json
```

---

## 10. Direct Prompts to Feed to the Next AI Agent

When opening a new conversation, paste the following instruction along with this file:

```markdown
You are an expert full-stack React performance engineer.
Recreate the Let's Cook website by strictly following the specifications in RECREATION_SPEC.md.

Key Requirements:
1. Preserve 100% of all visual designs, colors, parameters, and audio oscillator frequencies.
2. Ensure the launch lockout gate stays locked until 6:00 PM today IST, and opens via the ` (backtick) key.
3. Keep the custom circuit-board /links page with zero third-party Linktree redirects.
4. Implement the procedural Web Audio API engine in soundEngine.js with zero external audio assets.
5. Maximize performance: 120 FPS canvas animations, GPU acceleration, object pooling, and no memory leaks.
```

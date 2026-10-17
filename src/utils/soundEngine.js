/**
 * Web Audio API Sound Engine (V2 - Cinema-Grade Acoustic & Tactile Soundscape)
 * Redesigned to eliminate high-pitched, childish, or arcade-like tones.
 * Features warm low-mid fundamentals, physical mechanical clicks,
 * low-pass acoustic filtering, and subtle tactile haptics.
 */

let audioCtx = null;
let soundMuted = false;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const setSoundMuted = (muted) => {
  soundMuted = muted;
};

export const isSoundMuted = () => soundMuted;

/**
 * 1. Premium Tactile Button Click
 * Warm, damped mechanical switch (Apple trackpad / Linear keyboard style).
 * No harsh high frequencies: 220Hz -> 65Hz body + 550Hz micro-snap.
 */
export const playTechClick = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Body: Warm low-end acoustic thump (220Hz -> 65Hz)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(220, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(65, now + 0.04);

    bodyGain.gain.setValueAtTime(0.14, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    bodyOsc.connect(filter);
    filter.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.04);

    // Transient: Subtle tactile switch snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(450, now);
    snapOsc.frequency.exponentialRampToValueAtTime(140, now + 0.018);

    snapGain.gain.setValueAtTime(0.08, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    snapOsc.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start(now);
    snapOsc.stop(now + 0.018);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 2. Subtle Mechanical Data Decode Tick
 * Authentic tactile mechanical keyboard / typewriter click (420Hz -> 160Hz)
 * Clearly audible on laptop and mobile speakers while remaining warm, mature, and non-childish.
 */
export const playDecodeTick = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Damped warm acoustic filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.8, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.032);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.032);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 3. Haptic Mechanical Hover Rumble
 * Progressive mechanical engine rev / haptic vibration.
 * Uses low-mid audible harmonics (140Hz-240Hz) so it translates clearly
 * through laptop speakers and earbuds while keeping a deep sub-bass foundation.
 */
export const playHoverRumbleTick = (intensity = 'light') => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const freqMap = { light: 140, medium: 180, heavy: 240 };
    const gainMap = { light: 0.18, medium: 0.26, heavy: 0.36 };

    // 1. Audible engine rumble body (punchy low-mid)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.065);
    filter.Q.setValueAtTime(2.2, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqMap[intensity] || 150, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.065);

    gain.gain.setValueAtTime(gainMap[intensity] || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.065);

    // 2. Sub-bass acoustic weight
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.07);

    subGain.gain.setValueAtTime((gainMap[intensity] || 0.2) * 0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.07);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 4. Inversion / Mode Shift Energy Surge
 * Deep cinematic riser into low-end implosion (no shrill sweeps).
 */
export const playInversionSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Warm low-mid energy build (110Hz -> 380Hz)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.28);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.4);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.32);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    // 2. Heavy Sub Bass Drop Impact (140Hz -> 32Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.45);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 5. Dramatic Cinematic Kinetic Strike & Armor Fracture Sound
 */
export const playCinematicShatterSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass Concussion (Deep seismic implosion)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(18, now + 1.6);
    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.6);

    // Damped Kinetic Impact
    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.7);
    filter.Q.setValueAtTime(2.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 6. Dark Thanos Manifest Threat Drone & Sub Rumble
 */
export const playThanosThreatSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const tritoneFreqs = [43.65, 61.74, 87.3];
    tritoneFreqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.94, now + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(45, now + 1.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.6);
    });
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 7. Neon Ignition / Cathode Strike
 * Warm analog transformer buzz and electrical surge (no 80s arcade beeps).
 */
export const playNeonIgniteSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.setValueAtTime(140, now + 0.05);
    osc.frequency.setValueAtTime(95, now + 0.12);
    osc.frequency.setValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 8. Iron Man Repulsor Power Surge
 * Deep resonant turbine buildup (95Hz -> 420Hz) with sub-bass punch.
 */
export const playRepulsorSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + 0.25);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 8b. Hulk Gamma Shockwave / Seismic Smash
 * Thunderous sub-bass impact (110Hz -> 28Hz) with distorted low-end saturation and seismic rumble.
 */
export const playGammaSmashSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Heavy Seismic Sub-Bass Impact (110Hz -> 28Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(320, now);
    subFilter.frequency.exponentialRampToValueAtTime(65, now + 0.55);

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.55);

    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.55);

    // 2. Concussive Punch Acoustic Crack
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    const punchFilter = ctx.createBiquadFilter();

    punchFilter.type = 'bandpass';
    punchFilter.frequency.setValueAtTime(180, now);
    punchFilter.Q.setValueAtTime(1.8, now);

    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(180, now);
    punchOsc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    punchGain.gain.setValueAtTime(0.35, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    punchOsc.connect(punchFilter);
    punchFilter.connect(punchGain);
    punchGain.connect(ctx.destination);

    punchOsc.start(now);
    punchOsc.stop(now + 0.2);

    // 3. Subtle low-end noise rumble (kinetic shockwave)
    const bufferSize = ctx.sampleRate * 0.35;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.6;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(260, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.35);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 9. Captain America Vibranium Shield Kinetic Resonant Chime
 * Rich acoustic bell chime (fundamental A3: 220Hz + overtone E4: 330Hz).
 */
export const playVibraniumPing = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [220, 330, 587.33].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + 0.45);

      gain.gain.setValueAtTime(0.12 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    });
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 10. Thor Stormbreaker Rolling Thunder & Anvil Resonance
 */
export const playThunderStrike = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Resonant Uru Steel Chime (330Hz, 440Hz, 660Hz)
    [330, 440, 660].forEach((freq, idx) => {
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'sine';
      metalOsc.frequency.setValueAtTime(freq, now);
      metalOsc.frequency.exponentialRampToValueAtTime(freq * 0.97, now + 0.35);
      metalGain.gain.setValueAtTime(0.12 / (idx + 1), now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);
      metalOsc.start(now);
      metalOsc.stop(now + 0.35);
    });

    // Rolling Concussive Thunder Rumble
    const thunderOsc = ctx.createOscillator();
    const thunderGain = ctx.createGain();
    const thunderFilter = ctx.createBiquadFilter();

    thunderOsc.type = 'sawtooth';
    thunderOsc.frequency.setValueAtTime(90, now);
    thunderOsc.frequency.exponentialRampToValueAtTime(24, now + 1.2);

    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(220, now);
    thunderFilter.frequency.exponentialRampToValueAtTime(50, now + 1.2);

    thunderGain.gain.setValueAtTime(0.45, now);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    thunderOsc.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(ctx.destination);
    thunderOsc.start(now);
    thunderOsc.stop(now + 1.2);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 11. Avengers Assemble Cinematic War Horn / Braam
 */
export const playAssembleFanfare = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low brass power fifths (A1: 55Hz, E2: 82.41Hz, A2: 110Hz, E3: 164.8Hz)
    const freqs = [55, 82.41, 110, 164.8];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + 0.22);
      filter.frequency.exponentialRampToValueAtTime(90, now + 2.0);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    });

    // Sub-drop
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(80, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 1.8);
    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.8);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 12. Doctor Strange Time Stone Reversal
 */
export const playTimeStoneReversal = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 392.00].forEach((freq, i) => {
      const tOsc = ctx.createOscillator();
      const tGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      tOsc.type = 'sine';
      tOsc.frequency.setValueAtTime(freq, now + i * 0.1);
      tGain.gain.setValueAtTime(0.09, now + i * 0.1);
      tGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      tOsc.connect(filter);
      filter.connect(tGain);
      tGain.connect(ctx.destination);
      tOsc.start(now + i * 0.1);
      tOsc.stop(now + i * 0.1 + 0.3);
    });
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 13. J.A.R.V.I.S. HUD Boot Sequence
 * Warm low-mid telemetry intervals (D4: 293.66Hz, F#4: 369.99Hz, A4: 440Hz, D5: 587.33Hz).
 */
export const playJarvisBootSequence = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass Reactor Ignite
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(140, now + 1.5);
    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.5);

    // Warm Telemetry Chimes
    const chirps = [293.66, 369.99, 440, 587.33];
    chirps.forEach((freq, idx) => {
      setTimeout(() => {
        if (soundMuted) return;
        const tNow = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, tNow);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, tNow);
        gain.gain.setValueAtTime(0.06, tNow);
        gain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.14);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(tNow);
        osc.stop(tNow + 0.14);
      }, 450 + idx * 110);
    });
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 14. Nanotech Micro Snap (Mechanical tactile latch)
 */
export const playNaniteSnap = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.025);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 15. Nanotech Swarm Launch
 */
export const playNanotechLaunch = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 16. Nanotech Assembly Complete
 */
export const playNanotechAssemblyComplete = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.45);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (err) {
    // Audio fallback
  }
};

/**
 * 17. J.A.R.V.I.S. Typing Micro Blip
 * Soft subdued 340Hz -> 180Hz acoustic pulse.
 */
export const playJarvisTypeBlip = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.02);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch (err) {
    // Audio fallback
  }
};

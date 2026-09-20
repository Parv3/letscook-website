/**
 * Web Audio API Sound Engine
 * Provides synthesized tech sound effects without external audio assets.
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

// Tech Button Click Tone (Louder & Punchier)
export const playTechClick = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.09);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(300, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    subOsc.start();
    osc.stop(ctx.currentTime + 0.09);
    subOsc.stop(ctx.currentTime + 0.09);
  } catch (err) {
    // Ignore audio errors
  }
};

// Text Scramble Micro-Beep (Louder & Crisp)
export const playDecodeTick = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600 + Math.random() * 600, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (err) {
    // Ignore audio errors
  }
};

// Micro Rumble Tick for Progressive Hover Shaking
export const playHoverRumbleTick = (intensity = 'light') => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freqMap = { light: 140, medium: 220, heavy: 380 };
    const gainMap = { light: 0.12, medium: 0.22, heavy: 0.38 };

    osc.type = intensity === 'heavy' ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freqMap[intensity] || 150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(gainMap[intensity] || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    // Ignore audio errors
  }
};

// CREATE / LETS COOK Inversion Energy Shatter & Reverse Sound (Louder & Epic)
export const playInversionSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Pitch sweep up + metallic resonant blast
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.65, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);

    // 2. Heavy Sub Bass Drop Impact
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(200, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.45);

    subGain.gain.setValueAtTime(0.85, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start();
    subOsc.stop(ctx.currentTime + 0.45);
  } catch (err) {
    // Ignore audio errors
  }
};

// Dramatic Cinematic Kinetic Strike & Armor Fracture Sound (Intense, Seismic & Heavy)
export const playCinematicShatterSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Massive Sub-bass Concussion (Deep seismic implosion)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(16, now + 1.8);
    subGain.gain.setValueAtTime(1.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.8);

    // 2. Heavy Kinetic Impact Crunch & White-Noise Shockwave
    const bufferSize = ctx.sampleRate * 0.9;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.22));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, now);
    filter.frequency.exponentialRampToValueAtTime(110, now + 0.9);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
  } catch (err) {
    // Ignore audio errors
  }
};

// Ominous Thanos Manifest Threat Drone & Sub Rumble (Dark, Foreboding & Dramatic)
export const playThanosThreatSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Dark dissonant tritone drone (F1: 43.65Hz + B1: 61.74Hz)
    const tritoneFreqs = [43.65, 61.74, 87.3];
    tritoneFreqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.94, now + 1.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 1.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35 / (idx + 1), now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.6);
    });
  } catch (err) {
    // Ignore audio errors
  }
};

// Neon Electric Ignition / Cathode Strike Sound
export const playNeonIgniteSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(180, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(520, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch (err) {
    // Ignore audio errors
  }
};

// Iron Man Repulsor Beam Power Surge & High-Frequency Discharge
export const playRepulsorSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Ignore audio errors
  }
};

// Captain America Vibranium Shield Kinetic Resonant Chime
export const playVibraniumPing = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.38);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.start(now);
    osc.stop(now + 0.38);
  } catch (err) {
    // Ignore audio errors
  }
};

// Thor Stormbreaker Atmospheric Lightning Crack, Anvil Clink & Rolling Thunder
export const playThunderStrike = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Sharp Supersonic Lightning Arc Crack (High-voltage electrical snap)
    const crackLen = ctx.sampleRate * 0.12;
    const crackBuffer = ctx.createBuffer(1, crackLen, ctx.sampleRate);
    const crackData = crackBuffer.getChannelData(0);
    for (let i = 0; i < crackLen; i++) {
      crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
    }
    const crackSource = ctx.createBufferSource();
    crackSource.buffer = crackBuffer;
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.setValueAtTime(1400, now);
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.7, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(ctx.destination);
    crackSource.start(now);

    // 2. Nidavellir Uru Forged Anvil Clink (Resonant Asgardian steel impact overtone)
    [880, 1320, 1760].forEach((freq, idx) => {
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'sine';
      metalOsc.frequency.setValueAtTime(freq, now);
      metalOsc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.3);
      metalGain.gain.setValueAtTime(0.25 / (idx + 1), now);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);
      metalOsc.start(now);
      metalOsc.stop(now + 0.35);
    });

    // 3. Rolling Concussive Thunder Rumble & Deep Sub-bass Drop
    const thunderOsc = ctx.createOscillator();
    const thunderGain = ctx.createGain();
    const thunderFilter = ctx.createBiquadFilter();
    thunderOsc.type = 'sawtooth';
    thunderOsc.frequency.setValueAtTime(140, now);
    thunderOsc.frequency.exponentialRampToValueAtTime(24, now + 1.4);

    thunderFilter.type = 'lowpass';
    thunderFilter.frequency.setValueAtTime(320, now);
    thunderFilter.frequency.exponentialRampToValueAtTime(60, now + 1.4);

    thunderGain.gain.setValueAtTime(0.8, now);
    thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    thunderOsc.connect(thunderFilter);
    thunderFilter.connect(thunderGain);
    thunderGain.connect(ctx.destination);
    thunderOsc.start(now);
    thunderOsc.stop(now + 1.4);
  } catch (err) {
    // Ignore audio errors
  }
};

// Avengers Assemble Dramatic Cinematic War Horn / Braam (Dark, Monumental & Epic)
export const playAssembleFanfare = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Heavy cinematic low brass power fifths (A1: 55Hz, E2: 82.41Hz, A2: 110Hz, E3: 164.8Hz)
    const freqs = [55, 82.41, 110, 164.8];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + 2.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.22);
      filter.frequency.exponentialRampToValueAtTime(100, now + 2.0);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.0);
    });

    // 2. Sub-bass Ground Impact (Dark Sub-drop Rumble)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 1.8);

    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.8);
  } catch (err) {
    // Ignore audio errors
  }
};

// Doctor Strange Time Stone Entropy Reversal Chime
export const playTimeStoneReversal = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [600, 800, 1000, 1200, 900].forEach((freq, i) => {
      const tOsc = ctx.createOscillator();
      const tGain = ctx.createGain();
      tOsc.connect(tGain);
      tGain.connect(ctx.destination);
      tOsc.type = 'sine';
      tOsc.frequency.setValueAtTime(freq, now + i * 0.12);
      tGain.gain.setValueAtTime(0.18, now + i * 0.12);
      tGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);
      tOsc.start(now + i * 0.12);
      tOsc.stop(now + i * 0.12 + 0.35);
    });
  } catch (err) {
    // Ignore audio errors
  }
};

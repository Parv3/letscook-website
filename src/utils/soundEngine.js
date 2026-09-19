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

// Dramatic Cinematic Timer Glass Shatter Sound (Ultra Loud & Impactful)
export const playCinematicShatterSound = () => {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 1. Sub-bass boom (Louder gain: 0.95)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5);
    subGain.gain.setValueAtTime(0.95, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(ctx.currentTime + 1.5);

    // 2. High glass shatter noise burst (Louder gain: 0.75)
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10000, ctx.currentTime + 1.0);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.75, ctx.currentTime + 1.2);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(ctx.currentTime + 1.2);
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

import React, { useEffect, useRef, useState } from 'react';
import {
  playJarvisBootSequence,
  playNaniteSnap,
  playNanotechLaunch,
  playNanotechAssemblyComplete,
  playJarvisTypeBlip,
  isSoundMuted
} from '../utils/soundEngine';

/**
 * JarvisNanotechHUD Component
 * High-fidelity combination of J.A.R.V.I.S. Tactical HUD Boot Sequence (demo_jarvis_hud.html)
 * and the Nanotech Particle Swarm Assembly Engine (demo_nanotech.html).
 */
export default function JarvisNanotechHUD({ onComplete }) {
  const swarmCanvasRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [holdHud, setHoldHud] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(!isSoundMuted());
  const [isSolidified, setIsSolidified] = useState(false);
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const [statusText, setStatusText] = useState('INITIALIZING CORE SYSTEMS...');
  const [subBadge, setSubBadge] = useState('INITIALIZING NEURAL LINK');
  const [subMetric, setSubMetric] = useState('REPULSOR CALIBRATION: 0%');
  const [progressPct, setProgressPct] = useState(0);
  const [countdownSec, setCountdownSec] = useState('6.0s');
  const [timerDashOffset, setTimerDashOffset] = useState(0);
  const [reticles, setReticles] = useState([]);
  const [diagLines, setDiagLines] = useState({
    tl1: '', tl2: '', tl3: '',
    tr1: '', tr2: '', tr3: '',
    bl1: '', bl2: '', bl3: '',
    br1: '', br2: '', br3: ''
  });

  // Hexadecimal column content
  const [hexColLeft, setHexColLeft] = useState([]);
  const [hexColRight, setHexColRight] = useState([]);

  const holdHudRef = useRef(holdHud);
  holdHudRef.current = holdHud;

  const audioEnabledRef = useRef(audioEnabled);
  audioEnabledRef.current = audioEnabled;

  // Initialize Hexadecimal Data Streams
  useEffect(() => {
    const hexChars = '0123456789ABCDEF';
    const getByte = () => '0x' + hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];

    const genList = (count, alert = false) => {
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          id: i,
          text: `${getByte()} ${getByte()} // ${alert ? 'ALERT' : Math.floor(100 + Math.random() * 899)}`,
          head: i === 0 || i === Math.floor(count / 2)
        });
      }
      return arr;
    };

    setHexColLeft(genList(30, false));
    setHexColRight(genList(30, true));

    const hexInterval = setInterval(() => {
      setHexColLeft(prev => {
        if (!prev.length) return prev;
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], text: `${getByte()} ${getByte()} // ${Math.floor(100 + Math.random() * 899)}` };
        return next;
      });
      setHexColRight(prev => {
        if (!prev.length) return prev;
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], text: `${getByte()} ${getByte()} // ALERT` };
        return next;
      });
    }, 180);

    return () => clearInterval(hexInterval);
  }, []);

  // Diagnostics Auto-typing Engine
  useEffect(() => {
    const diagData = [
      { key: 'tl1', prefix: 'SYS: ', text: 'ARC CORE SYNC... 100%', vital: false, alert: false },
      { key: 'tl2', prefix: 'STATUS: ', text: 'REACTOR NOMINAL', vital: true, alert: false },
      { key: 'tl3', prefix: 'TELEMETRY: ', text: 'TACTICAL UPLINK STABLE', vital: false, alert: false },

      { key: 'tr1', prefix: 'REPULSORS: ', text: 'CHARGED AT 1.21 GW', vital: false, alert: false },
      { key: 'tr2', prefix: 'ARMAMENT: ', text: 'WEAPONS HOT', vital: false, alert: true },
      { key: 'tr3', prefix: 'GUIDANCE: ', text: 'MICRO-MISSILE ARRAY READY', vital: false, alert: false },

      { key: 'bl1', prefix: 'THRUSTERS: ', text: 'VECTOR GIMBALS ACTIVE', vital: false, alert: false },
      { key: 'bl2', prefix: 'AVIONICS: ', text: 'FLIGHT READY', vital: true, alert: false },
      { key: 'bl3', prefix: 'STABILIZER: ', text: 'MACH 3 COMPENSATED', vital: false, alert: false },

      { key: 'br1', prefix: 'RADAR: ', text: '360-DEGREE SCANNING', vital: false, alert: false },
      { key: 'br2', prefix: 'THREAT LVL: ', text: 'ELEVATED // TRACKING', vital: false, alert: true },
      { key: 'br3', prefix: 'CLEARANCE: ', text: 'STARK ACCESS LVL 9', vital: false, alert: false }
    ];

    const timeouts = [];

    diagData.forEach((item, idx) => {
      const delay = 400 + idx * 160;
      const t = setTimeout(() => {
        let charIndex = 0;
        const textToType = item.text;
        const interval = setInterval(() => {
          if (charIndex <= textToType.length) {
            const currentSubstr = textToType.substring(0, charIndex);
            setDiagLines(prev => ({
              ...prev,
              [item.key]: {
                prefix: item.prefix,
                text: currentSubstr,
                vital: item.vital,
                alert: item.alert
              }
            }));
            charIndex++;
            if (audioEnabledRef.current && charIndex % 4 === 0) {
              playJarvisTypeBlip();
            }
          } else {
            clearInterval(interval);
          }
        }, 28);
      }, delay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  // Targeting Reticles Generation
  useEffect(() => {
    const reticleConfigs = [
      { label: 'TARGET LOCK: 99.8% // FLT-01', threat: false, range: '412M', q: 0 },
      { label: 'THREAT ASSESSED // HOSTILE', threat: true, range: '128M', q: 1 },
      { label: 'TACTICAL ACQUIRED // CALIB', threat: false, range: '890M', q: 2 },
      { label: 'SURVEILLANCE NODE // ACTIVE', threat: false, range: '640M', q: 3 }
    ];

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const paddingX = Math.max(160, vw * 0.16);
    const paddingY = Math.max(80, vh * 0.12);

    const generated = reticleConfigs.map((cfg, idx) => {
      let posX, posY;
      if (cfg.q === 0) {
        posX = paddingX + Math.random() * (vw * 0.28 - paddingX);
        posY = paddingY + Math.random() * (vh * 0.28 - paddingY);
      } else if (cfg.q === 1) {
        posX = vw * 0.72 + Math.random() * (vw * 0.25 - 60);
        posY = paddingY + Math.random() * (vh * 0.28 - paddingY);
      } else if (cfg.q === 2) {
        posX = paddingX + Math.random() * (vw * 0.28 - paddingX);
        posY = vh * 0.68 + Math.random() * (vh * 0.2 - 30);
      } else {
        posX = vw * 0.72 + Math.random() * (vw * 0.25 - 60);
        posY = vh * 0.68 + Math.random() * (vh * 0.2 - 30);
      }

      return {
        id: idx,
        x: posX,
        y: posY,
        threat: cfg.threat,
        label: cfg.label,
        range: cfg.range,
        delay: 350 + idx * 280
      };
    });

    setReticles(generated);
  }, []);

  // Threat Radar Canvas Render Loop
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let radarAngle = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const threatPoints = [
      { angle: 0.85, dist: 220, label: 'THREAT_01 // HIGH SPEED', hostile: true },
      { angle: 2.4, dist: 310, label: 'AIR_TRAFFIC_ID #904', hostile: false },
      { angle: 4.1, dist: 190, label: 'SATELLITE_UPLINK', hostile: false },
      { angle: 5.2, dist: 270, label: 'BALLISTIC_VECTOR // HOSTILE', hostile: true }
    ];

    const renderRadar = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Matrix Perspective Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      const step = 48;
      ctx.beginPath();
      for (let x = 0; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Radar Distance Rings
      const radii = [140, 240, 340, 440];
      radii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.16)' : 'rgba(0, 240, 255, 0.08)';
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Sweeping Radar Line & Wedge
      radarAngle += 0.024;
      const sweepLength = Math.max(w, h) * 0.52;
      const sweepX = cx + Math.cos(radarAngle) * sweepLength;
      const sweepY = cy + Math.sin(radarAngle) * sweepLength;

      const wedgeAngle = 0.35;
      const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, sweepLength);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, sweepLength, radarAngle - wedgeAngle, radarAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sweepX, sweepY);
      ctx.stroke();

      // Threat Points
      threatPoints.forEach(pt => {
        const px = cx + Math.cos(pt.angle) * pt.dist;
        const py = cy + Math.sin(pt.angle) * pt.dist;
        const diff = Math.abs((radarAngle % (Math.PI * 2)) - (pt.angle % (Math.PI * 2)));
        const isNearSweep = diff < 0.28;

        ctx.fillStyle = pt.hostile ? 'rgba(255, 0, 85, 0.85)' : 'rgba(0, 240, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(px, py, isNearSweep ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();

        if (isNearSweep) {
          ctx.strokeStyle = pt.hostile ? 'rgba(255, 0, 85, 0.9)' : 'rgba(0, 240, 255, 0.9)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - 9, py - 9, 18, 18);

          ctx.font = '9px Consolas, monospace';
          ctx.fillStyle = pt.hostile ? '#ff0055' : '#00f0ff';
          ctx.fillText(pt.label, px + 14, py + 3);
        }
      });

      animId = requestAnimationFrame(renderRadar);
    };

    animId = requestAnimationFrame(renderRadar);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        animId = null;
      } else {
        if (!animId) animId = requestAnimationFrame(renderRadar);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Nanotech Particle Swarm Engine Render Loop
  useEffect(() => {
    const canvas = swarmCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      calculateTargetCoords();
    };
    window.addEventListener('resize', handleResize);

    // Target coordinates: 81 points
    let targetPoints = [];
    const centerPos = { x: width / 2, y: height / 2 };

    const calculateTargetCoords = () => {
      centerPos.x = width / 2;
      centerPos.y = height / 2;
      targetPoints = [];

      // Scale coordinates gracefully on small mobile screens to align with scaled reactor
      const scale = width < 600 ? 0.72 : 1;

      // 1. Outer Circle: 36 points
      const rOuter = 84 * scale;
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2 - Math.PI / 2;
        targetPoints.push({
          x: centerPos.x + rOuter * Math.cos(angle),
          y: centerPos.y + rOuter * Math.sin(angle)
        });
      }

      // 2. Inverted Triangle: 24 points (8 per edge)
      const rTri = 60 * scale;
      const v0 = {
        x: centerPos.x + rTri * Math.cos(-5 * Math.PI / 6),
        y: centerPos.y + rTri * Math.sin(-5 * Math.PI / 6)
      };
      const v1 = {
        x: centerPos.x + rTri * Math.cos(-Math.PI / 6),
        y: centerPos.y + rTri * Math.sin(-Math.PI / 6)
      };
      const v2 = {
        x: centerPos.x + rTri * Math.cos(Math.PI / 2),
        y: centerPos.y + rTri * Math.sin(Math.PI / 2)
      };

      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        targetPoints.push({ x: v0.x + (v1.x - v0.x) * t, y: v0.y + (v1.y - v0.y) * t });
      }
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        targetPoints.push({ x: v1.x + (v2.x - v1.x) * t, y: v1.y + (v2.y - v1.y) * t });
      }
      for (let i = 0; i < 8; i++) {
        const t = i / 8;
        targetPoints.push({ x: v2.x + (v0.x - v2.x) * t, y: v2.y + (v0.y - v2.y) * t });
      }

      // 3. Inner Core Ring: 14 points
      const rInner = 26 * scale;
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
        targetPoints.push({
          x: centerPos.x + rInner * Math.cos(angle),
          y: centerPos.y + rInner * Math.sin(angle)
        });
      }

      // 4. Center Cluster: 7 points
      targetPoints.push({ x: centerPos.x, y: centerPos.y });
      const rCluster = 10 * scale;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        targetPoints.push({
          x: centerPos.x + rCluster * Math.cos(angle),
          y: centerPos.y + rCluster * Math.sin(angle)
        });
      }
    };

    calculateTargetCoords();

    const TOTAL_PARTICLES = 81;
    const snapFlashes = [];
    const electricArcs = [];

    // Nanotech Particle class
    class NanotechParticle {
      constructor(index) {
        this.index = index;
        this.size = 5.2 + Math.random() * 1.5;
        this.reset();
      }

      reset() {
        this.state = 'dormant';
        this.x = 0;
        this.y = 0;
        this.currentAngle = 0;
        this.trail = [];
        this.startTime = 0;
        this.duration = 1700 + Math.random() * 600;
        this.delay = Math.random() * 900;
        this.snapped = false;
        this.p0 = { x: 0, y: 0 };
        this.p1 = { x: 0, y: 0 };
        this.p2 = { x: 0, y: 0 };
        this.p3 = { x: 0, y: 0 };
        this.wobbleFreq = 8 + Math.random() * 8;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleAmp = 18 + Math.random() * 22;
        this.perpAngle = 0;
      }

      spawn(currentTime, target) {
        this.state = 'swarming';
        this.p3 = { x: target.x, y: target.y };
        this.snapped = false;
        this.trail = [];

        // Random offscreen edge spawn
        const edge = Math.floor(Math.random() * 4);
        let startX = 0;
        let startY = 0;
        const margin = 35;
        if (edge === 0) {
          startX = Math.random() * width;
          startY = -margin - Math.random() * 40;
        } else if (edge === 1) {
          startX = Math.random() * width;
          startY = height + margin + Math.random() * 40;
        } else if (edge === 2) {
          startX = -margin - Math.random() * 40;
          startY = Math.random() * height;
        } else {
          startX = width + margin + Math.random() * 40;
          startY = Math.random() * height;
        }

        this.p0 = { x: startX, y: startY };
        this.x = startX;
        this.y = startY;

        const dx = this.p3.x - this.p0.x;
        const dy = this.p3.y - this.p0.y;
        const dist = Math.hypot(dx, dy);
        const baseAngle = Math.atan2(dy, dx);
        const curveDir = Math.random() > 0.5 ? 1 : -1;
        this.perpAngle = baseAngle + (Math.PI / 2) * curveDir;

        const curveIntensity = (0.24 + Math.random() * 0.38) * dist;
        this.p1 = {
          x: this.p0.x + Math.cos(baseAngle) * dist * 0.32 + Math.cos(this.perpAngle) * curveIntensity,
          y: this.p0.y + Math.sin(baseAngle) * dist * 0.32 + Math.sin(this.perpAngle) * curveIntensity
        };
        const p2Curve = curveIntensity * (0.4 + Math.random() * 0.35) * (Math.random() > 0.25 ? 1 : -0.5);
        this.p2 = {
          x: this.p0.x + Math.cos(baseAngle) * dist * 0.68 + Math.cos(this.perpAngle) * p2Curve,
          y: this.p0.y + Math.sin(baseAngle) * dist * 0.68 + Math.sin(this.perpAngle) * p2Curve
        };

        this.startTime = currentTime;
      }

      update(now) {
        if (this.state !== 'swarming') return;
        const elapsed = now - (this.startTime + this.delay);
        if (elapsed < 0) return;

        let t = elapsed / this.duration;
        if (t >= 1) {
          this.state = 'snapped';
          this.snapped = true;
          this.x = this.p3.x;
          this.y = this.p3.y;
          this.trail = [];

          snapFlashes.push({
            x: this.x,
            y: this.y,
            startTime: now,
            duration: 220,
            maxRadius: 14 + Math.random() * 6
          });

          if (audioEnabledRef.current && Math.random() < 0.65) {
            playNaniteSnap();
          }
          return;
        }

        // Cubic ease in-out
        const s = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const u = 1 - s;
        const bx = u * u * u * this.p0.x + 3 * u * u * s * this.p1.x + 3 * u * s * s * this.p2.x + s * s * s * this.p3.x;
        const by = u * u * u * this.p0.y + 3 * u * u * s * this.p1.y + 3 * u * s * s * this.p2.y + s * s * s * this.p3.y;

        const damping = Math.sin(t * Math.PI) * (1 - t);
        const wobble = Math.sin(t * this.wobbleFreq + this.wobblePhase) * this.wobbleAmp * damping;

        const nextX = bx + Math.cos(this.perpAngle) * wobble;
        const nextY = by + Math.sin(this.perpAngle) * wobble;

        this.currentAngle = Math.atan2(nextY - this.y, nextX - this.x);
        this.x = nextX;
        this.y = nextY;

        this.trail.unshift({ x: this.x, y: this.y });
        if (this.trail.length > 7) this.trail.pop();
      }

      draw(ctx, now, pulseRadius, fullyAssembled) {
        if (this.state === 'dormant') return;

        // Trail
        if (this.state === 'swarming' && this.trail.length > 1) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(this.trail[0].x, this.trail[0].y);
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
          }
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
          ctx.lineWidth = 1.4;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }

        let currentSize = this.size;
        let particleColor = '#00f0ff';
        let strokeColor = '#dffaff';
        let glowBlur = 8;
        let alpha = 0.92;

        if (this.state === 'snapped') {
          if (fullyAssembled) {
            const distFromCenter = Math.hypot(this.x - centerPos.x, this.y - centerPos.y);
            const waveDelta = Math.abs(distFromCenter - pulseRadius);
            if (waveDelta < 18) {
              const intensity = 1 - waveDelta / 18;
              currentSize = this.size * (1 + intensity * 0.4);
              particleColor = intensity > 0.6 ? '#ffffff' : '#5df5ff';
              strokeColor = '#ffffff';
              glowBlur = 12 + intensity * 14;
              alpha = 1;
            }
          }
        }

        // Hexagon shape
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.state === 'snapped' ? 0 : this.currentAngle);
        ctx.shadowColor = particleColor;
        ctx.shadowBlur = glowBlur;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const px = currentSize * Math.cos(a);
          const py = currentSize * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = alpha;
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();

        ctx.restore();
      }
    }

    const particles = Array.from({ length: TOTAL_PARTICLES }, (_, i) => new NanotechParticle(i));

    // Shuffle target points
    const shuffledIndices = Array.from({ length: TOTAL_PARTICLES }, (_, i) => i);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    const startTime = performance.now();
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      particles[i].spawn(startTime, targetPoints[shuffledIndices[i]]);
    }

    let fullyAssembledTime = 0;
    let playedFanfare = false;

    const render = now => {
      ctx.clearRect(0, 0, width, height);

      let snappedCount = 0;
      for (let p of particles) {
        p.update(now);
        if (p.state === 'snapped') snappedCount++;
      }

      const fullyAssembled = snappedCount === TOTAL_PARTICLES;
      if (fullyAssembled && fullyAssembledTime === 0) {
        fullyAssembledTime = now;
        setIsSolidified(true);
        if (!playedFanfare && audioEnabledRef.current) {
          playedFanfare = true;
          playNanotechAssemblyComplete();
        }
      }

      // Outward radial pulse wave
      let pulseRadius = 0;
      if (fullyAssembled) {
        const pulseProgress = ((now - fullyAssembledTime) % 2200) / 2200;
        pulseRadius = pulseProgress * 110;

        // Periodic micro electric arc
        if (Math.random() < 0.18) {
          const p1 = particles[Math.floor(Math.random() * particles.length)];
          const candidate = particles.find(p => p !== p1 && Math.hypot(p.x - p1.x, p.y - p1.y) < 36);
          if (candidate) {
            electricArcs.push({
              x1: p1.x,
              y1: p1.y,
              x2: candidate.x,
              y2: candidate.y,
              startTime: now,
              duration: 90 + Math.random() * 60
            });
          }
        }
      }

      // 1. Lattice Bonding Wireframe
      if (fullyAssembled) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.24)';
        ctx.lineWidth = 0.8;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 4;

        // Outer circle line
        ctx.beginPath();
        for (let i = 0; i < 36; i++) {
          const pt = targetPoints[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Triangle perimeter
        ctx.beginPath();
        for (let i = 36; i < 60; i++) {
          const pt = targetPoints[i];
          if (i === 36) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        for (let i = 60; i < 74; i++) {
          const pt = targetPoints[i];
          if (i === 60) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }

      // 2. Draw Particles
      for (let p of particles) {
        p.draw(ctx, now, pulseRadius, fullyAssembled);
      }

      // 3. Draw Micro Electric Arcs
      for (let i = electricArcs.length - 1; i >= 0; i--) {
        const arc = electricArcs[i];
        const elapsed = now - arc.startTime;
        if (elapsed >= arc.duration) {
          electricArcs.splice(i, 1);
          continue;
        }
        const alpha = 1 - elapsed / arc.duration;
        const midX = (arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 8;
        const midY = (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 8;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.lineTo(midX, midY);
        ctx.lineTo(arc.x2, arc.y2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Snap Flashes
      for (let i = snapFlashes.length - 1; i >= 0; i--) {
        const f = snapFlashes[i];
        const elapsed = now - f.startTime;
        if (elapsed >= f.duration) {
          snapFlashes.splice(i, 1);
          continue;
        }
        const t = elapsed / f.duration;
        const radius = 2 + t * f.maxRadius;
        const alpha = 1 - t;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.5 * (1 - t);
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.stroke();

        const rayLen = radius * 1.5;
        ctx.beginPath();
        ctx.moveTo(-rayLen, 0);
        ctx.lineTo(rayLen, 0);
        ctx.moveTo(0, -rayLen);
        ctx.lineTo(0, rayLen);
        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.9})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
        animId = null;
      } else {
        if (!animId) animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Main HUD Boot Audio & Countdown Timeline
  useEffect(() => {
    // 1. Trigger Sub-bass & HUD Sound Design
    if (audioEnabledRef.current) {
      playJarvisBootSequence();
      playNanotechLaunch();
    }

    // 2. Shockwave Ignition
    setShockwaveActive(true);

    // 3. Status Bar Progression (0% to 100% over 3.2s)
    const startTime = performance.now();
    const durationMs = 3200;

    const subSteps = [
      { at: 15, badge: 'NEURAL LINK ESTABLISHED', metric: 'REPULSOR CALIBRATION: 24%' },
      { at: 40, badge: 'ARC REACTOR COUPLING', metric: 'CORE PLASMA: 68.4 MWh' },
      { at: 65, badge: 'HUD OPTICS SYNCHRONIZED', metric: 'TARGETING ACQUISITION: 100%' },
      { at: 88, badge: 'ARMOR INTEGRITY VERIFIED', metric: 'ALL ACTUATORS NOMINAL' }
    ];

    let progressAnimId;
    const updateProgress = now => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const pct = Math.floor(progress * 100);
      setProgressPct(pct);

      for (let i = subSteps.length - 1; i >= 0; i--) {
        if (pct >= subSteps[i].at) {
          setSubBadge(subSteps[i].badge);
          setSubMetric(subSteps[i].metric);
          break;
        }
      }

      if (progress < 1) {
        progressAnimId = requestAnimationFrame(updateProgress);
      } else {
        setStatusText('JARVIS ONLINE // SYSTEM BOOT COMPLETE');
        setSubBadge('STATUS: FULL OPERATIONAL CAPACITY');
        setSubMetric('DEFENSE PROTOCOLS: ACTIVE');
      }
    };
    progressAnimId = requestAnimationFrame(updateProgress);

    // 4. Circular Countdown Dial (6.0s duration)
    const totalDurationMs = 6000;
    const dialStartTime = Date.now();
    const circumference = 2 * Math.PI * 9; // ~56.54

    const countdownInterval = setInterval(() => {
      if (holdHudRef.current) {
        setCountdownSec('HOLD');
        setTimerDashOffset(0);
        return;
      }

      const elapsed = Date.now() - dialStartTime;
      const remaining = Math.max(0, totalDurationMs - elapsed);
      const sec = (remaining / 1000).toFixed(1);
      setCountdownSec(`${sec}s`);

      const offset = circumference - (remaining / totalDurationMs) * circumference;
      setTimerDashOffset(offset);

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        if (!holdHudRef.current && onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, 50);

    // Keyboard ESC listener
    const handleKey = e => {
      if (e.key === 'Escape' && onCompleteRef.current) {
        onCompleteRef.current();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(progressAnimId);
      clearInterval(countdownInterval);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleClose = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  return (
    <div className="jarvis-hud-root animate-fade-in" aria-label="J.A.R.V.I.S. HUD & Nanotech Assembly">
      {/* 1. Helmet Curvature & CRT Scanline Visor Glare */}
      <div className="visor-glare" />
      <div className="helmet-curvature" />

      {/* 2. Fullscreen Threat Assessment Radar Grid Canvas */}
      <canvas ref={radarCanvasRef} className="radar-grid-canvas" />

      {/* 3. Fullscreen Nanotech Particle Swarm Canvas */}
      <canvas ref={swarmCanvasRef} className="nanotech-swarm-canvas" />

      {/* 4. Top Caliper Bar */}
      <header className="hud-caliper-top">
        <div className="caliper-top-left">
          <span className="brand-title">STARK INDUSTRIES</span>
          <span className="brand-sep">//</span>
          <span className="brand-sub">MARK LXXXV SYSTEM COCKPIT</span>
        </div>
        <div className="caliper-top-right">
          <span>OS VER: 10.4.2</span>
          <span className="gps-text">GPS: 40.7128° N, 74.0060° W</span>
          <div className="timer-badge">
            <svg className="timer-ring-svg" viewBox="0 0 24 24">
              <circle className="timer-circle-bg" cx="12" cy="12" r="9" />
              <circle
                className="timer-circle-bar"
                cx="12"
                cy="12"
                r="9"
                style={{ strokeDashoffset: timerDashOffset }}
              />
            </svg>
            <span className="timer-countdown-text">{countdownSec}</span>
          </div>
        </div>
      </header>

      {/* 5. Left Caliper (Hex Stream Flow Port A) */}
      <aside className="hud-caliper-left">
        <div className="stream-header">DATASTREAM // PORT A</div>
        <div className="hex-stream-container">
          <div className="hex-column">
            {hexColLeft.map(item => (
              <div key={item.id} className={item.head ? 'hex-head' : ''}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 6. Right Caliper (Hex Stream Flow Port B - Crimson Alert) */}
      <aside className="hud-caliper-right">
        <div className="stream-header red-header">DATASTREAM // PORT B</div>
        <div className="hex-stream-container">
          <div className="hex-column red-column">
            {hexColRight.map(item => (
              <div key={item.id} className={item.head ? 'hex-head red-head' : ''}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 7. Centered Arc Reactor Stage & Optics Center Cross */}
      <div className="hud-center-stage">
        {/* Shockwave expanding ring on reactor ignite */}
        {shockwaveActive && <div className="arc-shockwave-ring" />}

        {/* Tactical Pitch Ladder & Angle Compass */}
        <svg className="hud-center-cross-svg" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="280" fill="none" stroke="rgba(0, 240, 255, 0.12)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="300" cy="300" r="250" fill="none" stroke="rgba(0, 240, 255, 0.18)" strokeWidth="1" />
          <line x1="120" y1="300" x2="200" y2="300" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
          <line x1="400" y1="300" x2="480" y2="300" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
          <line x1="300" y1="120" x2="300" y2="200" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
          <line x1="300" y1="400" x2="300" y2="480" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="1.5" />
          <text x="300" y="112" fill="rgba(0,240,255,0.6)" fontSize="9" textAnchor="middle" fontFamily="monospace">000</text>
          <text x="495" y="303" fill="rgba(0,240,255,0.6)" fontSize="9" textAnchor="start" fontFamily="monospace">090</text>
          <text x="300" y="495" fill="rgba(0,240,255,0.6)" fontSize="9" textAnchor="middle" fontFamily="monospace">180</text>
          <text x="105" y="303" fill="rgba(0,240,255,0.6)" fontSize="9" textAnchor="end" fontFamily="monospace">270</text>
        </svg>

        {/* Centered Arc Reactor SVG Housing */}
        <div className="arc-reactor-housing">
          <svg className="arc-reactor-svg" viewBox="0 0 440 440">
            <defs>
              <radialGradient id="jarvisCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="30%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#0088cc" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0a0a14" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="jarvisCoilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#0088ff" />
              </linearGradient>
            </defs>

            {/* Rotating Outer Mechanical Ring */}
            <g className="arc-outer-ring">
              <circle cx="220" cy="220" r="185" fill="none" stroke="rgba(0, 240, 255, 0.6)" strokeWidth="4" strokeDasharray="16 12 4 12" />
              <circle cx="220" cy="220" r="176" fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" />
              {/* 12 Outer Segment Blocks */}
              <g stroke="#00f0ff" strokeWidth="2" opacity="0.8">
                <line x1="220" y1="26" x2="220" y2="44" />
                <line x1="317" y1="52" x2="308" y2="67" />
                <line x1="388" y1="123" x2="373" y2="132" />
                <line x1="414" y1="220" x2="396" y2="220" />
                <line x1="388" y1="317" x2="373" y2="308" />
                <line x1="317" y1="388" x2="308" y2="373" />
                <line x1="220" y1="414" x2="220" y2="396" />
                <line x1="123" y1="388" x2="132" y2="373" />
                <line x1="52" y1="317" x2="67" y2="308" />
                <line x1="26" y1="220" x2="44" y2="220" />
                <line x1="52" y1="123" x2="67" y2="132" />
                <line x1="123" y1="52" x2="132" y2="67" />
              </g>
            </g>

            {/* Middle Solenoid Coils Ring */}
            <g className="arc-middle-ring">
              <circle cx="220" cy="220" r="148" fill="none" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="2" />
              <circle cx="220" cy="220" r="118" fill="none" stroke="rgba(0, 240, 255, 0.4)" strokeWidth="2" />
              <g fill="url(#jarvisCoilGrad)" opacity="0.9">
                {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(angle => (
                  <rect
                    key={angle}
                    x="211"
                    y="74"
                    width="18"
                    height="28"
                    rx="2"
                    transform={`rotate(${angle} 220 220)`}
                  />
                ))}
              </g>
            </g>

            {/* Triangular Iris Ring */}
            <g className="arc-triangle-ring">
              <polygon points="220,130 298,265 142,265" fill="none" stroke="rgba(0, 240, 255, 0.7)" strokeWidth="3" />
              <polygon points="220,310 142,175 298,175" fill="none" stroke="rgba(255, 0, 85, 0.4)" strokeWidth="1" strokeDasharray="6 4" />
              <circle cx="220" cy="130" r="4" fill="#00f0ff" />
              <circle cx="298" cy="265" r="4" fill="#00f0ff" />
              <circle cx="142" cy="265" r="4" fill="#00f0ff" />
            </g>

            {/* Inner Counter-Rotating Reticle */}
            <g className="arc-inner-ring">
              <circle cx="220" cy="220" r="88" fill="none" stroke="#00f0ff" strokeWidth="2" strokeDasharray="32 8 8 8" />
              <circle cx="220" cy="220" r="68" fill="none" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* Core Plasma Sphere */}
            <g className="arc-core-pulse">
              <circle cx="220" cy="220" r="54" fill="url(#jarvisCoreGlow)" />
              <circle cx="220" cy="220" r="28" fill="#ffffff" opacity="0.95" />
              <circle cx="220" cy="220" r="16" fill="#00f0ff" opacity="0.9" />
              <circle cx="220" cy="220" r="6" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* 200MM Nanotech Target Matrix Guide Circle */}
        <div className={`nanotech-target-zone ${isSolidified ? 'solidified' : ''}`}>
          <div className="target-tick tick-top" />
          <div className="target-tick tick-bottom" />
          <div className="target-tick tick-left" />
          <div className="target-tick tick-right" />
          <div className="target-guide guide-60" />
          <div className="target-guide guide-120" />
        </div>
      </div>

      {/* 8. Tactical Reticles Layer */}
      <div className="hud-reticles-container">
        {reticles.map(r => (
          <div
            key={r.id}
            className={`hud-reticle-box ${r.threat ? 'hostile' : ''}`}
            style={{ left: `${r.x}px`, top: `${r.y}px` }}
          >
            <svg className="reticle-svg" viewBox="0 0 140 140">
              <circle className="reticle-spin-ccw" cx="70" cy="70" r="58" fill="none" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" strokeDasharray="18 12 4 12" />
              <circle className="reticle-spin-cw" cx="70" cy="70" r="46" fill="none" stroke={r.threat ? 'rgba(255,0,85,0.4)' : 'rgba(0,240,255,0.4)'} strokeWidth="1" strokeDasharray="6 6" />
              <line x1="70" y1="12" x2="70" y2="40" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" />
              <line x1="70" y1="100" x2="70" y2="128" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" />
              <line x1="12" y1="70" x2="40" y2="70" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" />
              <line x1="100" y1="70" x2="128" y2="70" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" />
              <circle cx="70" cy="70" r="16" fill="none" stroke={r.threat ? '#ff0055' : '#00f0ff'} strokeWidth="1.5" />
              <circle className="reticle-pulse" cx="70" cy="70" r="4" fill={r.threat ? '#ff0055' : '#00f0ff'} />
            </svg>
            <div className="reticle-badge">
              <span style={{ color: r.threat ? '#ff0055' : '#00f0ff', fontWeight: 800 }}>[ {r.range} ]</span> {r.label}
            </div>
          </div>
        ))}
      </div>

      {/* 9. 4-Corner Auto-Typing Diagnostics */}
      {/* Top-Left: SYS_TELEMETRY */}
      <div className="hud-diag-panel diag-tl">
        <div className="diag-head">SYS_TELEMETRY // CH-01</div>
        <div className="diag-row">
          <span>{diagLines.tl1.prefix}</span>
          <span>{diagLines.tl1.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.tl2.prefix}</span>
          <span className="vital-tag">{diagLines.tl2.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.tl3.prefix}</span>
          <span>{diagLines.tl3.text}</span>
        </div>
      </div>

      {/* Top-Right: ARMAMENT & TACTICAL */}
      <div className="hud-diag-panel diag-tr">
        <div className="diag-head">ARMAMENT & TACTICAL // CH-02</div>
        <div className="diag-row">
          <span>{diagLines.tr1.prefix}</span>
          <span>{diagLines.tr1.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.tr2.prefix}</span>
          <span className="alert-tag">{diagLines.tr2.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.tr3.prefix}</span>
          <span>{diagLines.tr3.text}</span>
        </div>
      </div>

      {/* Bottom-Left: PROPULSION & AVIONICS */}
      <div className="hud-diag-panel diag-bl">
        <div className="diag-head">PROPULSION & AVIONICS // CH-03</div>
        <div className="diag-row">
          <span>{diagLines.bl1.prefix}</span>
          <span>{diagLines.bl1.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.bl2.prefix}</span>
          <span className="vital-tag">{diagLines.bl2.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.bl3.prefix}</span>
          <span>{diagLines.bl3.text}</span>
        </div>
      </div>

      {/* Bottom-Right: ENVIRONMENT & SENSORS */}
      <div className="hud-diag-panel diag-br">
        <div className="diag-head">ENVIRONMENT & SENSORS // CH-04</div>
        <div className="diag-row">
          <span>{diagLines.br1.prefix}</span>
          <span>{diagLines.br1.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.br2.prefix}</span>
          <span className="alert-tag">{diagLines.br2.text}</span>
        </div>
        <div className="diag-row">
          <span>{diagLines.br3.prefix}</span>
          <span>{diagLines.br3.text}</span>
        </div>
      </div>

      {/* 10. Bottom Caliper Bar (Status Bar & Subsystem Telemetry) */}
      <footer className="hud-caliper-bottom">
        <div className="status-bar-box">
          <div className="status-row-info">
            <div className="subsystem-left">
              <span className="status-pill">{subBadge}</span>
              <span className="metric-pill">{subMetric}</span>
            </div>
            <div className="pct-pill">{progressPct}%</div>
          </div>

          <div className="progress-track-shell">
            <div className="progress-fill-bar" style={{ width: `${progressPct}%` }} />
            <div className="progress-slits" />
          </div>

          <div className={`status-banner-text ${progressPct >= 100 ? 'complete' : ''}`}>
            {statusText}
          </div>
        </div>
      </footer>

      {/* 11. Interactive Controls Dock */}
      <div className="hud-controls-dock">
        <button
          type="button"
          onClick={() => setHoldHud(prev => !prev)}
          className={`hud-dock-btn ${holdHud ? 'active-cyan' : ''}`}
          title="Toggle infinite HUD hold mode"
        >
          HOLD HUD: {holdHud ? 'ON (NO TIMEOUT)' : 'OFF (6S FADE)'}
        </button>

        <button
          type="button"
          onClick={() => setAudioEnabled(prev => !prev)}
          className={`hud-dock-btn ${audioEnabled ? 'active-cyan' : 'active-red'}`}
          title="Toggle audio synth"
        >
          AUDIO: {audioEnabled ? 'ONLINE' : 'MUTED'}
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="hud-dock-btn close-btn"
          title="Dismiss J.A.R.V.I.S. HUD"
        >
          CLOSE [ESC]
        </button>
      </div>

      {/* Corner Brackets */}
      <div className="hud-corner c-tl" />
      <div className="hud-corner c-tr" />
      <div className="hud-corner c-bl" />
      <div className="hud-corner c-br" />
    </div>
  );
}

import React, { useState } from 'react';
import { GitBranch, Terminal, Cpu, Users, ArrowUpRight, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import { playTechClick } from '../utils/soundEngine';

const SPRINTS = [
  {
    id: 'forge-cli',
    category: 'SYSTEMS',
    title: 'FORGE ENGINE / CLI',
    stage: 'PROTOTYPE · CYCLE 03',
    stageType: 'active',
    desc: 'High-throughput micro-benchmark runner & build cache CLI designed for collegiate hackathons with zero cloud dependencies.',
    stack: ['Rust', 'Tokio', 'SQLite', 'Wasm'],
    lead: 'Parv M.',
    rolesNeeded: ['1 Systems Engineer (Rust)', '1 CLI / TUI Designer'],
  },
  {
    id: 'campus-mesh',
    category: 'NETWORKS',
    title: 'CAMPUSMESH P2P',
    stage: 'ALPHA · ACTIVE SPRINT',
    stageType: 'active',
    desc: 'Decentralized peer-to-peer student knowledge repository operating over local campus subnets without internet reliance.',
    stack: ['Python', 'FastAPI', 'React Native', 'WebRTC'],
    lead: 'Squad Node 02',
    rolesNeeded: ['1 WebRTC Specialist', '1 Mobile Dev'],
  },
  {
    id: 'neuroprompt',
    category: 'AI/ML',
    title: 'NEUROPROMPT STUDIO',
    stage: 'RESEARCH · SPRINT 02',
    stageType: 'research',
    desc: 'Local-first model quantization workbench and agent evaluation harness run directly on student consumer GPUs.',
    stack: ['PyTorch', 'ONNX Runtime', 'Next.js', 'TypeScript'],
    lead: 'Squad Node 04',
    rolesNeeded: ['1 ML Engineer (PyTorch)', '1 Frontend Architect'],
  },
];

const CATEGORIES = ['ALL', 'SYSTEMS', 'NETWORKS', 'AI/ML'];

export default function ActiveSprintsBoard({ onOpenPitchModal, onOpenJoinModal }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredSprints = selectedCategory === 'ALL'
    ? SPRINTS
    : SPRINTS.filter(s => s.category === selectedCategory);

  const handleFilterClick = (cat) => {
    playTechClick();
    setSelectedCategory(cat);
  };

  return (
    <section id="sprints" className="sprints-section">
      <div className="sprints-container">
        {/* Section Header */}
        <div className="sprints-header">
          <div className="sprints-pill-badge">
            <span className="live-dot" />
            <span>COMMUNITY SPRINT FORGE · CYCLE 04</span>
          </div>
          <h2 className="sprints-title">ACTIVE SPRINT INITIATIVES</h2>
          <p className="sprints-subtitle">
            Open-source systems, developer tooling, and machine learning infrastructure built by students, for students.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="sprints-toolbar">
          <div className="filter-group">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sprint-status-note">
            <GitBranch size={13} />
            <span>3 ACTIVE REPOSITORIES</span>
          </div>
        </div>

        {/* Sprint Cards Grid */}
        <div className="sprints-grid">
          {filteredSprints.map((sprint) => (
            <div key={sprint.id} className="sprint-card">
              <div className="sprint-card-top">
                <span className="sprint-category-tag">{sprint.category}</span>
                <div className={`sprint-stage-badge ${sprint.stageType}`}>
                  <span className="stage-pulse-dot" />
                  {sprint.stage}
                </div>
              </div>

              <h3 className="sprint-card-title">{sprint.title}</h3>
              <p className="sprint-card-desc">{sprint.desc}</p>

              {/* Stack Badges */}
              <div className="sprint-stack-list">
                {sprint.stack.map((item, idx) => (
                  <span key={idx} className="stack-pill">{item}</span>
                ))}
              </div>

              {/* Open Team Roles */}
              <div className="sprint-roles-box">
                <span className="roles-label">OPEN SPRINT ROLES:</span>
                <ul className="roles-list">
                  {sprint.rolesNeeded.map((role, idx) => (
                    <li key={idx} className="role-item">
                      <span className="role-bullet">›</span> {role}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Actions */}
              <div className="sprint-card-footer">
                <button
                  onClick={() => {
                    playTechClick();
                    if (onOpenPitchModal) onOpenPitchModal();
                  }}
                  className="btn-claim-role"
                >
                  CLAIM OPEN ROLE <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Propose New Sprint Banner */}
        <div className="propose-sprint-banner">
          <div className="propose-text">
            <h4>HAVE AN ARCHITECTURE YOU WANT TO BUILD?</h4>
            <p>Pitch your project proposal directly to form a student sprint squad and get infrastructure support.</p>
          </div>
          <button
            onClick={() => {
              playTechClick();
              if (onOpenPitchModal) onOpenPitchModal();
            }}
            className="btn-primary glow-btn"
          >
            PITCH A PROJECT <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      <style>{`
        .sprints-section {
          padding: 80px 24px;
          position: relative;
          z-index: 10;
        }

        .sprints-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .sprints-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .sprints-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-badge);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--logo-accent-color, #ff2a6d);
          margin-bottom: 16px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--logo-accent-color, #ff2a6d);
          box-shadow: 0 0 8px var(--logo-accent-color, #ff2a6d);
          animation: pulse 1.8s infinite;
        }

        .sprints-title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .sprints-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .sprints-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 30px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .filter-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: var(--radius-btn);
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          color: var(--text-main);
          border-color: var(--accent-burgundy-border);
        }

        .filter-btn.active {
          background-color: var(--accent-burgundy);
          border-color: var(--accent-burgundy);
          color: #ffffff;
        }

        .sprint-status-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-dim);
          letter-spacing: 0.08em;
        }

        .sprints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .sprint-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .sprint-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-burgundy-border);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }

        html.light .sprint-card:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }

        .sprint-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .sprint-category-tag {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--text-dim);
        }

        .sprint-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: var(--radius-badge);
        }

        .sprint-stage-badge.active {
          background-color: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #22c55e;
        }

        .sprint-stage-badge.research {
          background-color: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.35);
          color: #a855f7;
        }

        .stage-pulse-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .sprint-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .sprint-card-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 18px;
          flex-grow: 1;
        }

        .sprint-stack-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }

        .stack-pill {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 9px;
          background-color: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-badge);
          color: var(--text-main);
        }

        .sprint-roles-box {
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-badge);
          padding: 12px 14px;
          margin-bottom: 20px;
        }

        .roles-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          margin-bottom: 6px;
        }

        .roles-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .role-item {
          font-size: 0.78rem;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .role-bullet {
          color: var(--logo-accent-color, #ff2a6d);
          font-weight: 700;
        }

        .sprint-card-footer {
          margin-top: auto;
        }

        .btn-claim-role {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background-color: var(--bg-surface-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-main);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-claim-role:hover {
          background-color: var(--accent-burgundy);
          border-color: var(--accent-burgundy);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(163, 8, 59, 0.4);
        }

        .propose-sprint-banner {
          background-color: var(--bg-surface);
          border: 1px solid var(--accent-burgundy-border);
          border-radius: var(--radius-card);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .propose-text h4 {
          font-size: 1.15rem;
          margin-bottom: 6px;
        }

        .propose-text p {
          font-size: 0.88rem;
          color: var(--text-muted);
          max-width: 650px;
        }

        @media (max-width: 768px) {
          .sprints-section {
            padding: 44px 16px;
          }
          .propose-sprint-banner {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 16px;
          }
          .propose-sprint-banner button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}

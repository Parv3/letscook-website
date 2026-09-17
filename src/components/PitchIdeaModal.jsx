import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getTrackedUrl } from '../utils/utmTracker';
import { playTechClick } from '../utils/soundEngine';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export default function PitchIdeaModal({ isOpen, onClose }) {
  const [projectTitle, setProjectTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    playTechClick();
    if (!projectTitle || !description || !email) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setProjectTitle('');
      setTechStack('');
      setDescription('');
      setEmail('');
      onClose();
    }, 3500);
  };

  return (
    <div className="search-overlay no-print" onClick={onClose}>
      <div className="pitch-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pitch-header">
          <div className="pitch-badge">
            <Sparkles size={14} />
            <span>STUDENT BUILD FOUNDRY</span>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close pitch modal">
            <X size={18} />
          </button>
        </div>

        <h2 className="pitch-title">COOK SOMETHING NEW</h2>
        <p className="pitch-sub">Pitch a project idea or tool to form a team and build together in Let's Cook.</p>

        {submitted ? (
          <div className="pitch-success animate-fade-in">
            <CheckCircle2 size={40} className="success-icon" />
            <h3>PITCH SUBMITTED!</h3>
            <p>Your idea has been sent to community leads. Join our WhatsApp or Linktree portal to connect with builders immediately.</p>
            <a 
              href={getTrackedUrl(LINKTREE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              OPEN LINKTREE COMMUNITY <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pitch-form">
            <div className="form-group">
              <label htmlFor="pitch-title-input">PROJECT NAME / IDEA</label>
              <input
                id="pitch-title-input"
                type="text"
                placeholder="e.g. Open-Source AI Code Reviewer"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                required
                className="pitch-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pitch-tech-input">REQUIRED TECH STACK</label>
              <input
                id="pitch-tech-input"
                type="text"
                placeholder="e.g. React, Python, FastAPI, Docker"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                className="pitch-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pitch-desc-input">SHORT DESCRIPTION & GOAL</label>
              <textarea
                id="pitch-desc-input"
                rows={3}
                placeholder="What problem does this solve and what help do you need?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="pitch-input textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pitch-email-input">YOUR EMAIL OR DISCORD / WHATSAPP HANDLE</label>
              <input
                id="pitch-email-input"
                type="text"
                placeholder="e.g. alex@student.edu or @alex_dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pitch-input"
              />
            </div>

            <button type="submit" className="btn-primary w-full mt-2">
              SUBMIT PITCH TO FOUNDRY <Send size={14} />
            </button>
          </form>
        )}
      </div>

      <style>{`
        .pitch-modal {
          width: 100%;
          max-width: 540px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          padding: 24px;
        }

        .pitch-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .pitch-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background-color: var(--accent-burgundy-light);
          border: 1px solid var(--accent-burgundy-border);
          color: var(--accent-burgundy-hover);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border-radius: var(--radius-badge);
        }

        .pitch-title {
          font-size: 1.6rem;
          margin-bottom: 6px;
        }

        .pitch-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .pitch-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .pitch-input {
          width: 100%;
          padding: 10px 14px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          color: var(--text-main);
          font-size: 0.88rem;
          font-family: var(--font-body);
        }

        .pitch-input:focus {
          border-color: var(--accent-burgundy);
          outline: none;
        }

        .textarea {
          resize: none;
        }

        .pitch-success {
          padding: 30px 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon {
          color: var(--accent-burgundy-hover);
          margin-bottom: 12px;
        }

        .pitch-success h3 {
          font-size: 1.3rem;
          margin-bottom: 8px;
        }

        .pitch-success p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        .mt-2 {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}

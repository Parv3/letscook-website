import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { playTechClick } from '../utils/soundEngine';
import { submitPitchData } from '../utils/pitchSubmission';

export default function PitchIdeaModal({ isOpen, onClose }) {
  const [projectTitle, setProjectTitle] = useState('');
  const [techStack, setTechStack] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    playTechClick();
    if (!projectTitle || !description || !email) return;

    setSubmitError('');
    setIsSubmitting(true);
    try {
      await submitPitchData({ projectTitle, techStack, description, email, honeypot });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setProjectTitle('');
        setTechStack('');
        setDescription('');
        setEmail('');
        setHoneypot('');
        onClose();
      }, 3500);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(err.message || 'Submission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pitch-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="pitch-modal-card" onClick={e => e.stopPropagation()}>
        <div className="pitch-modal-header">
          <div>
            <div className="pitch-modal-badge">
              <Sparkles size={13} />
              <span>COMMUNITY INCUBATOR</span>
            </div>
            <h2 className="pitch-modal-title">Pitch a Project Idea</h2>
            <p className="pitch-modal-subline">
              Propose an open-source tool, hackathon project, or startup concept to form a student sprint team.
            </p>
          </div>
          <button onClick={onClose} className="pitch-modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="pitch-success-view animate-fade-in">
            <CheckCircle2 size={44} className="pitch-success-icon" />
            <h3 className="pitch-success-title">Pitch Received!</h3>
            <p className="pitch-success-text">
              Your idea has been logged in the Let's Cook sprint incubator. Community leads will connect with you via email or Discord to kick off the sprint.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pitch-clean-form">
            {submitError && (
              <div className="pitch-error-alert animate-fade-in">
                <AlertCircle size={16} />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pitch-form-field">
              <label htmlFor="pitch-title-input">PROJECT NAME / IDEA *</label>
              <input
                id="pitch-title-input"
                type="text"
                placeholder="e.g. Distributed Task Orchestrator"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                required
                className="pitch-clean-input"
              />
            </div>

            <div className="pitch-form-field">
              <label htmlFor="pitch-tech-input">TECH STACK / TOOLS NEEDED</label>
              <input
                id="pitch-tech-input"
                type="text"
                placeholder="e.g. React, Rust, WASM, Tailwind, Node.js"
                value={techStack}
                onChange={e => setTechStack(e.target.value)}
                className="pitch-clean-input"
              />
            </div>

            <div className="pitch-form-field">
              <label htmlFor="pitch-desc-input">SHORT DESCRIPTION & GOALS *</label>
              <textarea
                id="pitch-desc-input"
                rows={3}
                placeholder="What core problem does this solve and what roles do you need?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                className="pitch-clean-textarea"
              />
            </div>

            <div className="pitch-form-field">
              <label htmlFor="pitch-email-input">YOUR CONTACT (EMAIL / DISCORD / GITHUB) *</label>
              <input
                id="pitch-email-input"
                type="text"
                placeholder="e.g. builder@example.com or @discord_handle"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pitch-clean-input"
              />
            </div>

            {/* Bot Honeypot field */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <input
                type="text"
                name="user_website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>

            <div className="pitch-actions-bar">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full pitch-submit-btn"
              >
                {isSubmitting ? 'SUBMITTING PITCH...' : 'SUBMIT PROJECT PITCH'} <Send size={15} />
              </button>

              <div className="pitch-alt-footer">
                <a
                  href="https://forms.gle/Fd4At9jGkJm7U1Xa9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pitch-google-form-link"
                >
                  Prefer Google Forms? Fill it out directly <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .pitch-modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(4, 6, 10, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 5000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .pitch-modal-card {
          width: 100%;
          max-width: 540px;
          background: linear-gradient(165deg, rgba(16, 18, 26, 0.98) 0%, rgba(8, 10, 15, 0.98) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 28px 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .pitch-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .pitch-modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(255, 42, 109, 0.12);
          border: 1px solid rgba(255, 42, 109, 0.3);
          border-radius: 20px;
          color: var(--accent-burgundy-hover);
          font-family: monospace;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .pitch-modal-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .pitch-modal-subline {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        .pitch-modal-close-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all var(--transition-fast);
        }

        .pitch-modal-close-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .pitch-clean-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pitch-form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pitch-form-field label {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.08em;
        }

        .pitch-clean-input, .pitch-clean-textarea {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;
          transition: all var(--transition-fast);
          font-family: inherit;
          box-sizing: border-box;
        }

        .pitch-clean-input:focus, .pitch-clean-textarea:focus {
          border-color: var(--accent-burgundy-hover);
          background: rgba(255, 255, 255, 0.07);
          box-shadow: 0 0 14px var(--accent-burgundy-light);
        }

        .pitch-clean-textarea {
          resize: vertical;
          min-height: 80px;
          line-height: 1.5;
        }

        .pitch-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #f87171;
          font-size: 0.82rem;
        }

        .pitch-actions-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 6px;
        }

        .pitch-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          font-size: 0.88rem;
          font-weight: 700;
        }

        .pitch-alt-footer {
          text-align: center;
        }

        .pitch-google-form-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.74rem;
          color: var(--text-dim);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .pitch-google-form-link:hover {
          color: var(--text-main);
        }

        .pitch-success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px 16px;
          gap: 12px;
        }

        .pitch-success-icon {
          color: #22c55e;
          filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.4));
        }

        .pitch-success-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .pitch-success-text {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 400px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

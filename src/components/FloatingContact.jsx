import React, { useState } from 'react';
import { MessageSquare, X, Send, ExternalLink } from 'lucide-react';
import { getTrackedUrl } from '../utils/utmTracker';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setEmail('');
      setMessage('');
    }, 2500);
  };

  return (
    <div className="floating-contact no-print">
      {/* Popover Card */}
      {isOpen && (
        <div className="contact-card animate-fade-in">
          <div className="contact-card-header">
            <div>
              <span className="contact-card-title">LET'S COOK COMMUNITY</span>
              <p className="contact-card-sub">Send us a message or join our WhatsApp / Discord.</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-card-btn" aria-label="Close message panel">
              <X size={16} />
            </button>
          </div>

          {submitted ? (
            <div className="contact-success">
              <p>Message sent successfully. Our leads will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="contact-input"
              />
              <textarea
                placeholder="What project or question do you have?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={3}
                className="contact-input textarea"
              />
              <button type="submit" className="btn-primary w-full">
                SEND MESSAGE <Send size={14} />
              </button>
              <a
                href={getTrackedUrl(LINKTREE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-linktree"
              >
                Or join directly on Linktree <ExternalLink size={12} />
              </a>
            </form>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="floating-trigger-btn"
        title="Contact Let's Cook Community"
        aria-label="Floating contact menu"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      <style>{`
        .floating-contact {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1500;
        }

        .floating-trigger-btn {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-btn);
          background-color: var(--accent-burgundy);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(139, 0, 46, 0.4);
          transition: all var(--transition-fast);
          border: 1px solid var(--accent-burgundy-hover);
        }

        .floating-trigger-btn:hover {
          transform: scale(1.05);
          background-color: var(--accent-burgundy-hover);
        }

        .contact-card {
          position: absolute;
          bottom: 64px;
          right: 0;
          width: 320px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
          padding: 20px;
        }

        .contact-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .contact-card-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-main);
          letter-spacing: 0.05em;
        }

        .contact-card-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .close-card-btn {
          color: var(--text-muted);
          padding: 2px;
        }

        .close-card-btn:hover {
          color: var(--text-main);
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-input {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          color: var(--text-main);
          font-size: 0.85rem;
          font-family: var(--font-body);
        }

        .contact-input:focus {
          border-color: var(--accent-burgundy);
          outline: none;
        }

        .textarea {
          resize: none;
        }

        .contact-success {
          padding: 16px 0;
          font-size: 0.85rem;
          color: var(--text-main);
          text-align: center;
        }

        .contact-linktree {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
          text-decoration: underline;
        }

        .contact-linktree:hover {
          color: var(--accent-burgundy);
        }

        @media (max-width: 640px) {
          .floating-contact {
            bottom: calc(14px + env(safe-area-inset-bottom, 0px));
            right: 14px;
          }

          .floating-trigger-btn {
            width: 44px;
            height: 44px;
            box-shadow: 0 4px 16px rgba(139, 0, 46, 0.45);
          }

          .contact-card {
            position: fixed;
            bottom: calc(66px + env(safe-area-inset-bottom, 0px));
            left: 14px;
            right: 14px;
            width: auto;
            max-width: 380px;
            margin: 0 auto;
            padding: 16px;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}

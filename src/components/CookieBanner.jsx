import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('letscook_cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('letscook_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('letscook_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner no-print animate-fade-in">
      <div className="cookie-content">
        <ShieldCheck size={18} className="cookie-icon" />
        <p>
          We use minimal analytical cookies to optimize community navigation at <strong>letscook.co.in</strong>.
        </p>
      </div>

      <div className="cookie-actions">
        <button onClick={handleDecline} className="btn-secondary btn-sm">
          DECLINE
        </button>
        <button onClick={handleAccept} className="btn-primary btn-sm">
          ACCEPT
        </button>
      </div>

      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 1400;
          max-width: 440px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 16px 20px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cookie-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .cookie-icon {
          color: var(--accent-burgundy);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cookie-content p {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .cookie-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-sm {
          padding: 6px 14px;
          font-size: 0.75rem;
        }

        @media (max-width: 600px) {
          .cookie-banner {
            left: 16px;
            right: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}

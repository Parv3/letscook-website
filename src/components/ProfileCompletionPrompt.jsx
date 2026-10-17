import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Edit3, X, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { getStoredUser } from '../services/portalService';
import { playVibraniumPing, playTechClick } from '../utils/soundEngine';

export default function ProfileCompletionPrompt() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isVisible, setIsVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const timerRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('letscook_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('letscook_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Calculate completion percentage
  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') {
      setIsVisible(false);
      return;
    }

    const fields = [
      currentUser.fullName,
      currentUser.phone,
      currentUser.college && !currentUser.college.includes('Apex') ? currentUser.college : null,
      currentUser.branch,
      currentUser.yearOfStudy,
      currentUser.targetSquad,
      currentUser.skills,
      currentUser.avatarUrl
    ];

    const filledCount = fields.filter(Boolean).length;
    const calculatedPercent = Math.min(100, Math.round((filledCount / fields.length) * 100));
    setPercent(calculatedPercent);

    if (calculatedPercent >= 100) {
      setIsVisible(false);
      return;
    }

    // Schedule random popup appearance
    const scheduleRandomPopup = () => {
      // Random delay between 8,000ms and 18,000ms (8 to 18 seconds)
      const randomDelay = Math.floor(Math.random() * 10000) + 8000;
      
      timerRef.current = setTimeout(() => {
        setIsVisible(true);
        try {
          playVibraniumPing();
        } catch (_) {}
      }, randomDelay);
    };

    scheduleRandomPopup();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentUser]);

  const handleDismiss = () => {
    playTechClick();
    setIsVisible(false);
    // Re-schedule another random appearance between 50s and 100s
    if (timerRef.current) clearTimeout(timerRef.current);
    const retriggerDelay = Math.floor(Math.random() * 50000) + 50000;
    timerRef.current = setTimeout(() => {
      if (percent < 100) {
        setIsVisible(true);
        try {
          playVibraniumPing();
        } catch (_) {}
      }
    }, retriggerDelay);
  };

  const handleOpenEdit = () => {
    playTechClick();
    setIsVisible(false);
    window.dispatchEvent(new Event('open_profile_edit'));
  };

  if (!currentUser || currentUser.role === 'admin' || percent >= 100 || !isVisible) {
    return null;
  }

  return (
    <div className="profile-prompt-toast animate-slide-up" role="dialog" aria-label="Profile Completion Notification">
      <div className="prompt-toast-inner">
        <button 
          onClick={handleDismiss} 
          className="prompt-close-btn"
          aria-label="Remind me later"
        >
          <X size={15} />
        </button>

        <div className="prompt-header-row">
          <div className="prompt-badge">
            <Sparkles size={13} className="sparkle-icon" />
            <span>PROFILE STATUS</span>
          </div>
          <span className="prompt-percent-number">{percent}%</span>
        </div>

        <h4 className="prompt-title">Your Profile is {percent}% complete</h4>

        <div className="prompt-progress-track">
          <div 
            className="prompt-progress-bar"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="prompt-desc">
          Add your college, squad, and tech skills so squad leads can verify and induct you into active team sprints.
        </p>

        <div className="prompt-actions-row">
          <button onClick={handleOpenEdit} className="btn-prompt-complete glow-btn">
            <Edit3 size={14} /> Complete Now
          </button>
          <button onClick={handleDismiss} className="btn-prompt-later">
            Remind Me Later
          </button>
        </div>
      </div>

      <style>{`
        .profile-prompt-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99998;
          max-width: 380px;
          width: calc(100% - 48px);
          pointer-events: auto;
        }

        .prompt-toast-inner {
          background: rgba(15, 17, 24, 0.95);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: relative;
        }

        .prompt-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .prompt-close-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .prompt-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding-right: 24px;
        }

        .prompt-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: monospace;
          font-size: 0.7rem;
          font-weight: 800;
          color: #fbbf24;
          letter-spacing: 0.08em;
        }

        .sparkle-icon {
          color: #fbbf24;
        }

        .prompt-percent-number {
          font-family: var(--font-display, monospace);
          font-size: 0.88rem;
          font-weight: 900;
          color: #fbbf24;
        }

        .prompt-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .prompt-progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .prompt-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #22c55e 100%);
          border-radius: 9999px;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
          transition: width 0.4s ease;
        }

        .prompt-desc {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .prompt-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-prompt-complete {
          flex: 1;
          height: 36px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          color: #060608;
          font-family: monospace;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }

        .btn-prompt-later {
          height: 36px;
          padding: 0 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.76rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-prompt-later:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        @keyframes slideUpPrompt {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slideUpPrompt 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (max-width: 640px) {
          .profile-prompt-toast {
            bottom: 16px;
            right: 16px;
            width: calc(100% - 32px);
          }
        }
      `}</style>
    </div>
  );
}

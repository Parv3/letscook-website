import React from 'react';
import { Shield, ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function PrivacyPolicyPage({ setCurrentPage }) {
  return (
    <div className="legal-page animate-fade-in">
      <div className="legal-container">
        <button 
          onClick={() => { setCurrentPage('home'); window.scrollTo(0, 0); }} 
          className="back-btn"
        >
          <ArrowLeft size={16} /> RETURN TO HOME
        </button>

        <div className="legal-header">
          <div className="badge">
            <Shield size={14} /> LEGAL DOCUMENTATION
          </div>
          <h1>PRIVACY POLICY</h1>
          <p className="effective-date">Last Updated: September 18, 2026 | Domain: letscook.co.in</p>
        </div>

        <div className="legal-content">
          <section className="policy-section">
            <h2>1. OVERVIEW</h2>
            <p>
              This Privacy Policy explains how Let's Cook ("we", "us", "community"), operating via <strong>letscook.co.in</strong>, collects, uses, and protects information when you navigate our platform, join our community tracks, or interact with our services.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. INFORMATION WE COLLECT</h2>
            <p>
              As a student community portal, we collect minimal data essential to providing community updates and organizing software sprints:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Email addresses or social handles submitted voluntarily via contact forms or external registration portals.</li>
              <li><strong>Analytics & UTM Tracking:</strong> Campaign identifiers (such as UTM parameters) stored in temporary session storage to evaluate community growth sources.</li>
              <li><strong>Local Storage Preferences:</strong> Theme preference settings (dark or light mode) and cookie consent status saved in your browser local storage.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. USE OF INFORMATION</h2>
            <p>We use collected information strictly to:</p>
            <ul>
              <li>Facilitate team matching for hackathons and software projects.</li>
              <li>Send event reminders, workshop schedules, and community announcements.</li>
              <li>Analyze site navigation trends to improve page responsiveness and accessibility.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. THIRD-PARTY LINKS & PLATFORMS</h2>
            <p>
              Our website links directly to community channels hosted on external platforms including WhatsApp, GitHub, LinkedIn, and Discord. We encourage you to review the privacy policies of any third-party service you visit via our links.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. DATA PROTECTION & USER RIGHTS</h2>
            <p>
              We do not sell, rent, or monetize any member data. You retain the right to request deletion of your contact records or opt out of community emails at any time by contacting our community leads.
            </p>
          </section>

          <div className="legal-cta-box">
            <h3>HAVE QUESTIONS ABOUT PRIVACY?</h3>
            <p>Reach out to our team or join our community portal directly.</p>
            <button 
              onClick={() => {
                if (window.history && window.history.pushState) {
                  window.history.pushState(null, '', '/links');
                }
                setCurrentPage('links');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-primary mt-3"
            >
              VISIT COMMUNITY LINKS <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .legal-page {
          padding: 60px 24px 80px 24px;
          background-color: var(--bg-main);
          min-height: 80vh;
        }

        .legal-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 28px;
        }

        .back-btn:hover {
          color: var(--accent-burgundy-hover);
        }

        .legal-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .legal-header h1 {
          font-size: 2.4rem;
          margin-top: 10px;
          margin-bottom: 8px;
        }

        .effective-date {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .legal-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .policy-section h2 {
          font-size: 1.15rem;
          margin-bottom: 12px;
          color: var(--accent-burgundy);
          letter-spacing: 0.04em;
        }

        .policy-section p {
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          margin-bottom: 10px;
        }

        .policy-section ul {
          padding-left: 20px;
          color: var(--text-muted);
          font-size: 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .policy-section strong {
          color: var(--text-main);
        }

        .legal-cta-box {
          margin-top: 20px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          padding: 24px;
          text-align: center;
        }

        .legal-cta-box h3 {
          font-size: 1.2rem;
          margin-bottom: 6px;
        }

        .legal-cta-box p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .mt-3 {
          margin-top: 14px;
        }
      `}</style>
    </div>
  );
}

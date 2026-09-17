import React from 'react';
import { FileText, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { getTrackedUrl } from '../utils/utmTracker';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

export default function TermsPage({ setCurrentPage }) {
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
            <FileText size={14} /> TERMS OF SERVICE
          </div>
          <h1>TERMS AND CONDITIONS</h1>
          <p className="effective-date">Last Updated: September 18, 2026 | Domain: letscook.co.in</p>
        </div>

        <div className="legal-content">
          <section className="policy-section">
            <h2>1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing or using the website at <strong>letscook.co.in</strong>, participating in our open-source software tracks, or joining community chat spaces, you agree to comply with and be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. COMMUNITY CODE OF CONDUCT</h2>
            <p>
              Let's Cook is committed to fostering an inclusive, harassment-free environment for all student builders. Members agree to:
            </p>
            <ul>
              <li>Treat fellow students, mentors, and collaborators with respect.</li>
              <li>Refrain from abusive, discriminatory, or disruptive behavior across all project channels.</li>
              <li>Respect intellectual property rights and open-source licensing terms.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. INTELLECTUAL PROPERTY & CODE OPEN SOURCE</h2>
            <p>
              Projects built under the Let's Cook umbrella belong to their respective creators unless otherwise designated under specific open-source licenses (such as MIT or Apache 2.0).
            </p>
          </section>

          <section className="policy-section">
            <h2>4. LIMITATION OF LIABILITY</h2>
            <p>
              Our website and community programs are provided on an "as is" and "as available" basis without warranties of any kind. Let's Cook community organizers shall not be held liable for third-party platform downtimes or user-submitted content.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. GOVERNING LAW & MODIFICATIONS</h2>
            <p>
              We reserve the right to revise these Terms at any time. Continued use of <strong>letscook.co.in</strong> following updates signifies acceptance of the revised terms.
            </p>
          </section>

          <div className="legal-cta-box">
            <h3>QUESTIONS REGARDING COMMUNITY TERMS?</h3>
            <p>Connect with our student organizing committee on Linktree.</p>
            <a 
              href={getTrackedUrl(LINKTREE_URL)}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary mt-3"
            >
              CONNECT VIA LINKTREE <ArrowUpRight size={16} />
            </a>
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

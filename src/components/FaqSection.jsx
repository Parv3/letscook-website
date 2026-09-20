import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'What is Let\'s Cook?',
    a: 'Let\'s Cook is a student-run technology and builder community focused on shipping real software projects, hosting peer learning sessions, and organizing collaborative build sprints.'
  },
  {
    q: 'Who can join the community?',
    a: 'Any student interested in software engineering, UI design, product management, DevOps, or building digital products is welcome to join regardless of skill level.'
  },
  {
    q: 'Are there any membership fees?',
    a: 'No. Let\'s Cook is entirely free for students. All our workshops, hackathons, open-source cohorts, and community events are open access.'
  },
  {
    q: 'How do project teams get formed?',
    a: 'Members can pitch ideas during our pitch sessions or join existing build tracks. We match developers, designers, and project leads based on interest and technology stack.'
  },
  {
    q: 'Where do community discussions take place?',
    a: 'Our main communication channels are hosted on Discord and WhatsApp, accessible through our official Linktree community portal.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="section-header">
          <div className="badge">
            <HelpCircle size={14} />
            <span>COMMUNITY FAQ</span>
          </div>
          <h2>FREQUENTLY ASKED QUESTIONS</h2>
          <p>Everything you need to know about joining Let's Cook and participating in projects.</p>
        </div>

        <div className="accordion-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`accordion-item ${isOpen ? 'open' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="accordion-header">
                  <span className="question-text">{item.q}</span>
                  <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} size={18} />
                </div>
                {isOpen && (
                  <div className="accordion-body animate-fade-in">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .faq-section {
          padding: 80px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-main);
        }

        .faq-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background-color: var(--accent-burgundy-light);
          color: var(--accent-burgundy);
          border: 1px solid var(--accent-burgundy-border);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border-radius: var(--radius-badge);
          margin-bottom: 14px;
        }

        .section-header h2 {
          font-size: 2.2rem;
          margin-bottom: 12px;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .accordion-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .accordion-item {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          overflow: hidden;
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }

        .accordion-item:hover {
          border-color: var(--accent-burgundy-border);
        }

        .accordion-item.open {
          border-color: var(--accent-burgundy);
        }

        .accordion-header {
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .question-text {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--text-main);
        }

        .chevron-icon {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
          flex-shrink: 0;
        }

        .chevron-icon.rotate {
          transform: rotate(180deg);
          color: var(--accent-burgundy);
        }

        .accordion-body {
          padding: 0 22px 20px 22px;
          border-top: 1px solid var(--border-color);
          margin-top: 4px;
          padding-top: 16px;
        }

        .accordion-body p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .faq-section {
            padding: 44px 16px;
          }
          .section-header h2 {
            font-size: clamp(1.35rem, 5.2vw, 1.7rem);
            line-height: 1.25;
            margin-bottom: 8px;
          }
          .section-header p {
            font-size: 0.84rem;
            line-height: 1.48;
            margin-bottom: 24px;
          }
          .accordion-header {
            padding: 14px 16px;
            gap: 12px;
          }
          .question-text {
            font-size: 0.92rem;
            line-height: 1.35;
          }
          .accordion-body {
            padding: 0 16px 16px 16px;
            padding-top: 12px;
          }
          .accordion-body p {
            font-size: 0.85rem;
            line-height: 1.5;
          }
        }
      `}</style>
    </section>
  );
}

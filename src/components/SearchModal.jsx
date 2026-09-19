import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { getTrackedUrl } from '../utils/utmTracker';

const LINKTREE_URL = 'https://linktr.ee/letscookfoundry?utm_source=linktree_profile_share&ltsid=7956c057-e413-4ae2-ad41-c9a226a89e24';

const SEARCH_ITEMS = [
  { title: 'Community Overview', category: 'General', page: 'home', section: 'top', snippet: 'Student-run technology & builder Let\'s Cook community.' },
  { title: 'Let\'s Cook Initiatives', category: 'Program', page: 'home', section: 'pillars', snippet: 'Hackathons, open-source build tracks, and peer mentorship.' },
  { title: 'Frequently Asked Questions', category: 'Help', page: 'home', section: 'faq', snippet: 'How to join, membership cost, tech stacks, and team projects.' },
  { title: 'Privacy Policy', category: 'Legal', page: 'privacy', snippet: 'Data protection and user rights policy at letscook.co.in.' },
  { title: 'Terms & Conditions', category: 'Legal', page: 'terms', snippet: 'Community guidelines and platform usage terms.' },
  { title: 'Linktree Community Links', category: 'External', url: LINKTREE_URL, snippet: 'Official community links, WhatsApp groups, and socials.' }
];

export default function SearchModal({ isOpen, onClose, setCurrentPage }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isParvQuery = ['parv', 'creator', 'author', 'developer', 'architect', 'credits', 'who made this'].some(k => 
    query.toLowerCase().includes(k)
  );

  const PARV_EASTER_EGG = {
    title: 'MADE BY PARV',
    category: 'Lead Architect',
    url: 'https://www.linkedin.com/in/parvmishra/',
    snippet: 'System Architect & Full-Stack Engineer • Tap to connect on LinkedIn ↗'
  };

  const filtered = [
    ...(isParvQuery ? [PARV_EASTER_EGG] : []),
    ...SEARCH_ITEMS.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    )
  ];

  const handleSelect = (item) => {
    onClose();
    if (item.url) {
      window.open(getTrackedUrl(item.url), '_blank');
      return;
    }
    setCurrentPage(item.page);
    if (item.section && item.page === 'home') {
      setTimeout(() => {
        const el = document.getElementById(item.section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Search Header */}
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search Let's Cook website..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="search-input"
          />
          <button onClick={onClose} className="close-btn" aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        {/* Search Results */}
        <div className="search-results">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>No results found for "{query}"</p>
              <span className="subtext">Try searching for 'initiatives', 'faq', 'terms', or 'join'</span>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div 
                key={idx} 
                className="search-item"
                onClick={() => handleSelect(item)}
              >
                <div className="search-item-header">
                  <span className="search-item-title">{item.title}</span>
                  <span className="search-item-cat">{item.category}</span>
                </div>
                <p className="search-item-snippet">{item.snippet}</p>
              </div>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="search-footer">
          <span>Press <strong>ESC</strong> to close</span>
          <span>Domain: <strong>letscook.co.in</strong></span>
        </div>
      </div>

      <style>{`
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--modal-overlay);
          z-index: 2000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 100px;
          padding-inline: 16px;
        }

        .search-modal {
          width: 100%;
          max-width: 600px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-card);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          gap: 12px;
        }

        .search-icon {
          color: var(--accent-burgundy);
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-main);
          font-size: 1.05rem;
          font-family: var(--font-body);
        }

        .close-btn {
          color: var(--text-muted);
          padding: 4px;
        }

        .close-btn:hover {
          color: var(--text-main);
        }

        .search-results {
          max-height: 360px;
          overflow-y: auto;
          padding: 12px;
        }

        .search-item {
          padding: 12px 14px;
          border-radius: var(--radius-btn);
          cursor: pointer;
          transition: background-color var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .search-item:hover {
          background-color: var(--bg-surface-hover);
        }

        .search-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .search-item-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .search-item-cat {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 2px 8px;
          background-color: var(--accent-burgundy-light);
          color: var(--accent-burgundy);
          border-radius: 2px;
        }

        .search-item-snippet {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .no-results {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .subtext {
          font-size: 0.8rem;
          display: block;
          margin-top: 6px;
        }

        .search-footer {
          padding: 12px 20px;
          background-color: var(--bg-main);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft, 
  Filter, 
  Users, 
  Layers, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  getAllEvents, 
  getEventById, 
  getCertificateById, 
  searchCertificates, 
  getPortalStats 
} from '../services/certificateService';
import CertificateViewer from '../components/CertificateViewer';
import { playTechClick } from '../utils/soundEngine';

export default function CertificateVerifyPage({ setCurrentPage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [selectedCert, setSelectedCert] = useState(null);
  const [urlCertId, setUrlCertId] = useState(null);

  const events = useMemo(() => getAllEvents(), []);
  const stats = useMemo(() => getPortalStats(), []);

  // Sync URL query params (e.g. /verify?id=LC-ORIG-001)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Let's Cook | Credential Verification Portal";

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('cert');
    if (idParam) {
      setUrlCertId(idParam);
      const found = getCertificateById(idParam);
      if (found) {
        setSelectedCert(found);
      }
    }

    return () => {
      document.title = "Let's Cook | Student-Run Tech & Builder Community";
    };
  }, []);

  const handleSelectCert = (cert) => {
    playTechClick();
    setSelectedCert(cert);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', `/verify?id=${encodeURIComponent(cert.id)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSelection = () => {
    playTechClick();
    setSelectedCert(null);
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/verify');
    }
  };

  const searchResults = useMemo(() => {
    return searchCertificates({
      query: searchQuery,
      eventId: selectedEventId,
      limit: 24
    });
  }, [searchQuery, selectedEventId]);

  const handleReturnHome = () => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    setCurrentPage('home');
  };

  return (
    <div className="verify-page-wrapper animate-fade-in">
      {/* Background Ambience */}
      <div className="verify-ambient-grid" />
      <div className="verify-radial-glow" />

      <main className="verify-main-container">
        {/* Top Navigation Bar */}
        <div className="verify-top-bar">
          <button 
            onClick={handleReturnHome}
            className="verify-back-btn"
            aria-label="Return to main website"
          >
            <ArrowLeft size={16} /> RETURN TO MAIN SITE
          </button>
          
          <div className="verify-status-indicator">
            <span className="status-ping" />
            <span className="status-label">REGISTRY LIVE • SHA-256 SECURED</span>
          </div>
        </div>

        {/* Portal Hero Header */}
        <header className="verify-hero">
          <div className="verify-badge-pill">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>LET'S COOK OFFICIAL CREDENTIAL REGISTRY</span>
          </div>

          <h1 className="verify-title">
            Certificate <span className="text-gradient-cyan">Verification</span>
          </h1>
          <p className="verify-subtitle">
            Instant cryptographic proof of achievement, participation, and excellence issued across all Let's Cook workshops, hackathons, and community programs.
          </p>

          {/* Key Registry Telemetry Counters */}
          <div className="verify-stats-grid">
            <div className="stat-card">
              <span className="stat-num">{stats.totalIssued}</span>
              <span className="stat-desc"><Users size={14} /> Total Verified Recipients</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">{stats.totalEvents}</span>
              <span className="stat-desc"><Layers size={14} /> Active Events</span>
            </div>
            <div className="stat-card">
              <span className="stat-num">100%</span>
              <span className="stat-desc"><CheckCircle2 size={14} /> Cryptographic Validity</span>
            </div>
          </div>
        </header>

        {/* ACTIVE CREDENTIAL VIEW (When an ID is selected or opened via link) */}
        {selectedCert ? (
          <section className="verified-view-section animate-fade-in">
            {/* Verification Status Card */}
            <div className="verified-credential-card">
              <div className="cred-card-header">
                <div className="cred-badge">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <div>
                    <span className="cred-badge-status">OFFICIAL RECORD VERIFIED</span>
                    <span className="cred-badge-id">ID: {selectedCert.id}</span>
                  </div>
                </div>

                <button 
                  onClick={handleClearSelection}
                  className="cred-reset-btn"
                >
                  <Search size={14} /> Search Another
                </button>
              </div>

              <div className="cred-details-grid">
                <div className="cred-field">
                  <label>RECIPIENT NAME</label>
                  <p className="cred-highlight-name">{selectedCert.recipient.name}</p>
                </div>
                <div className="cred-field">
                  <label>CREDENTIAL TYPE</label>
                  <p>{selectedCert.credentialType}</p>
                </div>
                <div className="cred-field">
                  <label>EVENT</label>
                  <p>{selectedCert.event?.name || 'ORIGIN 2026'}</p>
                </div>
                <div className="cred-field">
                  <label>ORGANIZATION & PARTNER</label>
                  <p>Let's Cook {selectedCert.event?.partner ? `× ${selectedCert.event.partner}` : ''}</p>
                </div>
                <div className="cred-field">
                  <label>ISSUE DATE</label>
                  <p>{selectedCert.issueDate}</p>
                </div>
                <div className="cred-field">
                  <label>INTEGRITY HASH</label>
                  <p className="font-mono text-xs text-zinc-400">{selectedCert.verifyHash}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Certificate Viewer & Downloader */}
            <div className="cert-renderer-box">
              <CertificateViewer 
                certificate={selectedCert} 
                event={selectedCert.event || events[0]} 
              />
            </div>
          </section>
        ) : (
          /* SEARCH & DIRECTORY VIEW */
          <section className="verify-search-section">
            <div className="search-filter-bar">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Certificate ID (e.g. LC-ORIG-001), your name, or email..."
                  className="search-input-field"
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="clear-search-btn"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Event Filter Select */}
              <div className="event-filter-wrap">
                <Filter size={16} className="filter-icon" />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="event-filter-select"
                >
                  <option value="all">All Events ({stats.totalEvents})</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.shortName || ev.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Suggestions / Sample Pills */}
            <div className="search-quick-tags">
              <span className="tags-label">Try searching:</span>
              {['LC-ORIG-001', 'Khushal Aggarwal', 'Ishaan Saxena', 'Harmanjit Kaur', 'Saksham Pathak'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="quick-tag-pill"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Results Display */}
            <div className="results-container">
              <div className="results-header">
                <h3>
                  {searchQuery 
                    ? `Matching Records (${searchResults.length})` 
                    : `Verified Recipients (${searchResults.length})`}
                </h3>
                <span className="results-caption">Click any certificate to view, verify, and download</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="certs-grid">
                  {searchResults.map(cert => (
                    <div
                      key={cert.id}
                      onClick={() => handleSelectCert(cert)}
                      className="cert-result-card"
                    >
                      <div className="cert-card-top">
                        <span className="cert-id-tag">{cert.id}</span>
                        <span className="cert-event-pill">{cert.event?.shortName || 'ORIGIN'}</span>
                      </div>

                      <h4 className="cert-recipient-name">{cert.recipient.name}</h4>
                      
                      <div className="cert-meta-info">
                        <span className="cert-meta-item">
                          <Award size={13} /> {cert.credentialType}
                        </span>
                        {cert.recipient.branch && (
                          <span className="cert-meta-item">
                            🎓 {cert.recipient.branch}
                          </span>
                        )}
                        <span className="cert-meta-item">
                          <Calendar size={13} /> {cert.issueDate}
                        </span>
                      </div>

                      <div className="cert-view-action">
                        <span>View Verified Certificate</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results-box">
                  <AlertCircle size={36} className="text-zinc-500 mb-3" />
                  <h4>No Matching Certificate Found</h4>
                  <p>
                    Please verify that your Certificate ID (e.g. <code>LC-ORIG-001</code>), full name, or registered email is entered correctly.
                  </p>
                </div>
              )}
            </div>

            {/* Available Events Showcase */}
            <div className="events-directory-showcase">
              <div className="directory-header">
                <Sparkles size={20} className="text-cyan-400" />
                <h3>Events in Official Registry</h3>
              </div>

              <div className="events-directory-grid">
                {events.map(ev => (
                  <div key={ev.id} className="event-directory-card">
                    <div className="event-dir-header">
                      <span className="event-category-badge">{ev.category}</span>
                      <span className="event-date-tag">{ev.date}</span>
                    </div>
                    <h4>{ev.name}</h4>
                    <p>{ev.description}</p>
                    <div className="event-dir-footer">
                      <span className="org-label">Organized by {ev.organization} {ev.partner ? `× ${ev.partner}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        .verify-page-wrapper {
          position: relative;
          min-height: 100vh;
          padding: 30px 20px 80px 20px;
          background-color: #060608;
          color: #f1f5f9;
          overflow-x: hidden;
        }

        .verify-ambient-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .verify-radial-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 450px;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(255, 0, 85, 0.03) 50%, transparent 80%);
          pointer-events: none;
          z-index: 0;
        }

        .verify-main-container {
          position: relative;
          z-index: 1;
          max-width: 1080px;
          margin: 0 auto;
        }

        .verify-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
        }

        .verify-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .verify-back-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(0, 240, 255, 0.3);
          transform: translateX(-2px);
        }

        .verify-status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .status-ping {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .verify-hero {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 40px auto;
        }

        .verify-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0, 240, 255, 0.06);
          border: 1px solid rgba(0, 240, 255, 0.25);
          border-radius: 999px;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #00f0ff;
          margin-bottom: 20px;
        }

        .verify-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f0ff 0%, #38bdf8 60%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .verify-subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .verify-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 24px;
        }

        .stat-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-num {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
        }

        .stat-desc {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Verified View Specifics */
        .verified-view-section {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .verified-credential-card {
          background: linear-gradient(165deg, rgba(20, 24, 34, 0.85) 0%, rgba(10, 12, 18, 0.95) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.08);
        }

        .cred-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
        }

        .cred-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cred-badge-status {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.8rem;
          font-weight: 800;
          color: #34d399;
          letter-spacing: 0.06em;
        }

        .cred-badge-id {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .cred-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cred-reset-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .cred-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
        }

        .cred-field label {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.68rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }

        .cred-field p {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }

        .cred-highlight-name {
          color: #00f0ff !important;
          font-size: 1.15rem !important;
          font-weight: 800 !important;
        }

        .cert-renderer-box {
          background: rgba(14, 16, 22, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
        }

        /* Search & Filter Bar */
        .search-filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-input-field {
          width: 100%;
          height: 52px;
          padding: 0 46px 0 48px;
          background: rgba(20, 24, 34, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .search-input-field:focus {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
          background: rgba(24, 30, 44, 0.95);
        }

        .clear-search-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .event-filter-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .event-filter-select {
          height: 52px;
          padding: 0 24px 0 40px;
          background: rgba(20, 24, 34, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          color: #cbd5e1;
          font-size: 0.9rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .search-quick-tags {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 36px;
        }

        .tags-label {
          font-size: 0.78rem;
          color: #64748b;
          font-family: var(--font-mono, monospace);
        }

        .quick-tag-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-tag-pill:hover {
          color: #00f0ff;
          border-color: rgba(0, 240, 255, 0.3);
          background: rgba(0, 240, 255, 0.06);
        }

        /* Results Display */
        .results-container {
          margin-bottom: 60px;
        }

        .results-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .results-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .results-caption {
          font-size: 0.82rem;
          color: #64748b;
        }

        .certs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 16px;
        }

        .cert-result-card {
          background: rgba(18, 22, 32, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cert-result-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 240, 255, 0.35);
          background: rgba(22, 28, 42, 0.9);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 240, 255, 0.1);
        }

        .cert-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cert-id-tag {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 800;
          color: #00f0ff;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.2);
        }

        .cert-event-pill {
          font-size: 0.72rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .cert-recipient-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .cert-meta-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cert-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #64748b;
        }

        .cert-view-action {
          margin-top: 6px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.84rem;
          font-weight: 700;
          color: #00f0ff;
        }

        .no-results-box {
          text-align: center;
          padding: 50px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }

        .no-results-box h4 {
          font-size: 1.1rem;
          color: #e2e8f0;
          margin-bottom: 6px;
        }

        .no-results-box p {
          color: #64748b;
          font-size: 0.88rem;
        }

        /* Events Directory */
        .events-directory-showcase {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 28px;
        }

        .directory-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .directory-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .events-directory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
        }

        .event-directory-card {
          background: rgba(18, 22, 32, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-dir-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .event-category-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 700;
          color: #ff0055;
          padding: 2px 8px;
          background: rgba(255, 0, 85, 0.1);
          border-radius: 6px;
        }

        .event-date-tag {
          font-size: 0.75rem;
          color: #64748b;
        }

        .event-directory-card h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .event-directory-card p {
          font-size: 0.84rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        .event-dir-footer {
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          color: #64748b;
          font-family: var(--font-mono, monospace);
        }

        @media (max-width: 640px) {
          .verify-stats-grid {
            grid-template-columns: 1fr;
          }
          .search-filter-bar {
            flex-direction: column;
          }
          .certs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

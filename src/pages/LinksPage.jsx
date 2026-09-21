import React, { useEffect } from 'react';
import { ArrowLeft, ExternalLink, Share2, Check } from 'lucide-react';
import { playTechClick } from '../utils/soundEngine';

export default function LinksPage({ setCurrentPage }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Let's Cook | Community Links";
    return () => {
      document.title = "Let's Cook | Student-Run Tech & Builder Community";
    };
  }, []);

  const handleReturnHome = () => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    setCurrentPage('home');
  };

  const handleCopyLink = () => {
    playTechClick();
    const linksUrl = window.location.origin + '/links';
    navigator.clipboard.writeText(linksUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="links-page-wrapper animate-fade-in">
      <main className="links-card-container">
        {/* Circuit traces in corners */}
        <svg className="circuit-trace-svg tr" viewBox="0 0 150 120" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M20 10 H70 L100 40 V80 L130 110" />
          <circle cx="14" cy="10" r="6" />
          <path d="M60 30 L85 55 V100" />
          <circle cx="55" cy="26" r="5" />
          <circle cx="85" cy="106" r="5" />
        </svg>
        <svg className="circuit-trace-svg bl" viewBox="0 0 130 110" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M10 10 H60 L90 40 V90" />
          <circle cx="90" cy="96" r="6" />
          <path d="M40 30 L60 50 H110" />
          <circle cx="116" cy="50" r="5" />
        </svg>

        {/* Top Utility Bar */}
        <div className="links-top-bar">
          <button 
            onClick={handleReturnHome}
            className="links-back-btn"
            aria-label="Return to main website"
          >
            <ArrowLeft size={15} /> RETURN TO MAIN SITE
          </button>

          <button 
            onClick={handleCopyLink}
            className="links-share-btn"
            title="Copy links URL"
            aria-label="Copy links URL"
          >
            {copied ? <Check size={14} className="text-green" /> : <Share2 size={14} />}
            <span>{copied ? 'COPIED!' : 'SHARE'}</span>
          </button>
        </div>

        {/* Header */}
        <header className="links-header">
          <div className="links-logo-tile">
            <img src="/letscook-logo.png" alt="Let's Cook Logo" />
          </div>
          <h1 className="links-title">
            Let’s <span className="links-accent">Cook</span>
          </h1>
          <p className="links-motto">CODERE, AEDIFICARE, VINCERE</p>
          <p className="links-lede">
            A student-run tech community. Stop watching tutorials. Start shipping.
          </p>
        </header>

        {/* Circuit Wired Navigation List */}
        <nav className="links-nav" aria-label="Let's Cook official community links">
          <button 
            className="circuit-link primary"
            onClick={handleReturnHome}
          >
            <span className="link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
              </svg>
            </span>
            <span className="link-txt">
              <strong>Visit our website</strong>
              <span>letscook.co.in</span>
            </span>
          </button>

          <a 
            className="circuit-link join"
            href="https://chat.whatsapp.com/Gogg1uWXakiEPFmmtQrTHL"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playTechClick}
          >
            <span className="link-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </span>
            <span className="link-txt">
              <strong>Join our WhatsApp community</strong>
              <span>Events, sprints, and opportunities</span>
            </span>
          </a>

          <a 
            className="circuit-link"
            href="https://www.instagram.com/letscook_com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playTechClick}
          >
            <span className="link-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className="link-txt">
              <strong>Follow us on Instagram</strong>
              <span>@letscook_com</span>
            </span>
          </a>

          <a 
            className="circuit-link"
            href="https://www.linkedin.com/company/let-s-cook-community-the-foundry/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playTechClick}
          >
            <span className="link-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z" />
              </svg>
            </span>
            <span className="link-txt">
              <strong>Follow us on LinkedIn</strong>
              <span>Let’s Cook Community</span>
            </span>
          </a>

          <a 
            className="circuit-link"
            href="https://github.com/letscook-community"
            target="_blank"
            rel="noopener noreferrer"
            onClick={playTechClick}
          >
            <span className="link-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </span>
            <span className="link-txt">
              <strong>See what we build on GitHub</strong>
              <span>github.com/letscook-community</span>
            </span>
          </a>
        </nav>

        {/* Secondary Social Chips */}
        <section className="links-more-section" aria-label="More places to find us">
          <p className="links-more-label">Also find us on</p>
          <div className="links-chips-grid">
            <a 
              className="links-chip" 
              href="https://x.com/letscook_com" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={playTechClick}
              aria-label="Let's Cook on X"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
              <span>X</span>
            </a>
            <a 
              className="links-chip" 
              href="https://www.threads.com/@letscook_com" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={playTechClick}
              aria-label="Let's Cook on Threads"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M16.5 11.2c-.3-2.4-1.9-3.7-4.3-3.7-2.6 0-4.2 1.9-4.2 4.5s1.6 4.5 4.1 4.5c2.3 0 3.9-1.4 3.9-3.3 0-2.6-3.2-3-5.1-2.3M16.5 11.2c.2 1.7 1.3 3 2.9 2.7M19.4 13.9c.4-3.8-1.1-9.4-7.3-9.4C7.6 4.5 4.5 7.8 4.5 12s3 7.5 7.6 7.5c2.3 0 4-.7 5.3-1.8" />
              </svg>
              <span>Threads</span>
            </a>
            <a 
              className="links-chip" 
              href="https://www.facebook.com/profile.php?id=61594453651601" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={playTechClick}
              aria-label="Let's Cook on Facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
              <span>Facebook</span>
            </a>
            <a 
              className="links-chip" 
              href="mailto:foundry@letscook.co.in"
              onClick={playTechClick}
              aria-label="Email Let's Cook"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <span>Email</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="links-footer">
          <b>Let’s Cook</b> is run by The Foundry, our student team.<br />
          Learn, build and grow, together. Mathura, U.P.
        </footer>
      </main>

      <style>{`
        .links-page-wrapper {
          min-height: 85vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 40px 16px 80px;
          position: relative;
          z-index: 10;
        }

        .links-card-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: #161214;
          border: 1px solid #3A2A2F;
          border-radius: 24px;
          padding: 32px 24px 44px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(183, 14, 50, 0.12);
          overflow: hidden;
        }

        .circuit-trace-svg {
          position: absolute;
          pointer-events: none;
          color: #6B2A38;
        }
        .circuit-trace-svg.tr {
          top: -6px;
          right: -10px;
          width: 150px;
        }
        .circuit-trace-svg.bl {
          bottom: -10px;
          left: -14px;
          width: 130px;
          transform: rotate(180deg);
        }

        .links-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }

        .links-back-btn, .links-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #211A1C;
          border: 1px solid #3A2A2F;
          color: #B9AEB1;
          font-family: 'Space Grotesk', system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 7px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .links-back-btn:hover, .links-share-btn:hover {
          color: #F4F1F2;
          border-color: #B70E32;
          transform: translateY(-1px);
        }

        .text-green {
          color: #10b981;
        }

        .links-header {
          position: relative;
          text-align: center;
          margin-bottom: 28px;
          z-index: 1;
        }

        .links-logo-tile {
          width: 104px;
          height: 104px;
          margin: 0 auto 16px;
          border-radius: 24px;
          background: #ffffff;
          display: grid;
          place-items: center;
          border: 2px solid #3A2A2F;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .links-logo-tile img {
          width: 78px;
          height: auto;
          display: block;
        }

        .links-title {
          margin: 0;
          font-size: 2.1rem;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #F4F1F2;
        }
        .links-accent {
          color: #B70E32;
          text-shadow: 0 0 20px rgba(183, 14, 50, 0.4);
        }

        .links-motto {
          margin: 6px 0 0;
          font-size: 0.72rem;
          letter-spacing: 0.24em;
          color: #B9AEB1;
          font-weight: 600;
        }

        .links-lede {
          margin: 14px auto 0;
          max-width: 32ch;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #d1c7c9;
        }

        /* Circuit wiring line and nodes */
        .links-nav {
          position: relative;
          padding-left: 34px;
          z-index: 1;
        }
        .links-nav::before {
          content: "";
          position: absolute;
          left: 11px;
          top: -14px;
          bottom: 30px;
          width: 2px;
          background: #B70E32;
          border-radius: 2px;
        }

        .circuit-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 0 0 13px;
          padding: 14px 16px;
          min-height: 64px;
          background: #211A1C;
          border: 1.5px solid #3A2A2F;
          border-radius: 14px;
          color: #F4F1F2;
          text-decoration: none;
          text-align: left;
          width: 100%;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }
        .circuit-link::before {
          content: "";
          position: absolute;
          left: -23px;
          top: 50%;
          width: 22px;
          height: 2px;
          background: #B70E32;
        }
        .circuit-link::after {
          content: "";
          position: absolute;
          left: -29px;
          top: 50%;
          width: 12px;
          height: 12px;
          margin-top: -6px;
          border-radius: 50%;
          background: #161214;
          border: 2px solid #B70E32;
          transition: background-color 0.2s ease;
        }
        .circuit-link:hover {
          border-color: #B70E32;
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(183, 14, 50, 0.15);
        }
        .circuit-link:hover::after {
          background: #B70E32;
        }

        .link-icon {
          flex: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #1E181A;
          color: #B70E32;
        }
        .link-icon svg {
          width: 22px;
          height: 22px;
        }

        .link-txt {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .link-txt strong {
          font-weight: 600;
          font-size: 1rem;
          line-height: 1.25;
          color: #F4F1F2;
        }
        .link-txt span {
          font-size: 0.8rem;
          color: #B9AEB1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .circuit-link.primary {
          background: #B70E32;
          border-color: #B70E32;
          color: #ffffff;
        }
        .circuit-link.primary .link-icon {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .circuit-link.primary .link-txt strong {
          color: #ffffff;
        }
        .circuit-link.primary .link-txt span {
          color: rgba(255, 255, 255, 0.88);
        }
        .circuit-link.primary:hover {
          background: #8E0A26;
          border-color: #8E0A26;
        }

        .circuit-link.join {
          border-color: #B70E32;
        }
        .circuit-link.join .link-icon {
          background: #B70E32;
          color: #ffffff;
        }

        .links-more-section {
          position: relative;
          z-index: 1;
          margin-top: 24px;
          text-align: center;
        }
        .links-more-label {
          margin: 0 0 10px;
          font-size: 0.82rem;
          color: #B9AEB1;
          font-weight: 500;
        }
        .links-chips-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .links-chip {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 4px;
          border: 1.5px solid #3A2A2F;
          border-radius: 12px;
          background: #211A1C;
          color: #F4F1F2;
          text-decoration: none;
          font-size: 0.74rem;
          font-weight: 500;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .links-chip svg {
          width: 20px;
          height: 20px;
          color: #B70E32;
        }
        .links-chip:hover {
          border-color: #B70E32;
          transform: translateY(-2px);
          color: #ffffff;
        }

        .links-footer {
          position: relative;
          z-index: 1;
          margin-top: 28px;
          text-align: center;
          font-size: 0.78rem;
          color: #B9AEB1;
          line-height: 1.6;
        }
        .links-footer b {
          color: #F4F1F2;
          font-weight: 600;
        }

        @media (max-width: 520px) {
          .links-card-container {
            padding: 24px 16px 36px;
            border-radius: 20px;
          }
          .links-nav {
            padding-left: 28px;
          }
          .circuit-link {
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}

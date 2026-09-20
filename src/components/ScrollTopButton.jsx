import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      className="top-scroll-btn no-print animate-fade-in"
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />

      <style>{`
        .top-scroll-btn {
          position: fixed;
          bottom: 24px;
          right: 86px;
          z-index: 1300;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-btn);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .top-scroll-btn:hover {
          background-color: var(--bg-surface-hover);
          border-color: var(--accent-burgundy-border);
          color: var(--accent-burgundy-hover);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .top-scroll-btn {
            display: none !important;
          }
        }
      `}</style>
    </button>
  );
}

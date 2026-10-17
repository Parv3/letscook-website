import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Plus, 
  X, 
  ExternalLink, 
  FileCode, 
  Layers, 
  Presentation, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles,
  DownloadCloud
} from 'lucide-react';
import { getStoredUser, fetchPortalResources, uploadPortalResource, deletePortalResource } from '../services/portalService';
import { playTechClick, playVibraniumPing } from '../utils/soundEngine';

export default function ResourcesPage({ setCurrentPage, onSelectSquad, currentSquad }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

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

  // Fetch resources only if authenticated
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetchPortalResources();
        if (isMounted && res.success && Array.isArray(res.resources)) {
          setResources(res.resources);
        }
      } catch (err) {
        if (isMounted) console.error('Failed to load resources:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();

    return () => { isMounted = false; };
  }, [currentUser]);

  const isCoreMember = currentUser?.role === 'admin';

  const handleOpenJoin = () => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/join');
    }
    setCurrentPage('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHome = () => {
    playTechClick();
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteResource = async (resId) => {
    if (!window.confirm('Are you sure you want to remove this resource from the vault?')) return;
    try {
      playTechClick();
      await deletePortalResource(resId);
      setResources(prev => prev.filter(r => r.id !== resId));
      setSuccessToast('Resource removed from archive.');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete resource.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // =========================================================================
  // 1. STRICT UNAUTHENTICATED LOCKED STATE
  // Zero resource DOM nodes exist here — inspect cannot bypass this
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="resources-locked-viewport animate-fade-in">
        {/* Subtle blurred backdrop glow */}
        <div className="locked-grid-overlay" />
        <div className="locked-radial-glow" />

        <div 
          className="locked-simple-card"
          onClick={handleOpenJoin}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenJoin(); }}
          aria-label="Login to access resources"
        >
          <div className="locked-big-icon-wrap">
            <Lock size={68} strokeWidth={1.8} className="locked-big-icon" />
          </div>

          <h1 className="locked-minimal-title">
            Login to acess
          </h1>

          <button 
            type="button"
            className="locked-redirect-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenJoin();
            }}
          >
            <span>Login to access</span>
            <ArrowUpRight size={18} />
          </button>
        </div>

        <style>{`
          .resources-locked-viewport {
            min-height: calc(100vh - 80px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            position: relative;
            overflow: hidden;
            background: #06070a;
          }

          .locked-grid-overlay {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
          }

          .locked-radial-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 550px;
            height: 550px;
            background: radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%);
            filter: blur(60px);
            pointer-events: none;
          }

          .locked-simple-card {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 56px 40px;
            max-width: 440px;
            width: 100%;
            background: rgba(14, 16, 24, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(225, 29, 72, 0.12);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            cursor: pointer;
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
            text-align: center;
          }

          .locked-simple-card:hover {
            transform: translateY(-4px);
            border-color: rgba(225, 29, 72, 0.4);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(225, 29, 72, 0.25);
          }

          .locked-big-icon-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background: rgba(225, 29, 72, 0.1);
            border: 1px solid rgba(225, 29, 72, 0.35);
            margin-bottom: 24px;
            transition: transform 0.3s ease, border-color 0.3s ease;
          }

          .locked-simple-card:hover .locked-big-icon-wrap {
            transform: scale(1.06);
            border-color: rgba(225, 29, 72, 0.6);
            background: rgba(225, 29, 72, 0.16);
          }

          .locked-big-icon {
            color: #f43f5e;
            filter: drop-shadow(0 0 16px rgba(244, 63, 94, 0.6));
          }

          .locked-minimal-title {
            font-family: var(--font-display);
            font-size: clamp(1.6rem, 3vw, 2.1rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #ffffff;
            margin: 0 0 24px 0;
            line-height: 1.2;
          }

          .locked-redirect-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 13px 28px;
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(225, 29, 72, 0.4);
            transition: all 0.2s ease;
          }

          .locked-redirect-btn:hover {
            transform: scale(1.03);
            box-shadow: 0 0 30px rgba(225, 29, 72, 0.65);
          }

          @media (max-width: 480px) {
            .locked-simple-card {
              padding: 40px 24px;
            }
            .locked-big-icon-wrap {
              width: 90px;
              height: 90px;
            }
            .locked-big-icon {
              width: 52px;
              height: 52px;
            }
            .locked-redirect-btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED VAULT VIEW (All logged-in members can view/download)
  // =========================================================================
  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory || res.targetSquad === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.tags && res.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (sq) => {
    switch (sq) {
      case 'ironman':
      case 'tech': return '#ef4444';
      case 'hulk':
      case 'design': return '#22c55e';
      case 'thor':
      case 'events': return '#f59e0b';
      case 'captain':
      case 'pr': return '#38bdf8';
      default: return '#a855f7';
    }
  };

  const getFileIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('repo') || t.includes('code')) return <FileCode size={20} />;
    if (t.includes('design') || t.includes('figma')) return <Layers size={20} />;
    if (t.includes('deck') || t.includes('pitch')) return <Presentation size={20} />;
    return <BookOpen size={20} />;
  };

  return (
    <div className="resources-page-root animate-fade-in">
      <div className="resources-container">
        {/* Header Section */}
        <div className="resources-header-row">
          <div>
            <div className="resources-eyebrow">
              <Sparkles size={14} className="eyebrow-spark" />
              <span>LET'S COOK INTERNAL REPOSITORY · VERIFIED CLEARANCE</span>
            </div>
            <h1 className="resources-title">BUILDER VAULT & RESOURCES</h1>
            <p className="resources-subtitle">
              Curated production boilerplates, WebGL design systems, hackathon pitch decks, and architectural handbooks shared by Core Leadership.
            </p>
          </div>

          <div className="resources-header-cta">
            {isCoreMember ? (
              <button 
                onClick={() => { playTechClick(); setIsUploadModalOpen(true); }}
                className="btn-primary upload-resource-btn glow-btn"
              >
                <Plus size={16} /> Upload Resource
              </button>
            ) : (
              <div className="member-status-pill">
                <CheckCircle2 size={14} className="pill-check" />
                <span>MEMBER ACCESS · DOWNLOAD UNLOCKED</span>
              </div>
            )}
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successToast && (
          <div className="vault-alert alert-success animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}
        {errorMsg && (
          <div className="vault-alert alert-error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="resources-toolbar">
          <div className="vault-search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              placeholder="Search by title, technology (React, Next.js, WebGL), or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="vault-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="vault-category-pills">
            {[
              { id: 'all', label: 'ALL VAULTS' },
              { id: 'tech', label: 'TECH LABS (IRON MAN)' },
              { id: 'design', label: 'DESIGN TEAM (HULK)' },
              { id: 'events', label: 'EVENTS & DEMOS (THOR)' },
              { id: 'pr', label: 'PR & ADVOCACY (CAP)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { playTechClick(); setSelectedCategory(cat.id); }}
                className={`category-pill ${selectedCategory === cat.id ? 'active-pill' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="vault-loading-state">
            <div className="vault-spinner" />
            <span>Accessing encrypted Let's Cook repository...</span>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="vault-empty-state">
            <BookOpen size={48} className="empty-icon" />
            <h3>No resources found in this category</h3>
            <p>Try searching for a different keyword or select another squad division.</p>
          </div>
        ) : (
          <div className="resources-cards-grid">
            {filteredResources.map(res => {
              const themeColor = getCategoryColor(res.targetSquad || res.category);
              return (
                <div key={res.id} className="resource-card hover-glow">
                  <div className="resource-card-top">
                    <div 
                      className="resource-type-badge"
                      style={{ color: themeColor, borderColor: `${themeColor}40`, background: `${themeColor}12` }}
                    >
                      {getFileIcon(res.fileType)}
                      <span>{res.fileType || 'Guide'}</span>
                    </div>

                    <div className="resource-squad-tag" style={{ color: themeColor }}>
                      ● {(res.targetSquad || res.category || 'general').toUpperCase()}
                    </div>
                  </div>

                  <h3 className="resource-card-title">{res.title}</h3>
                  <p className="resource-card-desc">{res.description}</p>

                  {res.tags && res.tags.length > 0 && (
                    <div className="resource-tags-row">
                      {res.tags.map((tag, idx) => (
                        <span key={idx} className="resource-tag-chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="resource-card-footer">
                    <div className="uploader-info">
                      <span className="uploader-name">{res.uploadedBy?.name || 'Core Leadership'}</span>
                      <span className="uploader-role">{res.uploadedBy?.roleTitle || 'Core Head'}</span>
                    </div>

                    <div className="resource-actions-cell">
                      {isCoreMember && (
                        <button
                          onClick={() => handleDeleteResource(res.id)}
                          className="btn-delete-resource"
                          title="Delete resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-open-resource glow-btn"
                        style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #8b002e 100%)` }}
                        onClick={() => playTechClick()}
                      >
                        OPEN <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Core Member Upload Modal */}
        {isUploadModalOpen && (
          <UploadResourceModal 
            onClose={() => setIsUploadModalOpen(false)}
            onUploaded={(newRes) => {
              setResources(prev => [newRes, ...prev]);
              setIsUploadModalOpen(false);
              setSuccessToast('Resource uploaded and published to community members.');
              setTimeout(() => setSuccessToast(''), 4000);
            }}
          />
        )}
      </div>

      <style>{`
        .resources-page-root {
          min-height: calc(100vh - 80px);
          padding: 48px 24px 80px 24px;
          background: #06070a;
          position: relative;
        }

        .resources-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .resources-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }

        .resources-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #e2e8f0;
          margin-bottom: 12px;
        }

        .eyebrow-spark {
          color: #fbbf24;
        }

        .resources-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .resources-subtitle {
          font-size: 0.98rem;
          color: #94a3b8;
          max-width: 680px;
          line-height: 1.6;
          margin: 0;
        }

        .upload-resource-btn {
          height: 44px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent-burgundy) 0%, #dc2626 100%);
        }

        .member-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 9999px;
          font-family: monospace;
          font-size: 0.75rem;
          font-weight: 800;
          color: #4ade80;
          letter-spacing: 0.05em;
        }

        .pill-check {
          color: #22c55e;
        }

        .vault-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.88rem;
          margin-bottom: 24px;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #4ade80;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #f87171;
        }

        .resources-toolbar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 36px;
        }

        .vault-search-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: #64748b;
          pointer-events: none;
        }

        .vault-search-input {
          width: 100%;
          height: 48px;
          padding: 0 44px;
          background: rgba(14, 16, 22, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #ffffff;
          font-size: 0.92rem;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
          transition: border-color 0.2s ease;
        }

        .vault-search-input:focus {
          border-color: var(--accent-burgundy);
          outline: none;
        }

        .clear-search-btn {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .vault-category-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .category-pill {
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-pill:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .category-pill.active-pill {
          background: rgba(255, 255, 255, 0.12);
          border-color: #ffffff;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(255, 255, 255, 0.15);
        }

        .resources-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .resource-card {
          background: rgba(14, 16, 22, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }

        .resource-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }

        .resource-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .resource-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid;
          font-family: monospace;
          font-size: 0.7rem;
          font-weight: 800;
        }

        .resource-squad-tag {
          font-family: monospace;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .resource-card-title {
          font-family: var(--font-display);
          font-size: 1.18rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px 0;
          line-height: 1.35;
        }

        .resource-card-desc {
          font-size: 0.86rem;
          color: #94a3b8;
          line-height: 1.55;
          margin: 0 0 18px 0;
          flex: 1;
        }

        .resource-tags-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .resource-tag-chip {
          font-family: monospace;
          font-size: 0.68rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .resource-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .uploader-info {
          display: flex;
          flex-direction: column;
        }

        .uploader-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .uploader-role {
          font-size: 0.7rem;
          color: #64748b;
        }

        .resource-actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-delete-resource {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .btn-delete-resource:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .btn-open-resource {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .vault-loading-state,
        .vault-empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #64748b;
        }

        .vault-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--accent-burgundy);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px auto;
        }

        .empty-icon {
          color: #334155;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}

// =========================================================================
// 3. CORE MEMBER UPLOAD RESOURCE MODAL
// =========================================================================
function UploadResourceModal({ onClose, onUploaded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tech',
    targetSquad: 'ironman',
    fileType: 'Repository',
    url: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      playTechClick();
      const res = await uploadPortalResource(formData);
      playVibraniumPing();
      onUploaded(res.resource);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="modal-dialog-card" onClick={e => e.stopPropagation()}>
        <div className="modal-top-bar">
          <div>
            <h3 className="modal-title">Upload Vault Resource</h3>
            <p className="modal-subline">Core Team clearance: Add internal boilerplates, decks, and guides.</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="portal-error-alert" style={{ margin: '16px 24px 0 24px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-edit-form">
          <div className="form-field">
            <label>RESOURCE TITLE *</label>
            <input 
              type="text"
              required
              placeholder="e.g. Next.js 14 Full-Stack Production Starter"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label>CATEGORY *</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="tech">Tech Labs</option>
                <option value="design">Design Team</option>
                <option value="events">Events & Demos</option>
                <option value="pr">PR & Outreach</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="form-field">
              <label>RESOURCE TYPE *</label>
              <select 
                value={formData.fileType} 
                onChange={e => setFormData({ ...formData, fileType: e.target.value })}
              >
                <option value="Repository">GitHub Repository</option>
                <option value="Design Kit">Figma Design Kit</option>
                <option value="Pitch Deck">Pitch Deck / Slides</option>
                <option value="Guide">Documentation / Guide</option>
                <option value="Boilerplate">Code Boilerplate</option>
                <option value="Cheat Sheet">Cheat Sheet</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>DESTINATION URL / LINK *</label>
            <input 
              type="url"
              required
              placeholder="https://github.com/... or https://figma.com/..."
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>SQUAD DIVISION ASSIGNMENT</label>
            <select 
              value={formData.targetSquad} 
              onChange={e => setFormData({ ...formData, targetSquad: e.target.value })}
            >
              <option value="ironman">Iron Man (Tech Labs)</option>
              <option value="hulk">Hulk (Design Team)</option>
              <option value="thor">Thor (Events & Sprints)</option>
              <option value="captain">Captain America (PR & Outreach)</option>
            </select>
          </div>

          <div className="form-field">
            <label>TAGS (COMMA SEPARATED)</label>
            <input 
              type="text"
              placeholder="Next.js, Tailwind, System Design, Hackathons"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="form-field">
            <label>DESCRIPTION & INSTRUCTIONS</label>
            <textarea 
              rows={3}
              placeholder="Explain how members should use this blueprint, what problems it solves..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-actions-bar">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Publishing...' : 'Publish to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

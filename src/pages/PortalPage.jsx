import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  FileSpreadsheet, 
  Search, 
  Check, 
  AlertCircle,
  Edit3,
  X,
  Palette,
  Terminal,
  Zap,
  Camera,
  Upload
} from 'lucide-react';
import { 
  getStoredToken, 
  getStoredUser, 
  sendPortalOtp, 
  loginPortalUser, 
  getPortalMe, 
  updatePortalProfile,
  getAdminRoster, 
  executeAdminAction, 
  clearSession,
  saveSession
} from '../services/portalService';
import { playTechClick, playVibraniumPing, playAssembleFanfare } from '../utils/soundEngine';

// Predefined Avatars List
export const PREDEFINED_AVATARS = [
  { id: 'arc', name: 'Arc Sentry', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=arc-sentry&backgroundColor=ff0055' },
  { id: 'vibranium', name: 'Vibranium Aegis', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=vibranium-shield&backgroundColor=38bdf8' },
  { id: 'thunder', name: 'Thunder Forge', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=thunder-forge&backgroundColor=f59e0b' },
  { id: 'gamma', name: 'Gamma Titan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=gamma-titan&backgroundColor=22c55e' },
  { id: 'cyber', name: 'Cyber Ronin', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=cyber-ronin' },
  { id: 'synth', name: 'Synth Matrix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=synth-matrix&backgroundColor=8b5cf6' },
  { id: 'neural', name: 'Neural Core', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=neural-core&backgroundColor=ec4899' },
  { id: 'quantum', name: 'Quantum Op', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum-builder&backgroundColor=06b6d4' }
];

// Calculate Profile Completion Percentage
function calculateProfileCompletion(user) {
  if (!user) return 0;
  let score = 20; // 20% for email verified
  if (user.fullName && user.fullName.trim().length > 1) score += 20;
  if (user.college && user.branch) score += 20;
  if (user.targetSquad) score += 20;
  if ((user.skills && user.skills.length > 0) || user.githubUrl || user.linkedinUrl) score += 20;
  return Math.min(100, score);
}

// 4 Marvel Squads Data & Themes
const SQUADS_CONFIG = {
  ironman: {
    key: 'ironman',
    name: 'STARK TECH LABS',
    hero: 'IRON MAN',
    division: 'ENGINEERING & WASM',
    color: '#ff0055',
    secondary: '#00f0ff',
    desc: 'Rust, WASM, Distributed Systems, Cloud Architecture & Applied AI.'
  },
  captain: {
    key: 'captain',
    name: 'VIBRANIUM ALLIANCE',
    hero: 'CAPTAIN AMERICA',
    division: 'OUTREACH & PR',
    color: '#38bdf8',
    secondary: '#ef4444',
    desc: 'Developer Relations, Hackathon Alliances, Media & Community Diplomacy.'
  },
  thor: {
    key: 'thor',
    name: 'STORMBREAKER FORGE',
    hero: 'THOR',
    division: 'EVENTS & SPRINTS',
    color: '#f59e0b',
    secondary: '#60a5fa',
    desc: 'Rapid Prototyping Sprints, 24h Hackathons & Hardware Workshops.'
  },
  hulk: {
    key: 'hulk',
    name: 'GAMMA DESIGN LABS',
    hero: 'HULK',
    division: 'DESIGN & INTERFACE',
    color: '#22c55e',
    secondary: '#a855f7',
    desc: 'UI/UX Architecture, Design Systems, WebGL Shaders & Motion Engineering.'
  }
};

export default function PortalPage({ setCurrentPage, currentSquad = 'ironman', onSelectSquad }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);

  // Listen for open_profile_edit event from Navbar dropdown
  useEffect(() => {
    const handleOpenProfileModal = () => setIsProfileModalOpen(true);
    window.addEventListener('open_profile_edit', handleOpenProfileModal);
    return () => window.removeEventListener('open_profile_edit', handleOpenProfileModal);
  }, []);

  // Sync squad theme if user has a target squad
  useEffect(() => {
    if (currentUser?.targetSquad && onSelectSquad) {
      const sq = currentUser.targetSquad === 'core' ? 'hulk' : currentUser.targetSquad;
      if (SQUADS_CONFIG[sq] && sq !== currentSquad) {
        onSelectSquad(sq);
      }
    }
  }, [currentUser]);

  // Verify Session on mount
  // Verify Session on initial mount only
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoadingUser(false);
        return;
      }
      try {
        const user = await getPortalMe();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
          } else {
            // Keep existing storedUser if server is briefly unreachable or cold
            const cachedUser = getStoredUser();
            if (cachedUser) {
              setCurrentUser(cachedUser);
            } else {
              setCurrentUser(null);
              setToken(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const cachedUser = getStoredUser();
          if (cachedUser) {
            setCurrentUser(cachedUser);
          } else {
            setCurrentUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    }
    verifyAuth();
    return () => { isMounted = false; };
  }, []);

  const handleSignOut = () => {
    playTechClick();
    clearSession();
    setCurrentUser(null);
    setToken(null);
    window.dispatchEvent(new Event('letscook_auth_change'));
  };

  const handleSquadSelect = (squadKey) => {
    playTechClick();
    if (onSelectSquad) {
      onSelectSquad(squadKey);
    }
    localStorage.setItem('letscook_squad', squadKey);
    // If logged in, update profile asynchronously
    if (currentUser) {
      updatePortalProfile({ targetSquad: squadKey }).then(updated => {
        if (updated) {
          setCurrentUser(updated);
          window.dispatchEvent(new Event('letscook_auth_change'));
        }
      }).catch(() => {});
    }
  };

  const completionPercent = calculateProfileCompletion(currentUser);

  if (isLoadingUser) {
    return (
      <div className="portal-loading-screen">
        <div className="portal-spinner" />
        <p>Authenticating with Let's Cook Security Gateway...</p>
      </div>
    );
  }

  return (
    <div className="portal-container animate-fade-in">
      {!currentUser ? (
        <PortalAuthView 
          onAuthenticated={(user, issuedToken) => {
            saveSession(issuedToken, user);
            setCurrentUser(user);
            setToken(issuedToken);
            window.dispatchEvent(new Event('letscook_auth_change'));
            if (user?.targetSquad && onSelectSquad) {
              const sq = user.targetSquad === 'core' ? 'hulk' : user.targetSquad;
              if (SQUADS_CONFIG[sq]) onSelectSquad(sq);
            }
          }} 
        />
      ) : (
        <>
          {/* Progressive Profile Completion Floating Notice / Banner */}
          {completionPercent < 100 && !isPopupDismissed && (
            <div className="profile-completion-banner animate-fade-in">
              <div className="banner-left">
                <div className="completion-ring-box">
                  <span className="completion-ring-text">{completionPercent}%</span>
                </div>
                <div>
                  <h4 className="banner-title">Your Profile is {completionPercent}% complete</h4>
                  <p className="banner-desc">Complete your builder specs so squad heads can review your track and induct you.</p>
                </div>
              </div>
              <div className="banner-right">
                <button 
                  onClick={() => { playTechClick(); setIsProfileModalOpen(true); }}
                  className="btn-complete-profile"
                >
                  <Edit3 size={15} /> Complete Profile
                </button>
                <button 
                  onClick={() => setIsPopupDismissed(true)} 
                  className="btn-dismiss-banner" 
                  aria-label="Dismiss banner"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {currentUser.role === 'admin' ? (
            <AdminDashboardView 
              currentUser={currentUser} 
              onSignOut={handleSignOut} 
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onSelectSquad={handleSquadSelect}
              currentSquad={currentSquad}
            />
          ) : (
            <MemberDashboardView 
              currentUser={currentUser} 
              completionPercent={completionPercent}
              onSignOut={handleSignOut} 
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onSelectSquad={handleSquadSelect}
              currentSquad={currentSquad}
              onRefreshUser={async () => {
                const refreshed = await getPortalMe();
                if (refreshed) setCurrentUser(refreshed);
              }}
            />
          )}

          {/* Edit Profile Drawer / Modal */}
          {isProfileModalOpen && (
            <ProfileEditModal 
              currentUser={currentUser}
              onClose={() => setIsProfileModalOpen(false)}
              onSaved={(updatedUser) => {
                setCurrentUser(updatedUser);
                setIsProfileModalOpen(false);
                if (updatedUser?.targetSquad && onSelectSquad) {
                  onSelectSquad(updatedUser.targetSquad);
                }
              }}
              onSelectSquad={handleSquadSelect}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// 1. UNIFIED AUTHENTICATION GATE (Email -> 6-Digit OTP -> Instant Login)
// Whitelisted emails automatically receive Admin / Core Head status!
// ============================================================================
function PortalAuthView({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDevHint, setOtpDevHint] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsSendingOtp(true);
    try {
      playTechClick();
      const res = await sendPortalOtp(email);
      setOtpToken(res.otpToken);
      setOtpSent(true);
      setOtpCountdown(60);
      if (res.devOtp) {
        setOtpDevHint(res.devOtp);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpSent || !otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      playTechClick();
      const result = await loginPortalUser({
        email,
        otp: otpCode,
        otpToken
      });
      playAssembleFanfare();
      onAuthenticated(result.user, result.token);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-auth-wrapper">
      <div className="portal-auth-card">
        {/* Security Badge Header */}
        <div className="auth-card-header">
          <div className="auth-shield-icon">
            <Shield size={28} />
          </div>
          <h2 className="auth-headline">LET'S COOK ACCESS PORTAL</h2>
          <p className="auth-subline">
            Enter your email to receive a 6-digit access code.
          </p>
        </div>

        {errorMsg && (
          <div className="portal-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={otpSent ? handleVerifySubmit : handleSendOtp} className="portal-form">
          <div className="form-field">
            <label>YOUR EMAIL ADDRESS *</label>
            <div className="input-with-action">
              <input
                type="email"
                required
                disabled={otpSent}
                placeholder="alex@example.com or university email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {!otpSent ? (
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="btn-input-action"
                >
                  {isSendingOtp ? 'SENDING...' : 'GET CODE'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtpCode(''); }}
                  className="btn-input-action-edit"
                >
                  CHANGE
                </button>
              )}
            </div>
          </div>

          {/* 6-Digit OTP Matrix Field */}
          {otpSent && (
            <div className="otp-verification-section animate-fade-in">
              <div className="form-field">
                <div className="label-with-resend">
                  <label>ENTER 6-DIGIT VERIFICATION CODE *</label>
                  {otpCountdown > 0 ? (
                    <span className="resend-countdown">Resend in {otpCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="resend-btn"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  className="otp-code-input"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
                {otpDevHint && (
                  <button
                    type="button"
                    onClick={() => setOtpCode(otpDevHint)}
                    className="dev-otp-pill"
                    title="Click to auto-fill verification code"
                  >
                    <span>Instant Code: <strong>{otpDevHint}</strong> (Click to fill)</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length < 6}
                className="btn-primary w-full portal-submit-btn"
              >
                {isSubmitting ? 'VERIFYING...' : 'VERIFY & ENTER PORTAL'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MEMBER DASHBOARD VIEW (With Squad Theme Switcher)
// ============================================================================
function MemberDashboardView({ 
  currentUser, 
  completionPercent, 
  onSignOut, 
  onOpenProfileModal, 
  onSelectSquad,
  currentSquad 
}) {
  const activeSquadKey = currentUser.targetSquad === 'core' ? 'hulk' : (currentUser.targetSquad || currentSquad || 'ironman');
  const squad = SQUADS_CONFIG[activeSquadKey] || SQUADS_CONFIG.ironman;
  const isApproved = currentUser.status === 'approved';
  const isPending = currentUser.status === 'pending_review';

  return (
    <div className="member-dashboard-wrapper">
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div className="member-welcome-block">
          <div className="member-avatar-chip">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="member-avatar-img" />
            ) : (
              <User size={22} />
            )}
          </div>
          <div>
            <div className="member-eyebrow">STUDENT BUILDER PORTAL</div>
            <h1 className="member-name">{currentUser.fullName || 'Welcome, Builder'}</h1>
            <span className="member-id-tag">{currentUser.email} · {currentUser.college || 'Apex Institute of Technology'}</span>
          </div>
        </div>

        <div className="header-right-actions">
          <button onClick={onOpenProfileModal} className="btn-secondary edit-profile-btn">
            <Edit3 size={15} /> Edit Profile
          </button>
          <button onClick={onSignOut} className="btn-secondary sign-out-btn">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Application Status Banner */}
      <div className={`status-banner ${isApproved ? 'banner-approved' : isPending ? 'banner-pending' : 'banner-rejected'}`}>
        <div className="status-banner-content">
          <div className="status-icon-wrap">
            {isApproved ? (
              <CheckCircle2 size={24} className="icon-approved" />
            ) : isPending ? (
              <Clock size={24} className="icon-pending" />
            ) : (
              <XCircle size={24} className="icon-rejected" />
            )}
          </div>
          <div className="status-text-wrap">
            <h3 className="status-title">
              {isApproved 
                ? 'OFFICIAL MEMBER · ACTIVE IN SQUAD' 
                : isPending 
                  ? 'APPLICATION UNDER REVIEW' 
                  : 'APPLICATION ARCHIVED'}
            </h3>
            <p className="status-desc">
              {isApproved
                ? 'Your registration is verified by Core Council. You have access to internal repos, hackathon teams, and grants.'
                : isPending
                  ? 'Your profile is under review by Core Leadership. Make sure your profile details are fully completed.'
                  : 'Your application has concluded for this cohort. You can re-apply for future hackathons.'}
            </p>
          </div>
        </div>
      </div>

      {/* Squad Division Selector & Theme Changer */}
      <div className="dashboard-card squad-selector-card">
        <div className="squad-selector-header">
          <div>
            <span className="card-label">SQUAD DIVISION & THEME ACCENT</span>
            <h3 className="section-title">Pick your Squad Theme</h3>
            <p className="section-subtext">Selecting a squad dynamically customizes the entire website, certifications, and links.</p>
          </div>
          <span className="current-squad-badge" style={{ borderColor: squad.color, color: squad.color }}>
            CURRENT: {squad.hero}
          </span>
        </div>

        <div className="squad-grid-selector">
          {Object.values(SQUADS_CONFIG).map((sq) => {
            const isSelected = activeSquadKey === sq.key;
            return (
              <button
                key={sq.key}
                onClick={() => onSelectSquad(sq.key)}
                className={`squad-pick-card ${isSelected ? 'active-squad-card' : ''}`}
                style={{
                  borderColor: isSelected ? sq.color : 'rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? `0 0 24px ${sq.color}35` : 'none'
                }}
              >
                <div className="squad-dot" style={{ background: sq.color }} />
                <div className="squad-card-meta">
                  <span className="squad-card-hero">{sq.hero}</span>
                  <span className="squad-card-division">{sq.division}</span>
                </div>
                {isSelected && <Check size={16} className="squad-active-check" style={{ color: sq.color }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Profile Specs & Arsenal */}
      <div className="dashboard-cards-grid">
        {/* Builder Profile Specs */}
        <div className="dashboard-card profile-specs-card">
          <div className="card-top-row">
            <span className="card-label">BUILDER PROFILE SPECS</span>
            <button onClick={onOpenProfileModal} className="card-inline-action">
              <Edit3 size={13} /> Edit
            </button>
          </div>
          <div className="specs-list">
            <div className="spec-row">
              <span className="spec-key">Full Name:</span>
              <span className="spec-val">{currentUser.fullName || <span className="text-dim">Not set yet</span>}</span>
            </div>
            <div className="spec-row">
              <span className="spec-key">Branch & Year:</span>
              <span className="spec-val">
                {currentUser.branch ? `${currentUser.branch} (${currentUser.yearOfStudy || 'Student'})` : <span className="text-dim">Not set</span>}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-key">College / Institute:</span>
              <span className="spec-val">{currentUser.college || 'Apex Institute of Technology'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-key">Registered Email:</span>
              <span className="spec-val">{currentUser.email}</span>
            </div>
            {currentUser.githubUrl && (
              <div className="spec-row">
                <span className="spec-key">GitHub:</span>
                <a href={currentUser.githubUrl} target="_blank" rel="noreferrer" className="spec-link">
                  {currentUser.githubUrl.replace('https://github.com/', '@')}
                </a>
              </div>
            )}
          </div>

          {/* Skills Badges */}
          {currentUser.skills && currentUser.skills.length > 0 && (
            <div className="member-skills-wrap">
              <span className="skills-label">ACTIVE ARSENAL</span>
              <div className="skills-tags-cluster">
                {currentUser.skills.map((skill, idx) => (
                  <span key={idx} className="skill-chip">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Member Resources */}
        <div className="dashboard-card resources-card">
          <span className="card-label">COMMUNITY RESOURCES</span>
          <div className="resources-grid-stack">
            <a href="/links" className="resource-item">
              <div className="resource-icon-box"><Sparkles size={20} /></div>
              <div>
                <span className="resource-name">Official Community Hub</span>
                <span className="resource-meta">All WhatsApp, Discord & Social Links</span>
              </div>
              <ArrowRight size={16} className="resource-arrow" />
            </a>

            <a href="/verify" className="resource-item">
              <div className="resource-icon-box"><Shield size={20} /></div>
              <div>
                <span className="resource-name">Credentials & Certifications</span>
                <span className="resource-meta">Verify hackathon awards and certificates</span>
              </div>
              <ArrowRight size={16} className="resource-arrow" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. ADMIN DASHBOARD VIEW (Core Council Command Center)
// ============================================================================
function AdminDashboardView({ currentUser, onSignOut, onSelectSquad, currentSquad }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [squadFilter, setSquadFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchRoster = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminRoster();
      setData(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load leadership roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleAction = async (action, targetUserId, options = {}) => {
    playTechClick();
    setActionLoadingId(targetUserId);
    try {
      await executeAdminAction(action, targetUserId, options);
      setToastMsg(`Successfully updated member status.`);
      setTimeout(() => setToastMsg(''), 3000);
      fetchRoster();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCsv = () => {
    if (!data || !data.profiles) return;
    playTechClick();
    const headers = ['Full Name', 'Email', 'College', 'Branch', 'Year', 'Squad', 'Role', 'Status', 'Registered At'];
    const rows = data.profiles.map(p => [
      `"${p.fullName || ''}"`,
      `"${p.email}"`,
      `"${p.college || ''}"`,
      `"${p.branch || ''}"`,
      `"${p.yearOfStudy || ''}"`,
      `"${p.targetSquad || ''}"`,
      `"${p.roleTitle || ''}"`,
      `"${p.status}"`,
      `"${p.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `letscook-roster-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProfiles = (data?.profiles || []).filter(p => {
    const matchesSearch = 
      (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.college || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSquad = squadFilter === 'all' || p.targetSquad === squadFilter || (squadFilter === 'hulk' && p.targetSquad === 'core');
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesSquad && matchesStatus;
  });

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div className="admin-welcome-block">
          <div className="admin-avatar-chip">
            <Shield size={24} />
          </div>
          <div>
            <div className="admin-eyebrow">CORE COUNCIL LEADERSHIP COMMAND</div>
            <h1 className="admin-name">{currentUser.fullName || currentUser.roleTitle} · {currentUser.roleTitle}</h1>
            <span className="admin-id-tag">Whitelisted Admin Clearance Active · {currentUser.email}</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <button onClick={handleExportCsv} className="btn-secondary export-btn">
            <FileSpreadsheet size={15} /> Export Roster (.csv)
          </button>
          <button onClick={onSignOut} className="btn-secondary sign-out-btn">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="portal-toast animate-fade-in">
          <Check size={16} /> {toastMsg}
        </div>
      )}

      {/* Telemetry Metrics Bar */}
      {data?.metrics && (
        <div className="admin-metrics-grid">
          <div className="metric-tile">
            <span className="metric-num">{data.metrics.total}</span>
            <span className="metric-title">TOTAL REGISTERED</span>
            <span className="metric-sub">{data.metrics.adminsCount} Core Heads · {data.metrics.membersCount} Members</span>
          </div>

          <div className="metric-tile approved-tile">
            <span className="metric-num text-emerald">{data.metrics.approved}</span>
            <span className="metric-title">APPROVED MEMBERS</span>
            <span className="metric-sub">Active in Squad Tracks</span>
          </div>

          <div className="metric-tile pending-tile">
            <span className="metric-num text-amber">{data.metrics.pending}</span>
            <span className="metric-title">PENDING REVIEWS</span>
            <span className="metric-sub">Awaiting evaluation</span>
          </div>

          <div className="metric-tile squad-dist-tile">
            <div className="squad-mini-breakdown">
              <div><span className="dot dot-iron" /> Tech: {data.metrics.squads.ironman || 0}</div>
              <div><span className="dot dot-cap" /> PR: {data.metrics.squads.captain || 0}</div>
              <div><span className="dot dot-thor" /> Events: {data.metrics.squads.thor || 0}</div>
              <div><span className="dot dot-hulk" /> Design: {(data.metrics.squads.hulk || data.metrics.squads.core || 0)}</div>
            </div>
            <span className="metric-title">SQUAD BREAKDOWN</span>
          </div>
        </div>
      )}

      {/* Roster Controls: Search & Filters */}
      <div className="roster-controls-bar">
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search roster by name, email, college, or skills..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            value={squadFilter} 
            onChange={e => setSquadFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Squads</option>
            <option value="ironman">Tech (Iron Man)</option>
            <option value="captain">PR (Captain America)</option>
            <option value="thor">Events (Thor)</option>
            <option value="hulk">Design (Hulk Green)</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Archived</option>
          </select>
        </div>
      </div>

      {/* Member Roster Table */}
      <div className="roster-table-card">
        {isLoading ? (
          <div className="table-loading-msg">Refreshing Core Roster...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="table-empty-msg">No profiles match your search criteria.</div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>BUILDER</th>
                  <th>COLLEGE & TRACK</th>
                  <th>ASSIGNED SQUAD</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => {
                  const pSquad = p.targetSquad === 'core' ? 'hulk' : (p.targetSquad || 'ironman');
                  const sqCfg = SQUADS_CONFIG[pSquad] || SQUADS_CONFIG.ironman;
                  const isActioning = actionLoadingId === p.id;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="builder-cell">
                          <span className="builder-name">{p.fullName || 'Anonymous Builder'}</span>
                          <span className="builder-email">{p.email}</span>
                          {p.phone && <span className="builder-phone">{p.phone}</span>}
                        </div>
                      </td>

                      <td>
                        <div className="college-cell">
                          <span className="college-name">{p.college || 'Apex Institute of Technology'}</span>
                          <span className="college-branch">{p.branch || 'Undecided'} · {p.yearOfStudy || 'Student'}</span>
                        </div>
                      </td>

                      <td>
                        <span className="squad-badge-pill" style={{ color: sqCfg.color, borderColor: sqCfg.color }}>
                          {sqCfg.hero}
                        </span>
                      </td>

                      <td>
                        <span className={`role-badge ${p.role === 'admin' ? 'role-admin' : 'role-member'}`}>
                          {p.roleTitle || p.role}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge-pill status-${p.status}`}>
                          {p.status === 'approved' ? 'Approved' : p.status === 'pending_review' ? 'Pending' : 'Archived'}
                        </span>
                      </td>

                      <td>
                        <div className="actions-cell">
                          {p.status !== 'approved' && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction('approve', p.id)}
                              className="btn-action-approve"
                              title="Approve Member"
                            >
                              Approve
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction('reject', p.id)}
                              className="btn-action-reject"
                              title="Archive Member"
                            >
                              Archive
                            </button>
                          )}
                          {/* Reassign Squad Selector */}
                          <select
                            disabled={isActioning}
                            value={pSquad}
                            onChange={(e) => handleAction('reassign_squad', p.id, { newSquad: e.target.value })}
                            className="squad-reassign-select"
                          >
                            <option value="ironman">Tech</option>
                            <option value="captain">PR</option>
                            <option value="thor">Events</option>
                            <option value="hulk">Design (Green)</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 4. PROGRESSIVE PROFILE EDIT MODAL / DRAWER
// ============================================================================
function ProfileEditModal({ currentUser, onClose, onSaved, onSelectSquad }) {
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || '',
    avatarUrl: currentUser.avatarUrl || '',
    phone: currentUser.phone || '',
    college: currentUser.college || 'Apex Institute of Technology',
    branch: currentUser.branch || '',
    yearOfStudy: currentUser.yearOfStudy || '2nd Year',
    targetSquad: currentUser.targetSquad || 'ironman',
    skills: Array.isArray(currentUser.skills) ? currentUser.skills.join(', ') : (currentUser.skills || ''),
    githubUrl: currentUser.githubUrl || '',
    linkedinUrl: currentUser.linkedinUrl || '',
    portfolioUrl: currentUser.portfolioUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Avatar image size must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 160;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      playTechClick();
      const updated = await updatePortalProfile(formData);
      playVibraniumPing();
      window.dispatchEvent(new Event('letscook_auth_change'));
      onSaved(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSquadClick = (sqKey) => {
    playTechClick();
    setFormData({ ...formData, targetSquad: sqKey });
    if (onSelectSquad) onSelectSquad(sqKey);
  };

  return (
    <div className="modal-backdrop-fixed animate-fade-in" onClick={onClose}>
      <div className="modal-dialog-card" onClick={e => e.stopPropagation()}>
        <div className="modal-top-bar">
          <div>
            <h3 className="modal-title">Complete Builder Profile</h3>
            <p className="modal-subline">Fill in your builder details so squad leaders can induct and mentor you.</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="portal-error-alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-edit-form">
          {/* Avatar Selection & Upload Section */}
          <div className="form-field avatar-customizer-field">
            <label>PROFILE PICTURE & PREDEFINED AVATARS</label>
            <div className="avatar-preview-row">
              <div 
                className="current-avatar-circle" 
                style={{ borderColor: SQUADS_CONFIG[formData.targetSquad]?.color || 'var(--accent-burgundy)' }}
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="avatar-preview-img" />
                ) : (
                  <User size={30} className="avatar-preview-placeholder" />
                )}
              </div>
              <div className="avatar-upload-cta">
                <label className="btn-upload-avatar">
                  <Camera size={15} /> Upload Custom Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCustomAvatarUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
                <span className="avatar-upload-hint">PNG, JPG, WEBP · Auto-compressed to 160x160</span>
              </div>
            </div>

            <div className="predefined-avatars-label">OR CHOOSE A PREDEFINED AVATAR</div>
            <div className="predefined-avatars-grid">
              {PREDEFINED_AVATARS.map((av) => {
                const isSelected = formData.avatarUrl === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playTechClick();
                      setFormData(prev => ({ ...prev, avatarUrl: av.url }));
                    }}
                    className={`predefined-avatar-btn ${isSelected ? 'selected-avatar' : ''}`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="predefined-avatar-img" />
                    <span className="predefined-avatar-name">{av.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-field">
            <label>FULL NAME *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label>COLLEGE / UNIVERSITY *</label>
              <input
                type="text"
                required
                placeholder="Apex Institute of Technology"
                value={formData.college}
                onChange={e => setFormData({ ...formData, college: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>BRANCH / PROGRAM *</label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech CSE, IT, BCA"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label>YEAR OF STUDY</label>
              <select
                value={formData.yearOfStudy}
                onChange={e => setFormData({ ...formData, yearOfStudy: e.target.value })}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Alumni / Core">Alumni / Core</option>
              </select>
            </div>

            <div className="form-field">
              <label>PHONE / WHATSAPP NUMBER</label>
              <input
                type="tel"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Target Squad Division Selection */}
          <div className="form-field">
            <label>SELECT TARGET SQUAD DIVISION (SWITCHES WEBSITE THEME)</label>
            <div className="squad-modal-grid">
              {Object.values(SQUADS_CONFIG).map((sq) => {
                const isSelected = formData.targetSquad === sq.key;
                return (
                  <button
                    key={sq.key}
                    type="button"
                    onClick={() => handleSquadClick(sq.key)}
                    className={`modal-squad-tile ${isSelected ? 'selected-tile' : ''}`}
                    style={{
                      borderColor: isSelected ? sq.color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: isSelected ? `0 0 16px ${sq.color}40` : 'none'
                    }}
                  >
                    <div className="squad-dot" style={{ background: sq.color }} />
                    <span className="tile-hero">{sq.hero}</span>
                    <span className="tile-div">{sq.division.split('&')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-field">
            <label>SKILLS & ARSENAL (COMMA SEPARATED)</label>
            <input
              type="text"
              placeholder="React, Node.js, Python, Figma, Tailwind, System Design"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-field">
              <label>GITHUB PROFILE URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourhandle"
                value={formData.githubUrl}
                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>LINKEDIN / PORTFOLIO URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourhandle"
                value={formData.linkedinUrl}
                onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions-bar">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary modal-save-btn">
              {isSaving ? 'SAVING PROFILE...' : 'SAVE & UPDATE PROFILE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

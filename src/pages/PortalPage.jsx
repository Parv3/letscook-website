import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  User, 
  Users, 
  LogOut, 
  ArrowRight, 
  Lock, 
  Key, 
  Sparkles, 
  ExternalLink, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Check, 
  AlertCircle,
  Copy,
  RefreshCw,
  Rocket
} from 'lucide-react';
import { 
  getStoredToken, 
  getStoredUser, 
  sendPortalOtp, 
  registerPortalUser, 
  loginPortalUser, 
  getPortalMe, 
  getAdminRoster, 
  executeAdminAction, 
  clearSession 
} from '../services/portalService';
import { playTechClick, playVibraniumPing, playAssembleFanfare } from '../utils/soundEngine';

export default function PortalPage({ setCurrentPage }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Active Tab for Unauthenticated View ('register' | 'login')
  const [authTab, setAuthTab] = useState('register');

  // Verify Session on mount
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      if (!token) {
        setIsLoadingUser(false);
        return;
      }
      try {
        const user = await getPortalMe();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoadingUser(false);
      }
    }
    verifyAuth();
    return () => { isMounted = false; };
  }, [token]);

  const handleSignOut = () => {
    playTechClick();
    clearSession();
    setCurrentUser(null);
    setToken(null);
  };

  if (isLoadingUser) {
    return (
      <div className="portal-loading-screen">
        <div className="portal-spinner" />
        <p>Connecting to Let's Cook Security Gateway...</p>
      </div>
    );
  }

  return (
    <div className="portal-container animate-fade-in">
      {!currentUser ? (
        <PortalAuthView 
          authTab={authTab} 
          setAuthTab={setAuthTab} 
          onAuthenticated={(user, token) => {
            setCurrentUser(user);
            setToken(token);
          }} 
        />
      ) : currentUser.role === 'admin' ? (
        <AdminDashboardView 
          currentUser={currentUser} 
          onSignOut={handleSignOut} 
        />
      ) : (
        <MemberDashboardView 
          currentUser={currentUser} 
          onSignOut={handleSignOut} 
          onRefreshUser={async () => {
            const refreshed = await getPortalMe();
            if (refreshed) setCurrentUser(refreshed);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// 1. AUTHENTICATION VIEW (Register Member vs Sign In)
// ============================================================================
function PortalAuthView({ authTab, setAuthTab, onAuthenticated }) {
  // Register Form State
  const [regForm, setRegForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: 'GLA University',
    branch: '',
    yearOfStudy: '2nd Year',
    targetSquad: 'ironman',
    skills: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    corePasskey: ''
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasskey, setLoginPasskey] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDevHint, setOtpDevHint] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCorePasskeyInput, setShowCorePasskeyInput] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  const handleSendOtp = async (targetEmail) => {
    setErrorMsg('');
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address first.');
      return;
    }
    setIsSendingOtp(true);
    try {
      playTechClick();
      const res = await sendPortalOtp(targetEmail);
      setOtpToken(res.otpToken);
      setOtpSent(true);
      setOtpCountdown(60);
      if (res.devOtp) {
        setOtpDevHint(res.devOtp);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch passkey. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpSent || !otpCode) {
      setErrorMsg('Please request and enter your 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      playTechClick();
      const result = await registerPortalUser({
        ...regForm,
        otp: otpCode,
        otpToken
      });
      playAssembleFanfare();
      onAuthenticated(result.user, result.token);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpSent || !otpCode) {
      setErrorMsg('Please request and enter your 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      playTechClick();
      const result = await loginPortalUser({
        email: loginEmail,
        otp: otpCode,
        otpToken,
        corePasskey: loginPasskey
      });
      playVibraniumPing();
      onAuthenticated(result.user, result.token);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="portal-auth-wrapper">
      <div className="portal-auth-card">
        {/* Header Badge */}
        <div className="portal-header-badge">
          <Shield size={14} className="badge-shield-icon" />
          <span>LET'S COOK ACCESS GATEWAY</span>
        </div>

        <h1 className="portal-title">COMMUNITY PORTAL</h1>
        <p className="portal-subtitle">
          Secure registration and role-based access for student builders and core council leadership.
        </p>

        {/* Tab Toggle */}
        <div className="portal-tabs-selector">
          <button
            type="button"
            className={`portal-tab ${authTab === 'register' ? 'active-tab' : ''}`}
            onClick={() => {
              playTechClick();
              setAuthTab('register');
              setErrorMsg('');
              setOtpSent(false);
              setOtpCode('');
            }}
          >
            JOIN AS MEMBER
          </button>
          <button
            type="button"
            className={`portal-tab ${authTab === 'login' ? 'active-tab' : ''}`}
            onClick={() => {
              playTechClick();
              setAuthTab('login');
              setErrorMsg('');
              setOtpSent(false);
              setOtpCode('');
            }}
          >
            SIGN IN
          </button>
        </div>

        {errorMsg && (
          <div className="portal-alert portal-alert-error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* REGISTRATION FORM */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="portal-form">
            <div className="form-grid-2">
              <div className="form-field">
                <label>FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parv Mishra"
                  value={regForm.fullName}
                  onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>COLLEGE / UNIVERSITY *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GLA University"
                  value={regForm.college}
                  onChange={e => setRegForm({ ...regForm, college: e.target.value })}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>BRANCH / DEPARTMENT *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science (CSE)"
                  value={regForm.branch}
                  onChange={e => setRegForm({ ...regForm, branch: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>YEAR OF STUDY *</label>
                <select
                  value={regForm.yearOfStudy}
                  onChange={e => setRegForm({ ...regForm, yearOfStudy: e.target.value })}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Alumni / Graduated">Alumni / Graduated</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>STUDENT EMAIL *</label>
                <div className="input-with-action">
                  <input
                    type="email"
                    required
                    placeholder="student@gla.ac.in"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  />
                  <button
                    type="button"
                    disabled={isSendingOtp || otpCountdown > 0}
                    onClick={() => handleSendOtp(regForm.email)}
                    className="btn-input-action"
                  >
                    {isSendingOtp ? 'SENDING...' : otpCountdown > 0 ? `${otpCountdown}s` : 'SEND CODE'}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>WHATSAPP / PHONE</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={regForm.phone}
                  onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Target Squad Selection */}
            <div className="form-field">
              <label>SQUAD DIVISION PREFERENCE</label>
              <div className="squad-selection-grid">
                {[
                  { key: 'ironman', name: 'TECH TEAM', hero: 'Iron Man · Systems & AI', color: '#ff0055' },
                  { key: 'captain', name: 'PR TEAM', hero: 'Captain America · Outreach', color: '#0055ff' },
                  { key: 'thor', name: 'EVENTS TEAM', hero: 'Thor · Sprints & Hackathons', color: '#d97706' },
                  { key: 'core', name: 'CORE OPERATIONS', hero: 'Foundry · Governance', color: '#8b002e' }
                ].map(sq => (
                  <button
                    key={sq.key}
                    type="button"
                    className={`squad-radio-btn ${regForm.targetSquad === sq.key ? 'selected-squad' : ''}`}
                    onClick={() => { playTechClick(); setRegForm({ ...regForm, targetSquad: sq.key }); }}
                  >
                    <div className="squad-indicator-dot" style={{ background: sq.color }} />
                    <div className="squad-text-block">
                      <span className="squad-name">{sq.name}</span>
                      <span className="squad-hero">{sq.hero}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label>SKILLS & ARSENAL (COMMA SEPARATED)</label>
              <input
                type="text"
                placeholder="React, TypeScript, Python, Figma, Docker, UI/UX"
                value={regForm.skills}
                onChange={e => setRegForm({ ...regForm, skills: e.target.value })}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label>GITHUB PROFILE URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/yourhandle"
                  value={regForm.githubUrl}
                  onChange={e => setRegForm({ ...regForm, githubUrl: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>LINKEDIN OR PORTFOLIO URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourhandle"
                  value={regForm.linkedinUrl}
                  onChange={e => setRegForm({ ...regForm, linkedinUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Core Leadership Passkey Accordion */}
            <div className="core-passkey-toggle-box">
              <button
                type="button"
                className="core-toggle-link"
                onClick={() => setShowCorePasskeyInput(!showCorePasskeyInput)}
              >
                <Key size={14} />
                <span>{showCorePasskeyInput ? 'Hide Core Leadership Passkey' : 'Are you a Core Council Head? Enter Passkey'}</span>
              </button>
              {showCorePasskeyInput && (
                <div className="form-field animate-fade-in" style={{ marginTop: '10px' }}>
                  <input
                    type="password"
                    placeholder="Enter Core Council Passkey"
                    value={regForm.corePasskey}
                    onChange={e => setRegForm({ ...regForm, corePasskey: e.target.value })}
                  />
                  <span className="field-hint">Grants Admin status for President, Founder, VP, Sec, & Core Heads.</span>
                </div>
              )}
            </div>

            {/* OTP Section */}
            {otpSent && (
              <div className="otp-verification-section animate-fade-in">
                <div className="form-field">
                  <label>ENTER 6-DIGIT VERIFICATION PASSKEY *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="otp-code-input"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  {otpDevHint && (
                    <div className="dev-otp-pill">
                      <span>Dev Passkey: <strong>{otpDevHint}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full portal-submit-btn"
            >
              {isSubmitting ? 'PROCESSING APPLICATION...' : 'SUBMIT REGISTRATION'}
            </button>
          </form>
        )}

        {/* SIGN IN FORM */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="portal-form">
            <div className="form-field">
              <label>REGISTERED EMAIL *</label>
              <div className="input-with-action">
                <input
                  type="email"
                  required
                  placeholder="student@gla.ac.in"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isSendingOtp || otpCountdown > 0}
                  onClick={() => handleSendOtp(loginEmail)}
                  className="btn-input-action"
                >
                  {isSendingOtp ? 'SENDING...' : otpCountdown > 0 ? `${otpCountdown}s` : 'SEND CODE'}
                </button>
              </div>
            </div>

            {/* Core Leadership Passkey Accordion */}
            <div className="core-passkey-toggle-box">
              <button
                type="button"
                className="core-toggle-link"
                onClick={() => setShowCorePasskeyInput(!showCorePasskeyInput)}
              >
                <Key size={14} />
                <span>{showCorePasskeyInput ? 'Hide Core Passkey' : 'Core Head Sign In? Enter Passkey'}</span>
              </button>
              {showCorePasskeyInput && (
                <div className="form-field animate-fade-in" style={{ marginTop: '10px' }}>
                  <input
                    type="password"
                    placeholder="Enter Core Council Passkey"
                    value={loginPasskey}
                    onChange={e => setLoginPasskey(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* OTP Section */}
            {otpSent && (
              <div className="otp-verification-section animate-fade-in">
                <div className="form-field">
                  <label>ENTER 6-DIGIT VERIFICATION PASSKEY *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="otp-code-input"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  {otpDevHint && (
                    <div className="dev-otp-pill">
                      <span>Dev Passkey: <strong>{otpDevHint}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full portal-submit-btn"
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN TO PORTAL'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. MEMBER DASHBOARD VIEW (Isolated Account Space)
// ============================================================================
function MemberDashboardView({ currentUser, onSignOut, onRefreshUser }) {
  const [copiedLink, setCopiedLink] = useState(false);

  const squadMeta = {
    ironman: { name: 'STARK TECH LABS', color: '#ff0055', desc: 'Software, WASM, Rust & Applied AI Systems' },
    captain: { name: 'VIBRANIUM ALLIANCE', color: '#0055ff', desc: 'Outreach, PR & Developer Diplomacy' },
    thor: { name: 'STORMBREAKER OPS', color: '#d97706', desc: 'Hackathons, Sprints & Code Tournaments' },
    core: { name: 'FOUNDRY COMMAND', color: '#8b002e', desc: 'Operations & Treasury Micro-Grants' }
  }[currentUser.targetSquad] || { name: 'STARK TECH LABS', color: '#ff0055', desc: 'Full-Stack Software' };

  const isApproved = currentUser.status === 'approved';
  const isPending = currentUser.status === 'pending_review';

  return (
    <div className="member-dashboard-wrapper">
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div className="member-welcome-block">
          <div className="member-avatar-chip">
            <User size={20} />
          </div>
          <div>
            <div className="member-eyebrow">COMMUNITY MEMBER PORTAL</div>
            <h1 className="member-name">{currentUser.fullName}</h1>
            <span className="member-id-tag">{currentUser.email} · {currentUser.college}</span>
          </div>
        </div>

        <button onClick={onSignOut} className="btn-secondary sign-out-btn">
          <LogOut size={16} /> Sign Out
        </button>
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
                ? 'Your registration has been approved by the Core Council. You have full access to internal repos and sprints.'
                : isPending
                  ? 'Your student builder application is currently being evaluated by the Core Leadership Council.'
                  : 'Your application has been concluded for this sprint cohort. Reach out during the next open hackathon.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Squad Assignment & Builder Profile */}
      <div className="dashboard-cards-grid">
        {/* Squad Card */}
        <div className="dashboard-card squad-focus-card">
          <div className="card-top-row">
            <span className="card-label">ASSIGNED SQUAD DIVISION</span>
            <span className="squad-tag-pill" style={{ borderColor: squadMeta.color, color: squadMeta.color }}>
              ◈ {currentUser.targetSquad.toUpperCase()}
            </span>
          </div>
          <h2 className="squad-headline" style={{ color: squadMeta.color }}>{squadMeta.name}</h2>
          <p className="squad-subtext">{squadMeta.desc}</p>

          <div className="squad-actions-row">
            <a 
              href="https://chat.whatsapp.com/invite" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary squad-btn"
              style={{ background: squadMeta.color }}
            >
              JOIN SQUAD CHANNEL <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Builder Profile Specs */}
        <div className="dashboard-card profile-specs-card">
          <span className="card-label">BUILDER PROFILE SPECS</span>
          <div className="specs-list">
            <div className="spec-row">
              <span className="spec-key">Branch & Year:</span>
              <span className="spec-val">{currentUser.branch} ({currentUser.yearOfStudy})</span>
            </div>
            <div className="spec-row">
              <span className="spec-key">Registered Email:</span>
              <span className="spec-val">{currentUser.email}</span>
            </div>
            {currentUser.phone && (
              <div className="spec-row">
                <span className="spec-key">Contact Phone:</span>
                <span className="spec-val">{currentUser.phone}</span>
              </div>
            )}
            <div className="spec-row">
              <span className="spec-key">Member Role:</span>
              <span className="spec-val highlight-val">{currentUser.roleTitle}</span>
            </div>
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
      </div>

      {/* Member Resources & Official Sprints */}
      <div className="dashboard-card resources-card">
        <h3 className="resources-title">MEMBER-EXCLUSIVE RESOURCES</h3>
        <p className="resources-desc">Access official internal repositories, weekly peer reviews, and workshop materials.</p>
        
        <div className="resources-grid">
          <a href="/links" className="resource-item">
            <div className="resource-icon-box"><Sparkles size={20} /></div>
            <div>
              <span className="resource-name">Official Community Hub</span>
              <span className="resource-meta">All Discord, WhatsApp & Social Links</span>
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
  );
}

// ============================================================================
// 3. ADMIN DASHBOARD VIEW (Core Leadership Command Center)
// ============================================================================
function AdminDashboardView({ currentUser, onSignOut }) {
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

  // CSV Export Generator
  const handleExportCsv = () => {
    if (!data || !data.profiles) return;
    playTechClick();
    const headers = ['Full Name', 'Email', 'College', 'Branch', 'Year', 'Squad', 'Role', 'Status', 'Registered At'];
    const rows = data.profiles.map(p => [
      `"${p.fullName}"`,
      `"${p.email}"`,
      `"${p.college}"`,
      `"${p.branch}"`,
      `"${p.yearOfStudy}"`,
      `"${p.targetSquad}"`,
      `"${p.roleTitle}"`,
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
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSquad = squadFilter === 'all' || p.targetSquad === squadFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesSquad && matchesStatus;
  });

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top Header */}
      <div className="dashboard-header-bar">
        <div className="admin-welcome-block">
          <div className="admin-avatar-chip">
            <Shield size={22} />
          </div>
          <div>
            <div className="admin-eyebrow">CORE COUNCIL LEADERSHIP COMMAND</div>
            <h1 className="admin-name">{currentUser.fullName} · {currentUser.roleTitle}</h1>
            <span className="admin-id-tag">Admin Clearance Active · {currentUser.email}</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <button onClick={handleExportCsv} className="btn-secondary export-btn">
            <FileSpreadsheet size={16} /> Export Roster (.csv)
          </button>
          <button onClick={onSignOut} className="btn-secondary sign-out-btn">
            <LogOut size={16} /> Sign Out
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
            <span className="metric-sub">Active across squad tracks</span>
          </div>

          <div className="metric-tile pending-tile">
            <span className="metric-num text-amber">{data.metrics.pending}</span>
            <span className="metric-title">PENDING REVIEWS</span>
            <span className="metric-sub">Requires Core evaluation</span>
          </div>

          <div className="metric-tile squad-dist-tile">
            <div className="squad-mini-breakdown">
              <div><span className="dot dot-iron" /> Tech: {data.metrics.squads.ironman}</div>
              <div><span className="dot dot-cap" /> PR: {data.metrics.squads.captain}</div>
              <div><span className="dot dot-thor" /> Events: {data.metrics.squads.thor}</div>
              <div><span className="dot dot-core" /> Core: {data.metrics.squads.core}</div>
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
            placeholder="Search by name, email, college, or skills..."
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
            <option value="ironman">Stark Tech Labs</option>
            <option value="captain">Vibranium Alliance</option>
            <option value="thor">Stormbreaker Ops</option>
            <option value="core">Core Command</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button onClick={fetchRoster} className="icon-btn refresh-btn" title="Refresh Roster">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Applicant Table */}
      <div className="admin-roster-card">
        {isLoading ? (
          <div className="table-loading-box">Loading member roster...</div>
        ) : filteredProfiles.length === 0 ? (
          <div className="table-empty-box">No applicants match your search criteria.</div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>APPLICANT</th>
                  <th>COLLEGE & BRANCH</th>
                  <th>SQUAD</th>
                  <th>ROLE & STATUS</th>
                  <th>SKILLS / ARSENAL</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => {
                  const isBusy = actionLoadingId === p.id;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="applicant-cell">
                          <span className="applicant-name">{p.fullName}</span>
                          <span className="applicant-email">{p.email}</span>
                          {p.phone && <span className="applicant-phone">{p.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="college-cell">
                          <span className="college-name">{p.college}</span>
                          <span className="branch-name">{p.branch} ({p.yearOfStudy})</span>
                        </div>
                      </td>
                      <td>
                        <span className={`squad-badge squad-${p.targetSquad}`}>
                          {p.targetSquad.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="status-cell">
                          <span className={`status-pill pill-${p.status}`}>
                            {p.status === 'approved' ? 'Approved' : p.status === 'pending_review' ? 'Pending' : 'Rejected'}
                          </span>
                          <span className="role-caption">{p.roleTitle}</span>
                        </div>
                      </td>
                      <td>
                        <div className="skills-inline-list">
                          {(p.skills || []).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="skill-mini-tag">{s}</span>
                          ))}
                          {(p.skills || []).length > 3 && (
                            <span className="skill-mini-tag">+{p.skills.length - 3}</span>
                          )}
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="external-link-icon" title="GitHub">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="actions-cluster">
                          {p.status !== 'approved' && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleAction('approve', p.id)}
                              className="btn-action-approve"
                              title="Approve Member"
                            >
                              Approve
                            </button>
                          )}
                          {p.status !== 'rejected' && (
                            <button
                              disabled={isBusy}
                              onClick={() => handleAction('reject', p.id)}
                              className="btn-action-reject"
                              title="Reject / Archive Application"
                            >
                              Reject
                            </button>
                          )}
                          <select
                            disabled={isBusy}
                            value={p.targetSquad}
                            onChange={(e) => handleAction('reassign_squad', p.id, { newSquad: e.target.value })}
                            className="squad-reassign-dropdown"
                            title="Reassign Squad Division"
                          >
                            <option value="ironman">Iron Man</option>
                            <option value="captain">Captain America</option>
                            <option value="thor">Thor</option>
                            <option value="core">Core</option>
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

      {/* Audit Trail Section */}
      {data?.auditLogs && data.auditLogs.length > 0 && (
        <div className="admin-audit-section">
          <h4 className="audit-section-title">SECURITY & GOVERNANCE AUDIT TRAIL</h4>
          <div className="audit-logs-list">
            {data.auditLogs.slice(0, 10).map((log, i) => (
              <div key={log.id || i} className="audit-log-row">
                <span className="audit-time">{new Date(log.createdAt).toLocaleTimeString()}</span>
                <span className="audit-actor">{log.actorRole} ({log.actorEmail})</span>
                <span className="audit-action">{log.action}</span>
                <span className="audit-details">{JSON.stringify(log.details)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

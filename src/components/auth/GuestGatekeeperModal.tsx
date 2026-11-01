import React, { useState, useEffect } from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Info, 
  UserPlus, 
  LogIn, 
  CheckCircle2,
  KeyRound,
  Terminal,
  Database,
  Trash2,
  Unlock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  isAdminAuthenticated, 
  isMasterPasswordConfigured, 
  verifyMasterPassword, 
  setMasterPassword, 
  setAdminAuthenticated 
} from '../../services/adminAuthService';

interface GuestGatekeeperModalProps {
  onBypassDev?: () => void;
}

export const GuestGatekeeperModal: React.FC<GuestGatekeeperModalProps> = ({ onBypassDev }) => {
  const { 
    session, 
    loading, 
    error, 
    isConfigured, 
    loginWithGuestCredentials, 
    signUpWithGuestCredentials 
  } = useGuestAuth();

  // Primary visible modes: 'signin' | 'signup'
  // Hidden backdoor mode: 'admin' (only accessible via ?admin=true or Ctrl+Shift+A)
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'admin'>('signin');
  const [isAdminModeActive, setIsAdminModeActive] = useState(false);

  // Guest credential fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin backdoor fields
  const [adminPassphrase, setAdminPassphrase] = useState('');
  const [showAdminPassphrase, setShowAdminPassphrase] = useState(false);
  const [isPassphraseVerified, setIsPassphraseVerified] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Detect ?admin=true in URL
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('admin') === 'true') {
        setIsAdminModeActive(true);
        setAuthMode('admin');
      }
    } catch {
      // In non-browser environments, safely ignore
    }
  }, []);

  // 2. Detect Ctrl + Shift + A backdoor keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModeActive((prev) => {
          const next = !prev;
          if (next) {
            setAuthMode('admin');
            setLocalError(null);
            setSuccessMsg('Master Admin backdoor activated via shortcut (Ctrl+Shift+A).');
          } else {
            setAuthMode('signin');
            setLocalError(null);
            setSuccessMsg(null);
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If already authenticated via Supabase session, admin session, or loading, do not render modal
  if (loading || session || isAdminAuthenticated()) {
    return null;
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    if (authMode === 'signup') {
      if (cleanPassword.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setLocalError('Passwords do not match. Please re-enter.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await signUpWithGuestCredentials(cleanEmail, cleanPassword);
        if (res.success) {
          if (res.needsConfirmation) {
            setSuccessMsg(res.message || 'Account created! Please check your email to confirm or sign in directly.');
          } else {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            } catch {}
          }
        } else if (res.error) {
          setLocalError(res.error);
        }
      } catch (err: any) {
        setLocalError(err?.message || 'Failed to create account. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Sign in mode
      setSubmitting(true);
      try {
        const res = await loginWithGuestCredentials(cleanEmail, cleanPassword);
        if (res.success) {
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch {}
        } else if (res.error) {
          setLocalError(res.error);
        }
      } catch (err: any) {
        setLocalError(err?.message || 'Authentication error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    const cleanPass = adminPassphrase.trim();
    if (!cleanPass) {
      setLocalError('Please enter the master admin passphrase.');
      return;
    }

    setSubmitting(true);
    try {
      const isConfiguredAlready = isMasterPasswordConfigured();
      if (isConfiguredAlready) {
        const isValid = await verifyMasterPassword(cleanPass);
        if (isValid) {
          setIsPassphraseVerified(true);
          setAdminAuthenticated(true);
          setSuccessMsg('Master Admin passphrase verified! Workstation & debug presets unlocked.');
          try {
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          } catch {}
        } else {
          setLocalError('Incorrect master admin passphrase. Access denied.');
        }
      } else {
        // Initial setup for admin passcode
        if (cleanPass.length < 4) {
          setLocalError('Admin passphrase must be at least 4 characters.');
          return;
        }
        await setMasterPassword(cleanPass);
        setIsPassphraseVerified(true);
        setAdminAuthenticated(true);
        setSuccessMsg('Master Admin passphrase initialized & verified! Debug presets enabled.');
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } catch {
      setLocalError('Failed to verify admin passphrase. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBypassWorkstation = () => {
    if (!isPassphraseVerified) {
      setLocalError('Admin passphrase required before enabling debug presets.');
      return;
    }
    setAdminAuthenticated(true);
    if (onBypassDev) {
      onBypassDev();
    }
  };

  const handleResetStorage = () => {
    if (!isPassphraseVerified) {
      setLocalError('Admin passphrase required before executing debug resets.');
      return;
    }
    try {
      const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('resumebuddy_'));
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setSuccessMsg(`Cleared ${keysToRemove.length} local resume cache keys.`);
    } catch {
      setLocalError('Failed to clear local storage.');
    }
  };

  const displayedError = localError || error;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans"
    >
      {/* Ambient background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Gatekeeper Card */}
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/10 mb-3.5">
            {authMode === 'admin' ? <Lock className="w-7 h-7 text-amber-300" /> : <ShieldCheck className="w-7 h-7" />}
          </div>

          <h1
            id="guest-modal-title"
            className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1"
          >
            ResumeBuddy Private Workstation
          </h1>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-semibold tracking-wide uppercase text-blue-400 mt-0.5 mb-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{authMode === 'admin' ? 'Master Admin Backdoor' : 'Authorized Guest Access'}</span>
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {authMode === 'admin'
              ? 'Backdoor session active. Enter master admin passphrase to unlock workstation and debug presets.'
              : authMode === 'signup'
              ? 'Create your free account to access the private ATS workstation.'
              : 'Please sign in using your designated guest tester credentials.'}
          </p>
        </div>

        {/* Backdoor Status Pill (Only visible when backdoor is triggered via ?admin=true or Ctrl+Shift+A) */}
        {isAdminModeActive && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-300">
            <span className="flex items-center gap-1.5 font-semibold">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Backdoor Active</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              Press Ctrl+Shift+A to hide
            </span>
          </div>
        )}

        {/* Segmented Auth Mode Switcher */}
        {/* Normal visitors ONLY see: [ Sign In ] and [ Create Free Account ] */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setLocalError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setLocalError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Free Account</span>
          </button>

          {/* Hidden Master Admin Tab: ONLY rendered when backdoor is actively unlocked */}
          {isAdminModeActive && (
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setLocalError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                authMode === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Master Admin</span>
            </button>
          )}
        </div>

        {/* Missing Supabase Configuration Notice (Non-blocking fallback for dev) */}
        {!isConfigured && authMode !== 'admin' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="font-semibold block text-amber-300">
                  Supabase Environment Pending
                </strong>
                Set <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</code> in environment secrets.
              </div>
            </div>
            {onBypassDev && (
              <button
                type="button"
                onClick={onBypassDev}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[11px] font-semibold transition cursor-pointer"
              >
                Bypass Gatekeeper (Dev Mode)
              </button>
            )}
          </div>
        )}

        {/* Success / Confirmation Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/70 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* Inline Error Alert */}
        {displayedError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block">Access Denied</span>
              <span>{displayedError}</span>
            </div>
          </div>
        )}

        {/* View 1 & 2: Guest Sign In / Sign Up Form */}
        {authMode !== 'admin' ? (
          <form onSubmit={handleGuestSubmit} className="space-y-3.5">
            <div>
              <label
                htmlFor="guest-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="guest-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. colleague@company.com"
                required
                autoFocus
                autoComplete="username"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="guest-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                {authMode === 'signup' ? 'Password (min 6 characters)' : 'Access Key / Password'}
              </label>
              <div className="relative">
                <input
                  id="guest-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'signup' ? 'Create a secure password...' : 'Enter guest access key...'}
                  required
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label
                  htmlFor="guest-confirm-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="guest-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to confirm..."
                  required
                  autoComplete="new-password"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                />
              </div>
            )}

            {/* Primary CTA Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{authMode === 'signup' ? 'Creating Account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'signup' ? 'Create Account & Start Building' : 'Enter Workstation'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* View 3: Master Admin Backdoor with Passphrase & Debug Presets */
          <div className="space-y-4">
            <form onSubmit={handleAdminAuthSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-passphrase"
                    className="block text-[11px] font-bold uppercase tracking-wider text-amber-300"
                  >
                    Master Admin Passphrase
                  </label>
                  {isPassphraseVerified && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="admin-passphrase"
                    type={showAdminPassphrase ? 'text' : 'password'}
                    value={adminPassphrase}
                    onChange={(e) => setAdminPassphrase(e.target.value)}
                    placeholder="Enter master admin passphrase..."
                    required
                    autoFocus
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 pr-10 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassphrase(!showAdminPassphrase)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    aria-label={showAdminPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                  >
                    {showAdminPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 active:scale-[0.99] transition shadow-lg shadow-amber-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Passphrase...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Verify Passphrase & Unlock</span>
                  </>
                )}
              </button>
            </form>

            {/* Debug Presets: Locked until passphrase is validly entered */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Debug Presets</span>
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isPassphraseVerified
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isPassphraseVerified ? 'Unlocked' : 'Requires Passphrase'}
                </span>
              </div>

              {!isPassphraseVerified ? (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Debug presets are protected. Enter the master passphrase above to enable workstation bypass and dev tools.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 opacity-40 pointer-events-none">
                    <button className="py-1.5 px-2.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400 border border-slate-700">
                      Bypass Gatekeeper
                    </button>
                    <button className="py-1.5 px-2.5 rounded-lg bg-slate-800 text-[11px] font-semibold text-slate-400 border border-slate-700">
                      Reset Local Storage
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleBypassWorkstation}
                      className="py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bypass to Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetStorage}
                      className="py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Reset Storage</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdminAuthenticated(true)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enter Workstation (Admin Mode)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtle Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400/90 leading-relaxed">
            Temporary access session. All resume data is processed 100% client-side in your local browser.
          </p>
        </div>
      </div>
    </div>
  );
};
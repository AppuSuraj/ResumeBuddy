import React, { useState, useEffect } from 'react';
import {
  isMasterPasswordConfigured,
  setMasterPassword,
  verifyMasterPassword,
  isAdminAuthenticated,
  setAdminAuthenticated,
  onAdminAuthChange,
} from '../../services/adminAuthService';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { useToast } from '../common/Toast';
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  children: React.ReactNode;
}

export const AdminGatekeeper: React.FC<Props> = ({ children }) => {
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(false);
  const [isAdminConfigured, setIsAdminConfigured] = useState<boolean>(true);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);

  // Guest Supabase Auth hook
  const {
    session,
    loading: guestLoading,
    error: guestHookError,
    isConfigured: isSupabaseReady,
    loginWithGuestCredentials,
    signUpWithGuestCredentials,
  } = useGuestAuth();

  // Active gatekeeper view
  const [activeTab, setActiveTab] = useState<'guest' | 'admin'>('guest');
  const [guestAuthMode, setGuestAuthMode] = useState<'signin' | 'signup'>('signin');

  // Admin form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [adminErrorMsg, setAdminErrorMsg] = useState('');

  // Guest form states
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('');
  const [showGuestPassword, setShowGuestPassword] = useState(false);
  const [submittingGuest, setSubmittingGuest] = useState(false);
  const [guestErrorMsg, setGuestErrorMsg] = useState<string | null>(null);
  const [guestSuccessMsg, setGuestSuccessMsg] = useState<string | null>(null);

  const toast = useToast();

  useEffect(() => {
    const configured = isMasterPasswordConfigured();
    const authed = isAdminAuthenticated();
    setIsAdminConfigured(configured);
    setIsAdminAuthed(authed);
    setAdminLoading(false);

    const unsubscribe = onAdminAuthChange((authedState) => {
      setIsAdminAuthed(authedState);
      setIsAdminConfigured(isMasterPasswordConfigured());
      if (!authedState) {
        setPassword('');
        setAdminErrorMsg('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrorMsg('');

    if (password.length < 4) {
      setAdminErrorMsg('Master password must be at least 4 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAdminErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmittingAdmin(true);
    try {
      await setMasterPassword(password);
      setAdminAuthenticated(rememberMe);
      setIsAdminConfigured(true);
      setIsAdminAuthed(true);
      toast.success('Admin Passcode Initialized', 'Welcome Admin! Master credentials configured.');
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } catch {
      setAdminErrorMsg('Failed to initialize admin credentials. Please try again.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrorMsg('');

    if (!password.trim()) {
      setAdminErrorMsg('Please enter your admin master passcode.');
      return;
    }

    setSubmittingAdmin(true);
    try {
      const isValid = await verifyMasterPassword(password);
      if (isValid) {
        setAdminAuthenticated(rememberMe);
        setIsAdminAuthed(true);
        toast.success('Admin Access Granted', 'Unlocked ResumeBuddy private workspace.');
        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.5 } });
        } catch {}
      } else {
        setAdminErrorMsg('Incorrect master passcode. Access denied.');
        toast.error('Authentication Failed', 'Invalid admin password.');
      }
    } catch {
      setAdminErrorMsg('Authentication error. Please try again.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestErrorMsg(null);
    setGuestSuccessMsg(null);

    const cleanEmail = guestEmail.trim();
    const cleanPassword = guestPassword.trim();

    if (!cleanEmail || !cleanPassword) {
      setGuestErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (guestAuthMode === 'signup') {
      if (cleanPassword.length < 6) {
        setGuestErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (cleanPassword !== guestConfirmPassword.trim()) {
        setGuestErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setSubmittingGuest(true);
      try {
        const res = await signUpWithGuestCredentials(cleanEmail, cleanPassword);
        if (res.success) {
          if (res.needsConfirmation) {
            setGuestSuccessMsg(res.message || 'Account created! Please check your email to confirm or sign in directly.');
          } else {
            toast.success('Account Created', 'Welcome to ResumeBuddy Private Workstation.');
            try {
              confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
            } catch {}
          }
        } else if (res.error) {
          setGuestErrorMsg(res.error);
        }
      } catch (err: any) {
        setGuestErrorMsg(err?.message || 'Registration error. Please try again.');
      } finally {
        setSubmittingGuest(false);
      }
    } else {
      setSubmittingGuest(true);
      try {
        const res = await loginWithGuestCredentials(cleanEmail, cleanPassword);
        if (res.success) {
          toast.success('Guest Access Verified', 'Welcome to ResumeBuddy Private Workstation.');
          try {
            confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
          } catch {}
        } else if (res.error) {
          setGuestErrorMsg(res.error);
        }
      } catch (err: any) {
        setGuestErrorMsg(err?.message || 'Authentication error. Please try again.');
      } finally {
        setSubmittingGuest(false);
      }
    }
  };

  if (adminLoading || guestLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated via Admin Master Passcode or Supabase Guest Session, display main application
  if (isAdminAuthed || Boolean(session)) {
    return <>{children}</>;
  }

  const displayedGuestError = guestErrorMsg || guestHookError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10 mb-3">
            {activeTab === 'guest' ? <ShieldCheck className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>ResumeBuddy</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
              {activeTab === 'guest' ? 'Guest Access' : 'Admin'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            {activeTab === 'guest'
              ? 'Please sign in using your designated guest tester credentials.'
              : isAdminConfigured
              ? 'Enter your master admin passcode to access ResumeBuddy.'
              : 'Initial Admin Setup: Create your master passcode to protect this workspace on GitHub.'}
          </p>
        </div>

        {/* Access Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('guest');
              setAdminErrorMsg('');
              setGuestErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guest Tester</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminErrorMsg('');
              setGuestErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Master Admin</span>
          </button>
        </div>

        {/* TAB 1: GUEST TESTER AUTHENTICATION (SUPABASE) */}
        {activeTab === 'guest' && (
          <div className="space-y-4">
            {!isSupabaseReady && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <strong className="block text-amber-300">Supabase Config Pending</strong>
                  Set <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_URL</code> and{' '}
                  <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</code> in environment secrets.
                </div>
              </div>
            )}

            {/* Guest Sub-mode: Sign In vs Sign Up */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setGuestAuthMode('signin');
                  setGuestErrorMsg(null);
                  setGuestSuccessMsg(null);
                }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                  guestAuthMode === 'signin'
                    ? 'bg-blue-600/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setGuestAuthMode('signup');
                  setGuestErrorMsg(null);
                  setGuestSuccessMsg(null);
                }}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                  guestAuthMode === 'signup'
                    ? 'bg-blue-600/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Free Account
              </button>
            </div>

            {guestSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/70 text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
                <span>{guestSuccessMsg}</span>
              </div>
            )}

            {displayedGuestError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{displayedGuestError}</span>
              </div>
            )}

            <form onSubmit={handleGuestSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. colleague@company.com"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  {guestAuthMode === 'signup' ? 'Password (min 6 characters)' : 'Access Key / Password'}
                </label>
                <div className="relative">
                  <input
                    type={showGuestPassword ? 'text' : 'password'}
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    placeholder={guestAuthMode === 'signup' ? 'Create a secure password...' : 'Enter guest access key...'}
                    required
                    autoComplete={guestAuthMode === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 pr-10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGuestPassword(!showGuestPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                  >
                    {showGuestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {guestAuthMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showGuestPassword ? 'text' : 'password'}
                    value={guestConfirmPassword}
                    onChange={(e) => setGuestConfirmPassword(e.target.value)}
                    placeholder="Re-enter password to confirm..."
                    required
                    autoComplete="new-password"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submittingGuest}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submittingGuest ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{guestAuthMode === 'signup' ? 'Creating Account...' : 'Verifying Credentials...'}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {guestAuthMode === 'signup' ? 'Create Account & Start Building' : 'Enter Workstation'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MASTER ADMIN AUTHENTICATION */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            {adminErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/70 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                <span className="font-bold">•</span>
                <span>{adminErrorMsg}</span>
              </div>
            )}

            {!isAdminConfigured ? (
              <form onSubmit={handleAdminSetup} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Set Master Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create master password (min 4 chars)"
                      required
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Master Passcode
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter master password"
                    required
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberSetup"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberSetup" className="text-xs text-slate-300 cursor-pointer select-none">
                    Remember this device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingAdmin ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save Password & Unlock</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Master Admin Passcode
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your master passcode..."
                      required
                      autoFocus
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingAdmin}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingAdmin ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Unlock Workspace</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Security Badge Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400/90 leading-relaxed">
            Temporary access session. All resume data is processed 100% client-side in your local browser.
          </p>
        </div>
      </div>
    </div>
  );
};

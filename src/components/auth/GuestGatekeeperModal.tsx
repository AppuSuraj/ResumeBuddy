import React, { useState } from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isAdminAuthenticated } from '../../services/adminAuthService';

interface GuestGatekeeperModalProps {
  onBypassDev?: () => void;
}

export const GuestGatekeeperModal: React.FC<GuestGatekeeperModalProps> = ({ onBypassDev }) => {
  const { session, loading, error, isConfigured, loginWithGuestCredentials } = useGuestAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated via Supabase session, admin session, or loading, do not render modal
  if (loading || session || isAdminAuthenticated()) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your Guest ID / Email and Access Key.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginWithGuestCredentials(email, password);
      if (res.success) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      } else if (res.error) {
        setLocalError(res.error);
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setSubmitting(false);
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
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo / Shield Icon */}
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/10 mb-3.5">
            <ShieldCheck className="w-7 h-7" />
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h1
              id="guest-modal-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-white"
            >
              ResumeBuddy Private Workstation
            </h1>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-semibold tracking-wide uppercase text-blue-400 mt-1 mb-2">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>Authorized Guest Access</span>
          </div>

          {/* Subtitle */}
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Please sign in using your designated guest tester credentials.
          </p>
        </div>

        {/* Missing Supabase Configuration Notice (Non-blocking fallback for dev) */}
        {!isConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong className="font-semibold block text-amber-300">
                  Supabase Environment Pending
                </strong>
                Set <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-slate-950/80 px-1 py-0.2 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</code> to enforce live guest verification.
              </div>
            </div>
            {onBypassDev && (
              <button
                type="button"
                onClick={onBypassDev}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[11px] font-semibold transition"
              >
                Bypass Gatekeeper (Dev Mode)
              </button>
            )}
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

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="guest-email"
              className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Guest ID / Email
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
              Access Key / Password
            </label>
            <div className="relative">
              <input
                id="guest-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter designated guest access key..."
                required
                autoComplete="current-password"
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

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] transition shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Workstation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

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

import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { 
  Sparkles, 
  CheckCircle2, 
  FileEdit, 
  X, 
  ShieldCheck, 
  FileText, 
  Crosshair 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WelcomeHeroBanner: React.FC = () => {
  const { isOnboarded, loadSampleData, startFromScratch, dismissOnboardingBanner } = useResume();
  const toast = useToast();

  if (isOnboarded) {
    return null;
  }

  const handleLoadSample = () => {
    loadSampleData();
    dismissOnboardingBanner();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch {}
    toast.success('Pro Sample Loaded', 'Explore the interactive ATS diff, bullet bank, and PDF export!');
  };

  const handleStartFromScratch = () => {
    startFromScratch();
    toast.info('Clean Canvas Ready', 'Your blank resume is ready. Fill in your details on the left!');
  };

  return (
    <div className="w-full max-w-[210mm] mb-5 mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-blue-950/40 border border-blue-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-blue-500/20">
        {/* Ambient background glow accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dismiss (X) button */}
        <button
          onClick={dismissOnboardingBanner}
          title="Dismiss welcome banner"
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold tracking-wide uppercase text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Welcome to ResumeBuddy</span>
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug pr-8">
          🚀 The Zero-BS, Anti-Subscription ATS Workstation
        </h2>

        {/* Narrative Body */}
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Tired of builders holding your PDF hostage behind a $30/mo paywall? You're in good hands.
        </p>

        {/* Pillar Feature Checkmarks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5 pt-2 border-t border-slate-800/70">
          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300 leading-tight">
              <strong className="text-white block font-semibold">100% Client-Side</strong>
              Zero cloud telemetry or data harvesting
            </span>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300 leading-tight">
              <strong className="text-white block font-semibold">Mode-3 Vector PDF</strong>
              ATS parsers read real text, not screenshots
            </span>
          </div>

          <div className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <Crosshair className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-300 leading-tight">
              <strong className="text-white block font-semibold">Real-Time JD Diff</strong>
              Honest keyword matching & ATS math
            </span>
          </div>
        </div>

        {/* Subtitle & Action CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 font-medium">
            Your canvas is fresh and ready. How would you like to begin?
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Pro Sample</span>
            </button>

            <button
              onClick={handleStartFromScratch}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 active:scale-95 transition cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5 text-slate-400" />
              <span>Start From Scratch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

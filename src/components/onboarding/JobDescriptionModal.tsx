import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { Sparkles, ArrowRight, X, CheckCircle2, UserCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const JobDescriptionModal: React.FC = () => {
  const { 
    resumeData, 
    userProfile, 
    startCleanResumeWithProfile, 
    updateJobTarget, 
    isJdModalOpen, 
    setIsJdModalOpen, 
    setActiveTab 
  } = useResume();
  const toast = useToast();

  const [roleTitle, setRoleTitle] = useState(resumeData.jobTarget.targetRoleTitle || '');
  const [jdText, setJdText] = useState(resumeData.jobTarget.jobDescriptionText || '');
  const [startFresh, setStartFresh] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isJdModalOpen) return null;

  const hasCachedProfile = Boolean(userProfile.fullName || userProfile.email);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    setTimeout(() => {
      if (startFresh) {
        // Starts clean fresh resume with cached user profile info (name, phone, email, etc.)
        startCleanResumeWithProfile(roleTitle, jdText);
        toast.success('Clean Resume Initialized', hasCachedProfile ? `Pre-filled contact details for ${userProfile.fullName}.` : 'Workspace ready for your new role.');
      } else {
        // Retains whatever is already in the active resume and updates target
        updateJobTarget(roleTitle, jdText);
        toast.success('Target Role Updated', 'ATS match recalculated.');
      }

      setIsAnalyzing(false);
      setIsJdModalOpen(false);
      setActiveTab('target');

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if confetti fails
      }
    }, 400);
  };

  const handleSkip = () => {
    setIsJdModalOpen(false);
    setActiveTab('personal');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Target Role & Job Description
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimize your resume for real-time ATS keyword matching and high callback rates.
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleAnalyze} className="p-5 space-y-4">
          {/* Profile Cache Banner */}
          {hasCachedProfile && (
            <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 truncate">
                <span className="font-semibold text-white">Profile Memory Active:</span> Auto-filling Name, Email & Phone for <span className="font-semibold text-emerald-200">{userProfile.fullName || userProfile.email}</span>.
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Job Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Product Manager, Data Analyst"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Job Description Text (Optional)
              </label>
              <span className="text-[10px] text-slate-400">Paste responsibilities & qualifications</span>
            </div>
            <textarea
              rows={5}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here to extract keywords, skills, and compute ATS match score..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition font-mono leading-relaxed"
            />
          </div>

          {/* Clean Workspace Mode Option */}
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="startFresh"
                checked={startFresh}
                onChange={(e) => setStartFresh(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="startFresh" className="text-xs text-slate-300 cursor-pointer">
                <span className="font-semibold text-white">Start with a clean canvas</span>
                <p className="text-[11px] text-slate-400">
                  Keeps your saved contact info (Name, Phone, Email), clears previous role bullets.
                </p>
              </label>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/60 shrink-0">
              Recommended
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Keywords...
                </>
              ) : (
                <>
                  Analyze & Start Building
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

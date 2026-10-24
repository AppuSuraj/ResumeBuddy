import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Sparkles, FileText, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const JobDescriptionModal: React.FC = () => {
  const { resumeData, updateJobTarget, isJdModalOpen, setIsJdModalOpen, setActiveTab } = useResume();

  const [roleTitle, setRoleTitle] = useState(resumeData.jobTarget.targetRoleTitle || '');
  const [jdText, setJdText] = useState(resumeData.jobTarget.jobDescriptionText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isJdModalOpen) return null;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    setTimeout(() => {
      updateJobTarget(roleTitle, jdText);
      setIsAnalyzing(false);
      setIsJdModalOpen(false);
      setActiveTab('target');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if confetti fails
      }
    }, 600);
  };

  const handleSkip = () => {
    setIsJdModalOpen(false);
    setActiveTab('personal');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Tailor Resume to Job Description
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Input your target job title & description for instant AI ATS optimization & bullet suggestions.
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
        <form onSubmit={handleAnalyze} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Job Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Product Manager, Data Analyst"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Job Description Text (Optional)
              </label>
              <span className="text-[11px] text-slate-400">Paste full job post or key requirements</span>
            </div>
            <textarea
              rows={6}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the Job Description here (e.g. responsibilities, required skills, tools, qualifications)..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono"
            />
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              What AI will do with this:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
              <li>Extract target keywords and required technical/soft skills</li>
              <li>Calculate your real-time ATS match score</li>
              <li>Power the AI Bullet Assistant to generate tailored experience highlights</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
            >
              Skip for now (Manual Edit)
            </button>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Keywords...
                </>
              ) : (
                <>
                  Analyze & Start Building
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

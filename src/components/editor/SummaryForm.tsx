import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { generateSummaryVariations } from '../../services/aiService';
import { AiSummarySuggestion } from '../../types/resume';
import { FileText, Sparkles, Check, ArrowRight, Wand2, X } from 'lucide-react';

export const SummaryForm: React.FC = () => {
  const { resumeData, updatePersonal, setActiveTab } = useResume();
  const { personal, jobTarget, experience } = resumeData;
  const toast = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AiSummarySuggestion[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  const handleGenerateAi = async () => {
    setIsGenerating(true);
    setShowDrawer(true);

    const expSummary = experience
      .map((e) => `${e.jobTitle} at ${e.company}: ${e.highlights.join(' ')}`)
      .join(' | ');

    try {
      const results = await generateSummaryVariations(
        personal.fullName || 'Candidate',
        personal.jobTitle || jobTarget.targetRoleTitle || 'Professional',
        expSummary,
        jobTarget.jobDescriptionText
      );
      setSuggestions(results);
    } catch (e) {
      console.error('Failed to generate summary options:', e);
      toast.error('AI Summary Error', 'Could not generate summary variations.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySummary = (summaryText: string) => {
    updatePersonal({ summary: summaryText });
    setShowDrawer(false);
    toast.success('Summary Applied', 'Professional summary updated.');
  };

  const charCount = personal.summary ? personal.summary.length : 0;

  return (
    <div className="p-4 space-y-4 text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Professional Summary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hook recruiters with a 2-4 sentence executive overview of your career value.
          </p>
        </div>
        <button
          onClick={handleGenerateAi}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800/80 rounded-xl transition shadow-xs active:scale-98 disabled:opacity-60 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
          <span>AI Summary Generator</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-xs space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Summary Statement
          </label>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {charCount} characters {charCount >= 200 && charCount <= 500 ? '(Ideal length)' : ''}
          </span>
        </div>
        <textarea
          rows={6}
          value={personal.summary || ''}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
          placeholder="High-performing Professional with 5+ years of experience in leading engineering teams, driving measurable growth, and delivering scalable solutions..."
          className="w-full bg-slate-50 hover:bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/50 focus:border-blue-500 leading-relaxed font-sans transition shadow-inner"
        />
      </div>

      {/* AI Suggestions Drawer */}
      {showDrawer && (
        <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-blue-500/20 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Generated Summary Variations
            </h3>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isGenerating ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Analyzing career milestones & generating tailored summaries...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-xl space-y-2.5 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                      {item.styleName}
                    </span>
                    <button
                      onClick={() => handleApplySummary(item.summary)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      Use This <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation Button to Next Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 3 of 7: Professional Summary</span>
        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          <span>Next: Work Experience</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

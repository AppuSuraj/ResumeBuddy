import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { Target, Sparkles, CheckCircle2, AlertCircle, Plus, RefreshCw, PlusCircle, Check } from 'lucide-react';

export const TargetJobPanel: React.FC = () => {
  const { resumeData, updateJobTarget, updateSkillCategory, addSkillCategory } = useResume();
  const { jobTarget } = resumeData;
  const toast = useToast();

  const [roleTitle, setRoleTitle] = useState(jobTarget.targetRoleTitle || '');
  const [jdText, setJdText] = useState(jobTarget.jobDescriptionText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      updateJobTarget(roleTitle, jdText);
      setIsAnalyzing(false);
      toast.success('Job Analysis Updated', 'ATS score and keyword matches recalculated.');
    }, 200);
  };

  const handleAddMissingKeywordToSkills = (keyword: string) => {
    if (resumeData.skills.length > 0) {
      const firstCat = resumeData.skills[0];
      if (!firstCat.skills.some((s) => s.toLowerCase() === keyword.toLowerCase())) {
        updateSkillCategory(firstCat.id, {
          skills: [...firstCat.skills, keyword],
        });
        toast.success('Keyword Added', `"${keyword}" added to ${firstCat.categoryName}.`);
      } else {
        toast.info('Already in Skills', `"${keyword}" is already in your skills.`);
      }
    } else {
      addSkillCategory();
      toast.info('Category Created', 'Created a Technical Skills category.');
    }
  };

  const handleAddAllMissingKeywords = () => {
    const missing = jobTarget.matchFeedback?.missingKeywords || [];
    if (missing.length === 0) return;

    if (resumeData.skills.length > 0) {
      const firstCat = resumeData.skills[0];
      const existing = new Set(firstCat.skills.map((s) => s.toLowerCase()));
      const toAdd = missing.filter((m) => !existing.has(m.toLowerCase()));
      
      if (toAdd.length > 0) {
        updateSkillCategory(firstCat.id, {
          skills: [...firstCat.skills, ...toAdd],
        });
        toast.success('Keywords Added', `Added ${toAdd.length} missing keywords to skills!`);
      } else {
        toast.info('All Keywords Present', 'All missing keywords are already in your skills.');
      }
    } else {
      addSkillCategory();
      toast.info('Category Created', 'Please click again to add keywords to the new category.');
    }
  };

  const atsScore = jobTarget.atsScore || 80;

  return (
    <div className="p-4 space-y-4 text-slate-200">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            Target Job & ATS Optimizer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extract keywords from job postings to maximize your resume match score.
          </p>
        </div>
      </div>

      {/* Target Job Input Form */}
      <form onSubmit={handleUpdate} className="space-y-3 bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl shadow-sm">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Job Role
          </label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Lead Frontend Engineer, Senior Product Manager..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Job Description (JD) Text
          </label>
          <textarea
            rows={4}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste job posting requirements & responsibilities..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-60"
        >
          {isAnalyzing ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>{isAnalyzing ? 'Analyzing JD...' : 'Analyze & Calculate Match'}</span>
        </button>
      </form>

      {/* ATS Match Score Card */}
      <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">ATS Match Analysis</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Based on keyword frequency in target job</p>
          </div>
          <div
            className={`text-sm font-black px-3 py-1 rounded-full border transition ${
              atsScore >= 80
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80'
                : atsScore >= 65
                ? 'bg-amber-950/70 text-amber-400 border-amber-800/80'
                : 'bg-rose-950/70 text-rose-400 border-rose-800/80'
            }`}
          >
            {atsScore}% Overall Match
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${atsScore}%` }}
          />
        </div>

        {/* Matched Keywords */}
        {jobTarget.matchFeedback?.matchedKeywords && jobTarget.matchFeedback.matchedKeywords.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matched Keywords ({jobTarget.matchFeedback.matchedKeywords.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {jobTarget.matchFeedback.matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {jobTarget.matchFeedback?.missingKeywords && jobTarget.matchFeedback.missingKeywords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Missing Keywords ({jobTarget.matchFeedback.missingKeywords.length})</span>
              </div>
              <button
                onClick={handleAddAllMissingKeywords}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add All to Skills
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {jobTarget.matchFeedback.missingKeywords.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => handleAddMissingKeywordToSkills(kw)}
                  title="Click to add this keyword to your Skills section"
                  className="group text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3 h-3 text-amber-400 group-hover:scale-125 transition-transform" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optimization Suggestions */}
        {jobTarget.matchFeedback?.recommendations && jobTarget.matchFeedback.recommendations.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Tailoring Recommendations</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {jobTarget.matchFeedback.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold text-xs mt-0.5">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

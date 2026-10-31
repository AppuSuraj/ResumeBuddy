import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { analyzeJobDescription } from '../../services/aiService';
import { ResumeData } from '../../types/resume';
import { Target, Sparkles, CheckCircle2, AlertCircle, Plus, RefreshCw, PlusCircle, Check } from 'lucide-react';

export const TargetJobPanel: React.FC = () => {
  const { resumeData, setResumeData, updateJobTarget, updatePersonal, updateSkillCategory, addSkillCategory } = useResume();
  const { jobTarget, personal } = resumeData;
  const toast = useToast();

  const [roleTitle, setRoleTitle] = useState(jobTarget.targetRoleTitle || '');
  const [jdText, setJdText] = useState(jobTarget.jobDescriptionText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync local inputs when target data updates externally
  useEffect(() => {
    setRoleTitle(jobTarget.targetRoleTitle || '');
    setJdText(jobTarget.jobDescriptionText || '');
  }, [jobTarget.targetRoleTitle, jobTarget.jobDescriptionText]);

  // Check if current resume headline is empty, default, or was previously synced
  const isDefaultHeadline =
    !personal.jobTitle ||
    personal.jobTitle.trim() === '' ||
    personal.jobTitle === 'Senior Full Stack Engineer' ||
    personal.jobTitle === 'Target Role' ||
    personal.jobTitle === 'Job Title' ||
    personal.jobTitle === 'Professional' ||
    personal.jobTitle === jobTarget.targetRoleTitle;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setTimeout(() => {
      updateJobTarget(roleTitle, jdText);

      // Intelligent Defaulting: automatically sync headline if it's default/placeholder
      if (isDefaultHeadline && roleTitle.trim()) {
        updatePersonal({ jobTitle: roleTitle.trim() });
      }

      setIsAnalyzing(false);
      toast.success('Job Analysis Updated', 'ATS score and keyword matches recalculated.');
    }, 200);
  };

  const handleSyncToResumeTitle = () => {
    if (!roleTitle.trim()) return;
    updatePersonal({ jobTitle: roleTitle.trim() });
    toast.success('Title Synced', `Resume headline updated to "${roleTitle.trim()}".`);
  };

  const handleAddMissingKeywordToSkills = (keyword: string) => {
    if (resumeData.skills.length > 0) {
      const firstCat = resumeData.skills[0];
      if (!firstCat.skills.some((s) => s.toLowerCase() === keyword.toLowerCase())) {
        const newSkills = [...firstCat.skills, keyword];
        updateSkillCategory(firstCat.id, {
          skills: newSkills,
        });

        // Recalculate match immediately with updated skills
        const updatedResume: ResumeData = {
          ...resumeData,
          skills: resumeData.skills.map((s, idx) => (idx === 0 ? { ...s, skills: newSkills } : s)),
        };
        const analyzed = analyzeJobDescription(roleTitle, jdText, updatedResume);
        setResumeData((prev) => ({ ...prev, jobTarget: analyzed }));

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
        const newSkills = [...firstCat.skills, ...toAdd];
        updateSkillCategory(firstCat.id, {
          skills: newSkills,
        });

        // Recalculate match immediately with updated skills
        const updatedResume: ResumeData = {
          ...resumeData,
          skills: resumeData.skills.map((s, idx) => (idx === 0 ? { ...s, skills: newSkills } : s)),
        };
        const analyzed = analyzeJobDescription(roleTitle, jdText, updatedResume);
        setResumeData((prev) => ({ ...prev, jobTarget: analyzed }));

        toast.success('Keywords Added', `Added ${toAdd.length} missing keywords to skills!`);
      } else {
        toast.info('All Keywords Present', 'All missing keywords are already in your skills.');
      }
    } else {
      addSkillCategory();
      toast.info('Category Created', 'Please click again to add keywords to the new category.');
    }
  };

  const atsScore = jobTarget.atsScore ?? 0;
  const matchedKeywords = jobTarget.matchFeedback?.matchedKeywords || [];
  const missingKeywords = jobTarget.matchFeedback?.missingKeywords || [];
  const totalCoreKeywords = matchedKeywords.length + missingKeywords.length;

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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Job Role
            </label>
            {/* Explicit Override: Manual sync button when user has a custom headline */}
            {roleTitle.trim() && personal.jobTitle?.trim() !== roleTitle.trim() && (
              <button
                type="button"
                onClick={handleSyncToResumeTitle}
                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/70 hover:bg-blue-900/80 border border-blue-800/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition shadow-sm"
                title="Sync this Target Role directly to your resume headline"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Sync to Resume Title</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Lead Frontend Engineer, Senior Product Manager..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Used for ATS scoring against target job descriptions.
          </p>
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

        {/* Concise Counter */}
        <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
          <span className="font-semibold text-slate-200">
            {totalCoreKeywords > 0
              ? `Matched ${matchedKeywords.length} of ${totalCoreKeywords} core keywords`
              : 'No keywords detected yet'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {totalCoreKeywords > 0
              ? `${Math.round((matchedKeywords.length / totalCoreKeywords) * 100)}% keyword match`
              : '0%'}
          </span>
        </div>

        {/* Matched Keywords Cluster */}
        <div>
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matched Keywords ({matchedKeywords.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Found in resume</span>
          </div>
          {matchedKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">No matched keywords yet.</p>
          )}
        </div>

        {/* Missing Keywords Cluster */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Missing Keywords ({missingKeywords.length})</span>
            </div>
            {missingKeywords.length > 0 && (
              <button
                type="button"
                onClick={handleAddAllMissingKeywords}
                className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add All to Skills
              </button>
            )}
          </div>
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddMissingKeywordToSkills(kw)}
                  title="Click to add this keyword to your Skills section"
                  className="group text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-amber-950/50 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-700/60 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-3 h-3 text-amber-400/80 group-hover:text-amber-400 group-hover:scale-125 transition-transform" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          ) : totalCoreKeywords > 0 ? (
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> All core keywords matched!
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Enter a Job Description above to see missing keyword gaps.</p>
          )}
        </div>

        {/* Dynamic Targeted Tips & Recommendations */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Targeted Optimization Tips</span>
          </div>

          {/* Dynamic Keyword Suggestion Tip */}
          {missingKeywords.length > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300">Targeted Tip:</span> Consider adding:{' '}
              <strong className="text-white font-mono">{missingKeywords.slice(0, 3).join(', ')}</strong>{' '}
              to your skills section or work experience bullets.
            </div>
          )}

          {/* Dynamic Recommendations List */}
          {jobTarget.matchFeedback?.recommendations && jobTarget.matchFeedback.recommendations.length > 0 && (
            <ul className="space-y-1.5 text-xs text-slate-300">
              {jobTarget.matchFeedback.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold text-xs mt-0.5">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

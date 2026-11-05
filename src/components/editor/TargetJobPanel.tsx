import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { 
  analyzeJobDescription, 
  extractJdKeywordsWithAi, 
  escapeRegex,
  getResumeWordCount 
} from '../../services/aiService';
import { ResumeData, SkillCategory } from '../../types/resume';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  PlusCircle, 
  Check, 
  Eye, 
  Edit3, 
  Highlighter,
  ArrowRight,
  FileCheck2 
} from 'lucide-react';

export const TargetJobPanel: React.FC = () => {
  const { 
    resumeData, 
    setResumeData, 
    updateJobTarget, 
    updatePersonal, 
    updateSkillCategory, 
    addSkillCategory,
    setActiveTab,
    addRecentlyAddedSkill
  } = useResume();
  const { jobTarget, personal } = resumeData;
  const toast = useToast();

  const [roleTitle, setRoleTitle] = useState(jobTarget.targetRoleTitle || '');
  const [jdText, setJdText] = useState(jobTarget.jobDescriptionText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Default to Paste/Raw Text mode first
  const [jdViewMode, setJdViewMode] = useState<'editor' | 'diff'>('editor');

  const jdWordCount = jdText.trim() ? jdText.trim().split(/\s+/).filter(Boolean).length : 0;
  const hasExtractedKeywords = Boolean(jobTarget.extractedKeywords && jobTarget.extractedKeywords.length > 0);
  const canShowDiff = jdWordCount >= 30 && hasExtractedKeywords;
  const resumeWordCount = getResumeWordCount(resumeData);

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const extractedKeywords = await extractJdKeywordsWithAi(jdText);
      const analyzed = analyzeJobDescription(roleTitle, jdText, resumeData, extractedKeywords);
      setResumeData((prev) => ({
        ...prev,
        jobTarget: analyzed,
      }));

      // Intelligent Defaulting: automatically sync headline if it's default/placeholder
      if (isDefaultHeadline && roleTitle.trim()) {
        updatePersonal({ jobTitle: roleTitle.trim() });
      }

      toast.success(
        'Job Analysis Complete',
        extractedKeywords.length > 0
          ? `Extracted ${extractedKeywords.length} core technical keywords.`
          : 'ATS score and keyword matches recalculated.'
      );
    } catch {
      updateJobTarget(roleTitle, jdText);
      toast.success('Job Analysis Updated', 'ATS score and keyword matches recalculated.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncToResumeTitle = () => {
    if (!roleTitle.trim()) return;
    updatePersonal({ jobTitle: roleTitle.trim() });
    toast.success('Title Synced', `Resume headline updated to "${roleTitle.trim()}".`);
  };

  const handleAddMissingKeywordToSkills = (keyword: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanKw = keyword.trim();
    if (!cleanKw) return;

    let updatedSkills: SkillCategory[];
    let targetCatName = 'Technical Skills';

    if (resumeData.skills.length > 0) {
      const firstCat = resumeData.skills[0];
      targetCatName = firstCat.categoryName;
      if (firstCat.skills.some((s) => s.toLowerCase() === cleanKw.toLowerCase())) {
        toast.info('Already in Skills', `"${cleanKw}" is already listed.`);
        return;
      }
      // ONLY push this single keyword
      const newSkills = [...firstCat.skills, cleanKw];
      updatedSkills = resumeData.skills.map((s, idx) =>
        idx === 0 ? { ...s, skills: newSkills } : s
      );
    } else {
      updatedSkills = [
        {
          id: `skill-${Date.now()}`,
          categoryName: 'Technical Skills',
          skills: [cleanKw],
        },
      ];
    }

    // Immediately recalculate ATS match with the new skill
    const updatedResume: ResumeData = {
      ...resumeData,
      skills: updatedSkills,
    };
    const analyzed = analyzeJobDescription(
      roleTitle,
      jdText,
      updatedResume,
      resumeData.jobTarget.extractedKeywords
    );

    setResumeData({
      ...updatedResume,
      jobTarget: analyzed,
    });

    // Mark skill as recently added for pulse animation badge in SkillsForm
    addRecentlyAddedSkill(cleanKw);

    toast.success(
      `✓ Added "${cleanKw}" to your Skills section!`,
      undefined,
      {
        label: 'View Skills Tab →',
        onClick: () => setActiveTab('skills'),
      }
    );
  };

  const handleAddAllMissingKeywords = () => {
    const missing = jobTarget.matchFeedback?.missingKeywords || [];
    if (missing.length === 0) return;

    let updatedSkills: SkillCategory[];

    if (resumeData.skills.length > 0) {
      const firstCat = resumeData.skills[0];
      const existing = new Set(firstCat.skills.map((s) => s.toLowerCase()));
      const toAdd = missing.filter((m) => !existing.has(m.toLowerCase()));
      if (toAdd.length === 0) {
        toast.info('All Keywords Present', 'All missing keywords are already in your skills.');
        return;
      }
      const newSkills = [...firstCat.skills, ...toAdd];
      updatedSkills = resumeData.skills.map((s, idx) =>
        idx === 0 ? { ...s, skills: newSkills } : s
      );
      toAdd.forEach((kw) => addRecentlyAddedSkill(kw));
    } else {
      updatedSkills = [
        {
          id: `skill-${Date.now()}`,
          categoryName: 'Technical Skills',
          skills: [...missing],
        },
      ];
      missing.forEach((kw) => addRecentlyAddedSkill(kw));
    }

    const updatedResume: ResumeData = {
      ...resumeData,
      skills: updatedSkills,
    };
    const analyzed = analyzeJobDescription(
      roleTitle,
      jdText,
      updatedResume,
      resumeData.jobTarget.extractedKeywords
    );

    setResumeData({
      ...updatedResume,
      jobTarget: analyzed,
    });

    toast.success(
      `✓ Added missing keywords to your Skills section!`,
      undefined,
      {
        label: 'View Skills Tab →',
        onClick: () => setActiveTab('skills'),
      }
    );
  };

  const atsScore = jobTarget.atsScore ?? 0;
  const matchedKeywords = jobTarget.matchFeedback?.matchedKeywords || [];
  const missingKeywords = jobTarget.matchFeedback?.missingKeywords || [];
  const totalCoreKeywords = matchedKeywords.length + missingKeywords.length;

  return (
    <div className="p-4 space-y-4 text-slate-800 dark:text-slate-200">
      {/* 🎯 Step 1: Guided "Where to Start" Onboarding Micro-Banner */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                🎯 Step 1: Set Your Target Role
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Paste the job description you're applying for. We'll automatically analyze required keywords so your resume passes ATS filters. <span className="text-slate-500 dark:text-slate-400">(Don't have one right now? Click 'Skip to Editor' to write freely).</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className="self-start sm:self-center shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <span>Skip to Personal Info</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Target Job & ATS Optimizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Extract keywords from job postings to maximize your resume match score.
          </p>
        </div>
      </div>

      {/* Target Job Input Form */}
      <form onSubmit={handleUpdate} className="space-y-4 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-xs">
        {/* Prominent Target Role Position Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              🎯 TARGET ROLE / POSITION
            </span>
            {roleTitle.trim() && personal.jobTitle?.trim() !== roleTitle.trim() && (
              <button
                type="button"
                onClick={handleSyncToResumeTitle}
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 rounded-md flex items-center gap-1 transition shadow-xs cursor-pointer"
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
            placeholder="e.g. Senior Full-Stack Engineer, Product Marketing Manager"
            className="w-full bg-slate-50 hover:bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/50 focus:border-blue-500 transition shadow-inner"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            e.g., Senior Full-Stack Engineer, Product Marketing Manager
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Job Description (JD) & Keyword Diff
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setJdViewMode('editor')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                  jdViewMode === 'editor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                }`}
                title="Edit raw job description text"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Raw Text</span>
              </button>
              <button
                type="button"
                disabled={!canShowDiff}
                onClick={() => {
                  if (canShowDiff) setJdViewMode('diff');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                  jdViewMode === 'diff'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : canShowDiff
                    ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                    : 'text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                }`}
                title={
                  !canShowDiff
                    ? 'Paste a Job Description first (min 30 words) and click Analyze to see keyword highlights.'
                    : 'View interactive keyword highlighting & gap diff'
                }
              >
                <Highlighter className="w-3 h-3" />
                <span>Visual Diff</span>
              </button>
            </div>
          </div>

          {jdViewMode === 'editor' ? (
            <div className="space-y-1">
              <textarea
                rows={5}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job posting requirements & responsibilities..."
                className="w-full bg-slate-50 hover:bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/50 focus:border-blue-500 leading-relaxed"
              />
              {!canShowDiff && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Paste a Job Description first to see keyword highlights (minimum 30 words & click &quot;Analyze &amp; Calculate Match&quot;).
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Witty ATS Pro-Tip Banner */}
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2 shadow-xs font-sans">
                <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-blue-700 dark:text-blue-300 mr-1">ATS Pro-Tip:</strong>
                  We don't do star ratings or percentage bars for skills. Workday and Taleo don't care that you're '90% good at React'—they want proof of impact.
                </p>
              </div>

              {/* Interactive Diff Legend */}
              <div className="flex items-center justify-between text-[11px] px-3 py-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm" />
                    Covered Keywords ({matchedKeywords.length})
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                    Missing Keywords ({missingKeywords.length})
                  </span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-sans hidden sm:inline text-[10px]">Click amber tags to add to skills</span>
              </div>

              {/* Rendered Text with Calm, Modern Keyword Highlighting (De-coderized) */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 max-h-56 overflow-y-auto custom-scrollbar font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-300">
                {jdText.trim() ? (
                  (() => {
                    const allKws = [
                      ...matchedKeywords.map((k) => ({ text: k, isMatched: true })),
                      ...missingKeywords.map((k) => ({ text: k, isMatched: false })),
                    ]
                      .filter((k) => k.text && k.text.length >= 2)
                      .sort((a, b) => b.text.length - a.text.length);

                    if (allKws.length === 0) {
                      return <span className="whitespace-pre-wrap">{jdText}</span>;
                    }

                    // Strict word boundary helper ensuring short keywords like "AI"
                    // never slice into words like "obtain" or "campaign"
                    const buildStrictRegexPattern = (kw: string) => {
                      const esc = escapeRegex(kw);
                      const left = /^\w/.test(kw) ? '\\b' : '(?<=^|[\\s.,;:!?()\\[\\]"\'])';
                      const right = /\w$/.test(kw) ? '\\b' : '(?=$|[\\s.,;:!?()\\[\\]"\'])';
                      return `${left}${esc}${right}`;
                    };

                    const pattern = new RegExp(
                      `(${allKws.map((k) => buildStrictRegexPattern(k.text)).join('|')})`,
                      'gi'
                    );

                    const parts = jdText.split(pattern);

                    return (
                      <span className="whitespace-pre-wrap">
                        {parts.map((part, i) => {
                          const lower = part.trim().toLowerCase();
                          const foundMatched = matchedKeywords.find((k) => k.toLowerCase() === lower);
                          const foundMissing = missingKeywords.find((k) => k.toLowerCase() === lower);

                          if (foundMatched) {
                            return (
                              <mark
                                key={i}
                                className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50 rounded px-1.5 py-0.5 mx-0.5 font-medium inline-block shadow-xs"
                                title={`✓ Covered in resume: ${foundMatched}`}
                              >
                                {part}
                              </mark>
                            );
                          }

                          if (foundMissing) {
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddMissingKeywordToSkills(foundMissing, e);
                                }}
                                className="bg-amber-100 hover:bg-amber-200/70 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 border border-amber-300 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-700/60 rounded px-1.5 py-0.5 mx-0.5 font-medium transition inline-flex items-center gap-1 active:scale-95 text-left cursor-pointer group shadow-xs"
                                title={`⚠️ Missing keyword: Click to add "${foundMissing}" to Skills`}
                              >
                                <span>{part}</span>
                                <span className="text-[10px] text-amber-800 dark:text-amber-300 group-hover:text-amber-950 dark:group-hover:text-amber-100 bg-amber-200/80 dark:bg-amber-900/50 px-1.5 py-0.2 rounded font-sans">
                                  + Add to Skills
                                </span>
                              </button>
                            );
                          }

                          return <span key={i}>{part}</span>;
                        })}
                      </span>
                    );
                  })()
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic">No job description text pasted yet. Click "Edit Raw Text" above to paste a job posting.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-xl transition shadow-md shadow-blue-600/20 disabled:opacity-60 cursor-pointer"
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
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">ATS Match Analysis</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time keyword match vs target requirements</p>
          </div>
          <div
            className={`text-sm font-black px-3 py-1 rounded-full border transition ${
              atsScore >= 80
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/80'
                : atsScore >= 65
                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-800/80'
                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800/80'
            }`}
          >
            {atsScore}% Overall Match
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${atsScore}%` }}
          />
        </div>

        {/* Reactive Health Check Metric Triplet: Matched, Missing, Resume Word Count */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Matched
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{matchedKeywords.length}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">in resume</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              Missing
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{missingKeywords.length}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">gaps to target</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Word Health
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{resumeWordCount}</span>
            <span className={`text-[10px] font-semibold ${
              resumeWordCount >= 100 && resumeWordCount <= 600
                ? 'text-emerald-600 dark:text-emerald-400'
                : resumeWordCount > 600
                ? 'text-blue-600 dark:text-blue-300'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {resumeWordCount >= 100 && resumeWordCount <= 600
                ? '✓ Optimal'
                : resumeWordCount > 600
                ? '• Detailed'
                : '⚠️ Under 100 w'}
            </span>
          </div>
        </div>

        {/* Matched Keywords Cluster */}
        <div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Matched Keywords ({matchedKeywords.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Found in resume</span>
          </div>
          {matchedKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No matched keywords yet.</p>
          )}
        </div>

        {/* Missing Keywords Cluster with Isolated Pill State */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Missing Keywords ({missingKeywords.length})</span>
            </div>
            {missingKeywords.length > 0 && (
              <button
                type="button"
                onClick={handleAddAllMissingKeywords}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 hover:underline transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add All to Skills
              </button>
            )}
          </div>
          {missingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw, i) => {
                const isSelectedOrAdded = resumeData.skills.some((c) =>
                  c.skills.some((s) => s.toLowerCase() === kw.toLowerCase())
                );
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddMissingKeywordToSkills(kw, e);
                    }}
                    title={isSelectedOrAdded ? `"${kw}" is already in your skills` : `Click to add "${kw}" to Skills`}
                    className={`group text-[11px] font-sans px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs ${
                      isSelectedOrAdded
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 border border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/60'
                    }`}
                  >
                    {isSelectedOrAdded ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Plus className="w-3 h-3 text-amber-600 dark:text-amber-400 group-hover:scale-125 transition-transform" />
                    )}
                    <span>{kw}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-sans ${
                        isSelectedOrAdded
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400/80 group-hover:text-amber-950 dark:group-hover:text-amber-200'
                      }`}
                    >
                      {isSelectedOrAdded ? 'Added' : '+ Add'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : totalCoreKeywords > 0 ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> All core keywords matched!
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">Enter a Job Description above to see missing keyword gaps.</p>
          )}
        </div>

        {/* Dynamic Targeted Tips & Recommendations */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Targeted Optimization Tips</span>
          </div>

          {/* Dynamic Keyword Suggestion Tip */}
          {missingKeywords.length > 0 && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed font-sans">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Targeted Tip:</span> Consider adding:{' '}
              <strong className="text-slate-900 dark:text-white font-medium">{missingKeywords.slice(0, 3).join(', ')}</strong>{' '}
              to your skills section or work experience bullets.
            </div>
          )}

          {/* Dynamic Recommendations List */}
          {jobTarget.matchFeedback?.recommendations && jobTarget.matchFeedback.recommendations.length > 0 && (
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {jobTarget.matchFeedback.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400 font-bold text-xs mt-0.5">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer Navigation Button to Next Section */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 1 of 7: Role & Keywords</span>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          <span>Next: Personal Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { getSuggestedSkills, getLiveAiSkillSuggestions, hasApiKey } from '../../services/aiService';
import { Wrench, Plus, Trash2, X, Sparkles, Loader2, KeyRound, Bot } from 'lucide-react';

export const SkillsForm: React.FC = () => {
  const { resumeData, updateSkillCategory, addSkillCategory, deleteSkillCategory } = useResume();
  const { skills, jobTarget, personal } = resumeData;
  const toast = useToast();

  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});
  const [inlineSuggestions, setInlineSuggestions] = useState<{ [catId: string]: string[] }>({});
  const [loadingCategoryAi, setLoadingCategoryAi] = useState<{ [catId: string]: boolean }>({});
  const [isGeminiConnected, setIsGeminiConnected] = useState<boolean>(false);

  // Check Gemini API key status on mount & storage changes
  useEffect(() => {
    setIsGeminiConnected(hasApiKey());
    const handleStorage = () => setIsGeminiConnected(hasApiKey());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const roleTitle = jobTarget?.targetRoleTitle || personal?.jobTitle || 'Professional';
  const jdText = jobTarget?.jobDescriptionText || '';
  const suggestedSkillsList = getSuggestedSkills(resumeData);

  // Debounced live suggestions when user types in any category's input
  useEffect(() => {
    const timer = setTimeout(async () => {
      for (const cat of skills) {
        const query = newSkillInput[cat.id]?.trim();
        // Only fetch if query has at least 1 character or if user focused
        if (query && query.length >= 1) {
          const suggestions = await getLiveAiSkillSuggestions({
            roleTitle,
            categoryName: cat.categoryName,
            currentInput: query,
            existingSkills: cat.skills,
            jobDescription: jdText,
          });
          setInlineSuggestions(prev => ({ ...prev, [cat.id]: suggestions }));
        } else {
          setInlineSuggestions(prev => ({ ...prev, [cat.id]: [] }));
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [newSkillInput, roleTitle, jdText, skills]);

  const handleAddSkillTag = (catId: string, skillName?: string) => {
    const text = (skillName || newSkillInput[catId])?.trim();
    if (!text) return;

    const category = skills.find((c) => c.id === catId);
    if (category) {
      if (category.skills.some((s) => s.toLowerCase() === text.toLowerCase())) {
        toast.info('Already Added', `"${text}" is already in this category.`);
        return;
      }
      updateSkillCategory(catId, {
        skills: [...category.skills, text],
      });
      setNewSkillInput({ ...newSkillInput, [catId]: '' });
      // Remove from inline suggestions
      setInlineSuggestions(prev => ({
        ...prev,
        [catId]: (prev[catId] || []).filter(s => s.toLowerCase() !== text.toLowerCase()),
      }));
      toast.success('Skill Added', `Added "${text}" to ${category.categoryName}.`);
    }
  };

  const handleFetchCategoryAiSuggestions = async (catId: string) => {
    const category = skills.find((c) => c.id === catId);
    if (!category) return;

    setLoadingCategoryAi(prev => ({ ...prev, [catId]: true }));
    try {
      const suggestions = await getLiveAiSkillSuggestions({
        roleTitle,
        categoryName: category.categoryName,
        currentInput: newSkillInput[catId] || '',
        existingSkills: category.skills,
        jobDescription: jdText,
      });

      if (suggestions.length > 0) {
        setInlineSuggestions(prev => ({ ...prev, [catId]: suggestions }));
        toast.success(
          isGeminiConnected ? 'Gemini 2.5 Suggestions' : 'Skills Suggested',
          `Found ${suggestions.length} relevant competencies for "${category.categoryName}".`
        );
      } else {
        toast.info('No new skills found', 'You already have all top recommended skills for this category.');
      }
    } catch {
      toast.error('AI Error', 'Could not retrieve skill suggestions.');
    } finally {
      setLoadingCategoryAi(prev => ({ ...prev, [catId]: false }));
    }
  };

  const handleRemoveSkillTag = (catId: string, skillIdx: number) => {
    const category = skills.find((c) => c.id === catId);
    if (category) {
      const removed = category.skills[skillIdx];
      updateSkillCategory(catId, {
        skills: category.skills.filter((_, i) => i !== skillIdx),
      });
      toast.info('Skill Removed', `Removed "${removed}".`);
    }
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (skills.length === 0) {
      addSkillCategory();
      toast.info('Category Created', 'Created a skills category.');
      return;
    }
    const firstCat = skills[0];
    const existing = new Set(firstCat.skills.map((s) => s.toLowerCase().trim()));
    if (!existing.has(skill.toLowerCase().trim())) {
      updateSkillCategory(firstCat.id, {
        skills: [...firstCat.skills, skill],
      });
      toast.success('Suggested Skill Added', `"${skill}" added to ${firstCat.categoryName}.`);
    } else {
      toast.info('Already Present', `"${skill}" is already in your skills.`);
    }
  };

  const handleAddAllSuggestedSkills = () => {
    if (skills.length === 0) {
      addSkillCategory();
      return;
    }
    const firstCat = skills[0];
    const existing = new Set(firstCat.skills.map((s) => s.toLowerCase().trim()));
    const toAdd = suggestedSkillsList.filter((s) => !existing.has(s.toLowerCase().trim()));

    if (toAdd.length > 0) {
      updateSkillCategory(firstCat.id, {
        skills: [...firstCat.skills, ...toAdd],
      });
      toast.success('All Skills Added', `Added ${toAdd.length} suggested skills.`);
    } else {
      toast.info('All Present', 'All suggested skills are already in your list.');
    }
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      {/* Header with Gemini Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Skills & Competencies
            </h2>
            {isGeminiConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 2.5 Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400" title="Connect API key in top-right for Google Gemini integration">
                <KeyRound className="w-3 h-3 text-amber-400" />
                Gemini Ready
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time AI suggestions based on <strong className="text-slate-300">"{roleTitle}"</strong> and what you type.
          </p>
        </div>
        <button
          onClick={() => {
            addSkillCategory();
            toast.success('Category Added', 'New skill group created.');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-xs space-y-2">
          <p>No skill categories created yet.</p>
          <button
            onClick={addSkillCategory}
            className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-lg border border-blue-900/60 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Create Technical Skills Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((cat) => {
            const hasSuggestions = (inlineSuggestions[cat.id] || []).length > 0;
            const isLoadingThis = loadingCategoryAi[cat.id];

            return (
              <div key={cat.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cat.categoryName}
                    onChange={(e) => updateSkillCategory(cat.id, { categoryName: e.target.value })}
                    placeholder="e.g. Technical & Professional Skills, Cloud, Tools"
                    className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-3/4"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFetchCategoryAiSuggestions(cat.id)}
                      disabled={isLoadingThis}
                      className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-900/50 px-2 py-1 rounded-lg transition disabled:opacity-50"
                      title="AI suggest skills for this category"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-purple-400" />
                      )}
                      <span>AI Suggest</span>
                    </button>
                    <button
                      onClick={() => {
                        deleteSkillCategory(cat.id);
                        toast.info('Category Removed', `Deleted ${cat.categoryName}.`);
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Skill Tag Cloud */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-slate-950/40 rounded-xl border border-slate-800/40">
                  {cat.skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic p-1">No skills added yet in this group. Type below or click AI suggestions.</span>
                  ) : (
                    cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-medium group hover:border-slate-600 transition"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => handleRemoveSkillTag(cat.id, sIdx)}
                          className="text-slate-400 hover:text-rose-400 transition"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Skill Input with Real-time AI Assistant */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newSkillInput[cat.id] || ''}
                        onChange={(e) => setNewSkillInput({ ...newSkillInput, [cat.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkillTag(cat.id);
                          }
                        }}
                        placeholder={`Type a skill (e.g. ${roleTitle.includes('Support') ? 'Active Directory, ServiceNow, PowerShell' : 'React, Docker, Python'})...`}
                        className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleAddSkillTag(cat.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-sm active:scale-98"
                    >
                      Add Tag
                    </button>
                  </div>

                  {/* Real-time Inline AI Suggestions as user types */}
                  {hasSuggestions && (
                    <div className="p-2.5 bg-purple-950/20 border border-purple-900/40 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          {isGeminiConnected ? 'Gemini 2.5 Suggestions' : 'AI Suggestions for "' + (newSkillInput[cat.id] || roleTitle) + '"'}
                        </span>
                        <span className="text-[10px] text-slate-500">Click to add instantly</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {inlineSuggestions[cat.id].map((suggested, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAddSkillTag(cat.id, suggested)}
                            className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-800/60 text-xs font-medium transition active:scale-95"
                          >
                            <Plus className="w-3 h-3 text-purple-400 group-hover:scale-125 transition-transform" />
                            <span>{suggested}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Skills Banner from Job Target */}
      {suggestedSkillsList.length > 0 && (
        <div className="bg-emerald-950/25 border border-emerald-900/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-emerald-300">
                Recommended Skills for "{roleTitle}" ({suggestedSkillsList.length})
              </h3>
            </div>
            <button
              onClick={handleAddAllSuggestedSkills}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition"
            >
              Add All to Skills
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkillsList.map((skill, idx) => (
              <button
                key={idx}
                onClick={() => handleAddSuggestedSkill(skill)}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-200 border border-emerald-800/50 text-xs font-medium transition"
              >
                <Plus className="w-3 h-3 text-emerald-400 group-hover:scale-125 transition-transform" />
                <span>{skill}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


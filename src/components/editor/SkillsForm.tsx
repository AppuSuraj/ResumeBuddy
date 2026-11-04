import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { getLiveAiSkillSuggestions, hasApiKey } from '../../services/aiService';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  X, 
  Sparkles, 
  Loader2, 
  KeyRound, 
  Bot, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  FolderTree,
  SlidersHorizontal
} from 'lucide-react';

const DOMAIN_CATEGORIES = [
  'Role Recommended',
  'Tech & Cloud',
  'Data & AI',
  'Design',
  'Leadership & Agile',
  'Marketing & Sales',
] as const;

type DomainCategory = typeof DOMAIN_CATEGORIES[number];

const CURATED_DOMAIN_SKILLS: Record<Exclude<DomainCategory, 'Role Recommended'>, string[]> = {
  'Tech & Cloud': [
    'React', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'AWS', 'Docker',
    'Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'REST APIs', 'PostgreSQL',
    'Redis', 'Microservices', 'Git & GitHub', 'Terraform', 'System Architecture'
  ],
  'Data & AI': [
    'Python', 'SQL', 'Machine Learning', 'Data Pipelines', 'Pandas',
    'Tableau', 'Power BI', 'ETL Processes', 'BigQuery', 'Snowflake',
    'TensorFlow', 'LLMs & Prompting', 'Vector Databases', 'Apache Spark', 'Statistical Analysis'
  ],
  'Design': [
    'Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping',
    'User Research', 'Usability Testing', 'Interaction Design', 'Responsive Web Design',
    'Information Architecture', 'Mobile App Design', 'Tailwind CSS'
  ],
  'Leadership & Agile': [
    'Agile & Scrum', 'Cross-Functional Leadership', 'Sprint Planning',
    'Stakeholder Management', 'Product Roadmapping', 'Mentorship & Coaching',
    'OKRs & KPI Tracking', 'Risk Mitigation', 'Resource Allocation', 'Process Optimization'
  ],
  'Marketing & Sales': [
    'SEO & Content Strategy', 'Google Analytics 4', 'Conversion Rate Optimization',
    'Growth Marketing', 'B2B Sales Pipeline', 'CRM (Salesforce / HubSpot)',
    'A/B Testing', 'Email Automation', 'Customer Retention', 'Paid Search / SEM'
  ],
};

export const SkillsForm: React.FC = () => {
  const { 
    resumeData, 
    setResumeData,
    updateSkillCategory, 
    addSkillCategory, 
    deleteSkillCategory,
    setActiveTab,
    recentlyAddedSkills 
  } = useResume();
  const { skills, jobTarget, personal } = resumeData;
  const toast = useToast();

  const [standaloneInput, setStandaloneInput] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('Role Recommended');
  const [showCategoryOrganizer, setShowCategoryOrganizer] = useState<boolean>(skills.length > 1);
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

  // Get flat list and lowercase set of all currently existing skills
  const allCurrentSkills = skills.flatMap((cat) => cat.skills);
  const existingSkillsSet = new Set(allCurrentSkills.map((s) => s.toLowerCase().trim()));

  // Role-specific recommendation generator
  const getRoleRecommendedSkills = (): string[] => {
    const list: string[] = [];
    const rLower = roleTitle.toLowerCase();

    // 1. Prioritize keywords extracted from user's Target Job
    if (jobTarget?.extractedKeywords && jobTarget.extractedKeywords.length > 0) {
      jobTarget.extractedKeywords.slice(0, 8).forEach(k => {
        if (!list.includes(k)) list.push(k);
      });
    }

    // 2. Role-specific heuristics
    if (rLower.includes('engineer') || rLower.includes('developer') || rLower.includes('full stack') || rLower.includes('software')) {
      ['TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'CI/CD Pipelines', 'System Design'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('frontend') || rLower.includes('web')) {
      ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Web Performance', 'Responsive Design', 'Git'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('backend') || rLower.includes('cloud')) {
      ['Node.js', 'Python', 'PostgreSQL', 'REST APIs', 'Microservices', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Database Indexing'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('support') || rLower.includes('it') || rLower.includes('desk') || rLower.includes('specialist') || rLower.includes('administrator')) {
      ['Active Directory', 'ServiceNow', 'Office 365', 'ITIL Framework', 'PowerShell', 'Remote Desktop (RDP)', 'TCP/IP & DNS', 'Ticketing Systems', 'MFA / RSA', 'Hardware Troubleshooting'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('data') || rLower.includes('analyst') || rLower.includes('analytics')) {
      ['SQL', 'Python', 'Tableau', 'Power BI', 'Data Pipelines', 'Pandas', 'ETL Processes', 'BigQuery', 'Statistical Analysis', 'A/B Testing'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('product') || rLower.includes('project') || rLower.includes('manager')) {
      ['Product Roadmapping', 'Agile & Scrum', 'User Research', 'Cross-Functional Leadership', 'Sprint Planning', 'Stakeholder Management', 'KPIs & OKRs', 'Jira'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else if (rLower.includes('design') || rLower.includes('ux') || rLower.includes('ui')) {
      ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Interaction Design', 'Tailwind CSS'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    } else {
      ['Project Management', 'Cross-Functional Leadership', 'Process Optimization', 'Strategic Planning', 'Data Analysis', 'Stakeholder Communication', 'Agile Methodologies', 'Budgeting'].forEach(s => {
        if (!list.includes(s)) list.push(s);
      });
    }

    return list.slice(0, 12);
  };

  const currentDisplayRecommendations = selectedDomain === 'Role Recommended'
    ? getRoleRecommendedSkills()
    : CURATED_DOMAIN_SKILLS[selectedDomain] || [];

  // Standalone skill addition (unbundled from mandatory categories)
  const handleAddStandaloneSkill = (rawText?: string) => {
    const textToAdd = (rawText || standaloneInput).trim();
    if (!textToAdd) return;

    // Support comma-separated batch input (e.g., "React, TypeScript, Next.js")
    const skillsToInsert = textToAdd
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsToInsert.length === 0) return;

    if (skills.length === 0) {
      // Create initial default category if none exists
      const newCategory = {
        id: `skill-${Date.now()}`,
        categoryName: 'Technical & Professional Skills',
        skills: skillsToInsert,
      };
      setResumeData((prev) => ({
        ...prev,
        skills: [newCategory],
      }));
      setStandaloneInput('');
      toast.success('Skills Added', `Added ${skillsToInsert.length} skill(s) to your resume.`);
      return;
    }

    // Append to primary category (skills[0])
    const primaryCat = skills[0];
    const catExistingSet = new Set(primaryCat.skills.map((s) => s.toLowerCase().trim()));
    const newItems = skillsToInsert.filter((s) => !catExistingSet.has(s.toLowerCase().trim()));

    if (newItems.length > 0) {
      updateSkillCategory(primaryCat.id, {
        skills: [...primaryCat.skills, ...newItems],
      });
      toast.success(
        'Skill Added',
        newItems.length === 1 ? `Added "${newItems[0]}".` : `Added ${newItems.length} skills.`
      );
    } else {
      toast.info('Already Added', `Skill is already present in your competencies.`);
    }

    setStandaloneInput('');
  };

  const handleAddAllMissingRecommendations = () => {
    const missing = currentDisplayRecommendations.filter(
      (s) => !existingSkillsSet.has(s.toLowerCase().trim())
    );
    if (missing.length === 0) {
      toast.info('All Competencies Active', 'You already have all recommended skills in this list.');
      return;
    }
    handleAddStandaloneSkill(missing.join(', '));
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    // Remove from whichever category contains it
    let removed = false;
    skills.forEach((cat) => {
      const idx = cat.skills.findIndex((s) => s.toLowerCase() === skillNameToRemove.toLowerCase());
      if (idx !== -1) {
        updateSkillCategory(cat.id, {
          skills: cat.skills.filter((_, i) => i !== idx),
        });
        removed = true;
      }
    });
    if (removed) {
      toast.info('Skill Removed', `Removed "${skillNameToRemove}".`);
    }
  };

  // Category-specific AI helpers
  const handleAddSkillToSpecificCategory = (catId: string, skillName?: string) => {
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
      setInlineSuggestions((prev) => ({
        ...prev,
        [catId]: (prev[catId] || []).filter((s) => s.toLowerCase() !== text.toLowerCase()),
      }));
      toast.success('Skill Added', `Added "${text}" to ${category.categoryName}.`);
    }
  };

  const handleFetchCategoryAiSuggestions = async (catId: string) => {
    const category = skills.find((c) => c.id === catId);
    if (!category) return;

    setLoadingCategoryAi((prev) => ({ ...prev, [catId]: true }));
    try {
      const suggestions = await getLiveAiSkillSuggestions({
        roleTitle,
        categoryName: category.categoryName,
        currentInput: newSkillInput[catId] || '',
        existingSkills: category.skills,
        jobDescription: jdText,
      });

      if (suggestions.length > 0) {
        setInlineSuggestions((prev) => ({ ...prev, [catId]: suggestions }));
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
      setLoadingCategoryAi((prev) => ({ ...prev, [catId]: false }));
    }
  };

  return (
    <div className="p-4 space-y-5 text-slate-200">
      {/* Header with Gemini Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Skills & Core Competencies
            </h2>
            {isGeminiConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini 2.5 Active
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-400"
                title="Connect API key in top-right for Google Gemini integration"
              >
                <KeyRound className="w-3 h-3 text-amber-400" />
                Gemini Ready
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Role: <strong className="text-slate-200">"{roleTitle}"</strong> • Real-time ATS match scoring.
          </p>
        </div>
      </div>

      {/* 1. Fast Standalone Skill Input (Unbundled Category Requirement) */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Skills (Press Enter or comma separated)</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {allCurrentSkills.length} active competencies on resume
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={standaloneInput}
              onChange={(e) => setStandaloneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddStandaloneSkill();
                }
              }}
              placeholder="e.g. React, TypeScript, Docker, CI/CD, Agile..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddStandaloneSkill()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        </div>

        {/* Active Skills Tag Cloud */}
        {allCurrentSkills.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {allCurrentSkills.map((skill, sIdx) => {
                const isRecentlyAdded = recentlyAddedSkills?.includes(skill.trim().toLowerCase());
                return (
                  <span
                    key={`${skill}-${sIdx}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isRecentlyAdded
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/70 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <span>{skill}</span>
                    {isRecentlyAdded && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded animate-pulse">
                        New
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-400 transition ml-0.5 cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Dynamic "Recommended for Your Target Role" Chip Cloud */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Recommended for</span>
                <span className="text-emerald-300 font-semibold truncate max-w-[200px]">"{roleTitle}"</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Click any competency to add directly to your resume.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddAllMissingRecommendations}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition cursor-pointer self-start sm:self-auto"
          >
            + Add All Missing to Resume
          </button>
        </div>

        {/* Quick Domain Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {DOMAIN_CATEGORIES.map((domain) => {
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>

        {/* Interactive Chip Cloud */}
        <div className="flex flex-wrap gap-2 pt-1">
          {currentDisplayRecommendations.map((recSkill) => {
            const isAdded = existingSkillsSet.has(recSkill.toLowerCase().trim());
            return isAdded ? (
              <span
                key={recSkill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 text-xs font-semibold shadow-sm select-none"
                title="Already added to your resume"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{recSkill}</span>
              </span>
            ) : (
              <button
                key={recSkill}
                type="button"
                onClick={() => handleAddStandaloneSkill(recSkill)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-950/70 text-slate-200 hover:text-blue-200 border border-slate-700/80 hover:border-blue-600/70 text-xs font-medium transition active:scale-95 cursor-pointer shadow-sm"
                title={`Click to add "${recSkill}" to resume`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:scale-125 transition-transform shrink-0" />
                <span>{recSkill}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Collapsible Custom Categories Organizer (Optional) */}
      <div className="border border-slate-800/80 rounded-2xl bg-slate-950/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCategoryOrganizer(!showCategoryOrganizer)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-slate-900/50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-bold text-white">
                Organize by Custom Categories (Optional)
              </span>
              <p className="text-[11px] text-slate-400">
                Group skills into structured blocks (e.g. "Languages", "Cloud & Tools", "Soft Skills").
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              {skills.length} {skills.length === 1 ? 'Group' : 'Groups'}
            </span>
            {showCategoryOrganizer ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {showCategoryOrganizer && (
          <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-900/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Manage categories and skill groupings:</span>
              <button
                type="button"
                onClick={() => {
                  addSkillCategory();
                  toast.success('Category Added', 'Created new skill group.');
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category Group</span>
              </button>
            </div>

            {skills.map((cat) => {
              const hasSuggestions = (inlineSuggestions[cat.id] || []).length > 0;
              const isLoadingThis = loadingCategoryAi[cat.id];

              return (
                <div
                  key={cat.id}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cat.categoryName}
                      onChange={(e) => updateSkillCategory(cat.id, { categoryName: e.target.value })}
                      placeholder="Category Title (e.g. Cloud Infrastructure)"
                      className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex-1 max-w-sm"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFetchCategoryAiSuggestions(cat.id)}
                        disabled={isLoadingThis}
                        className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-900/50 px-2 py-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        title="AI suggest skills for this specific category"
                      >
                        {isLoadingThis ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-purple-400" />
                        )}
                        <span>AI Suggest</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteSkillCategory(cat.id);
                          toast.info('Category Removed', `Deleted ${cat.categoryName}.`);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skills tags in this category */}
                  <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 bg-slate-950/50 rounded-xl border border-slate-800/60">
                    {cat.skills.length === 0 ? (
                      <span className="text-xs text-slate-500 italic p-1">
                        No skills in this category. Type below to add.
                      </span>
                    ) : (
                      cat.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700/80"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateSkillCategory(cat.id, {
                                skills: cat.skills.filter((_, i) => i !== sIdx),
                              });
                            }}
                            className="text-slate-400 hover:text-rose-400 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add skill specifically to this category */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput[cat.id] || ''}
                      onChange={(e) => setNewSkillInput({ ...newSkillInput, [cat.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkillToSpecificCategory(cat.id);
                        }
                      }}
                      placeholder={`Add skill to "${cat.categoryName}"...`}
                      className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkillToSpecificCategory(cat.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Category-specific AI Inline Suggestions */}
                  {hasSuggestions && (
                    <div className="p-2.5 bg-purple-950/20 border border-purple-900/40 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                          <Bot className="w-3.5 h-3.5 text-purple-400" />
                          <span>AI Suggestions for "{cat.categoryName}"</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Click to add</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {inlineSuggestions[cat.id].map((suggested, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddSkillToSpecificCategory(cat.id, suggested)}
                            className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-800/60 text-xs font-medium transition active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-purple-400 group-hover:scale-125 transition-transform" />
                            <span>{suggested}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Navigation Button to Next Section */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Step 5 of 7: Core Competencies</span>
        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          <span>Next: Education History</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

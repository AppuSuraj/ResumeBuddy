import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { getSuggestedSkills } from '../../services/aiService';
import { Wrench, Plus, Trash2, X, Sparkles, Check } from 'lucide-react';

export const SkillsForm: React.FC = () => {
  const { resumeData, updateSkillCategory, addSkillCategory, deleteSkillCategory } = useResume();
  const { skills } = resumeData;
  const toast = useToast();

  const [newSkillInput, setNewSkillInput] = useState<{ [catId: string]: string }>({});

  const suggestedSkillsList = getSuggestedSkills(resumeData);

  const handleAddSkillTag = (catId: string) => {
    const text = newSkillInput[catId]?.trim();
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
      toast.success('Skill Added', `Added "${text}" to ${category.categoryName}.`);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-400" />
            Skills & Competencies
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize technical competencies, frameworks, tools, and soft skills into categories.
          </p>
        </div>
        <button
          onClick={() => {
            addSkillCategory();
            toast.success('Category Added', 'New skill group created.');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
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
          {skills.map((cat) => (
            <div key={cat.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={cat.categoryName}
                  onChange={(e) => updateSkillCategory(cat.id, { categoryName: e.target.value })}
                  placeholder="e.g. Languages & Frameworks, Cloud & DevOps, Management"
                  className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-3/4"
                />
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

              {/* Skill Tag Cloud */}
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((skill, sIdx) => (
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
                ))}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2 pt-1">
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
                  placeholder="Type a skill and press Enter (e.g. React, Docker, Python)..."
                  className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button
                  onClick={() => handleAddSkillTag(cat.id)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold rounded-xl border border-slate-700/80 transition"
                >
                  Add Tag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Skills Banner */}
      {suggestedSkillsList.length > 0 && (
        <div className="bg-emerald-950/25 border border-emerald-900/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-emerald-300">
                Recommended Skills for Your Target Role ({suggestedSkillsList.length})
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

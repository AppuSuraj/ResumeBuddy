import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { generateAiBullets } from '../../services/aiService';
import { WorkExperience } from '../../types/resume';
import { Briefcase, Plus, Trash2, ChevronUp, ChevronDown, Sparkles, Wand2, X, Check } from 'lucide-react';

export const ExperienceForm: React.FC = () => {
  const { resumeData, updateExperienceItem, addExperienceItem, deleteExperienceItem, reorderExperience } = useResume();
  const { experience, jobTarget } = resumeData;
  const toast = useToast();

  // State for AI bullet drawer
  const [activeAiExpId, setActiveAiExpId] = useState<string | null>(null);
  const [activeBulletIndex, setActiveBulletIndex] = useState<number | null>(null);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [selectedBullets, setSelectedBullets] = useState<string[]>([]);
  const [currentDraftText, setCurrentDraftText] = useState<string>('');

  const openAiBulletsModal = async (exp: WorkExperience, currentText?: string, bulletIndex?: number) => {
    setActiveAiExpId(exp.id);
    setActiveBulletIndex(bulletIndex ?? null);
    setCurrentDraftText(currentText || '');
    setIsGeneratingBullets(true);
    setGeneratedBullets([]);
    setSelectedBullets([]);

    try {
      const bullets = await generateAiBullets(
        exp.jobTitle || 'Role',
        exp.company || 'Company',
        jobTarget.jobDescriptionText,
        currentText
      );
      setGeneratedBullets(bullets);
      if (bulletIndex !== undefined && bulletIndex !== null && bullets.length > 0) {
        setSelectedBullets([bullets[0]]);
      } else {
        setSelectedBullets(bullets);
      }
    } catch (e) {
      console.error('Failed to generate bullets:', e);
      toast.error('AI Generator Error', 'Could not generate bullet points.');
    } finally {
      setIsGeneratingBullets(false);
    }
  };

  const handleApplySelectedBullets = (expId: string) => {
    const exp = experience.find((e) => e.id === expId);
    if (exp && selectedBullets.length > 0) {
      if (activeBulletIndex !== null) {
        const updated = [...exp.highlights];
        updated[activeBulletIndex] = selectedBullets[0];
        updated.splice(activeBulletIndex + 1, 0, ...selectedBullets.slice(1));
        updateExperienceItem(expId, { highlights: updated });
        toast.success('Bullet Enhanced', 'Updated achievement with AI-crafted metric bullet.');
      } else {
        updateExperienceItem(expId, {
          highlights: [...exp.highlights, ...selectedBullets],
        });
        toast.success('Bullets Added', `Added ${selectedBullets.length} AI achievement bullets.`);
      }
    }
    setActiveAiExpId(null);
    setActiveBulletIndex(null);
  };

  const toggleBulletSelection = (bullet: string) => {
    if (selectedBullets.includes(bullet)) {
      setSelectedBullets(selectedBullets.filter((b) => b !== bullet));
    } else {
      setSelectedBullets([...selectedBullets, bullet]);
    }
  };

  const handleAddExperience = () => {
    addExperienceItem();
    toast.success('Role Added', 'New work experience entry created.');
  };

  const handleDeleteExperience = (id: string, roleName: string) => {
    deleteExperienceItem(id);
    toast.info('Role Deleted', `Removed ${roleName || 'work experience entry'}.`);
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            Work Experience
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Highlight quantifiable achievements, metrics, and leadership impact.
          </p>
        </div>
        <button
          onClick={handleAddExperience}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-xs space-y-2">
          <p>No work experience added yet.</p>
          <button
            onClick={handleAddExperience}
            className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-lg border border-blue-900/60 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Your First Role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div key={exp.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="font-bold text-xs text-white truncate max-w-[220px]">
                  {exp.jobTitle || 'Untitled Position'} {exp.company ? `@ ${exp.company}` : ''}
                </div>
                <div className="flex items-center gap-1">
                  {index > 0 && (
                    <button
                      onClick={() => reorderExperience(index, index - 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < experience.length - 1 && (
                    <button
                      onClick={() => reorderExperience(index, index + 1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteExperience(exp.id, exp.jobTitle)}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 ml-1 transition"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={exp.jobTitle}
                    onChange={(e) => updateExperienceItem(exp.id, { jobTitle: e.target.value })}
                    placeholder="Senior Software Engineer"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperienceItem(exp.id, { company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperienceItem(exp.id, { location: e.target.value })}
                    placeholder="San Francisco, CA (or Remote)"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperienceItem(exp.id, { startDate: e.target.value })}
                      placeholder="2021-03"
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date</label>
                    <input
                      type="text"
                      disabled={exp.isCurrent}
                      value={exp.isCurrent ? 'Present' : exp.endDate}
                      onChange={(e) => updateExperienceItem(exp.id, { endDate: e.target.value })}
                      placeholder="2023-08"
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Current Role Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.isCurrent}
                  onChange={(e) => updateExperienceItem(exp.id, { isCurrent: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-300 cursor-pointer">
                  I currently work in this position
                </label>
              </div>

              {/* Highlights / Responsibilities section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Achievements & Responsibilities
                  </label>
                  <button
                    onClick={() => openAiBulletsModal(exp)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-300 bg-blue-950/70 hover:bg-blue-900 border border-blue-800/80 rounded-lg transition"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    AI Generate Bullets
                  </button>
                </div>

                {/* Bullets List */}
                <div className="space-y-2">
                  {exp.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex gap-2 items-start group">
                      <span className="text-blue-400 font-bold text-xs mt-2">•</span>
                      <textarea
                        rows={2}
                        value={hl}
                        onChange={(e) => {
                          const updated = [...exp.highlights];
                          updated[hIdx] = e.target.value;
                          updateExperienceItem(exp.id, { highlights: updated });
                        }}
                        className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      />
                      <div className="flex flex-col gap-1 mt-1">
                        <button
                          onClick={() => openAiBulletsModal(exp, hl, hIdx)}
                          title="AI Polish this bullet"
                          className="p-1.5 text-blue-400 hover:text-blue-200 hover:bg-blue-900/40 rounded-lg transition opacity-60 group-hover:opacity-100"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = exp.highlights.filter((_, i) => i !== hIdx);
                            updateExperienceItem(exp.id, { highlights: updated });
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition opacity-60 group-hover:opacity-100"
                          title="Delete Bullet"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      updateExperienceItem(exp.id, {
                        highlights: [...exp.highlights, ''],
                      });
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 pt-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Bullet Suggestions Modal */}
      {activeAiExpId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                AI Bullet Point Generator
              </h3>
              <button onClick={() => setActiveAiExpId(null)} className="text-slate-400 hover:text-white p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isGeneratingBullets ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  {activeBulletIndex !== null ? 'Enhancing bullet point with action verbs & metrics...' : 'Generating achievement-driven metric bullets...'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Select the bullet points you wish to include in your resume:
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {generatedBullets.map((bullet, idx) => {
                    const isSelected = selectedBullets.includes(bullet);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleBulletSelection(bullet)}
                        className={`p-3 rounded-xl border text-xs leading-relaxed cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-500/80 text-blue-100 ring-1 ring-blue-500/30'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border text-xs shrink-0 transition ${
                              isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="flex-1">{bullet}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setActiveAiExpId(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApplySelectedBullets(activeAiExpId)}
                    disabled={selectedBullets.length === 0}
                    className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    Add Selected Bullets ({selectedBullets.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

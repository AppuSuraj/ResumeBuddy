import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

export const EducationForm: React.FC = () => {
  const { resumeData, updateEducationItem, addEducationItem, deleteEducationItem } = useResume();
  const { education } = resumeData;
  const toast = useToast();

  const handleAdd = () => {
    addEducationItem();
    toast.success('Education Added', 'New education entry created.');
  };

  const handleDelete = (id: string, name: string) => {
    deleteEducationItem(id);
    toast.info('Education Deleted', `Removed ${name || 'entry'}.`);
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            Education History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Degrees, academic institutions, graduation dates, and relevant honors.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-xs space-y-2">
          <p>No education history added yet.</p>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-lg border border-blue-900/60 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Degree
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="font-bold text-xs text-white truncate max-w-[240px]">
                  {edu.degree || 'Untitled Degree'} {edu.institution ? `• ${edu.institution}` : ''}
                </div>
                <button
                  onClick={() => handleDelete(edu.id, edu.degree)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Degree / Major</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducationItem(edu.id, { degree: e.target.value })}
                    placeholder="B.S. in Computer Science"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Institution / University</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducationItem(edu.id, { institution: e.target.value })}
                    placeholder="University of California, Berkeley"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={edu.location || ''}
                    onChange={(e) => updateEducationItem(edu.id, { location: e.target.value })}
                    placeholder="Berkeley, CA"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Year</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => updateEducationItem(edu.id, { startDate: e.target.value })}
                      placeholder="2018"
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => updateEducationItem(edu.id, { endDate: e.target.value })}
                      placeholder="2022"
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">GPA / Honors / Key Coursework (Optional)</label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducationItem(edu.id, { gpa: e.target.value })}
                  placeholder="GPA: 3.8 / 4.0 • Magna Cum Laude • Dean's Honor List"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

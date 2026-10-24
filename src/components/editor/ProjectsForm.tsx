import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { FolderGit2, Plus, Trash2, ExternalLink } from 'lucide-react';

export const ProjectsForm: React.FC = () => {
  const { resumeData, updateProjectItem, addProjectItem, deleteProjectItem } = useResume();
  const { projects } = resumeData;
  const toast = useToast();

  const handleAdd = () => {
    addProjectItem();
    toast.success('Project Added', 'New portfolio project entry created.');
  };

  const handleDelete = (id: string, name: string) => {
    deleteProjectItem(id);
    toast.info('Project Deleted', `Removed ${name || 'project'}.`);
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-blue-400" />
            Featured Projects
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrate real-world application of your skills, tech stack, and results.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-xs space-y-2">
          <p>No projects added yet.</p>
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-lg border border-blue-900/60 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="font-bold text-xs text-white truncate max-w-[240px]">
                  {proj.name || 'Untitled Project'}
                </div>
                <button
                  onClick={() => handleDelete(proj.id, proj.name)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProjectItem(proj.id, { name: e.target.value })}
                    placeholder="OmniDash Real-time Analytics"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={proj.techStack ? proj.techStack.join(', ') : ''}
                    onChange={(e) =>
                      updateProjectItem(proj.id, {
                        techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="React, TypeScript, Node.js, PostgreSQL"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Project Description & Outcomes
                </label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProjectItem(proj.id, { description: e.target.value })}
                  placeholder="Built an analytics dashboard tracking 100k+ events/sec; optimized query response times by 40%."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

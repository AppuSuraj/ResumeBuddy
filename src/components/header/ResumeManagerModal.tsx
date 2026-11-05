import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { X, Plus, Copy, Trash2, Edit3, Check, Layers, Clock, GitBranch } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeManagerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { resumes, currentResumeId, createNewResume, switchResume, deleteResume, duplicateResume, branchResume, renameResume } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [branchingId, setBranchingId] = useState<string | null>(null);
  const [branchRoleInput, setBranchRoleInput] = useState('');
  const toast = useToast();

  if (!isOpen) return null;

  const handleRenameStart = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleRenameSave = (id: string) => {
    if (editTitle.trim()) {
      renameResume(id, editTitle.trim());
      toast.success('Resume Renamed', `Updated title to "${editTitle.trim()}".`);
    }
    setEditingId(null);
  };

  const handleDuplicate = (id: string, title: string) => {
    duplicateResume(id);
    toast.success('Resume Duplicated', `Created a copy of "${title}".`);
  };

  const handleStartBranch = (id: string, currentTargetRole?: string) => {
    setBranchingId(id);
    setBranchRoleInput(currentTargetRole || '');
  };

  const handleConfirmBranch = (id: string) => {
    if (!branchRoleInput.trim()) {
      toast.error('Role Required', 'Please enter a target role title for this branch.');
      return;
    }
    branchResume(id, branchRoleInput.trim());
    toast.success('Version Branched', `Created targeted profile for "${branchRoleInput.trim()}".`);
    setBranchingId(null);
    setBranchRoleInput('');
    onClose();
  };

  const handleDelete = (id: string, title: string) => {
    deleteResume(id);
    toast.info('Resume Deleted', `Removed "${title}".`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              My Resumes & Targeted Branches
              <span className="bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono border border-blue-200 dark:border-blue-500/20 font-semibold">
                {resumes.length} saved
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage version branches per target role (e.g. Frontend Lead vs Engineering Manager).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                createNewResume('Targeted Resume');
                toast.success('New Resume Created', 'Started a fresh resume profile.');
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Resume
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-2.5">
          {resumes.map((resume) => {
            const isActive = resume.id === currentResumeId;
            const isEditing = editingId === resume.id;
            const isBranching = branchingId === resume.id;
            const dateStr = new Date(resume.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={resume.id}
                className={`rounded-2xl border transition-all shadow-xs ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/60 shadow-sm shadow-blue-500/10'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex-1 min-w-0 pr-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(resume.id)}
                          className="bg-white dark:bg-slate-950 border border-blue-500 text-slate-900 dark:text-white px-2.5 py-1 rounded-lg text-xs w-64 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameSave(resume.id)}
                          className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-xs truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                          {resume.title}
                        </h3>
                        <button
                          onClick={() => handleRenameStart(resume.id, resume.title)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                          title="Rename"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        {isActive && (
                          <span className="bg-blue-600 text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        {resume.targetRoleBranch && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 font-semibold font-mono">
                            <GitBranch className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Branch: {resume.targetRoleBranch}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="truncate max-w-[200px]">
                        Target: <span className="text-slate-700 dark:text-slate-300 font-medium">{resume.jobTarget?.targetRoleTitle || 'General'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" /> {dateStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => {
                          switchResume(resume.id);
                          toast.success('Switched Resume', `Loaded "${resume.title}".`);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl border border-blue-500/30 transition cursor-pointer"
                      >
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => handleStartBranch(resume.id, resume.jobTarget?.targetRoleTitle)}
                      title="Branch version for new target role"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/60 transition cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(resume.id, resume.title)}
                      title="Duplicate Resume"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {resumes.length > 1 && (
                      <button
                        onClick={() => handleDelete(resume.id, resume.title)}
                        title="Delete Resume"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Branching Drawer */}
                {isBranching && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-700/80 rounded-b-2xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        Branch for Target Role
                      </span>
                      <button
                        onClick={() => setBranchingId(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Creates an isolated copy of this resume with its own ATS target and bullet selections while preserving your master bullet history.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={branchRoleInput}
                        onChange={(e) => setBranchRoleInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmBranch(resume.id)}
                        placeholder="e.g. Lead Frontend Architect, Engineering Manager..."
                        className="flex-1 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-700/80 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmBranch(resume.id)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        Create Branch
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

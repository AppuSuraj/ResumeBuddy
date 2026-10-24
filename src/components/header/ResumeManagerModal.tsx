import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { X, Plus, Copy, Trash2, Edit3, Check, Layers, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeManagerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { resumes, currentResumeId, createNewResume, switchResume, deleteResume, duplicateResume, renameResume } = useResume();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
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

  const handleDelete = (id: string, title: string) => {
    deleteResume(id);
    toast.info('Resume Deleted', `Removed "${title}".`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800/80 bg-slate-900/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              My Resumes
              <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-mono border border-blue-500/20">
                {resumes.length} saved
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch between job-targeted resumes or create new variations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                createNewResume('Targeted Resume');
                toast.success('New Resume Created', 'Started a fresh resume profile.');
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
            >
              <Plus className="w-4 h-4" /> New Resume
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
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
            const dateStr = new Date(resume.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={resume.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex-1 min-w-0 pr-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSave(resume.id)}
                        className="bg-slate-950 border border-blue-500 text-white px-2.5 py-1 rounded-lg text-xs w-64 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenameSave(resume.id)}
                        className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {resume.title}
                      </h3>
                      <button
                        onClick={() => handleRenameStart(resume.id, resume.title)}
                        className="p-1 text-slate-500 hover:text-slate-300 transition"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {isActive && (
                        <span className="bg-blue-600 text-white text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="truncate max-w-[200px]">
                      Target: <span className="text-slate-300">{resume.jobTarget?.targetRoleTitle || 'General'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
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
                      className="px-3 py-1.5 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-500/30 transition"
                    >
                      Open
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(resume.id, resume.title)}
                    title="Duplicate Resume"
                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {resumes.length > 1 && (
                    <button
                      onClick={() => handleDelete(resume.id, resume.title)}
                      title="Delete Resume"
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

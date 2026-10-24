import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { 
  Target, 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  FolderGit2, 
  PlusCircle, 
  Palette, 
  LayoutGrid 
} from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { activeTab, setActiveTab, resumeData } = useResume();

  const getSectionStatus = (id: string): boolean => {
    switch (id) {
      case 'target':
        return Boolean(resumeData.jobTarget.targetRoleTitle || resumeData.jobTarget.jobDescriptionText);
      case 'personal':
        return Boolean(resumeData.personal.fullName && resumeData.personal.email);
      case 'summary':
        return Boolean(resumeData.personal.summary && resumeData.personal.summary.length > 20);
      case 'experience':
        return resumeData.experience.length > 0;
      case 'skills':
        return resumeData.skills.some((c) => c.skills.length > 0);
      case 'education':
        return resumeData.education.length > 0;
      case 'projects':
        return resumeData.projects.length > 0;
      case 'custom':
        return resumeData.customSections.length > 0;
      default:
        return false;
    }
  };

  const tabs = [
    { id: 'target', label: 'Target Job', icon: Target },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'custom', label: 'Custom', icon: PlusCircle },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'style', label: 'Styling', icon: Palette },
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-2 py-1.5 flex items-center overflow-x-auto scrollbar-none gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isFilled = getSectionStatus(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isActive
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
            <span>{tab.label}</span>
            {isFilled && !['templates', 'style'].includes(tab.id) && (
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-emerald-500/70'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { activeTab, setActiveTab, resumeData } = useResume();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 15);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

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
    <div className="relative bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="px-2 py-2 flex items-center overflow-x-auto scrollbar-none gap-1.5 scroll-smooth"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFilled = getSectionStatus(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/10'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/60 border border-slate-700/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{tab.label}</span>
              {isFilled && !['templates', 'style'].includes(tab.id) && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Horizontal Scroll Right Gradient Fade Mask & Indicator */}
      {canScrollRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
          <button
            type="button"
            onClick={handleScrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-blue-300 border border-slate-700 shadow-md backdrop-blur-md transition cursor-pointer"
            title="Scroll to view more sections"
          >
            <span>More sections</span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
          </button>
        </>
      )}
    </div>
  );
};

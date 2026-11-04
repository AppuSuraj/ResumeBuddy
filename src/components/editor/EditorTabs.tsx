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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { activeTab, setActiveTab, resumeData } = useResume();
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 15);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Keep active tab visible on change
  useEffect(() => {
    const activeBtn = tabRefs.current[activeTab];
    if (activeBtn && scrollRef.current) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 180, behavior: 'smooth' });
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
      {/* Dynamic Left Gradient Mask & Back Chevron */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
          <button
            type="button"
            onClick={handleScrollLeft}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/90 hover:bg-slate-700 text-blue-300 border border-slate-700 shadow-md backdrop-blur-md transition cursor-pointer"
            title="Scroll back left"
            aria-label="Scroll back to previous sections"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
          </button>
        </>
      )}

      {/* Two-Way Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="px-6 py-2 flex items-center overflow-x-auto overscroll-x-contain scrollbar-none gap-1.5 scroll-smooth"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isFilled = getSectionStatus(tab.id);

          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
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

      {/* Dynamic Right Gradient Mask & Forward Chevron */}
      {canScrollRight && (
        <>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10" />
          <button
            type="button"
            onClick={handleScrollRight}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-slate-800/90 hover:bg-slate-700 text-blue-300 border border-slate-700 shadow-md backdrop-blur-md transition cursor-pointer"
            title="Scroll forward right"
            aria-label="Scroll forward to more sections"
          >
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </button>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { TargetJobPanel } from './TargetJobPanel';
import { PersonalForm } from './PersonalForm';
import { SummaryForm } from './SummaryForm';
import { ExperienceForm } from './ExperienceForm';
import { SkillsForm } from './SkillsForm';
import { EducationForm } from './EducationForm';
import { ProjectsForm } from './ProjectsForm';
import { CustomSectionForm } from './CustomSectionForm';
import { TemplateSelector } from './TemplateSelector';
import { StyleCustomizer } from './StyleCustomizer';
import { 
  Target, 
  User, 
  FileText, 
  Briefcase, 
  Wrench, 
  GraduationCap, 
  FolderGit2, 
  PlusCircle, 
  LayoutGrid, 
  Palette, 
  ChevronDown, 
  CheckCircle2 
} from 'lucide-react';

interface AccordionSection {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactNode;
}

export const MobileAccordionEditor: React.FC = () => {
  const { resumeData, activeTab, setActiveTab } = useResume();
  const [openSectionId, setOpenSectionId] = useState<string>(activeTab || 'personal');

  // Keep accordion expanded section synchronized when navigating via Next Section buttons
  React.useEffect(() => {
    if (activeTab) {
      setOpenSectionId(activeTab);
    }
  }, [activeTab]);

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
      case 'templates':
      case 'style':
        return true;
      default:
        return false;
    }
  };

  const sections: AccordionSection[] = [
    {
      id: 'target',
      label: 'Target Job & ATS Optimizer',
      subtitle: resumeData.jobTarget.targetRoleTitle || 'Match job description & keywords',
      icon: Target,
      component: <TargetJobPanel />,
    },
    {
      id: 'personal',
      label: 'Personal Information',
      subtitle: resumeData.personal.fullName || 'Name, contact, links & location',
      icon: User,
      component: <PersonalForm />,
    },
    {
      id: 'summary',
      label: 'Professional Summary',
      subtitle: 'Career overview & AI elevator pitch',
      icon: FileText,
      component: <SummaryForm />,
    },
    {
      id: 'experience',
      label: 'Work Experience',
      subtitle: `${resumeData.experience.length} roles • Master Bullet Bank`,
      icon: Briefcase,
      component: <ExperienceForm />,
    },
    {
      id: 'skills',
      label: 'Skills & Competencies',
      subtitle: 'Technical, soft & core skills',
      icon: Wrench,
      component: <SkillsForm />,
    },
    {
      id: 'education',
      label: 'Education & Credentials',
      subtitle: `${resumeData.education.length} entries recorded`,
      icon: GraduationCap,
      component: <EducationForm />,
    },
    {
      id: 'projects',
      label: 'Projects & Portfolio',
      subtitle: `${resumeData.projects.length} featured projects`,
      icon: FolderGit2,
      component: <ProjectsForm />,
    },
    {
      id: 'custom',
      label: 'Custom Sections',
      subtitle: 'Certifications, languages & publications',
      icon: PlusCircle,
      component: <CustomSectionForm />,
    },
    {
      id: 'templates',
      label: 'Template Gallery',
      subtitle: 'ATS-Safe single and multi-column designs',
      icon: LayoutGrid,
      component: <TemplateSelector />,
    },
    {
      id: 'style',
      label: 'Styles & Colors',
      subtitle: 'Typography, palette & line height',
      icon: Palette,
      component: <StyleCustomizer />,
    },
  ];

  const handleToggle = (id: string) => {
    const nextId = openSectionId === id ? '' : id;
    setOpenSectionId(nextId);
    if (nextId) {
      setActiveTab(nextId as any);
    }
  };

  return (
    <div className="w-full p-3 space-y-2.5 pb-24">
      {sections.map((section) => {
        const Icon = section.icon;
        const isOpen = openSectionId === section.id;
        const isComplete = getSectionStatus(section.id);

        return (
          <div
            key={section.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
              isOpen
                ? 'bg-white dark:bg-slate-900 border-blue-500/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20'
                : 'bg-white/80 dark:bg-slate-900/70 border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {/* Touch-Friendly Accordion Header Card (Min 48px height) */}
            <button
              type="button"
              onClick={() => handleToggle(section.id)}
              className="w-full min-h-[48px] px-3.5 py-3 flex items-center justify-between text-left transition select-none cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                    isOpen
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {section.label}
                    </span>
                    {isComplete && !['templates', 'style'].includes(section.id) && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {section.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Accordion Body Content */}
            {isOpen && (
              <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-950/60 animate-in fade-in zoom-in-98 duration-150">
                {section.component}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


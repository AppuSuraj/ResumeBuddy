import React, { useState } from 'react';
import { useResume } from './context/ResumeContext';
import { TopNavbar } from './components/header/TopNavbar';
import { JobDescriptionModal } from './components/onboarding/JobDescriptionModal';
import { EditorTabs } from './components/editor/EditorTabs';
import { TargetJobPanel } from './components/editor/TargetJobPanel';
import { PersonalForm } from './components/editor/PersonalForm';
import { SummaryForm } from './components/editor/SummaryForm';
import { ExperienceForm } from './components/editor/ExperienceForm';
import { EducationForm } from './components/editor/EducationForm';
import { SkillsForm } from './components/editor/SkillsForm';
import { ProjectsForm } from './components/editor/ProjectsForm';
import { CustomSectionForm } from './components/editor/CustomSectionForm';
import { TemplateSelector } from './components/editor/TemplateSelector';
import { StyleCustomizer } from './components/editor/StyleCustomizer';
import { TemplateRenderer, TEMPLATE_METADATA } from './components/templates/TemplateRenderer';
import { TemplateId } from './types/resume';
import { ZoomIn, ZoomOut, Maximize2, Eye, Layout, Palette, Edit3 } from 'lucide-react';

const QUICK_COLORS = [
  '#2563eb', // Royal Blue
  '#0d9488', // Teal
  '#7c3aed', // Violet
  '#16a34a', // Emerald Green
  '#e11d48', // Rose
  '#1e3a8a', // Executive Navy
  '#334155', // Midnight Charcoal
];

export const MainApp: React.FC = () => {
  const { resumeData, activeTab, updateStyleConfig } = useResume();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'target':
        return <TargetJobPanel />;
      case 'personal':
        return <PersonalForm />;
      case 'summary':
        return <SummaryForm />;
      case 'experience':
        return <ExperienceForm />;
      case 'education':
        return <EducationForm />;
      case 'skills':
        return <SkillsForm />;
      case 'projects':
        return <ProjectsForm />;
      case 'custom':
        return <CustomSectionForm />;
      case 'templates':
        return <TemplateSelector />;
      case 'style':
        return <StyleCustomizer />;
      default:
        return <TargetJobPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Mobile Screen Switcher Bar (Visible on phones/tablets < md) */}
      <div className="md:hidden flex items-center justify-center px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex bg-slate-950 p-1 rounded-xl w-full max-w-xs border border-slate-800">
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileView === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Form Editor</span>
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              mobileView === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Form Editor Panel */}
        <div className={`w-full md:w-[46%] lg:w-[42%] bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-[calc(100vh-105px)] md:h-[calc(100vh-57px)] ${
          mobileView === 'editor' ? 'flex' : 'hidden md:flex'
        }`}>
          <EditorTabs />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {renderActiveTabContent()}
          </div>
        </div>

        {/* Right Side: Live WYSIWYG Resume Preview */}
        <div className={`w-full md:w-[54%] lg:w-[58%] bg-slate-950 flex flex-col h-[calc(100vh-105px)] md:h-[calc(100vh-57px)] relative overflow-hidden ${
          mobileView === 'preview' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Live Preview Controls Header */}
          <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex items-center justify-between z-10 gap-3">
            {/* Left: Quick Template Selector & Page Format Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Preview</span>
              </div>

              {/* Quick Template Switcher Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200">
                <Layout className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={resumeData.style.templateId}
                  onChange={(e) => updateStyleConfig({ templateId: e.target.value as TemplateId })}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                >
                  {TEMPLATE_METADATA.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Color Swatches */}
              <div className="hidden lg:flex items-center gap-1 pl-1">
                {QUICK_COLORS.map((color) => {
                  const isCurrent = resumeData.style.primaryColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => updateStyleConfig({ primaryColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${
                        isCurrent ? 'ring-2 ring-white scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right: Zoom & Canvas Controls */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                A4 Standard
              </span>

              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-mono text-slate-300 min-w-[42px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 ml-0.5 transition"
                  title="Reset Zoom (100%)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scalable Resume Canvas */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start bg-slate-950/80 custom-scrollbar">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-[210mm] transition-all duration-200"
            >
              <div
                id="resume-preview-container"
                className="bg-white text-slate-900 shadow-2xl rounded-sm min-h-[297mm] overflow-hidden ring-1 ring-slate-800/40"
              >
                <TemplateRenderer data={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Job Description Modal */}
      <JobDescriptionModal />
    </div>
  );
};

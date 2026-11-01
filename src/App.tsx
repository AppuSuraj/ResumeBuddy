import React, { useState, useEffect } from 'react';
import { useResume } from './context/ResumeContext';
import { useToast } from './components/common/Toast';
import { TopNavbar } from './components/header/TopNavbar';
import { GuestGatekeeperModal } from './components/auth/GuestGatekeeperModal';
import { WelcomeHeroBanner } from './components/onboarding/WelcomeHeroBanner';
import { JobDescriptionModal } from './components/onboarding/JobDescriptionModal';
import { SupportTipModal } from './components/modals/SupportTipModal';
import { EditorTabs } from './components/editor/EditorTabs';
import { MobileAccordionEditor } from './components/editor/MobileAccordionEditor';
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
import { exportResumeToPdf } from './services/pdfExporter';
import confetti from 'canvas-confetti';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Layout, 
  Palette, 
  Edit3, 
  FileDown, 
  Zap 
} from 'lucide-react';

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
  const { resumeData, activeTab, setActiveTab, updateStyleConfig } = useResume();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isExportingMobilePdf, setIsExportingMobilePdf] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  // Calculate responsive auto-scale on mobile so standard 794px A4 sheet fits viewport width with 24px padding
  const mobileFitScale = isMobile ? Math.min(1, Math.max(0.35, (viewportWidth - 24) / 794)) : 1;
  const effectiveScale = isMobile ? mobileFitScale * (zoomLevel / 100) : zoomLevel / 100;
  const atsScore = resumeData.jobTarget.atsScore ?? 0;

  const handleMobilePdfExport = async () => {
    setIsExportingMobilePdf(true);
    try {
      await exportResumeToPdf('resume-preview-container', resumeData.personal.fullName || 'Resume');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.2 } });
      toast.success(
        'Vector PDF Generated Successfully!',
        'Zero paywalls, zero $30/mo traps. Your resume is 100% yours. Go get that interview.'
      );
    } catch (e) {
      console.error('PDF export error:', e);
      toast.info('Opening Print View', 'Use Print > Save as PDF on your device.');
      setTimeout(() => {
        window.print();
      }, 300);
    } finally {
      setIsExportingMobilePdf(false);
    }
  };

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
      {/* Guest Authentication Gatekeeper Modal (Active when guest session is required) */}
      <GuestGatekeeperModal />

      {/* Top Navbar */}
      <TopNavbar />

      {/* Sticky Segmented Mobile Workstation Switcher (< 768px) */}
      <div className="md:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 py-2 flex items-center justify-center shadow-md">
        <div className="flex bg-slate-950 p-1 rounded-xl w-full max-w-sm border border-slate-800 gap-1.5">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`flex-1 min-h-[44px] py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer select-none ${
              mobileView === 'editor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>✏️ Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 min-h-[44px] py-2 px-3 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition cursor-pointer select-none ${
              mobileView === 'preview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>📄 Live Preview</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace (Desktop side-by-side, Mobile single-pane) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-16 md:pb-0">
        {/* Left Side: Form Editor Panel */}
        <div
          className={`w-full md:w-[46%] lg:w-[42%] bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-[calc(100vh-110px)] md:h-[calc(100vh-57px)] ${
            mobileView === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Desktop Tab Selector */}
          <div className="hidden md:block">
            <EditorTabs />
          </div>

          {/* Desktop Content View vs Mobile Accordion View */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isMobile ? (
              <MobileAccordionEditor />
            ) : (
              renderActiveTabContent()
            )}
          </div>
        </div>

        {/* Right Side: Live WYSIWYG Resume Preview */}
        <div
          className={`w-full md:w-[54%] lg:w-[58%] bg-slate-950 flex flex-col h-[calc(100vh-110px)] md:h-[calc(100vh-57px)] relative overflow-hidden ${
            mobileView === 'preview' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Live Preview Controls Header */}
          <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex items-center justify-between z-10 gap-3">
            {/* Left: Quick Template Selector & Page Format Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Preview</span>
              </div>

              {/* Quick Template Switcher Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 min-h-[36px]">
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

              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 p-0.5 rounded-lg text-xs min-h-[36px]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px] font-mono text-slate-300 min-w-[38px] text-center select-none">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/80 ml-0.5 transition cursor-pointer"
                  title="Reset Zoom (100%)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scalable Resume Canvas Container with Auto-Fit on Mobile (Zero Horizontal Scroll) */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 md:p-8 flex flex-col items-center justify-start bg-slate-950/80 custom-scrollbar max-w-full">
            {/* High-Impact Boasting Welcome Hero Banner for First-Time Users */}
            <WelcomeHeroBanner />

            <div
              className="w-full max-w-full overflow-x-hidden flex justify-center py-2"
              style={{
                minHeight: isMobile ? `${Math.ceil(1123 * effectiveScale)}px` : undefined,
              }}
            >
              <div
                style={{
                  width: '794px',
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                  marginBottom: isMobile ? `-${Math.ceil(1123 * (1 - effectiveScale))}px` : undefined,
                }}
                className={isMobile ? 'shrink-0' : 'w-full max-w-[210mm] transition-all duration-200'}
              >
                <div
                  id="resume-preview-container"
                  className="bg-white text-slate-900 shadow-2xl rounded-sm min-h-[1123px] overflow-hidden ring-1 ring-slate-800/40"
                >
                  <TemplateRenderer data={resumeData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (< 768px, Touch-friendly 44px+ targets) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-2 shadow-2xl">
        {/* Secondary Action 1: ATS Score Badge */}
        <button
          type="button"
          onClick={() => {
            setMobileView('editor');
            setActiveTab('target');
          }}
          className={`min-h-[44px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer shrink-0 select-none ${
            atsScore >= 80
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/70'
              : atsScore >= 65
              ? 'bg-amber-950/70 text-amber-300 border-amber-800/80 hover:bg-amber-900/70'
              : 'bg-rose-950/70 text-rose-300 border-rose-800/80 hover:bg-rose-900/70'
          }`}
          title="View ATS Score & Keywords"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Score: {atsScore}%</span>
        </button>

        {/* Secondary Action 2: Style Customizer */}
        <button
          type="button"
          onClick={() => {
            setMobileView('editor');
            setActiveTab('style');
          }}
          className={`min-h-[44px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer shrink-0 select-none ${
            activeTab === 'style' && mobileView === 'editor'
              ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
          }`}
          title="Customize Style & Colors"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>Style</span>
        </button>

        {/* Primary Action: Download PDF */}
        <button
          type="button"
          onClick={handleMobilePdfExport}
          disabled={isExportingMobilePdf}
          className="flex-1 min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] rounded-xl transition shadow-lg shadow-blue-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          {isExportingMobilePdf ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Onboarding Job Description Modal */}
      <JobDescriptionModal />

      {/* Post-Download Support & Tip Modal */}
      <SupportTipModal />
    </div>
  );
};

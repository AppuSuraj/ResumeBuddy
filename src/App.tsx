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
  Zap,
  Sparkles,
  RefreshCw
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
  const { resumeData, activeTab, setActiveTab, updateStyleConfig, loadSampleData } = useResume();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
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

  // Dedicated Auto-Fit Scaling Engine for Mobile Viewport (< 768px)
  // Computes exact scale so the 794px base A4 document fits the screen width with 24px padding
  const mobileScale = Math.min(1, Math.max(0.2, (viewportWidth - 24) / 794));
  const atsScore = resumeData.jobTarget.atsScore ?? 0;
  const activeTemplateName = TEMPLATE_METADATA.find((t) => t.id === resumeData.style.templateId)?.name || 'Executive Modern';

  const handleMobilePdfExport = async () => {
    setIsExportingMobilePdf(true);
    try {
      const targetId = document.getElementById('resume-preview-container-mobile')
        ? 'resume-preview-container-mobile'
        : 'resume-preview-container';
      await exportResumeToPdf(targetId, resumeData.personal.fullName || 'Resume');
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

  const handleLoadSample = () => {
    loadSampleData();
    toast.info('Sample Data Loaded', 'Sample executive resume has been loaded.');
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

      {/* ========================================================================= */}
      {/* 1. DESKTOP WORKSPACE (>= 768px Viewports, Untouched Desktop Experience)  */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col h-screen w-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Desktop Split-Screen Workspace */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left Side: Form Editor Panel */}
          <div className="w-[46%] lg:w-[42%] bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-[calc(100vh-57px)]">
            <EditorTabs />
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderActiveTabContent()}
            </div>
          </div>

          {/* Right Side: Live WYSIWYG Resume Preview */}
          <div className="w-[54%] lg:w-[58%] bg-slate-950 flex flex-col h-[calc(100vh-57px)] relative overflow-hidden">
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

            {/* Scalable Resume Canvas */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center justify-start bg-slate-950/80 custom-scrollbar">
              <WelcomeHeroBanner />

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
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED MOBILE SHELL (< 768px Viewports, Native App Ergonomics)       */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100">
        {/* Layer 1: Compact Mobile Top Bar (Sticky, Height: 52px) */}
        <header className="h-[52px] bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-3 flex items-center justify-between z-30 shrink-0">
          {/* Left: Brand Icon + Active Template Name Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-white tracking-tight shrink-0">ResumeBuddy</span>
              <span className="text-[10px] font-medium text-slate-300 bg-slate-800/90 border border-slate-700/70 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                {activeTemplateName}
              </span>
            </div>
          </div>

          {/* Right: Dynamic ATS Score Pill + Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Dynamic ATS Score Pill */}
            <button
              type="button"
              onClick={() => {
                setMobileTab('editor');
                setActiveTab('target');
              }}
              className={`min-h-[36px] px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition cursor-pointer select-none ${
                atsScore >= 80
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                  : atsScore >= 65
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                  : 'bg-rose-950/70 text-rose-300 border-rose-800/80'
              }`}
              title="ATS Score - tap to optimize"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{atsScore}% ATS</span>
            </button>

            {/* Style / Palette Drawer Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileTab('editor');
                setActiveTab('style');
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
              title="Customize Template & Style"
            >
              <Palette className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Quick Sample Button */}
            <button
              type="button"
              onClick={handleLoadSample}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
              title="Load Executive Sample Resume"
            >
              <RefreshCw className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </header>

        {/* Layer 2: Dynamic Viewport Canvas (Flex-1, Scrollable, No Horizontal Bleed) */}
        <main className="flex-1 overflow-hidden relative w-full">
          {/* Subview A: Mobile Editor (Accordions) */}
          <div
            className={`w-full h-full px-4 py-3 pb-24 overflow-y-auto custom-scrollbar ${
              mobileTab === 'editor' ? 'block' : 'hidden'
            }`}
          >
            <MobileAccordionEditor />
          </div>

          {/* Subview B: Mobile Preview (Auto-Fit Scaling Engine) */}
          <div
            className={`w-full h-full bg-slate-900/90 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start p-3 pb-24 custom-scrollbar ${
              mobileTab === 'preview' ? 'flex' : 'hidden'
            }`}
          >
            <WelcomeHeroBanner />

            {/* Auto-Fit Scaling Canvas Container: Sheet on a Clipboard */}
            <div
              className="relative w-full overflow-hidden flex justify-center py-2 shrink-0"
              style={{
                height: `${Math.ceil(1123 * mobileScale + 16)}px`,
              }}
            >
              <div
                style={{
                  transform: `scale(${mobileScale})`,
                  transformOrigin: 'top center',
                  width: '794px',
                  height: '1123px',
                }}
                className="shadow-2xl rounded-sm pointer-events-none select-none shrink-0"
              >
                <div
                  id="resume-preview-container-mobile"
                  className="bg-white text-slate-900 shadow-2xl rounded-sm min-h-[1123px] overflow-hidden"
                >
                  <TemplateRenderer data={resumeData} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Layer 3: Native App Bottom Navigation Bar (Sticky Bottom, Height: 60px) */}
        <nav className="h-[60px] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 py-1.5 flex items-center justify-around gap-2 z-40 shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          {/* Tab 1: Edit Content */}
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`flex-1 min-h-[44px] h-full flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
              mobileTab === 'editor'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-[10px] font-bold">Edit Content</span>
          </button>

          {/* Tab 2: Full Preview */}
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 min-h-[44px] h-full flex flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none ${
              mobileTab === 'preview'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-[10px] font-bold">Full Preview</span>
          </button>

          {/* Tab 3: Export PDF */}
          <button
            type="button"
            onClick={handleMobilePdfExport}
            disabled={isExportingMobilePdf}
            className="flex-1 min-h-[44px] h-full flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-md shadow-blue-600/25 transition disabled:opacity-50 cursor-pointer select-none"
          >
            {isExportingMobilePdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span className="text-[11px]">Export PDF</span>
              </>
            )}
          </button>
        </nav>
      </div>

      {/* Global Modals Mounted Outside Layout Shells */}
      <JobDescriptionModal />
      <SupportTipModal />
    </div>
  );
};

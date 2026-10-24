import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { exportResumeToPdf } from '../../services/pdfExporter';
import { exportResumeToDocx } from '../../services/docxExporter';
import { getStoredApiKey, setStoredApiKey } from '../../services/aiService';
import { 
  Sparkles, 
  FileDown, 
  FileText, 
  Key, 
  RefreshCw, 
  Target, 
  Upload, 
  Check, 
  Layers, 
  ChevronDown,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResumeManagerModal } from './ResumeManagerModal';
import { UploadResumeModal } from '../onboarding/UploadResumeModal';

export const TopNavbar: React.FC = () => {
  const { 
    resumeData, 
    resumes,
    setActiveTab, 
    setIsJdModalOpen, 
    loadSampleData, 
    clearResumeToBlank,
    exportAsJson, 
    importFromJson 
  } = useResume();
  const toast = useToast();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const hasApiKey = Boolean(getStoredApiKey());

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    setShowExportMenu(false);
    try {
      await exportResumeToPdf('resume-preview-container', resumeData.personal.fullName || 'Resume');
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.2 } });
      toast.success('PDF Export Complete', 'Your print-ready resume has been downloaded.');
    } catch (e) {
      console.error('PDF export error:', e);
      toast.error('PDF Export Failed', 'Ensure the preview is loaded and try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDocxExport = async () => {
    setIsExportingDocx(true);
    setShowExportMenu(false);
    try {
      await exportResumeToDocx(resumeData);
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.2 } });
      toast.success('Word Document Exported', 'Downloaded as an editable .docx file.');
    } catch (e) {
      console.error('DOCX export error:', e);
      toast.error('DOCX Export Failed', 'Could not generate Word document.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKeyInput.trim());
    setSavedKeySuccess(true);
    toast.success('AI Settings Saved', apiKeyInput.trim() ? 'Gemini 2.5 Flash active.' : 'Smart Offline fallback active.');
    setTimeout(() => {
      setSavedKeySuccess(false);
      setShowAiModal(false);
    }, 1000);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (importFromJson(text)) {
          toast.success('Import Successful', 'Resume loaded from JSON backup.');
        } else {
          toast.error('Import Failed', 'Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    loadSampleData();
    toast.info('Sample Data Loaded', 'Sample executive resume has been loaded.');
  };

  const atsScore = resumeData.jobTarget.atsScore || 80;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">ResumeBuddy</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                AI Powered
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="truncate max-w-[150px] text-slate-300 font-medium">
                {resumeData.title || 'Untitled Resume'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400/90 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Autosaved
              </span>
            </div>
          </div>

          {/* Quick Resumes Pill */}
          <button
            onClick={() => setShowManagerModal(true)}
            className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>My Resumes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-200">
              {resumes.length}
            </span>
          </button>
        </div>

        {/* Center: Target Job Quick Match Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('target')}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition"
            title="Click to view ATS keyword breakdown & optimize"
          >
            <Target className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-45 transition-transform" />
            <span className="max-w-[130px] md:max-w-[180px] truncate text-slate-200">
              {resumeData.jobTarget.targetRoleTitle || 'Set Target Role'}
            </span>

            {/* ATS Score Badge */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition ${
                atsScore >= 80
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                  : atsScore >= 65
                  ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                  : 'bg-rose-950/70 text-rose-300 border-rose-800/80'
              }`}
            >
              <span className="text-[9px] font-mono opacity-70">ATS</span>
              <span>{atsScore}%</span>
            </div>
          </button>
        </div>

        {/* Right: Actions & Export Controls */}
        <div className="flex items-center gap-2">
          {/* Import Resume Modal Trigger */}
          <button
            onClick={() => setShowUploadModal(true)}
            title="Import existing PDF, DOCX, or TXT resume"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import</span>
          </button>

          {/* Sample Data Button */}
          <button
            onClick={handleLoadSample}
            title="Load sample professional data"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample</span>
          </button>

          {/* AI Settings Button */}
          <button
            onClick={() => setShowAiModal(true)}
            title={hasApiKey ? 'Gemini API Configured (Active)' : 'Configure Gemini API Key (Optional)'}
            className={`relative p-2 rounded-xl border transition ${
              hasApiKey
                ? 'bg-blue-950/50 border-blue-800/80 text-blue-300 hover:bg-blue-900/60'
                : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            {hasApiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            )}
          </button>

          {/* Export Dropdown Group */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-0.5 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition">
              <button
                onClick={handlePdfExport}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white rounded-l-[10px] hover:bg-white/10 active:scale-98 transition disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-1.5 py-2 border-l border-white/20 text-white hover:bg-white/10 rounded-r-[10px] transition"
                title="More export options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl py-1.5 z-40 space-y-1">
                  <button
                    onClick={handleDocxExport}
                    disabled={isExportingDocx}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Export Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => {
                      exportAsJson();
                      setShowExportMenu(false);
                      toast.success('Backup Saved', 'Resume data exported to JSON.');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Backup (.json)</span>
                  </button>

                  <button
                    onClick={() => {
                      clearResumeToBlank();
                      setShowExportMenu(false);
                      toast.success('Clean Canvas', 'Kept your contact info; cleared previous job content.');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Clear to Clean Canvas</span>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer transition">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Restore (.json)</span>
                    <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* AI Settings Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                AI Engine Configuration
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Gemini 2.5
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ResumeBuddy has an offline AI engine built right in, so you can tailor summaries and bullets with zero setup. 
              To connect live Gemini LLM capabilities, paste your Google AI Studio API key below.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500"
                />
              </div>

              {savedKeySuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>API preference updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Manager Modal */}
      <ResumeManagerModal 
        isOpen={showManagerModal} 
        onClose={() => setShowManagerModal(false)} 
      />

      {/* Upload Existing Resume Modal */}
      <UploadResumeModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </>
  );
};

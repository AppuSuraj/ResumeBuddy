import React, { useState, useEffect } from 'react';
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
  Share2,
  Lock,
  Shield,
  KeyRound,
  Printer,
  LogOut,
  UserCheck,
  Sun,
  Moon,
  Command,
  X,
  Laptop
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ResumeManagerModal } from './ResumeManagerModal';
import { UploadResumeModal } from '../onboarding/UploadResumeModal';
import { logoutAdmin, changeMasterPassword } from '../../services/adminAuthService';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { useTheme } from '../../context/ThemeContext';

export const TopNavbar: React.FC = () => {
  const { 
    resumeData, 
    resumes,
    setActiveTab, 
    setIsJdModalOpen, 
    loadSampleData, 
    clearResumeToBlank,
    exportAsJson, 
    importFromJson,
    userProfile
  } = useResume();
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getStoredApiKey());
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const { session, user, logout: logoutGuest } = useGuestAuth();

  // Keyboard shortcut listener (Ctrl+S, Ctrl+P, Ctrl+D, Ctrl+/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toast.success('Resume Saved', 'All changes stored in local client cache.');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, toast]);

  // Admin Security modal states
  const [settingsTab, setSettingsTab] = useState<'ai' | 'security'>('ai');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const hasApiKey = Boolean(getStoredApiKey());

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (!currentPasswordInput) {
      setSecurityMsg({ text: 'Please enter your current master password.', isError: true });
      return;
    }
    if (newPasswordInput.length < 4) {
      setSecurityMsg({ text: 'New password must be at least 4 characters.', isError: true });
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setSecurityMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await changeMasterPassword(currentPasswordInput, newPasswordInput);
      if (res.success) {
        setSecurityMsg({ text: 'Master password updated successfully!', isError: false });
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
        toast.success('Security Updated', 'Master admin password changed.');
      } else {
        setSecurityMsg({ text: res.message, isError: true });
        toast.error('Update Failed', res.message);
      }
    } catch {
      setSecurityMsg({ text: 'Failed to update master password.', isError: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    setShowExportMenu(false);
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
      setIsExportingPdf(false);
    }
  };

  const handleDocxExport = async () => {
    setIsExportingDocx(true);
    setShowExportMenu(false);
    try {
      await exportResumeToDocx(resumeData);
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.2 } });
      toast.success(
        'Vector PDF Generated Successfully!',
        'Zero paywalls, zero $30/mo traps. Your resume is 100% yours. Go get that interview.'
      );
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

  const atsScore = resumeData.jobTarget.atsScore ?? 0;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">ResumeBuddy</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                AI Powered
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[150px] text-slate-700 dark:text-slate-300 font-medium">
                {resumeData.title || 'Untitled Resume'}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400/90 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Autosaved
              </span>
            </div>
          </div>

          {/* Quick Resumes Pill */}
          <button
            onClick={() => setShowManagerModal(true)}
            className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>My Resumes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {resumes.length}
            </span>
          </button>
        </div>

        {/* Center: Target Job Quick Match Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('target')}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 transition"
            title="Click to view ATS keyword breakdown & optimize"
          >
            <Target className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 group-hover:rotate-45 transition-transform" />
            <span className="max-w-[130px] md:max-w-[180px] truncate text-slate-800 dark:text-slate-200 font-semibold">
              {resumeData.jobTarget.targetRoleTitle || 'Set Target Role'}
            </span>

            {/* ATS Score Badge */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border transition ${
                atsScore >= 80
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80'
                  : atsScore >= 65
                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80'
                  : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80'
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
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>Import</span>
          </button>

          {/* Sample Data Button */}
          <button
            onClick={handleLoadSample}
            title="Load sample professional data"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Sample</span>
          </button>

          {/* AI Settings Button */}
          <button
            onClick={() => setShowAiModal(true)}
            title={hasApiKey ? 'Settings & Security (Active)' : 'Configure Gemini API Key & Admin Security'}
            className={`relative p-2 rounded-xl border transition ${
              hasApiKey
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                : 'bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            {hasApiKey && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode (Ctrl+D)' : 'Switch to Dark Mode (Ctrl+D)'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Export Dropdown Group */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-0.5 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition">
              <button
                onClick={handlePdfExport}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white rounded-l-[10px] hover:bg-white/10 active:scale-98 transition disabled:opacity-50 cursor-pointer"
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
                className="px-1.5 py-2 border-l border-white/20 text-white hover:bg-white/10 rounded-r-[10px] transition cursor-pointer"
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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-40 space-y-1">
                  <button
                    onClick={handleDocxExport}
                    disabled={isExportingDocx}
                    title="Download Word"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Download Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      toast.info('Opening Vector Print', 'In print dialog, choose Save as PDF for vector text.');
                      setTimeout(() => window.print(), 300);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    <span>Print / Native Vector PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      exportAsJson();
                      setShowExportMenu(false);
                      toast.success('Backup Saved', 'Resume data exported to JSON.');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Backup (.json)</span>
                  </button>

                  <button
                    onClick={() => {
                      clearResumeToBlank();
                      setShowExportMenu(false);
                      toast.success('Clean Canvas', 'Kept your contact info; cleared previous job content.');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Clear to Clean Canvas</span>
                  </button>

                  <label className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer transition">
                    <Upload className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>Restore (.json)</span>
                    <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar & Session Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="relative p-0.5 rounded-full ring-2 ring-transparent hover:ring-blue-500/50 transition cursor-pointer"
              title={`Account: ${user?.email || 'Active Session'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center shadow-md">
                {(user?.email?.[0] || userProfile?.fullName?.[0] || 'U').toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-40 space-y-1.5 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      {session ? 'Active Account' : 'Workstation Session'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {user?.email || 'Private Local Session'}
                    </div>
                  </div>

                  <div className="px-3 py-1.5 flex items-center justify-between text-[11px] bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Storage Scope</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      100% Private Client
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowShortcutsModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Command className="w-3.5 h-3.5 text-blue-500" />
                      <span>Keyboard Shortcuts</span>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                      Ctrl+/
                    </kbd>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={async () => {
                      setShowProfileMenu(false);
                      logoutAdmin();
                      if (session) {
                        await logoutGuest();
                      }
                      toast.info('Session Ended', 'You have been safely logged out. Resumes remain securely in your local browser cache.');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Session / Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Settings & Security Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Modal Header & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettingsTab('ai')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    settingsTab === 'ai'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>AI Engine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('security')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    settingsTab === 'security'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Security</span>
                </button>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {settingsTab === 'ai' ? 'Gemini 2.5' : 'SHA-256'}
              </span>
            </div>

            {/* Tab 1: AI Engine Configuration */}
            {settingsTab === 'ai' && (
              <>
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
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Tab 2: Admin Security & Master Password */}
            {settingsTab === 'security' && (
              <>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Manage your master admin credentials. Only the SHA-256 hash is verified in-browser to protect your GitHub Pages deployment.
                </p>

                {securityMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      securityMsg.isError
                        ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                        : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {securityMsg.isError ? (
                      <span className="font-bold">•</span>
                    ) : (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{securityMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Current Master Password
                    </label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Enter current password..."
                      required
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      New Master Password
                    </label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password (min 4 chars)..."
                      required
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Confirm New Master Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPasswordInput}
                      onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                      placeholder="Confirm new password..."
                      required
                      className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                        logoutAdmin();
                        toast.info('Workspace Locked', 'Session ended.');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Now</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAiModal(false)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isUpdatingPassword ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <KeyRound className="w-3.5 h-3.5" />
                        )}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
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

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Command className="w-4 h-4 text-blue-500" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Quick Save (Local Cache)</span>
                <kbd className="px-2 py-1 font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">Ctrl + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Toggle Light / Dark Mode</span>
                <kbd className="px-2 py-1 font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">Ctrl + D</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Native Vector Print / PDF</span>
                <kbd className="px-2 py-1 font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">Ctrl + P</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Show / Hide Shortcuts</span>
                <kbd className="px-2 py-1 font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs">Ctrl + /</kbd>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer text-slate-800 dark:text-slate-200"
              >
                Close Shortcuts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

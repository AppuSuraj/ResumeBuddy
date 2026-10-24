import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { extractTextFromFile, parseResumeContent } from '../../services/resumeParserService';
import { getStoredApiKey, setStoredApiKey } from '../../services/aiService';
import { ResumeData } from '../../types/resume';
import { Upload, FileText, Check, AlertCircle, Sparkles, X, ArrowRight, User, Briefcase, GraduationCap, Wrench, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadResumeModal: React.FC<UploadResumeModalProps> = ({ isOpen, onClose }) => {
  const { resumeData, setResumeData } = useResume();
  const toast = useToast();

  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<ResumeData> | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>(getStoredApiKey());

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (apiKeyInput.trim()) {
      setStoredApiKey(apiKeyInput.trim());
    }

    setFileName(file.name);
    setIsParsing(true);
    setErrorMsg(null);
    setExtractedData(null);
    setParseStatus('Extracting text from document pages...');

    try {
      const rawText = await extractTextFromFile(file);
      setParseStatus('Structuring candidate info, experience & skills...');

      const parsed = await parseResumeContent(rawText, apiKeyInput.trim());

      if (parsed && (parsed.personal || parsed.experience)) {
        setExtractedData(parsed);
        toast.success('Resume Parsed', `Extracted details from ${file.name}.`);
      } else {
        setErrorMsg('Could not extract candidate data. Please ensure your file contains readable text or paste your Gemini API key above.');
      }
    } catch (err) {
      console.error('Failed to parse resume file:', err);
      setErrorMsg('Failed to process document file. Please ensure it is a valid PDF, DOCX, TXT, or JSON file.');
      toast.error('Parsing Failed', 'Could not parse the selected document.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyToWorkspace = () => {
    if (!extractedData) return;

    const current = { ...resumeData };

    if (extractedData.personal) {
      current.personal = {
        ...current.personal,
        ...extractedData.personal,
      };
    }

    if (extractedData.experience && extractedData.experience.length > 0) {
      current.experience = extractedData.experience.map((exp, idx) => ({
        ...exp,
        id: `exp_${Date.now()}_${idx}`,
      }));
    }

    if (extractedData.education && extractedData.education.length > 0) {
      current.education = extractedData.education.map((edu, idx) => ({
        ...edu,
        id: `edu_${Date.now()}_${idx}`,
      }));
    }

    if (extractedData.skills && extractedData.skills.length > 0) {
      current.skills = extractedData.skills.map((sk, idx) => ({
        ...sk,
        id: `skill_${Date.now()}_${idx}`,
      }));
    }

    setResumeData(current);
    confetti({ particleCount: 40, spread: 60 });
    toast.success('Workspace Updated', 'Imported resume populated into editor.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import & Auto-Fill Resume</h3>
              <p className="text-[11px] text-slate-400">Upload PDF, DOCX, TXT or JSON to auto-populate workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Key Box (Optional) */}
        {!getStoredApiKey() && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <Key className="w-3.5 h-3.5" /> Google Gemini API Key (Optional Enhancement)
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setStoredApiKey(e.target.value.trim());
              }}
              placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-[10px] text-slate-400">
              Entering your Gemini API Key enables deep AI parsing to extract complex multi-page PDF formatting cleanly.
            </p>
          </div>
        )}

        {/* Upload Dropzone */}
        {!extractedData && !isParsing && (
          <div className="p-8 border-2 border-dashed border-slate-700/80 hover:border-blue-500 rounded-2xl text-center space-y-3 bg-slate-800/40 transition group cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.json,.md"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Click or drag your existing resume file here</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PDF, DOCX, TXT, or JSON formats</p>
            </div>
          </div>
        )}

        {/* Parsing Spinner */}
        {isParsing && (
          <div className="p-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-white font-semibold">{fileName}</p>
            <p className="text-xs text-slate-400">{parseStatus}</p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Extracted Preview */}
        {extractedData && (
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                Parsed Successfully ({fileName})
              </span>
              <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono">Ready to Apply</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2 text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                {extractedData.personal?.fullName || 'Candidate'}
              </p>
              <p className="text-slate-300">{extractedData.personal?.jobTitle}</p>
              <p className="text-slate-400 text-[11px]">
                {extractedData.personal?.email} • {extractedData.personal?.phone} • {extractedData.personal?.location}
              </p>

              {extractedData.experience && (
                <div className="pt-2 border-t border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {extractedData.experience.length} Work Experience Positions
                  </span>
                </div>
              )}

              {extractedData.skills && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    {extractedData.skills.reduce((acc, cat) => acc + cat.skills.length, 0)} Skills Extracted
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          {extractedData && (
            <button
              onClick={handleApplyToWorkspace}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition active:scale-98"
            >
              Apply to Resume Workspace <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

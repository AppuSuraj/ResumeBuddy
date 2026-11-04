import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { TEMPLATE_METADATA } from '../templates/TemplateRenderer';
import { TemplateId } from '../../types/resume';
import { LayoutGrid, Check } from 'lucide-react';

interface WireframeProps {
  templateId: TemplateId;
}

const TemplateWireframe: React.FC<WireframeProps> = ({ templateId }) => {
  switch (templateId) {
    // 1. Modern Left-Sidebar (Distinct 30% left column for contact/skills, 70% main body)
    case 'dual-column-modern':
    case 'modern-sidebar':
    case 'professional-two-tone': {
      const isTwoTone = templateId === 'professional-two-tone';
      return (
        <div className="flex h-full w-full gap-1">
          {/* Distinct 30% Left Sidebar */}
          <div
            className={`w-[32%] ${
              isTwoTone ? 'bg-indigo-950/80 border-indigo-700/60' : 'bg-slate-900/95 border-slate-800/90'
            } border-r p-1 flex flex-col gap-1 rounded-l`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500/80 mx-auto mb-0.5 shrink-0" />
            <div className="h-0.5 w-full bg-slate-500 rounded-sm" />
            <div className="h-0.5 w-3/4 bg-slate-600 rounded-sm mb-1" />
            {/* Skills chips in sidebar */}
            <div className="h-0.5 w-3/5 bg-blue-400 rounded-sm mb-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="h-1 w-full bg-slate-800 border border-slate-700/80 rounded-sm" />
              <span className="h-1 w-5/6 bg-slate-800 border border-slate-700/80 rounded-sm" />
              <span className="h-1 w-4/5 bg-slate-800 border border-slate-700/80 rounded-sm" />
            </div>
          </div>
          {/* 70% Main Body */}
          <div className="flex-1 p-1 flex flex-col gap-1">
            <div className="h-1.5 w-4/5 bg-blue-400 rounded-sm mb-0.5" />
            <div className="h-0.5 w-1/2 bg-slate-500 rounded-sm mb-1" />
            <div className="h-1 w-2/5 bg-slate-300 rounded-sm mb-0.5" />
            <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-5/6 bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-full bg-slate-700 rounded-sm mb-1" />
            <div className="h-1 w-1/3 bg-slate-300 rounded-sm mb-0.5" />
            <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
            <div className="h-0.5 w-3/4 bg-slate-700 rounded-sm" />
          </div>
        </div>
      );
    }

    // 2. Tech Compact (Dense grid with inline skills chips)
    case 'tech-developer':
    case 'compact-one-pager':
      return (
        <div className="h-full w-full flex flex-col justify-between text-left">
          {/* Monospace Dense Header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="h-1.5 w-10 bg-emerald-400 rounded-sm" />
              <div className="h-0.5 w-7 bg-slate-500 rounded-sm" />
            </div>
            {/* Tagged Skill Badges & Dense Prompt */}
            <div className="flex gap-0.5 mb-1.5">
              <span className="h-1.5 w-4 rounded bg-emerald-500/30 border border-emerald-400/50" />
              <span className="h-1.5 w-5 rounded bg-blue-500/30 border border-blue-400/50" />
              <span className="h-1.5 w-4 rounded bg-purple-500/30 border border-purple-400/50" />
            </div>
            {/* Dense Code Block / Experience Row */}
            <div className="border-l-2 border-emerald-500 bg-slate-900/90 pl-1 py-0.5 mb-1 rounded-r">
              <div className="h-0.5 w-8 bg-slate-300 rounded-sm mb-0.5" />
              <div className="h-0.5 w-11/12 bg-slate-600 rounded-sm" />
            </div>
          </div>
          {/* Dense Skills Grid at Footer */}
          <div className="pt-0.5 border-t border-slate-800">
            <div className="h-1 w-7 bg-emerald-400/90 rounded-sm mb-1" />
            <div className="grid grid-cols-3 gap-0.5">
              <span className="h-1 bg-slate-800 border border-slate-700 rounded-sm" />
              <span className="h-1 bg-slate-800 border border-slate-700 rounded-sm" />
              <span className="h-1 bg-slate-800 border border-slate-700 rounded-sm" />
            </div>
          </div>
        </div>
      );

    // 3. Executive Header Bar (Colored top banner with balanced two-column footer)
    case 'executive-senior':
    case 'elegant-corporate': {
      const isCorporate = templateId === 'elegant-corporate';
      return (
        <div className="h-full w-full flex flex-col text-left">
          {/* Colored Top Header Banner */}
          <div
            className={`h-3 w-full ${
              isCorporate
                ? 'bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900'
                : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900'
            } rounded-t p-0.5 flex flex-col justify-center mb-1.5`}
          >
            <div className="h-1 w-12 bg-white/90 rounded-sm mb-0.5" />
            <div className="h-0.5 w-8 bg-white/60 rounded-sm" />
          </div>

          {/* Balanced Section Grid */}
          <div className="space-y-1 flex-1">
            <div>
              <div className="h-1 w-9 bg-slate-300 rounded-sm mb-0.5" />
              <div className="border-b border-slate-800 w-full mb-0.5" />
              <div className="h-0.5 w-full bg-slate-700 rounded-sm mb-0.5" />
              <div className="h-0.5 w-5/6 bg-slate-700 rounded-sm" />
            </div>
            {/* Balanced Two-Column Footer */}
            <div className="grid grid-cols-2 gap-1 pt-0.5 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
              </div>
              <div className="space-y-0.5">
                <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Creative Vanguard
    case 'creative-vanguard':
      return (
        <div className="h-full w-full flex flex-col text-left">
          {/* Top Gradient Banner Header with Avatar */}
          <div className="h-5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 rounded-t relative mb-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-900 absolute -bottom-1.5 left-2" />
          </div>
          <div className="ml-6 h-1 w-9 bg-slate-300 rounded-sm mb-1.5" />
          {/* Card Section Styling */}
          <div className="space-y-1">
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <div className="h-0.5 w-7 bg-pink-400 rounded-sm mb-0.5" />
              <div className="h-0.5 w-full bg-slate-700 rounded-sm mb-0.5" />
              <div className="h-0.5 w-3/4 bg-slate-700 rounded-sm" />
            </div>
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <div className="h-0.5 w-7 bg-blue-400 rounded-sm mb-0.5" />
              <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
            </div>
          </div>
        </div>
      );

    // 5. Minimal Swiss
    case 'minimal-swiss':
      return (
        <div className="h-full w-full flex flex-col text-left">
          <div className="h-2 w-10 bg-white rounded-none mb-2" />
          <div className="space-y-1.5">
            <div className="flex gap-1.5 items-start">
              <div className="w-5 h-0.5 bg-slate-400 rounded-none shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <div className="h-0.5 w-full bg-slate-600 rounded-none" />
                <div className="h-0.5 w-4/5 bg-slate-600 rounded-none" />
              </div>
            </div>
            <div className="flex gap-1.5 items-start">
              <div className="w-5 h-0.5 bg-slate-400 rounded-none shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <div className="h-0.5 w-full bg-slate-600 rounded-none" />
                <div className="h-0.5 w-5/6 bg-slate-600 rounded-none" />
              </div>
            </div>
          </div>
        </div>
      );

    // 6. Startup Chic
    case 'startup-chic':
      return (
        <div className="h-full w-full flex flex-col text-left">
          <div className="rounded bg-slate-900 border border-slate-800 p-1 mb-1">
            <div className="h-1 w-10 bg-violet-400 rounded-sm mb-0.5" />
            <div className="h-0.5 w-6 bg-slate-500 rounded-sm" />
          </div>
          <div className="flex gap-0.5 mb-1.5">
            <span className="h-1.5 w-4 bg-violet-500/40 rounded-full" />
            <span className="h-1.5 w-5 bg-fuchsia-500/40 rounded-full" />
            <span className="h-1.5 w-4 bg-pink-500/40 rounded-full" />
          </div>
          <div className="rounded bg-slate-900 border border-slate-800 p-1 mb-1">
            <div className="h-0.5 w-8 bg-slate-300 rounded-sm mb-0.5" />
            <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
          </div>
        </div>
      );

    // 7. Single-Column ATS Minimalist (Horizontal rules, single stream)
    case 'academic-research':
    case 'modern-minimal':
    default:
      return (
        <div className="h-full w-full flex flex-col justify-between text-left">
          {/* Clean Horizontal Header Bar with Divider Rule */}
          <div>
            <div className="h-1.5 w-14 bg-blue-500 rounded-sm mb-0.5" />
            <div className="h-0.5 w-9 bg-slate-500 rounded-sm mb-1" />
            <div className="border-b border-slate-700/80 w-full mb-1.5" />
          </div>
          {/* Standard Single-Column Content Stream */}
          <div className="space-y-1.5">
            <div>
              <div className="h-1 w-8 bg-slate-300 rounded-sm mb-0.5" />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
                <div className="h-0.5 w-5/6 bg-slate-700 rounded-sm" />
                <div className="h-0.5 w-4/5 bg-slate-700 rounded-sm" />
              </div>
            </div>
            <div>
              <div className="border-b border-slate-800/90 w-full mb-1" />
              <div className="h-1 w-9 bg-slate-300 rounded-sm mb-0.5" />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full bg-slate-700 rounded-sm" />
                <div className="h-0.5 w-11/12 bg-slate-700 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export const TemplateSelector: React.FC = () => {
  const { resumeData, updateStyleConfig } = useResume();
  const toast = useToast();
  const currentTemplateId = resumeData.style.templateId;

  const handleSelectTemplate = (id: string, name: string) => {
    updateStyleConfig({ templateId: id as any });
    toast.success('Template Applied', `Switched to "${name}" layout.`);
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            Resume Template Gallery ({TEMPLATE_METADATA.length} Styles)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ATS-optimized designs crafted for technology, business, and executive roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TEMPLATE_METADATA.map((tmpl) => {
          const isSelected = currentTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id, tmpl.name)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-950/60 border-blue-500/80 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div>
                {/* Header row: Name, Active Check, and ATS Safety Badge */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-blue-300 transition-colors truncate">
                      {tmpl.name}
                    </h3>
                    {isSelected && (
                      <span className="bg-blue-600 text-white p-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* ATS Parser Safety Badge & Compatibility Tooltip */}
                  {tmpl.atsType === 'safe' ? (
                    <div className="relative group/badge shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 flex items-center gap-1 cursor-help transition">
                        <span>🤖 100% ATS Safe</span>
                      </span>
                      <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/badge:flex flex-col items-end z-30">
                        <div className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl max-w-xs leading-relaxed text-left">
                          Single-stream hierarchy guaranteed to pass enterprise ATS scanners (Workday, Taleo, Greenhouse).
                        </div>
                        <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 mr-3 -mt-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative group/badge shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-950/50 text-amber-300 border border-amber-800/60 flex items-center gap-1 cursor-help transition">
                        <span>👤 Recruiter / Human Eye</span>
                      </span>
                      <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/badge:flex flex-col items-end z-30">
                        <div className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl max-w-xs leading-relaxed text-left">
                          Visual multi-column / sidebar design crafted for direct recruiter emails, portfolios, and human review.
                        </div>
                        <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 mr-3 -mt-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual Skeleton Wireframe (Aspect ratio ~ 1 : 1.3) */}
                <div className="flex justify-center my-2">
                  <div className="w-28 aspect-[1/1.3] bg-slate-950 rounded-lg border border-slate-800/90 p-2 shadow-inner overflow-hidden group-hover:border-slate-700 transition">
                    <TemplateWireframe templateId={tmpl.id} />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {tmpl.category} • {tmpl.id}
                </span>
                <span
                  className={`text-[11px] font-bold transition ${
                    isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  {isSelected ? 'Active Template' : 'Use Template'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

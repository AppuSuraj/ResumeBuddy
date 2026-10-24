import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { TEMPLATE_METADATA } from '../templates/TemplateRenderer';
import { LayoutGrid, Check, Sparkles } from 'lucide-react';

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
                  ? 'bg-blue-950/60 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 group-hover:text-blue-300 transition-colors">
                    {tmpl.name}
                    {isSelected && (
                      <span className="bg-blue-600 text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">{tmpl.id}</span>
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

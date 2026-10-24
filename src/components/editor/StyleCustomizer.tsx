import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { FontFamily } from '../../types/resume';
import { Palette, Type, Image as ImageIcon, File } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Sky Cyan', hex: '#0284c7' },
  { name: 'Teal Emerald', hex: '#0d9488' },
  { name: 'Forest Green', hex: '#16a34a' },
  { name: 'Deep Violet', hex: '#7c3aed' },
  { name: 'Rose Pink', hex: '#e11d48' },
  { name: 'Executive Navy', hex: '#1e3a8a' },
  { name: 'Midnight Charcoal', hex: '#334155' },
];

const PRESET_FONTS: { name: string; value: FontFamily; preview: string }[] = [
  { name: 'Inter (Modern Sans)', value: 'Inter', preview: 'Clean & readable modern sans-serif' },
  { name: 'Roboto (Geometric)', value: 'Roboto', preview: 'Balanced technical font' },
  { name: 'Merriweather (Executive Serif)', value: 'Merriweather', preview: 'Authoritative traditional serif' },
  { name: 'JetBrains Mono (Code)', value: 'JetBrains Mono', preview: 'Developer & tech focused monospace' },
  { name: 'Outfit (Trendy Modern)', value: 'Outfit', preview: 'Vibrant geometric typography' },
];

export const StyleCustomizer: React.FC = () => {
  const { resumeData, updateStyleConfig } = useResume();
  const { style } = resumeData;

  return (
    <div className="p-4 space-y-5 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            Style & Formatting Options
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize accent colors, typography, and photos.</p>
        </div>
      </div>

      {/* Primary Color Swatches */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Accent Color Theme
        </label>

        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((col) => {
            const isSelected = style.primaryColor === col.hex;
            return (
              <button
                key={col.hex}
                onClick={() => updateStyleConfig({ primaryColor: col.hex })}
                className={`w-7 h-7 rounded-full transition transform hover:scale-110 flex items-center justify-center border-2 ${
                  isSelected ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            );
          })}

          {/* Custom Hex Picker */}
          <div className="flex items-center gap-1.5 ml-2">
            <input
              type="color"
              value={style.primaryColor || '#2563eb'}
              onChange={(e) => updateStyleConfig({ primaryColor: e.target.value })}
              className="w-7 h-7 rounded-lg cursor-pointer border border-slate-700 bg-slate-800"
            />
            <span className="text-xs font-mono text-slate-400">{style.primaryColor}</span>
          </div>
        </div>
      </div>

      {/* Font Family Selector */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-blue-400" /> Font Family
        </label>

        <div className="space-y-2">
          {PRESET_FONTS.map((font) => {
            const isSelected = style.fontFamily === font.value;
            return (
              <div
                key={font.value}
                onClick={() => updateStyleConfig({ fontFamily: font.value })}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{font.name}</span>
                  <span className="text-[10px] text-slate-400">{font.value}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5" style={{ fontFamily: font.value }}>
                  {font.preview}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-xs font-bold text-white">Show Profile Photo</span>
              <p className="text-[11px] text-slate-400">Toggle headshot visibility on compatible templates</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={style.showPhoto}
            onChange={(e) => updateStyleConfig({ showPhoto: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

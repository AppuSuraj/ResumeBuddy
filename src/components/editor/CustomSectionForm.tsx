import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { useToast } from '../common/Toast';
import { PlusCircle, Plus, Trash2, X } from 'lucide-react';

export const CustomSectionForm: React.FC = () => {
  const { resumeData, updateCustomSection, addCustomSection, deleteCustomSection } = useResume();
  const { customSections } = resumeData;
  const toast = useToast();

  const handleAddSection = () => {
    addCustomSection('Certifications & Honors');
    toast.success('Section Added', 'Created "Certifications & Honors" section.');
  };

  const handleDeleteSection = (id: string, title: string) => {
    deleteCustomSection(id);
    toast.info('Section Deleted', `Removed "${title || 'custom section'}".`);
  };

  const handleAddItemToSection = (sectionId: string) => {
    const targetSection = customSections.find((s) => s.id === sectionId);
    if (targetSection) {
      updateCustomSection(sectionId, {
        items: [
          ...targetSection.items,
          {
            id: `item-${Date.now()}`,
            title: 'New Award / Certification',
            subtitle: 'Issuing Organization',
            date: '2023',
            description: '',
          },
        ],
      });
      toast.success('Item Added', 'New entry added to section.');
    }
  };

  const handleRemoveItem = (sectionId: string, itemId: string) => {
    const targetSection = customSections.find((s) => s.id === sectionId);
    if (targetSection) {
      updateCustomSection(sectionId, {
        items: targetSection.items.filter((i) => i.id !== itemId),
      });
    }
  };

  return (
    <div className="p-4 space-y-4 text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Custom Sections
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add certifications, publications, honors, volunteer work, or spoken languages.
          </p>
        </div>
        <button
          onClick={handleAddSection}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {customSections.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-400 text-xs space-y-2">
          <p>No custom sections added yet.</p>
          <button
            onClick={handleAddSection}
            className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 rounded-lg border border-blue-900/60 inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certifications & Honors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customSections.map((cs) => (
            <div key={cs.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <input
                  type="text"
                  value={cs.sectionTitle}
                  onChange={(e) => updateCustomSection(cs.id, { sectionTitle: e.target.value })}
                  placeholder="e.g. Certifications, Publications, Languages"
                  className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-3/4"
                />
                <button
                  onClick={() => handleDeleteSection(cs.id, cs.sectionTitle)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                  title="Delete Section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {cs.items.map((item, idx) => (
                  <div key={item.id} className="bg-slate-800/60 border border-slate-700/70 p-3 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Item #{idx + 1}</span>
                      <button
                        onClick={() => handleRemoveItem(cs.id, item.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Title / Name</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updatedItems = cs.items.map((i) =>
                              i.id === item.id ? { ...i, title: e.target.value } : i
                            );
                            updateCustomSection(cs.id, { items: updatedItems });
                          }}
                          placeholder="AWS Certified Solutions Architect"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Subtitle / Issuer</label>
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) => {
                            const updatedItems = cs.items.map((i) =>
                              i.id === item.id ? { ...i, subtitle: e.target.value } : i
                            );
                            updateCustomSection(cs.id, { items: updatedItems });
                          }}
                          placeholder="Amazon Web Services"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date / Year</label>
                        <input
                          type="text"
                          value={item.date || ''}
                          onChange={(e) => {
                            const updatedItems = cs.items.map((i) =>
                              i.id === item.id ? { ...i, date: e.target.value } : i
                            );
                            updateCustomSection(cs.id, { items: updatedItems });
                          }}
                          placeholder="2023"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Details (Optional)</label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updatedItems = cs.items.map((i) =>
                              i.id === item.id ? { ...i, description: e.target.value } : i
                            );
                            updateCustomSection(cs.id, { items: updatedItems });
                          }}
                          placeholder="Credential ID: 123456"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleAddItemToSection(cs.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item to {cs.sectionTitle}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

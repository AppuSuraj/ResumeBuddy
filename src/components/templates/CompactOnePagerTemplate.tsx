import React from 'react';
import { ResumeData } from '../../types/resume';

export const CompactOnePagerTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#0284c7';

  return (
    <div
      className="w-full bg-white text-slate-900 p-6 shadow-sm font-sans text-xs leading-snug"
      style={{ fontFamily: style.fontFamily || 'Inter' }}
    >
      {/* Dense Header */}
      <header className="border-b pb-3 mb-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none" style={{ color: primaryColor }}>
            {personal.fullName || 'Name'}
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-0.5 uppercase tracking-wide">
            {personal.jobTitle}
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600 space-y-0.5">
          <div>{personal.email} • {personal.phone}</div>
          <div>{personal.location} {personal.linkedin ? `• ${personal.linkedin}` : ''}</div>
        </div>
      </header>

      {/* Summary */}
      {personal.summary && (
        <section className="mb-3">
          <p className="text-[11px] text-slate-700 leading-normal italic">{personal.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1.5" style={{ borderColor: primaryColor }}>
            Experience
          </h2>
          <div className="space-y-2">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-semibold">
                  <span>{exp.jobTitle} <span className="font-normal text-slate-500">at</span> {exp.company}</span>
                  <span className="text-[10px] text-slate-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 mt-0.5">
                  {exp.highlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: primaryColor }}>
            Skills & Expertise
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-slate-800">{cat.categoryName}: </span>
                <span className="text-slate-600">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Projects Grid */}
      <div className="grid grid-cols-2 gap-4">
        {education.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: primaryColor }}>
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="text-[11px]">
                <div className="font-semibold text-slate-800">{edu.degree}</div>
                <div className="text-slate-600">{edu.institution} ({edu.startDate} - {edu.endDate})</div>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b pb-0.5 mb-1" style={{ borderColor: primaryColor }}>
              Projects
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} className="text-[11px]">
                <span className="font-semibold text-slate-800">{proj.name}: </span>
                <span className="text-slate-600">{proj.description}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

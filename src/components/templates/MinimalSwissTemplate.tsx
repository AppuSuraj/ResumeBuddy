import React from 'react';
import { ResumeData } from '../../types/resume';

export const MinimalSwissTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;

  return (
    <div className="w-full bg-stone-100 text-black p-10 shadow-sm font-sans">
      {/* Stark Grid Header */}
      <header className="grid grid-cols-3 border-b-2 border-black pb-6 mb-8">
        <div className="col-span-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
            {personal.fullName || 'FULL NAME'}
          </h1>
          <p className="text-sm font-bold tracking-widest mt-2 uppercase text-stone-700">
            {personal.jobTitle}
          </p>
        </div>
        <div className="text-xs font-mono space-y-1 text-right">
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
        </div>
      </header>

      {/* Summary */}
      {personal.summary && (
        <section className="grid grid-cols-4 gap-4 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest col-span-1">OBJECTIVE</h2>
          <p className="text-xs text-stone-800 col-span-3 leading-relaxed font-medium">{personal.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="grid grid-cols-4 gap-4 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest col-span-1">EXPERIENCE</h2>
          <div className="col-span-3 space-y-5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-xs">
                  <span>{exp.jobTitle.toUpperCase()}</span>
                  <span className="font-mono text-[11px] text-stone-600">{exp.startDate} — {exp.isCurrent ? 'PRESENT' : exp.endDate}</span>
                </div>
                <div className="text-xs font-semibold text-stone-600 mb-1">{exp.company}</div>
                <ul className="list-square list-inside space-y-1 text-xs text-stone-800">
                  {exp.highlights.map((hl, idx) => (
                    <li key={idx}>{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="grid grid-cols-4 gap-4 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest col-span-1">SKILLS</h2>
          <div className="col-span-3 space-y-1.5 text-xs font-medium">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold">{cat.categoryName}: </span>
                <span className="text-stone-700">{cat.skills.join(' / ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="grid grid-cols-4 gap-4">
          <h2 className="text-xs font-black uppercase tracking-widest col-span-1">EDUCATION</h2>
          <div className="col-span-3 space-y-2 text-xs">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <span className="font-bold">{edu.degree} — {edu.institution}</span>
                <span className="font-mono text-stone-600">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

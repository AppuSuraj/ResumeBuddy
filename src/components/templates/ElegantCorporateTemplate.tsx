import React from 'react';
import { ResumeData } from '../../types/resume';

export const ElegantCorporateTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#1e293b'; // Slate 800

  return (
    <div className="w-full bg-white text-slate-800 p-8 shadow-sm font-sans">
      <header className="border-b-4 border-slate-800 pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              {personal.fullName || 'Candidate Name'}
            </h1>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-1">
              {personal.jobTitle}
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5 font-medium">
            <div>{personal.email}</div>
            <div>{personal.phone}</div>
            <div>{personal.location}</div>
          </div>
        </div>
      </header>

      {personal.summary && (
        <section className="mb-6 bg-slate-50 p-3.5 rounded border-l-4 border-slate-800">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-slate-900 mb-1">Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{exp.jobTitle}</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                  {exp.highlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-1 mb-2">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-slate-900">{cat.categoryName}: </span>
                <span className="text-slate-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2 text-xs">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.institution}
                </div>
                <span className="text-slate-500">{edu.startDate} - {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

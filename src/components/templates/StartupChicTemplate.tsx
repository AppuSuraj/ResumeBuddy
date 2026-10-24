import React from 'react';
import { ResumeData } from '../../types/resume';

export const StartupChicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#2563eb'; // Professional blue default

  return (
    <div className="w-full bg-slate-50 text-slate-900 p-8 shadow-sm rounded-2xl font-sans space-y-6">
      {/* Header card */}
      <header className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {personal.fullName || 'Full Name'}
          </h1>
          <p className="text-sm font-extrabold mt-1" style={{ color: primaryColor }}>
            {personal.jobTitle}
          </p>

          <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-3">
            {personal.email && <span className="bg-slate-100 px-2.5 py-1 rounded-lg">✉️ {personal.email}</span>}
            {personal.phone && <span className="bg-slate-100 px-2.5 py-1 rounded-lg">📞 {personal.phone}</span>}
            {personal.location && <span className="bg-slate-100 px-2.5 py-1 rounded-lg">📍 {personal.location}</span>}
          </div>
        </div>
        {style.showPhoto && personal.photoUrl && (
          <img
            src={personal.photoUrl}
            alt={personal.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200"
          />
        )}
      </header>

      {/* Summary */}
      {personal.summary && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">About Me</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{personal.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Experience</h2>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-bold mb-2" style={{ color: primaryColor }}>{exp.company}</div>
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

      {/* Skills Pill Cloud */}
      {skills.length > 0 && (
        <section className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Skills</h2>
          <div className="space-y-3">
            {skills.map((cat) => (
              <div key={cat.id}>
                <div className="text-xs font-bold text-slate-800 mb-1.5">{cat.categoryName}</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Projects */}
      <div className="grid grid-cols-2 gap-4">
        {education.length > 0 && (
          <section className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="font-bold text-slate-900">{edu.degree}</div>
                <div className="text-slate-600">{edu.institution}</div>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Projects</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="font-bold text-slate-900">{proj.name}</div>
                <div className="text-slate-600">{proj.description}</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

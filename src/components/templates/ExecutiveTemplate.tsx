import React from 'react';
import { ResumeData } from '../../types/resume';

export const ExecutiveTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#1e3a8a'; // Executive Navy

  return (
    <div
      className="w-full bg-stone-50 text-stone-900 p-9 shadow-md font-serif"
      style={{ fontFamily: style.fontFamily || 'Merriweather, Georgia, serif' }}
    >
      {/* Header */}
      <header className="text-center border-b-2 border-stone-800 pb-5 mb-6">
        <h1 className="text-3xl font-extrabold uppercase tracking-widest text-stone-900" style={{ color: primaryColor }}>
          {personal.fullName || 'Executive Candidate'}
        </h1>
        {personal.jobTitle && (
          <p className="text-sm font-semibold uppercase tracking-wider text-stone-600 mt-1 font-sans">
            {personal.jobTitle}
          </p>
        )}

        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600 mt-3 font-sans">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.email && <span>• {personal.email}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
          {personal.website && <span>• {personal.website}</span>}
        </div>
      </header>

      {/* Executive Summary */}
      {personal.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 mb-2">
            Executive Profile
          </h2>
          <p className="text-xs text-stone-800 leading-relaxed italic">{personal.summary}</p>
        </section>
      )}

      {/* Leadership Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 mb-3">
            Professional Leadership & Career History
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline font-sans">
                  <h3 className="text-sm font-bold text-stone-900">{exp.jobTitle}</h3>
                  <span className="text-xs text-stone-600 font-semibold">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-bold italic mb-1.5" style={{ color: primaryColor }}>
                  {exp.company} {exp.location ? `| ${exp.location}` : ''}
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-stone-800">
                  {exp.highlights.map((hl, i) => (
                    <li key={i} className="leading-relaxed">{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 mb-3">
            Education & Academic Credentials
          </h2>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline font-sans">
                  <h3 className="text-xs font-bold text-stone-900">{edu.degree}</h3>
                  <span className="text-xs text-stone-600">{edu.startDate} – {edu.endDate}</span>
                </div>
                <p className="text-xs text-stone-700 italic">{edu.institution} {edu.location ? `— ${edu.location}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competencies / Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 mb-2">
            Core Competencies & Capabilities
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            {skills.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-stone-900">{cat.categoryName}: </span>
                <span className="text-stone-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections.map((cs) => (
        <section key={cs.id} className="mb-6">
          <h2 className="text-xs font-bold font-sans uppercase tracking-widest text-stone-800 border-b border-stone-300 pb-1 mb-2">
            {cs.sectionTitle}
          </h2>
          <div className="space-y-2 font-sans">
            {cs.items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-stone-900">{item.title}</span>
                  {item.date && <span className="text-stone-600">{item.date}</span>}
                </div>
                {item.subtitle && <p className="text-stone-700 italic">{item.subtitle}</p>}
                {item.description && <p className="text-stone-800 mt-0.5">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

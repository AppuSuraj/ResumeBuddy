import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const AcademicTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;

  return (
    <div className="w-full bg-white text-slate-900 p-10 shadow-sm font-serif leading-relaxed">
      {/* Header */}
      <header className="text-center border-b border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
          {personal.fullName || 'Scholar Name'}
        </h1>
        {personal.jobTitle && <p className="text-xs italic text-slate-700 mt-1">{personal.jobTitle}</p>}

        <div className="text-xs text-slate-600 mt-2 space-x-3 font-sans">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.website && <span>• {personal.website}</span>}
        </div>
      </header>

      {/* Education First for Academic */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{edu.degree}</span>
                  <span className="font-normal text-slate-600">{edu.startDate} – {edu.endDate}</span>
                </div>
                <div className="italic text-slate-700">{edu.institution}, {edu.location}</div>
                {edu.gpa && <div className="text-slate-600 mt-0.5">GPA: {edu.gpa}</div>}
                {edu.description && <div className="text-slate-700 mt-1">{edu.description}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      {personal.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
            Research Interests & Profile
          </h2>
          <p className="text-xs text-slate-800 italic">{personal.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-sans">
            Academic & Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{exp.jobTitle}</span>
                  <span className="font-normal text-slate-600">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <div className="italic text-slate-700 mb-1">{exp.company}, {exp.location}</div>
                <ul className="list-disc list-inside space-y-1 text-slate-800">
                  {exp.highlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects / Publications */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-sans">
            Publications & Key Projects
          </h2>
          <div className="space-y-2 text-xs">
            {projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <span className="font-bold">{proj.name}</span>
                {proj.description && (
                  <ProjectDescription
                    description={proj.description}
                    techStack={proj.techStack}
                    primaryColor="#0f172a"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections.map((cs) => (
        <section key={cs.id} className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
            {cs.sectionTitle}
          </h2>
          <div className="space-y-2 text-xs">
            {cs.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between">
                  <span className="font-bold">{item.title}</span>
                  {item.date && <span className="text-slate-600">{item.date}</span>}
                </div>
                {item.subtitle && <div className="italic text-slate-700">{item.subtitle}</div>}
                {item.description && <div className="text-slate-800">{item.description}</div>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

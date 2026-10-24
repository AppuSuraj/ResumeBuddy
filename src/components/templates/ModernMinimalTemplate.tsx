import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const ModernMinimalTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#2563eb';

  return (
    <div
      className="w-full bg-white text-slate-800 p-8 shadow-sm font-sans"
      style={{ fontFamily: style.fontFamily || 'Inter' }}
    >
      {/* Top Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: primaryColor }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ color: primaryColor }}>
              {personal.fullName || 'Your Full Name'}
            </h1>
            {personal.jobTitle && (
              <p className="text-lg font-medium text-slate-600 mt-1 uppercase tracking-wider">
                {personal.jobTitle}
              </p>
            )}
          </div>
          {style.showPhoto && personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 shadow-sm"
              style={{ borderColor: primaryColor }}
            />
          )}
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-4">
          {personal.email && <span>📧 {personal.email}</span>}
          {personal.phone && <span>📱 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.website && <span>🌐 {personal.website}</span>}
          {personal.linkedin && <span>🔗 LinkedIn</span>}
          {personal.github && <span>💻 GitHub</span>}
        </div>
      </header>

      {/* Summary */}
      {personal.summary && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Professional Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Work Experience</h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-slate-900">{exp.jobTitle}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-600 mb-1.5" style={{ color: primaryColor }}>
                  {exp.company} {exp.location ? `• ${exp.location}` : ''}
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                  {exp.highlights.map((hl, i) => (
                    <li key={i} className="leading-snug">{hl}</li>
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Education</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                  <span className="text-xs text-slate-500">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{edu.institution} {edu.location ? `• ${edu.location}` : ''}</p>
                {edu.gpa && <p className="text-xs text-slate-500 mt-0.5">GPA: {edu.gpa}</p>}
                {edu.description && <p className="text-xs text-slate-600 mt-1">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Skills & Expertise</h2>
          <div className="space-y-2">
            {skills.map((cat) => (
              <div key={cat.id} className="text-xs">
                <span className="font-semibold text-slate-800">{cat.categoryName}: </span>
                <span className="text-slate-600">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Key Projects</h2>
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{proj.name}</h3>
                  {proj.techStack && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {proj.techStack.join(', ')}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <ProjectDescription
                    description={proj.description}
                    primaryColor={style.primaryColor}
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{cs.sectionTitle}</h2>
          <div className="space-y-2">
            {cs.items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">{item.title}</span>
                  {item.date && <span className="text-slate-500">{item.date}</span>}
                </div>
                {item.subtitle && <p className="text-slate-600">{item.subtitle}</p>}
                {item.description && <p className="text-slate-700 mt-0.5">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

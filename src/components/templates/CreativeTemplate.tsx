import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const CreativeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#0ea5e9'; // Professional Sky Blue accent

  return (
    <div className="w-full bg-white text-slate-800 shadow-md rounded-lg overflow-hidden font-sans">
      {/* Creative Header Banner */}
      <header
        className="p-8 text-white relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10">
          {style.showPhoto && personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            />
          )}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {personal.fullName || 'Creative Specialist'}
            </h1>
            <p className="text-sm font-medium text-purple-200 uppercase tracking-widest mt-1">
              {personal.jobTitle || 'UI/UX & Product Designer'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-purple-100 mt-4">
              {personal.email && <span className="bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">✉️ {personal.email}</span>}
              {personal.phone && <span className="bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">📞 {personal.phone}</span>}
              {personal.location && <span className="bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">📍 {personal.location}</span>}
              {personal.website && <span className="bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">🌐 Portfolio</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        {/* Summary */}
        {personal.summary && (
          <section className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-900 mb-1">About Me</h2>
            <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              Work History & Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-5 border-l-2 border-purple-200">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{exp.company} {exp.location ? `• ${exp.location}` : ''}</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {exp.highlights.map((hl, idx) => (
                      <li key={idx} className="leading-snug">{hl}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              Skills & Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((cat) => (
                <div key={cat.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5">{cat.categoryName}</h3>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((s, i) => (
                      <span key={i} className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-900 mb-3">Education</h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs bg-slate-50 p-3 rounded-lg">
                    <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-purple-700 text-[11px] mt-0.5">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-900 mb-3">Projects</h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs bg-slate-50 p-3 rounded-lg">
                    <h3 className="font-bold text-slate-900 mb-1">{proj.name}</h3>
                    {proj.description && (
                      <ProjectDescription
                        description={proj.description}
                        techStack={proj.techStack}
                        primaryColor={primaryColor}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

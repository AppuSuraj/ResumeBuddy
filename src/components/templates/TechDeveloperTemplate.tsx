import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const TechDeveloperTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#0ea5e9';

  return (
    <div className="w-full bg-slate-900 text-slate-100 p-8 font-mono shadow-lg rounded-sm">
      {/* Header Bar */}
      <header className="border-b border-slate-700 pb-5 mb-6 flex justify-between items-start">
        <div>
          <div className="text-xs text-emerald-400 font-mono mb-1">// RESUME_SOURCE.ts</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            {personal.fullName || 'Developer Name'}
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: primaryColor }}>
            const role = "{personal.jobTitle || 'Full Stack Engineer'}";
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3 font-sans">
            {personal.email && <span>📧 {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.github && <span>💻 {personal.github}</span>}
            {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
          </div>
        </div>
        {style.showPhoto && personal.photoUrl && (
          <img
            src={personal.photoUrl}
            alt={personal.fullName}
            className="w-20 h-20 rounded-md object-cover border border-slate-700 shadow"
          />
        )}
      </header>

      {/* Summary */}
      {personal.summary && (
        <section className="mb-6 font-sans">
          <div className="text-xs font-mono text-slate-400 mb-1">/** ABOUT_ME **/</div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded border border-slate-800">
            {personal.summary}
          </p>
        </section>
      )}

      {/* Tech Skills Badges */}
      {skills.length > 0 && (
        <section className="mb-6 font-sans">
          <div className="text-xs font-mono text-slate-400 mb-2">/** TECHNICAL_STACK **/</div>
          <div className="space-y-2">
            {skills.map((cat) => (
              <div key={cat.id} className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300 mr-2">{cat.categoryName}:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                  {cat.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-sky-900/50"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-6 font-sans">
          <div className="text-xs font-mono text-slate-400 mb-3">/** WORK_HISTORY **/</div>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-slate-700 pl-4 py-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-white">{exp.jobTitle}</h3>
                  <span className="text-xs font-mono text-emerald-400">
                    {exp.startDate} :: {exp.isCurrent ? 'PRESENT' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold mb-2" style={{ color: primaryColor }}>
                  @{exp.company} {exp.location ? `[${exp.location}]` : ''}
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {exp.highlights.map((hl, i) => (
                    <li key={i} className="leading-normal">{hl}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6 font-sans">
          <div className="text-xs font-mono text-slate-400 mb-3">/** FEATURED_PROJECTS **/</div>
          <div className="grid grid-cols-1 gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-800/80 p-3 rounded border border-slate-700">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-white font-mono">{proj.name}</h3>
                  {proj.techStack && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      [{proj.techStack.join(', ')}]
                    </span>
                  )}
                </div>
                <ProjectDescription
                  description={proj.description}
                  primaryColor="#10b981"
                  textColorClass="text-slate-300"
                  bulletColorClass="text-emerald-400"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="font-sans">
          <div className="text-xs font-mono text-slate-400 mb-2">/** EDUCATION **/</div>
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs text-slate-300">
                <span className="font-bold text-white">{edu.degree}</span> — {edu.institution} ({edu.startDate} - {edu.endDate})
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

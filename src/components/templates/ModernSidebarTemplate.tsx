import React from 'react';
import { ResumeData } from '../../types/resume';

export const ModernSidebarTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, style } = data;
  const primaryColor = style.primaryColor || '#374151'; // Slate-700 Charcoal default
  const accentColor = '#3b82f6';

  return (
    <div className="w-full bg-white text-slate-800 shadow-md rounded-lg overflow-hidden font-sans flex min-h-[1056px]">
      {/* Light Sidebar */}
      <aside className="w-1/3 bg-slate-100 p-8 flex flex-col gap-6 border-r border-slate-200">
        <div className="text-center md:text-left">
          {style.showPhoto && personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-28 h-28 rounded-xl object-cover border border-slate-300 mx-auto md:mx-0 mb-4"
            />
          )}
          <h1 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: primaryColor }}>
            {personal.fullName || 'Professional Name'}
          </h1>
          <p className="text-sm font-semibold mt-1 text-slate-600">
            {personal.jobTitle}
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-600 mt-4 border-t border-slate-300 pt-6">
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>Contact</h2>
          {personal.email && <div className="flex items-center gap-2"><span>✉</span> {personal.email}</div>}
          {personal.phone && <div className="flex items-center gap-2"><span>☏</span> {personal.phone}</div>}
          {personal.location && <div className="flex items-center gap-2"><span>⚲</span> {personal.location}</div>}
          {personal.linkedin && <div className="flex items-center gap-2"><span>in</span> {personal.linkedin.replace('https://', '')}</div>}
          {personal.website && <div className="flex items-center gap-2"><span>🌐</span> {personal.website.replace('https://', '')}</div>}
        </div>

        {education.length > 0 && (
          <div className="mt-4 border-t border-slate-300 pt-6">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold text-slate-800">{edu.degree}</div>
                  <div className="text-slate-600">{edu.institution}</div>
                  <div className="text-slate-500 mt-0.5 italic">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mt-4 border-t border-slate-300 pt-6">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>Skills</h2>
            <div className="space-y-4 text-xs">
              {skills.map((cat) => (
                <div key={cat.id}>
                  <div className="font-bold text-slate-700 mb-1.5">{cat.categoryName}</div>
                  <div className="flex flex-col gap-1 text-slate-600">
                    {cat.skills.map((s, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>{s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="w-2/3 p-8 bg-white space-y-8">
        {personal.summary && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-2 text-slate-400">Profile</h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {personal.summary}
            </p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-4 text-slate-400">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mb-2" style={{ color: accentColor }}>{exp.company} {exp.location && `| ${exp.location}`}</div>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 marker:text-slate-400">
                    {exp.highlights.map((hl, i) => (
                      <li key={i} className="leading-snug">{hl}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-[11px] font-black uppercase tracking-widest mb-4 text-slate-400">Projects</h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-1">{proj.name}</div>
                  <div className="text-slate-700 leading-relaxed">{proj.description}</div>
                  {(proj.liveUrl || proj.githubUrl) && <div className="text-blue-600 mt-1.5 hover:underline">{(proj.liveUrl || proj.githubUrl)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

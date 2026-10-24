import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const ProfessionalTwoToneTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, style } = data;
  const primaryColor = style.primaryColor || '#0f172a'; // Navy/Slate dark default
  const accentColor = '#3b82f6'; // Bright blue for small highlights

  return (
    <div className="w-full bg-white text-slate-800 shadow-md rounded-lg overflow-hidden font-sans flex min-h-[1056px]">
      {/* Left Sidebar (Dark Tone) */}
      <aside 
        className="w-1/3 text-white p-8 flex flex-col gap-6"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="text-center md:text-left">
          {style.showPhoto && personal.photoUrl && (
            <img
              src={personal.photoUrl}
              alt={personal.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white/10 mx-auto md:mx-0 mb-4"
            />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            {personal.fullName || 'Professional Name'}
          </h1>
          <p className="text-sm font-medium mt-1 text-slate-300 uppercase tracking-widest">
            {personal.jobTitle}
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-300 mt-4 border-t border-white/10 pt-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</h2>
          {personal.email && <div className="flex items-center gap-2"><span>✉</span> {personal.email}</div>}
          {personal.phone && <div className="flex items-center gap-2"><span>☏</span> {personal.phone}</div>}
          {personal.location && <div className="flex items-center gap-2"><span>⚲</span> {personal.location}</div>}
          {personal.linkedin && <div className="flex items-center gap-2"><span>in</span> {personal.linkedin.replace('https://', '')}</div>}
          {personal.website && <div className="flex items-center gap-2"><span>🌐</span> {personal.website.replace('https://', '')}</div>}
        </div>

        {skills.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Skills & Expertise</h2>
            <div className="space-y-4 text-xs">
              {skills.map((cat) => (
                <div key={cat.id}>
                  <div className="font-bold text-slate-200 mb-1.5">{cat.categoryName}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((s, idx) => (
                      <span key={idx} className="bg-white/10 px-2 py-0.5 rounded text-slate-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold text-slate-100">{edu.degree}</div>
                  <div className="text-slate-400">{edu.institution}</div>
                  <div className="text-slate-500 mt-0.5">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Main Content (Light Tone) */}
      <main className="w-2/3 p-8 bg-white space-y-6">
        {personal.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b-2 pb-1 inline-block" style={{ borderColor: primaryColor, color: primaryColor }}>
              Professional Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {personal.summary}
            </p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b-2 pb-1 inline-block" style={{ borderColor: primaryColor, color: primaryColor }}>
              Work Experience
            </h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-bold mb-2 text-slate-600">{exp.company} {exp.location && `• ${exp.location}`}</div>
                  <ul className="list-none space-y-1 text-xs text-slate-700">
                    {exp.highlights.map((hl, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span style={{ color: accentColor }}>▪</span>
                        <span className="flex-1 leading-snug">{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b-2 pb-1 inline-block" style={{ borderColor: primaryColor, color: primaryColor }}>
              Selected Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="font-bold text-slate-900 mb-1">{proj.name}</div>
                  {proj.description && (
                    <ProjectDescription
                      description={proj.description}
                      techStack={proj.techStack}
                      primaryColor={primaryColor}
                    />
                  )}
                  {(proj.liveUrl || proj.githubUrl) && <div className="text-blue-600 mt-1">{(proj.liveUrl || proj.githubUrl)}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

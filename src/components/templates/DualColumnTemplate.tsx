import React from 'react';
import { ResumeData } from '../../types/resume';
import { ProjectDescription } from './ProjectDescription';

export const DualColumnTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  const { personal, experience, education, skills, projects, customSections, style } = data;
  const primaryColor = style.primaryColor || '#0f766e'; // Teal primary

  return (
    <div className="w-full bg-white text-slate-800 shadow-md font-sans flex min-h-[800px]">
      {/* Left Sidebar */}
      <aside className="w-1/3 bg-slate-900 text-slate-200 p-6 flex flex-col justify-between">
        <div>
          {/* Photo & Name */}
          <div className="text-center mb-6">
            {style.showPhoto && personal.photoUrl && (
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-2 border-teal-400 shadow-lg"
              />
            )}
            <h1 className="text-xl font-bold text-white leading-tight">
              {personal.fullName || 'Your Name'}
            </h1>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mt-1">
              {personal.jobTitle}
            </p>
          </div>

          {/* Contact Details */}
          <div className="mb-6 space-y-2 text-xs border-t border-slate-800 pt-4 text-slate-300">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</h2>
            {personal.email && <div className="break-all">✉️ {personal.email}</div>}
            {personal.phone && <div>📞 {personal.phone}</div>}
            {personal.location && <div>📍 {personal.location}</div>}
            {personal.website && <div className="break-all">🌐 {personal.website}</div>}
            {personal.linkedin && <div>🔗 LinkedIn</div>}
            {personal.github && <div>💻 GitHub</div>}
          </div>

          {/* Skills Sidebar */}
          {skills.length > 0 && (
            <div className="mb-6 border-t border-slate-800 pt-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-3">Skills</h2>
              <div className="space-y-3">
                {skills.map((cat) => (
                  <div key={cat.id}>
                    <div className="text-xs font-bold text-slate-200 mb-1">{cat.categoryName}</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded border border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Sidebar */}
          {education.length > 0 && (
            <div className="border-t border-slate-800 pt-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="font-bold text-white">{edu.degree}</div>
                    <div className="text-slate-400">{edu.institution}</div>
                    <div className="text-[10px] text-slate-500">{edu.startDate} - {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-2/3 p-7 space-y-6">
        {/* Summary */}
        {personal.summary && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Profile</h2>
            <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Work Experience</h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-bold text-slate-900">{exp.jobTitle}</h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: primaryColor }}>
                    {exp.company} {exp.location ? `| ${exp.location}` : ''}
                  </div>
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

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Key Projects</h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 className="text-xs font-bold text-slate-900">{proj.name}</h3>
                  <ProjectDescription
                    description={proj.description}
                    techStack={proj.techStack}
                    primaryColor={style.primaryColor}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {customSections.map((cs) => (
          <section key={cs.id}>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">{cs.sectionTitle}</h2>
            <div className="space-y-2">
              {cs.items.map((item) => (
                <div key={item.id} className="text-xs">
                  <div className="font-bold text-slate-800">{item.title}</div>
                  {item.subtitle && <div className="text-slate-600">{item.subtitle}</div>}
                  {item.description && <div className="text-slate-700 mt-0.5">{item.description}</div>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

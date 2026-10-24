import React from 'react';

interface Props {
  description: string;
  techStack?: string[];
  primaryColor?: string;
  bulletColorClass?: string;
  textColorClass?: string;
}

export const ProjectDescription: React.FC<Props> = ({
  description,
  techStack,
  primaryColor,
  bulletColorClass = 'text-slate-400',
  textColorClass = 'text-slate-700',
}) => {
  if (!description && (!techStack || techStack.length === 0)) {
    return null;
  }

  // Parse lines from description (splits by newlines or inline bullet characters)
  const rawText = description || '';
  
  // Split on newlines or if user pasted inline bullets like "• line 1 • line 2"
  let lines: string[] = [];
  if (rawText.includes('\n')) {
    lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  } else if (rawText.includes(' • ') || rawText.startsWith('• ')) {
    lines = rawText
      .split(/(?:^|\s+)•\s+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  } else {
    lines = [rawText.trim()].filter(Boolean);
  }

  // Check if content represents multiple bullet points or starts with bullet symbols
  const isBulletList =
    lines.length > 1 ||
    rawText.includes('•') ||
    rawText.includes('- ') ||
    rawText.includes('* ');

  // Clean bullet symbols from start of line
  const cleanedLines = lines.map((line) =>
    line.replace(/^[\s•\-\*\d\.\)]+\s*/, '').trim()
  ).filter(Boolean);

  return (
    <div className={`mt-1 text-xs ${textColorClass} space-y-1`}>
      {isBulletList ? (
        <ul className="space-y-1 my-1">
          {cleanedLines.map((line, idx) => (
            <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
              <span
                className={`select-none text-[10px] leading-tight mt-1 shrink-0 ${bulletColorClass}`}
                style={primaryColor ? { color: primaryColor } : undefined}
              >
                •
              </span>
              <span className="flex-1">{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="leading-relaxed whitespace-pre-line">{rawText}</p>
      )}

      {/* Render Tech Stack badge pills if provided and not duplicated in bullet text */}
      {techStack && techStack.length > 0 && !rawText.toLowerCase().includes('tech stack:') && (
        <div className="flex flex-wrap items-center gap-1 mt-1 pt-0.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-0.5">
            Stack:
          </span>
          {techStack.map((tech, tIdx) => (
            <span
              key={tIdx}
              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

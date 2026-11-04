import { GoogleGenAI } from '@google/genai';
import { ResumeData, JobDescriptionData, AiSummarySuggestion } from '../types/resume';

// Local storage key for optional user API key
const GEMINI_API_KEY_STORAGE_KEY = 'resumebuddy_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || '';
}

export function hasApiKey(): boolean {
  return Boolean(getStoredApiKey() && getStoredApiKey().trim().length > 5);
}

export function setStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  }
}

// Comprehensive dictionary of common skills for smarter extraction
const COMMON_TECH_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'DevOps', 'Terraform',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'Elasticsearch', 'Kafka',
  'System Architecture', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
  'Data Analysis', 'Data Science', 'Machine Learning', 'Deep Learning', 'AI', 'NLP', 'TensorFlow', 'PyTorch', 'Pandas',
  'Tailwind CSS', 'Next.js', 'Vue.js', 'Angular', 'SASS', 'Redux', 'HTML5', 'CSS3', 'Webpack', 'Vite',
  'UI/UX Design', 'Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'Wireframing', 'User Research',
  'Product Strategy', 'Product Management', 'Roadmapping', 'Cross-functional Leadership', 'Stakeholder Management',
  'Performance Optimization', 'Security', 'Cybersecurity', 'Penetration Testing', 'Cryptography',
  'Unit Testing', 'Integration Testing', 'Jest', 'Cypress', 'Selenium', 'A/B Testing', 'Google Analytics', 'SEO',
  'Salesforce', 'HubSpot', 'CRM', 'B2B Sales', 'Business Development', 'Account Management',
  'Financial Modeling', 'Accounting', 'Excel', 'Tableau', 'Power BI', 'Data Visualization'
];

const COMMON_SOFT_SKILLS = [
  'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking', 'Teamwork', 'Collaboration',
  'Adaptability', 'Time Management', 'Project Management', 'Client Relations', 'Negotiation',
  'Strategic Planning', 'Innovation', 'Mentoring', 'Public Speaking', 'Analytical Skills'
];

/**
 * Calculates total word count across all text sections in the resume body
 */
export function getResumeWordCount(resume?: ResumeData): number {
  if (!resume) return 0;
  const parts: string[] = [];
  if (resume.personal?.summary) parts.push(resume.personal.summary);
  if (resume.personal?.jobTitle) parts.push(resume.personal.jobTitle);
  if (resume.experience) {
    resume.experience.forEach((exp) => {
      if (exp.jobTitle) parts.push(exp.jobTitle);
      if (exp.company) parts.push(exp.company);
      if (exp.highlights) exp.highlights.forEach((h) => parts.push(h));
    });
  }
  if (resume.education) {
    resume.education.forEach((edu) => {
      if (edu.degree) parts.push(edu.degree);
      if (edu.institution) parts.push(edu.institution);
      if (edu.description) parts.push(edu.description);
    });
  }
  if (resume.skills) {
    resume.skills.forEach((cat) => {
      if (cat.skills) parts.push(...cat.skills);
    });
  }
  if (resume.projects) {
    resume.projects.forEach((proj) => {
      if (proj.name) parts.push(proj.name);
      if (proj.description) parts.push(proj.description);
      if (proj.highlights) proj.highlights.forEach((h) => parts.push(h));
      if (proj.techStack) proj.techStack.forEach((t) => parts.push(t));
    });
  }
  if (resume.customSections) {
    resume.customSections.forEach((sec) => {
      if (sec.items) {
        sec.items.forEach((item) => {
          if (item.title) parts.push(item.title);
          if (item.subtitle) parts.push(item.subtitle);
          if (item.description) parts.push(item.description);
        });
      }
    });
  }
  const text = parts.join(' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Extracts candidate resume content for keyword matching.
 * IMPORTANT: Excludes resume.jobTarget (which holds the JD and extracted keywords)
 * to prevent false-positive self-matching.
 */
export function getResumeSearchableText(resume?: ResumeData): string {
  if (!resume) return '';
  const parts: string[] = [];
  if (resume.personal?.fullName) parts.push(resume.personal.fullName);
  if (resume.personal?.jobTitle) parts.push(resume.personal.jobTitle);
  if (resume.personal?.summary) parts.push(resume.personal.summary);
  if (resume.experience) {
    resume.experience.forEach((exp) => {
      if (exp.jobTitle) parts.push(exp.jobTitle);
      if (exp.company) parts.push(exp.company);
      if (exp.highlights) exp.highlights.forEach((h) => parts.push(h));
    });
  }
  if (resume.education) {
    resume.education.forEach((edu) => {
      if (edu.degree) parts.push(edu.degree);
      if (edu.institution) parts.push(edu.institution);
      if (edu.description) parts.push(edu.description);
    });
  }
  if (resume.skills) {
    resume.skills.forEach((cat) => {
      if (cat.categoryName) parts.push(cat.categoryName);
      if (cat.skills) parts.push(...cat.skills);
    });
  }
  if (resume.projects) {
    resume.projects.forEach((proj) => {
      if (proj.name) parts.push(proj.name);
      if (proj.description) parts.push(proj.description);
      if (proj.highlights) proj.highlights.forEach((h) => parts.push(h));
      if (proj.techStack) proj.techStack.forEach((t) => parts.push(t));
    });
  }
  if (resume.customSections) {
    resume.customSections.forEach((sec) => {
      if (sec.sectionTitle) parts.push(sec.sectionTitle);
      if (sec.items) {
        sec.items.forEach((item) => {
          if (item.title) parts.push(item.title);
          if (item.subtitle) parts.push(item.subtitle);
          if (item.description) parts.push(item.description);
        });
      }
    });
  }
  return parts.join(' ');
}

// Explicit stopword blacklist fallback ensuring generic English words are never scored as ATS keywords
export const STOPWORD_BLACKLIST = new Set([
  'about', 'you', 'your', 'all', 'this', 'our', 'key', 'what', 'we', 'with',
  'the', 'and', 'for', 'are', 'from', 'can', 'will', 'have', 'has', 'been',
  'each', 'more', 'other', 'into', 'than', 'them', 'these', 'their', 'there',
  'they', 'were', 'when', 'which', 'who', 'how', 'why', 'also', 'such', 'some',
  'well', 'most', 'very', 'only', 'just', 'over', 'both', 'must', 'should',
  'could', 'would', 'done', 'does', 'doing', 'where', 'work', 'role', 'team',
  'candidate', 'experience', 'responsibilities', 'qualifications', 'requirements',
  'summary', 'overview', 'description', 'position', 'apply', 'opportunity',
  'including', 'looking', 'needed', 'ability', 'preferred', 'minimum', 'plus',
  'job', 'skills', 'duties', 'ideal', 'level', 'status', 'company'
]);

export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds a strict regex ensuring word boundaries \b for alphanumeric boundaries,
 * and character boundary checks for symbols like C++, C#, .NET.
 */
export const buildStrictWordBoundary = (kw: string): RegExp => {
  const esc = escapeRegex(kw);
  const left = /^\w/.test(kw) ? '\\b' : '(?<=^|[\\s.,;:!?()\\[\\]"\'])';
  const right = /\w$/.test(kw) ? '\\b' : '(?=$|[\\s.,;:!?()\\[\\]"\'])';
  return new RegExp(`${left}${esc}${right}`, 'i');
};

/**
 * Fast offline extractor with stopword filtering and strict word boundaries
 */
export function extractJdKeywordsOffline(jdText: string): string[] {
  if (!jdText || jdText.trim().length < 5) return [];

  // Match known skills with strict word boundaries
  const allKnownSkills = [...COMMON_TECH_KEYWORDS, ...COMMON_SOFT_SKILLS];
  const matchedSkills = allKnownSkills.filter((keyword) => {
    const regex = buildStrictWordBoundary(keyword);
    return regex.test(jdText);
  });

  // Extract prominent multi-word capitalized terms (e.g. specialized tools or frameworks)
  const potentialProperNouns = jdText.match(/\b([A-Z][a-z0-9\.\+#]+(?:\s+[A-Z0-9\.\+#]+){0,2})\b/g) || [];
  const properNounsFiltered = potentialProperNouns.filter((w) => {
    const lower = w.toLowerCase().trim();
    return (
      w.length >= 2 &&
      !STOPWORD_BLACKLIST.has(lower) &&
      !lower.split(/\s+/).some((token) => STOPWORD_BLACKLIST.has(token))
    );
  });

  const unique = Array.from(new Set([...matchedSkills, ...properNounsFiltered]))
    .filter((kw) => !STOPWORD_BLACKLIST.has(kw.toLowerCase().trim()));

  return unique.slice(0, 15);
}

/**
 * High-efficiency, low-token JD Keyword Extractor using Gemini 2.5 Flash
 * Enforces responseMimeType: "application/json" and temperature: 0.1
 * Falls back to stopword-filtered offline extractor if offline or without API key.
 */
export async function extractJdKeywordsWithAi(jdText: string): Promise<string[]> {
  const truncatedJd = (jdText || '').trim().slice(0, 2000);
  if (!truncatedJd) return [];

  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Extract up to 15 core technical skills, certifications, and industry domain keywords from this job description. Exclude pronouns, common English verbs, and filler words. Output JSON array of strings only.\n\nJob Description:\n${truncatedJd}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed
            .map((s: any) => String(s).trim())
            .filter((s: string) => s.length >= 2 && !STOPWORD_BLACKLIST.has(s.toLowerCase()));
          if (sanitized.length > 0) {
            return sanitized.slice(0, 15);
          }
        }
      }
    } catch (err) {
      console.warn('Gemini keyword extraction error, using offline stopword fallback:', err);
    }
  }

  return extractJdKeywordsOffline(truncatedJd);
}

/**
 * Parses Job Description text to extract keywords and calculate ATS match score
 */
export function analyzeJobDescription(
  jobTitle: string,
  jdText: string,
  currentResume?: ResumeData,
  preExtractedKeywords?: string[]
): JobDescriptionData {
  const wordCount = currentResume ? getResumeWordCount(currentResume) : 0;
  const hasJdText = Boolean(jdText && jdText.trim().length >= 10);

  if (!hasJdText) {
    return {
      targetRoleTitle: jobTitle || 'Target Role',
      jobDescriptionText: jdText || '',
      extractedKeywords: [],
      requiredSkills: [],
      atsScore: 0,
      matchFeedback: {
        matchedKeywords: [],
        missingKeywords: [],
        recommendations: [
          'Paste a detailed Job Description to receive an accurate ATS Match Score & keyword breakdown.',
        ],
      },
    };
  }

  // Use pre-extracted keywords (from Gemini Flash) or fallback offline extractor
  const uniqueKeywords = (preExtractedKeywords && preExtractedKeywords.length > 0)
    ? preExtractedKeywords.filter((kw) => !STOPWORD_BLACKLIST.has(kw.toLowerCase().trim()))
    : extractJdKeywordsOffline(jdText);

  const topRequiredSkills = uniqueKeywords.slice(0, 15);

  // If resume is provided, check matches using strict word boundaries to avoid sub-string false positives
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];

  if (currentResume) {
    const resumeSearchText = getResumeSearchableText(currentResume);
    matchedKeywords = uniqueKeywords.filter((kw) => {
      const boundaryRegex = buildStrictWordBoundary(kw);
      return boundaryRegex.test(resumeSearchText);
    });
    missingKeywords = uniqueKeywords.filter((kw) => !matchedKeywords.includes(kw));
  } else {
    matchedKeywords = [];
    missingKeywords = topRequiredSkills;
  }

  // Prevent artificial inflation: Return 0% if resume body word count is < 20
  if (wordCount < 20) {
    const recommendations: string[] = [
      `Resume body word count is currently ${wordCount} (minimum 20 words required for ATS evaluation). Complete your work experience and summary.`,
    ];
    if (missingKeywords.length > 0) {
      recommendations.push(
        `Consider adding: ${missingKeywords.slice(0, 3).join(', ')} once your resume content is expanded.`
      );
    }
    return {
      targetRoleTitle: jobTitle || 'Target Role',
      jobDescriptionText: jdText,
      extractedKeywords: uniqueKeywords,
      requiredSkills: topRequiredSkills,
      atsScore: 0,
      matchFeedback: {
        matchedKeywords,
        missingKeywords,
        recommendations,
      },
    };
  }

  // Weight 1: Keyword match percentage (60%)
  const keywordScore = uniqueKeywords.length > 0
    ? (matchedKeywords.length / uniqueKeywords.length) * 60
    : 0;

  // Weight 2: Target Role presence in headline/summary (20%)
  const targetRoleLower = (jobTitle || currentResume?.jobTarget?.targetRoleTitle || '').trim().toLowerCase();
  const headlineLower = (currentResume?.personal?.jobTitle || '').toLowerCase();
  const summaryLower = (currentResume?.personal?.summary || '').toLowerCase();
  let roleScore = 0;

  if (targetRoleLower) {
    if (headlineLower.includes(targetRoleLower) || summaryLower.includes(targetRoleLower)) {
      roleScore = 20;
    } else {
      const tokens = targetRoleLower.split(/\s+/).filter(w => w.length > 2);
      if (tokens.length > 0) {
        const matchedTokens = tokens.filter(t => headlineLower.includes(t) || summaryLower.includes(t));
        roleScore = (matchedTokens.length / tokens.length) * 20;
      }
    }
  }

  // Weight 3: Completion of core sections (Personal, Experience, Skills, Education) (20%)
  let sectionScore = 0;
  const missingCoreSections: string[] = [];

  const hasPersonal = Boolean(
    currentResume?.personal?.fullName?.trim() &&
    (currentResume?.personal?.email?.trim() || currentResume?.personal?.phone?.trim())
  );
  if (hasPersonal) {
    sectionScore += 5;
  } else {
    missingCoreSections.push('Personal Details');
  }

  const hasExperience = Boolean(
    currentResume?.experience &&
    currentResume.experience.length > 0 &&
    currentResume.experience.some(e => e.jobTitle?.trim() && e.highlights?.some(h => h.trim().length > 0))
  );
  if (hasExperience) {
    sectionScore += 5;
  } else {
    missingCoreSections.push('Work Experience');
  }

  const hasSkills = Boolean(
    currentResume?.skills &&
    currentResume.skills.length > 0 &&
    currentResume.skills.some(cat => cat.skills && cat.skills.length > 0)
  );
  if (hasSkills) {
    sectionScore += 5;
  } else {
    missingCoreSections.push('Skills');
  }

  const hasEducation = Boolean(
    currentResume?.education &&
    currentResume.education.length > 0 &&
    currentResume.education.some(edu => edu.degree?.trim() || edu.institution?.trim())
  );
  if (hasEducation) {
    sectionScore += 5;
  } else {
    missingCoreSections.push('Education');
  }

  // Direct reactive ATS Score based on matched keywords against target keywords
  const targetKeywordsCount = Math.max(uniqueKeywords.length, 1);
  const atsScore = Math.min(100, Math.max(0, Math.round((matchedKeywords.length / targetKeywordsCount) * 100)));

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Consider adding: ${missingKeywords.slice(0, 3).join(', ')} into your experience bullet points or skills section.`
    );
  }
  if (roleScore < 20) {
    recommendations.push(`Tailor your Headline or Professional Summary to mention "${jobTitle || 'Target Role'}" explicitly (+20% ATS weight).`);
  }
  if (missingCoreSections.length > 0) {
    recommendations.push(`Complete core sections (${missingCoreSections.join(', ')}) to satisfy automated parser requirements.`);
  }

  return {
    targetRoleTitle: jobTitle || 'Target Role',
    jobDescriptionText: jdText,
    extractedKeywords: uniqueKeywords,
    requiredSkills: topRequiredSkills,
    atsScore,
    matchFeedback: {
      matchedKeywords,
      missingKeywords,
      recommendations,
    },
  };
}

/**
 * Dynamically synthesizes relevant skills based on Job Title, Job Description, and Work Experience.
 */
export function getSuggestedSkills(resumeData: ResumeData): string[] {
  const suggestions = new Set<string>();

  const roleTitle = (resumeData.jobTarget.targetRoleTitle || resumeData.personal.jobTitle || '').toLowerCase();
  const jdText = (resumeData.jobTarget.jobDescriptionText || '').toLowerCase();

  // 1. Role-specific Skill Database Suggestions
  if (roleTitle.includes('service desk') || roleTitle.includes('helpdesk') || roleTitle.includes('support') || roleTitle.includes('it spec') || roleTitle.includes('sysadmin')) {
    ['Active Directory', 'Azure AD', 'Office 365', 'ServiceNow', 'ITIL', 'Windows Server', 'PowerShell', 'Remote Desktop (RDP)', 'Hardware Diagnostics', 'TCP/IP & DNS', 'Ticketing Systems', 'Troubleshooting', 'MFA / RSA'].forEach(s => suggestions.add(s));
  } else if (roleTitle.includes('frontend') || roleTitle.includes('react') || roleTitle.includes('web dev')) {
    ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML5 & CSS3', 'Next.js', 'Redux', 'REST APIs', 'Webpack / Vite', 'UI/UX Design', 'Performance Optimization', 'Git'].forEach(s => suggestions.add(s));
  } else if (roleTitle.includes('backend') || roleTitle.includes('software eng') || roleTitle.includes('full stack') || roleTitle.includes('developer')) {
    ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'REST APIs', 'Microservices', 'GraphQL', 'AWS', 'CI/CD', 'Git'].forEach(s => suggestions.add(s));
  } else if (roleTitle.includes('devops') || roleTitle.includes('cloud') || roleTitle.includes('infra')) {
    ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Linux Administration', 'Ansible', 'Bash Scripting', 'Monitoring (Prometheus/Grafana)'].forEach(s => suggestions.add(s));
  } else if (roleTitle.includes('data') || roleTitle.includes('analyst') || roleTitle.includes('science')) {
    ['SQL', 'Python', 'Pandas & NumPy', 'Tableau / Power BI', 'Data Visualization', 'ETL Pipelines', 'Snowflake', 'BigQuery', 'Machine Learning', 'Statistical Analysis'].forEach(s => suggestions.add(s));
  } else if (roleTitle.includes('product') || roleTitle.includes('project') || roleTitle.includes('manager') || roleTitle.includes('agile')) {
    ['Agile & Scrum', 'Jira & Confluence', 'Product Strategy', 'Roadmapping', 'User Research', 'A/B Testing', 'Stakeholder Management', 'KPI / OKR Tracking', 'Cross-functional Leadership'].forEach(s => suggestions.add(s));
  }

  // 2. Extract from Job Description text
  const allKnown = [...COMMON_TECH_KEYWORDS, ...COMMON_SOFT_SKILLS];
  if (jdText) {
    allKnown.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(jdText)) {
        suggestions.add(keyword);
      }
    });
  }

  // 3. Extract from Work Experience highlights & titles
  const expFullText = resumeData.experience
    .map(e => `${e.jobTitle} ${e.company} ${e.highlights.join(' ')}`)
    .join(' ');
  
  if (expFullText) {
    allKnown.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(expFullText.toLowerCase())) {
        suggestions.add(keyword);
      }
    });

    // Auto-detect uppercase tech acronyms like SCCM, RSA, MFA, VPN, AWS, SQL, IAM
    const acronyms = expFullText.match(/\b[A-Z]{2,5}\b/g) || [];
    acronyms.forEach(ac => {
      if (!['THE', 'FOR', 'AND', 'WITH', 'NOT', 'ITS', 'MAY', 'OUR', 'NEW', 'CAN'].includes(ac)) {
        suggestions.add(ac);
      }
    });
  }

  // 4. Exclude skills that the user has already added to their skill categories
  const existingSkills = new Set(
    resumeData.skills.flatMap(cat => cat.skills.map(s => s.toLowerCase().trim()))
  );

  const junkSet = new Set([
    'job summary', 'job summary we', 'level', 'position title', 'we are', 'looking for',
    'about us', 'full time', 'part time', 'key responsibilities', 'qualifications', 'requirements',
    'company overview', 'equal opportunity', 'work experience', 'job description'
  ]);

  return Array.from(suggestions)
    .filter(skill => !existingSkills.has(skill.toLowerCase().trim()) && !junkSet.has(skill.toLowerCase().trim()))
    .slice(0, 20);
}

/**
 * Fetches real-time AI skill suggestions powered by Gemini (or smart offline engine)
 * based on role title, category, target JD, and what the user is typing in the input.
 */
export async function getLiveAiSkillSuggestions(params: {
  roleTitle: string;
  categoryName?: string;
  currentInput?: string;
  existingSkills: string[];
  jobDescription?: string;
}): Promise<string[]> {
  const { roleTitle, categoryName = '', currentInput = '', existingSkills, jobDescription = '' } = params;
  const existingSet = new Set(existingSkills.map(s => s.toLowerCase().trim()));
  const apiKey = getStoredApiKey();

  // If Gemini API Key is provided, call Gemini for rich dynamic suggestions
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an elite technical recruiter and resume ATS optimization specialist.
Suggest 8 highly relevant, industry-standard skill tags for a candidate.
Target Role: "${roleTitle || 'Professional'}"
Category: "${categoryName || 'Technical & Professional Skills'}"
${currentInput.trim() ? `User is typing query: "${currentInput.trim()}" (prioritize skills starting with or matching this query)` : ''}
${jobDescription.trim() ? `Target Job Description Context: "${jobDescription.slice(0, 400)}"` : ''}
Already added skills to omit: ${Array.from(existingSet).slice(0, 30).join(', ')}

Return ONLY a valid JSON array of strings (e.g. ["Active Directory", "PowerShell", "Azure DevOps"]). No explanation, no markdown ticks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed
              .map((s: any) => String(s).trim())
              .filter((s: string) => s.length > 1 && !existingSet.has(s.toLowerCase()));
            if (filtered.length > 0) {
              return filtered.slice(0, 8);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Gemini skill suggestions failed, falling back to local dictionary:', err);
    }
  }

  // Fast & Smart Offline Heuristic Fallback
  const q = currentInput.trim().toLowerCase();
  const allSkills = Array.from(new Set([
    ...COMMON_TECH_KEYWORDS,
    ...COMMON_SOFT_SKILLS,
    'Active Directory', 'Azure AD', 'Office 365', 'ServiceNow', 'ITIL', 'Windows Server',
    'PowerShell', 'Remote Desktop (RDP)', 'Hardware Diagnostics', 'TCP/IP & DNS',
    'Ticketing Systems', 'Troubleshooting', 'MFA / RSA', 'Salesforce', 'Jira Service Management',
    'Zendesk', 'Okta', 'Intune', 'SCCM', 'Linux', 'Ubuntu', 'Bash', 'Terraform', 'Ansible',
    'Docker', 'Kubernetes', 'Helm', 'CI/CD Pipelines', 'GitHub Actions', 'Jenkins',
    'Postman', 'Swagger', 'Grafana', 'Prometheus', 'Datadog', 'Splunk', 'Wireshark'
  ]));

  if (q) {
    const startsWithMatches = allSkills.filter(s => s.toLowerCase().startsWith(q) && !existingSet.has(s.toLowerCase()));
    const containsMatches = allSkills.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q) && !existingSet.has(s.toLowerCase()));
    return [...startsWithMatches, ...containsMatches].slice(0, 8);
  }

  // Default role-relevant suggestions if query is empty
  const roleLower = roleTitle.toLowerCase();
  const matched = allSkills.filter(s => {
    if (existingSet.has(s.toLowerCase())) return false;
    if (roleLower.includes('support') || roleLower.includes('desk') || roleLower.includes('specialist')) {
      return ['Office 365', 'Active Directory', 'ServiceNow', 'ITIL', 'PowerShell', 'TCP/IP & DNS', 'MFA / RSA', 'Ticketing Systems'].includes(s);
    }
    if (roleLower.includes('dev') || roleLower.includes('eng') || roleLower.includes('frontend') || roleLower.includes('react')) {
      return ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'CI/CD Pipelines'].includes(s);
    }
    return true;
  });

  return matched.slice(0, 8);
}

/**
 * Intelligent Smart Offline AI Contextual Bullet Rewriter
 * Transforms user draft bullets into professional, grammatically correct, ATS-optimized variations.
 */
function enhanceBulletTextOffline(currentText: string, roleTitle: string, company: string): string[] {
  // 1. Sanitize raw text & strip trailing punctuation/whitespace
  const rawText = currentText.trim().replace(/[\.\,\;\:]+$/, '').trim();
  const lowerText = rawText.toLowerCase();

  // 2. Comprehensive technical dictionary & acronym extractor
  const knownTechMap: Record<string, string> = {
    'mfa': 'Multi-Factor Authentication (MFA)',
    'rsa': 'RSA',
    'sccm': 'SCCM',
    'active directory': 'Active Directory',
    'azure portal': 'Azure Portal',
    'azure': 'Azure',
    'aws': 'AWS',
    'gcp': 'Google Cloud (GCP)',
    'react': 'React',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'node': 'Node.js',
    'node.js': 'Node.js',
    'python': 'Python',
    'java': 'Java',
    'sql': 'SQL',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'salesforce': 'Salesforce',
    'jira': 'Jira',
    'tableau': 'Tableau',
    'power bi': 'Power BI',
    'figma': 'Figma',
    'git': 'Git',
    'vpn': 'VPN',
    'sso': 'SSO',
    'iam': 'IAM',
    'vdi': 'VDI',
    'rdp': 'RDP',
  };

  const foundTech: string[] = [];
  Object.keys(knownTechMap).forEach((key) => {
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      foundTech.push(knownTechMap[key]);
    }
  });

  // Auto-detect uppercase acronyms like RSA, SCCM, MFA, VPN
  const uppercaseAcronyms = rawText.match(/\b[A-Z]{2,6}\b/g) || [];
  uppercaseAcronyms.forEach((acronym) => {
    if (!foundTech.some((t) => t.includes(acronym))) {
      foundTech.push(acronym);
    }
  });

  const uniqueTech = Array.from(new Set(foundTech));
  let techStr = '';
  if (uniqueTech.length > 2) {
    techStr = `${uniqueTech.slice(0, -1).join(', ')} and ${uniqueTech[uniqueTech.length - 1]}`;
  } else if (uniqueTech.length > 0) {
    techStr = uniqueTech.join(' and ');
  }

  // 3. Strip initial weak verbs and trailing infinitives
  let cleanedText = rawText
    .replace(/^(used|using|utilized|utilizing|assisted|assisting|helped|helping|worked on|worked with|did|was responsible for|managed to|handled|handling|troubleshot|troubleshooting)\s+/i, '')
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+to\s+(troubleshoot|resolve|fix|help|improve|support|manage)[\.\s]*$/i, '')
    .trim();

  // 4. Transform topic into natural professional noun/verb phrases
  let actionTopic = cleanedText;

  if (lowerText.includes('mfa') || lowerText.includes('rsa') || lowerText.includes('sccm') || lowerText.includes('remote control') || lowerText.includes('authentication')) {
    actionTopic = 'user authentication security protocols and remote desktop sessions for customer endpoint troubleshooting';
  } else if (lowerText.includes('access issue') || lowerText.includes('access issues')) {
    actionTopic = 'user access permissions and identity authentication tickets';
  } else if (lowerText.includes('react') || lowerText.includes('node') || lowerText.includes('dashboard') || lowerText.includes('build')) {
    actionTopic = 'web dashboard components and responsive user interface features';
  }

  if (!actionTopic || actionTopic.length < 3) {
    actionTopic = 'key technical operations and endpoint support workflows';
  }

  // Formulate 4 distinct, perfectly grammatical bullet point variations
  const var1 = `Administered ${techStr || 'technical systems'} to manage ${actionTopic}, improving incident resolution SLA by 35% and boosting overall system reliability.`;
  const var2 = `Diagnosed and resolved technical issues regarding ${actionTopic}${techStr ? ` utilizing ${techStr}` : ''}, maintaining 99.9% operational availability across customer endpoints.`;
  const var3 = `Enforced ${techStr || 'security protocols'} for ${actionTopic}, streamlining technical support workflows and reducing ticket turnaround times by 30%.`;
  const var4 = `Streamlined remote troubleshooting and customer support operations for ${actionTopic}${techStr ? ` leveraging ${techStr}` : ''}, achieving 95%+ first-contact resolution rates.`;

  // Clean double punctuation (e.g. "troubleshoot.,", "..", ",,")
  return [var1, var2, var3, var4].map((bullet) =>
    bullet
      .replace(/[\.\,]+\,/g, ',')
      .replace(/[\.\,]+\./g, '.')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Generates high-impact AI Bullet Points for work experience roles
 */
export async function generateAiBullets(
  roleTitle: string,
  company: string,
  targetJd?: string,
  currentText?: string,
  mode: 'contextual' | 'generalized' = 'contextual'
): Promise<string[]> {
  const apiKey = getStoredApiKey();

  // Try live Gemini API call if API key exists
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = '';

      if (mode === 'contextual') {
        prompt = `Act as an executive ATS resume coach.
Candidate Role: "${roleTitle || 'Professional'}" at "${company || 'Company'}".
${targetJd ? `Target Job Context: ${targetJd.slice(0, 450)}` : ''}
${currentText && currentText.trim().length > 3 ? `Draft bullet to polish: "${currentText}"` : ''}

Generate 4 high-impact accomplishment bullet points tailored specifically to this role and target job requirements.
Rules:
1. Every bullet MUST follow Google's X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".
2. Begin with strong past-tense action verbs (e.g., Engineered, Spearheaded, Accelerated, Optimized, Orchestrated).
3. Include realistic, quantifiable metrics (percentages, latency, throughput, dollar amounts, SLA improvements).
4. Preserve and emphasize relevant technical stack keywords matching the role and JD.
5. Return strictly a JSON array of 4 strings (e.g. ["Accomplished X...", "Accelerated Y..."]). No markdown ticks, no preamble.`;
      } else {
        prompt = `Act as an executive ATS resume coach.
Candidate Role: "${roleTitle || 'Professional'}" at "${company || 'Company'}".
${currentText && currentText.trim().length > 3 ? `Draft bullet to polish: "${currentText}"` : ''}

Generate 4 universally accepted, high-impact bullet points for this job title covering core pillars (agile sprint execution, cross-functional collaboration, system reliability, process improvement).
Rules:
1. Every bullet MUST follow Google's X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]".
2. Begin with strong past-tense action verbs (e.g., Spearheaded, Delivered, Championed, Streamlined).
3. Include realistic quantifiable metrics (percentages, team sizes, project turnaround timelines).
4. Return strictly a JSON array of 4 strings. No markdown ticks, no preamble.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        try {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.map((s) => String(s).trim()).filter((s) => s.length > 10);
            if (valid.length >= 2) {
              return valid.slice(0, 4);
            }
          }
        } catch {
          const bullets = response.text
            .split('\n')
            .map((line) => line.replace(/^[\s•\-\*\d\.\[\]"']+\s*/, '').replace(/["'],?$/, '').trim())
            .filter((line) => line.length > 10);
          if (bullets.length >= 2) {
            return bullets.slice(0, 4);
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart offline generator:', err);
    }
  }

  // Offline Smart AI Bullet Generator fallback
  if (currentText && currentText.trim().length > 5) {
    return enhanceBulletTextOffline(currentText, roleTitle, company);
  }

  const roleLower = roleTitle.toLowerCase();

  if (mode === 'generalized') {
    return [
      `Delivered 6 critical product milestones ahead of schedule by leading agile sprint cadences across cross-functional engineering and design teams.`,
      `Improved cross-departmental project turnaround time by 32% by establishing streamlined communication channels and weekly sync retrospectives.`,
      `Championed operational best practices and peer review workflows, reducing post-launch defects by 45% across recurring delivery cycles.`,
      `Mentored 4 junior and mid-level team members, accelerating onboarding velocity and increasing team output efficiency by 25%.`,
    ];
  }

  // Contextual offline role fallbacks
  if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('tech') || roleLower.includes('frontend') || roleLower.includes('backend') || roleLower.includes('full stack')) {
    return [
      `Architected and deployed scalable cloud microservices for ${roleTitle} at ${company}, reducing deployment latency by 35% across production environments.`,
      `Engineered high-throughput API endpoints supporting over 250,000 daily active users with 99.9% uptime SLA.`,
      `Reduced production bug incident frequency by 40% by implementing automated test-driven development (TDD) and CI/CD pipelines.`,
      `Optimized database indexing and queries, achieving a 50% performance improvement in API response times during peak traffic.`,
    ];
  } else if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('product') || roleLower.includes('project')) {
    return [
      `Spearheaded product roadmap and feature delivery for ${company}, increasing customer retention rates by 28% year-over-year.`,
      `Managed an agile cross-functional team of 12+ engineers and designers, delivering 4 key enterprise releases on time and within budget.`,
      `Defined core product KPIs and conducted data-driven user research, resulting in a 35% growth in monthly user engagement.`,
      `Streamlined cross-team dependency mapping, cutting overall release cycle turnaround time by 3 weeks.`,
    ];
  } else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('science')) {
    return [
      `Built automated data ingestion pipelines and predictive models at ${company}, driving strategic decisions for executive stakeholders.`,
      `Designed interactive executive dashboards visualizing business operational metrics, identifying $450K in annual cost savings.`,
      `Executed exploratory data analysis across 10M+ transaction records, boosting churn prediction accuracy by 30%.`,
      `Collaborated with growth teams to design and evaluate multi-arm bandit experiments, optimizing conversion funnel efficiency by 18%.`,
    ];
  } else if (roleLower.includes('support') || roleLower.includes('it') || roleLower.includes('desk') || roleLower.includes('admin') || roleLower.includes('specialist')) {
    return [
      `Resolved 1,200+ Tier-2/3 technical support tickets with a 98% first-touch resolution rate by optimizing ServiceNow troubleshooting runbooks.`,
      `Administered Active Directory, Okta MFA, and endpoint configuration policies for 850+ enterprise users with zero security compliance lapses.`,
      `Reduced average hardware and software ticket resolution turnaround time by 35% through automated PowerShell diagnostic scripts.`,
      `Provisioned and maintained cloud-managed endpoints and VPN tunnels across hybrid remote workforces, achieving 99.9% availability.`,
    ];
  } else if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui') || roleLower.includes('creative')) {
    return [
      `Created comprehensive multi-brand design systems for ${company}, reducing designer-to-developer handoff time by 45%.`,
      `Conducted user interviews and usability testing with 50+ participants, resolving core checkout funnel friction points.`,
      `Redesigned core product web & mobile interfaces, driving a 24% increase in user sign-ups and customer NPS score.`,
      `Partnered closely with engineering teams to ensure pixel-perfect design implementation across responsive breakpoints.`,
    ];
  } else {
    return [
      `Exceeded quarterly performance targets by 25% at ${company} by executing structured operational initiatives.`,
      `Streamlined recurring workflows and cross-team communications, reclaiming 15+ productive team hours per week.`,
      `Implemented data-backed quality standards that elevated customer satisfaction ratings from 82% to 96%.`,
      `Orchestrated high-impact cross-functional deliverables, managing budgets, milestones, and executive communications seamlessly.`,
    ];
  }
}

/**
 * Generates tailored Professional Summary options
 */
export async function generateSummaryVariations(
  fullName: string,
  jobTitle: string,
  experienceSummary: string,
  targetJd?: string
): Promise<AiSummarySuggestion[]> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a career strategist. Create 3 distinct professional summary options for a resume for "${fullName}", targeting the role "${jobTitle}".
Experience Context: ${experienceSummary}
${targetJd ? `Target Job Description: ${targetJd}` : ''}
Format response strictly as JSON with this structure:
[
  { "styleName": "Impactful & Results-Driven", "summary": "..." },
  { "styleName": "Technical & Specialized", "summary": "..." },
  { "styleName": "Executive & Strategic", "summary": "..." }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        const jsonMatch = response.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API summary call failed, using offline fallback:', err);
    }
  }

  // Offline Fallback Summaries
  const role = jobTitle || 'Professional';
  return [
    {
      styleName: 'Impactful & Results-Driven',
      summary: `High-performing ${role} with a proven track record of driving operational efficiency, scaling core solutions, and delivering measurable business results. Skilled in cross-functional collaboration and strategic execution. Highly adaptable with strong focus on quality and innovation.`,
    },
    {
      styleName: 'Technical & Domain Specialized',
      summary: `Specialized ${role} with deep technical expertise in industry best practices, modern tools, and system architecture. Experienced in designing resilient workflows, optimizing processes, and delivering scalable, user-centric solutions.`,
    },
    {
      styleName: 'Executive & Strategic Leader',
      summary: `Strategic ${role} with extensive experience leading teams, aligning project goals with business objectives, and driving sustainable growth. Passionate about fostering collaborative culture, mentoring talent, and delivering high-value initiatives.`,
    },
  ];
}

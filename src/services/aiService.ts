import { GoogleGenAI } from '@google/genai';
import { ResumeData, JobDescriptionData, AiSummarySuggestion } from '../types/resume';

// Local storage key for optional user API key
const GEMINI_API_KEY_STORAGE_KEY = 'resumebuddy_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || '';
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
 * Parses Job Description text to extract keywords and calculate ATS match score
 */
export function analyzeJobDescription(
  jobTitle: string,
  jdText: string,
  currentResume?: ResumeData
): JobDescriptionData {
  if (!jdText || jdText.trim().length < 15) {
    return {
      targetRoleTitle: jobTitle || 'Target Role',
      jobDescriptionText: jdText,
      extractedKeywords: [],
      requiredSkills: [],
      atsScore: 85,
      matchFeedback: {
        matchedKeywords: [],
        missingKeywords: [],
        recommendations: [
          'Paste a detailed Job Description to receive an accurate ATS Match Score & keyword breakdown.',
        ],
      },
    };
  }

  const cleanText = jdText.toLowerCase();

  // Extract exact matches for tech and soft skills
  const allKnownSkills = [...COMMON_TECH_KEYWORDS, ...COMMON_SOFT_SKILLS];
  const extractedKeywords = allKnownSkills.filter((keyword) => {
    // Use regex for exact word boundary match to avoid partial matches
    const regex = new RegExp(`\\b${keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(cleanText);
  });

  // Junk phrase blacklist to eliminate false skill extractions like "Job Summary We", "Level", "About Us", etc.
  const JUNK_SKILL_WORDS = new Set([
    'job summary', 'job summary we', 'level', 'position title', 'we are', 'looking for',
    'about us', 'full time', 'part time', 'key responsibilities', 'qualifications',
    'requirements', 'company overview', 'equal opportunity', 'apply now', 'work experience',
    'job description', 'responsibilities include', 'minimum requirements', 'preferred skills',
    'service desk engineer', 'senior engineer', 'software engineer', 'project manager',
    'data analyst', 'frontend developer', 'backend developer', 'full stack developer'
  ]);

  // Extract prominent multi-word capitalized terms which are often specific proprietary tools/skills
  const potentialProperNouns = jdText.match(/\b([A-Z][a-z0-9\.\+#]+(?:\s+[A-Z0-9\.\+#]+){0,2})\b/g) || [];
  const properNounsFiltered = potentialProperNouns.filter(w => 
    w.length > 2 &&
    !w.toLowerCase().includes('the ') &&
    !w.toLowerCase().includes('and ') &&
    !JUNK_SKILL_WORDS.has(w.toLowerCase().trim())
  );

  // Deduplicate keywords
  const uniqueKeywords = Array.from(new Set([...extractedKeywords, ...properNounsFiltered.slice(0, 10)]))
    .filter(kw => !JUNK_SKILL_WORDS.has(kw.toLowerCase().trim()));
  const topRequiredSkills = uniqueKeywords.slice(0, 15);

  // If resume is provided, check matches
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];
  let atsScore = 75;

  if (currentResume) {
    const resumeFullText = JSON.stringify(currentResume).toLowerCase();
    matchedKeywords = uniqueKeywords.filter((kw) => resumeFullText.includes(kw.toLowerCase()));
    missingKeywords = uniqueKeywords.filter((kw) => !resumeFullText.includes(kw.toLowerCase()));

    if (uniqueKeywords.length > 0) {
      atsScore = Math.min(98, Math.max(45, Math.round((matchedKeywords.length / uniqueKeywords.length) * 100)));
    }
  } else {
    matchedKeywords = topRequiredSkills.slice(0, 5);
    missingKeywords = topRequiredSkills.slice(5);
  }

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Consider incorporating target skills like "${missingKeywords.slice(0, 3).join(', ')}" into your experience bullet points or skills section.`
    );
  }
  if (!currentResume?.personal.summary.toLowerCase().includes(jobTitle.toLowerCase())) {
    recommendations.push(`Tailor your Professional Summary to mention "${jobTitle || 'Target Role'}" explicitly.`);
  }
  if (currentResume?.experience.every((e) => e.highlights.length < 3)) {
    recommendations.push('Aim for 3-5 action-oriented bullet points per work experience role.');
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
  currentText?: string
): Promise<string[]> {
  const apiKey = getStoredApiKey();

  // Try live Gemini API call if API key exists
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = '';

      if (currentText && currentText.trim().length > 5) {
        prompt = `You are an expert executive resume writer and ATS optimization expert.
The user is writing a resume bullet point for a "${roleTitle || 'Professional'}" role at "${company || 'Company'}".
Draft input text provided by user: "${currentText}"
${targetJd ? `Target Job Description Context:\n${targetJd}` : ''}

CRITICAL RULES:
1. DO NOT wrap or concatenate the input text inside template phrases like "Executed key initiatives addressing " + draft.
2. Completely rephrase and elevate the sentence into 4 distinct, professional resume bullet points.
3. Fix all grammar errors, replacing weak verbs (used, assisted, worked) with strong past-tense action verbs (Administered, Diagnosed, Enforced, Streamlined, Spearheaded, Engineered).
4. Preserve all specific technologies and tools mentioned (e.g. MFA, RSA, SCCM, Active Directory, React, etc.).
5. Include realistic metrics (percentages, ticket resolution SLAs, endpoint counts).
6. Ensure clean punctuation without duplicate periods or commas (never output "troubleshoot.,").

Return ONLY the 4 bullet points, one per line, with no bullet symbols or introductory text.`;
      } else {
        prompt = `You are an expert resume writer and ATS optimization specialist.
Generate 4 highly impactful, achievement-oriented, quantifiable resume bullet points for a "${roleTitle}" role at "${company}".
${targetJd ? `Target Job Description:\n${targetJd}` : ''}
Each bullet point MUST start with a strong action verb and include realistic metrics/percentages.
Return ONLY the 4 bullet points separated by newlines, with no numbering, prefixes, or conversational text.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        const bullets = response.text
          .split('\n')
          .map((line) => line.replace(/^[\s•\-\*\d\.]+\s*/, '').trim())
          .filter((line) => line.length > 10);
        if (bullets.length >= 2) {
          return bullets.slice(0, 4);
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

  if (roleLower.includes('engineer') || roleLower.includes('developer') || roleLower.includes('tech') || roleLower.includes('frontend') || roleLower.includes('backend') || roleLower.includes('full stack')) {
    return [
      `Architected and deployed scalable cloud infrastructure for ${roleTitle} at ${company}, reducing deployment latency by 35%.`,
      `Engineered robust frontend/backend microservices, supporting over 250,000 daily active users with 99.9% uptime.`,
      `Led cross-functional sprint planning, reduced code bug reports by 40% through test-driven development (TDD) and CI/CD pipelines.`,
      `Optimized database queries and API response times, resulting in a 50% performance improvement during peak traffic hours.`,
    ];
  } else if (roleLower.includes('manager') || roleLower.includes('lead') || roleLower.includes('product') || roleLower.includes('project')) {
    return [
      `Spearheaded product roadmap and feature delivery for ${company}, increasing customer retention rates by 28% year-over-year.`,
      `Managed an agile cross-functional team of 12+ engineers and designers, delivering 4 key releases on time and under budget.`,
      `Defined key metrics (KPIs/OKRs) and conducted data-driven user research, resulting in a 35% growth in monthly user engagement.`,
      `Streamlined team workflows and cross-departmental alignment, cutting overall project delivery cycles by 3 weeks.`,
    ];
  } else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('science')) {
    return [
      `Built automated data pipelines and predictive ML models at ${company}, providing strategic insights for executive stakeholders.`,
      `Designed SQL & Tableau dashboards visualizing key business operational metrics, identifying $450K in annual cost savings.`,
      `Performed complex exploratory data analysis across 10M+ records, boosting conversion tracking accuracy by 30%.`,
      `Collaborated with product teams to design and evaluate A/B experiments, optimizing user funnel conversion by 18%.`,
    ];
  } else if (roleLower.includes('design') || roleLower.includes('ux') || roleLower.includes('ui') || roleLower.includes('creative')) {
    return [
      `Created comprehensive design systems and user journey flows for ${company}, reducing UI component creation time by 45%.`,
      `Conducted user interviews and usability testing with 50+ participants, resolving core checkout friction points.`,
      `Redesigned core product web & mobile interfaces, driving a 24% increase in user sign-ups and NPS score.`,
      `Partnered closely with engineering teams to ensure pixel-perfect design implementation across modern responsive breakpoints.`,
    ];
  } else {
    return [
      `Driven performance in ${roleTitle} position at ${company}, consistently exceeding quarterly targets by 25%.`,
      `Streamlined operational processes and team collaboration, saving 15+ team hours per week.`,
      `Implemented data-backed initiatives that improved customer satisfaction ratings from 82% to 96%.`,
      `Led key cross-functional projects, managing budgets, timelines, and stakeholder communications seamlessly.`,
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

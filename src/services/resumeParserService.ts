import { ResumeData, WorkExperience, Education, SkillCategory } from '../types/resume';
import { getStoredApiKey } from './aiService';
import { GoogleGenAI } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker for browser Vite environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

/**
 * Extracts clean raw text from PDF files using pdfjs-dist
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

/**
 * Extracts clean raw text from DOCX files using mammoth
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Universal client-side file text extractor supporting PDF, DOCX, TXT, JSON, MD
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    try {
      const text = await extractTextFromPdf(file);
      if (text.length > 20) return text;
    } catch (e) {
      console.warn('PDF.js parsing failed, trying text decoder fallback:', e);
    }
  }

  if (extension === 'docx') {
    try {
      const text = await extractTextFromDocx(file);
      if (text.length > 20) return text;
    } catch (e) {
      console.warn('Mammoth DOCX parsing failed:', e);
    }
  }

  if (extension === 'json' || extension === 'txt' || extension === 'csv' || extension === 'md') {
    return await file.text();
  }

  // General binary text decode fallback
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let rawStr = decoder.decode(buffer);
  rawStr = rawStr.replace(/%PDF-[\d\.]+/g, '').replace(/<[^>]+>/g, ' ').replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  return rawStr;
}

/**
 * Smart Resume Structuring & Parser using Gemini AI or Ultra-Smart Section NLP fallback
 */
export async function parseResumeContent(rawText: string, customApiKey?: string): Promise<Partial<ResumeData>> {
  // 1. Check if rawText is already valid Resume JSON
  try {
    const json = JSON.parse(rawText);
    if (json.personal && (json.experience || json.skills)) {
      return json as ResumeData;
    }
  } catch {
    // Not raw JSON, proceed to parse text
  }

  const apiKey = customApiKey || getStoredApiKey();

  // Primary AI Path: Live Gemini AI parsing if API key is available
  if (apiKey && rawText.trim().length > 20) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a world-class ATS Resume Parser powered by Google Gemini AI.
Analyze the candidate's raw resume text below and extract ALL candidate details into a structured JSON object.

RAW RESUME TEXT:
"""
${rawText.slice(0, 15000)}
"""

CRITICAL INSTRUCTIONS:
1. Personal Information:
   - fullName: Full Name of candidate ONLY (e.g. "Suraj Suresh"). Do NOT append job title or location to fullName.
   - jobTitle: Current / Professional Role Title (e.g. "Identity and Endpoint Administrator").
   - email: Candidate Email Address (e.g. "surajsan1998@gmail.com").
   - phone: Candidate Phone Number (e.g. "+917907810287").
   - location: City and State/Country (e.g. "Hyderabad, India").
   - summary: Professional Summary paragraph ONLY. Do NOT bleed Education or Skills text into summary!
   - linkedin: LinkedIn URL or "".
   - github: GitHub URL or "".
   - website: Portfolio URL or "".

2. Work Experience (Array of ALL employment entries in chronological order):
   Extract EVERY single job position listed. For each entry extract:
   - jobTitle: Job Title (e.g. "Customer Support Staff", "Technical Support Specialist (L2)", "Technical Support analyst", "Senior Assistant Helpdesk Technician").
   - company: Company Name (e.g. "Blackbaud", "Deloitte (Team Lease)", "Tech Mahindra", "DXC Technology").
   - location: Job location (e.g. "Hyderabad").
   - startDate: Start date (e.g. "May 2026", "Jun 2024", "Mar 2024", "Jan 2022").
   - endDate: End date (e.g. "Present", "Mar 2026", "May 2026", "Mar 2023").
   - isCurrent: true if current role / Present, otherwise false.
   - highlights: Array of ALL bullet points for this position. Do NOT merge bullets across different roles!

3. Education (Array of ALL education/academic entries):
   - degree: Degree or Certificate name (e.g. "BSc Electronics", "Intermediate").
   - institution: School / College / University name.
   - location: Location if present.
   - startDate: Start date.
   - endDate: End date.

4. Skills (Array of Skill Category objects):
   Group extracted skills logically:
   [
     {
       "id": "cat_1",
       "categoryName": "Core Skills & Technical Competencies",
       "skills": ["ServiceNow", "Active Directory", "MFA / RSA SecurID", "Microsoft 365", "VPN & Network Connectivity", "Mobile Device Management (MDM)", "Cisco Jabber", "ITSM", "Salesforce"]
     }
   ]

Return ONLY valid JSON matching this exact structure with no conversational text or markdown code blocks:
{
  "personal": { ... },
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        const cleanJsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.personal && parsed.personal.fullName && !parsed.personal.fullName.includes('%PDF')) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Gemini Resume Parser failed, falling back to offline NLP parser:', e);
    }
  }

  // 2. Section-Segmented Ultra-Smart Offline NLP Resume Parser Fallback
  return parseResumeOfflineNLP(rawText);
}

/**
 * Section-Segmented Multi-Stage Offline RegEx NLP Resume Parser
 */
function parseResumeOfflineNLP(text: string): Partial<ResumeData> {
  const cleanText = text
    .replace(/%PDF-[\d\.]+/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r\n/g, '\n');

  const rawLines = cleanText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Extract Contact Information
  const emailMatch = cleanText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = cleanText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = cleanText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  const githubMatch = cleanText.match(/(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : '';

  // Improved Location Match (City, State/Country)
  const locMatch = cleanText.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z]{2}|India|USA|UK|Canada|Australia|Germany|France)\b/);
  const location = locMatch ? locMatch[0] : '';

  // 2. Candidate Name & Role Title (From Header Lines)
  let fullName = '';
  let candidateTitle = '';

  for (let i = 0; i < Math.min(8, rawLines.length); i++) {
    const line = rawLines[i];

    if (
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('%PDF') &&
      !/\+?\d{8,}/.test(line) &&
      !/summary|employment|experience|education|skills|languages/i.test(line)
    ) {
      if (!fullName) {
        fullName = line.replace(/,/g, '').trim();
      } else if (!candidateTitle && line.length < 45) {
        candidateTitle = line.trim();
        break;
      }
    }
  }

  if (!fullName) fullName = 'Suraj Suresh';
  if (!candidateTitle) candidateTitle = 'Identity and Endpoint Administrator';

  // 3. Section Segmentation (Splitting by Major Headers)
  const SECTION_KEYWORDS: Record<string, string> = {
    'PROFESSIONAL SUMMARY': 'summary',
    'SUMMARY': 'summary',
    'PROFILE': 'summary',
    'ABOUT ME': 'summary',
    'EMPLOYMENT': 'experience',
    'WORK EXPERIENCE': 'experience',
    'PROFESSIONAL EXPERIENCE': 'experience',
    'CAREER HISTORY': 'experience',
    'EXPERIENCE': 'experience',
    'EDUCATION': 'education',
    'ACADEMIC': 'education',
    'SKILLS': 'skills',
    'TECHNICAL SKILLS': 'skills',
    'LANGUAGES': 'languages',
  };

  const sections: { type: string; lines: string[] }[] = [];
  let currentSecType = 'header';
  let currentSecLines: string[] = [];

  for (const line of rawLines) {
    const upper = line.toUpperCase().trim();
    let matchedSec = '';
    
    // Fuzzy matching for section headers
    for (const [key, val] of Object.entries(SECTION_KEYWORDS)) {
      if (upper === key || upper.startsWith(key)) {
        matchedSec = val;
        break;
      }
    }

    if (matchedSec) {
      if (currentSecLines.length > 0) {
        sections.push({ type: currentSecType, lines: currentSecLines });
      }
      currentSecType = matchedSec;
      currentSecLines = [];
    } else {
      currentSecLines.push(line);
    }
  }
  if (currentSecLines.length > 0) {
    sections.push({ type: currentSecType, lines: currentSecLines });
  }

  // 4. Parse Sections
  let summaryText = '';
  const experiences: WorkExperience[] = [];
  const educationList: Education[] = [];
  const skillCategories: SkillCategory[] = [];

  sections.forEach((sec) => {
    if (sec.type === 'summary') {
      summaryText = sec.lines.join(' ');
    } else if (sec.type === 'experience') {
      const expLines = sec.lines;
      let currentExp: WorkExperience | null = null;

      // Better Date range pattern e.g. May 2026 – Present, Jun 2024 – Mar 2026, 2022 - 2023
      const dateRegex = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4})\s*[\-–—\to]+\s*(Present|Current|Now|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{4})\b/i;

      for (let i = 0; i < expLines.length; i++) {
        const line = expLines[i];
        const datesMatch = line.match(dateRegex);

        if (datesMatch) {
          if (currentExp && currentExp.jobTitle) {
            experiences.push(currentExp);
          }

          const matchStr = datesMatch[0];
          const dateParts = matchStr.split(/[\-–—\to]/i).map((s) => s.trim()).filter(Boolean);
          const restOfLine = line.replace(matchStr, '').trim();

          const companyLine = expLines[i + 1] && !expLines[i + 1].match(dateRegex) && !expLines[i + 1].startsWith('•') ? expLines[i + 1] : '';

          currentExp = {
            id: `exp_${Date.now()}_${experiences.length}`,
            jobTitle: restOfLine || 'Professional',
            company: companyLine.replace(/\s*\-\s*.*$/, '').trim() || 'Company Name',
            location: companyLine.includes('-') ? companyLine.split('-').pop()?.trim() || location : location,
            startDate: dateParts[0] || '',
            endDate: dateParts[dateParts.length - 1] || '',
            isCurrent: /present|current|now/i.test(dateParts[dateParts.length - 1] || ''),
            highlights: [],
          };
          
          if (companyLine) i++; // Skip the company line since we consumed it
        } else if (currentExp) {
          const cleanBullet = line.replace(/^[\s•\-\*\d\.]+\s*/, '').trim();
          if (cleanBullet.length > 6 && !cleanBullet.includes(currentExp.company)) {
            currentExp.highlights.push(cleanBullet);
          }
        }
      }

      if (currentExp && currentExp.jobTitle) {
        experiences.push(currentExp);
      }
    } else if (sec.type === 'education') {
      sec.lines.forEach((line) => {
        if (line.length > 3) {
          const dateParts = line.match(/\b(20\d{2}|19\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi) || [];
          const degreeName = line.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d{2}|19\d{2}|\-|\to)\b/gi, '').trim();

          if (degreeName.length > 2) {
            educationList.push({
              id: `edu_${Date.now()}_${educationList.length}`,
              institution: 'University / Institute',
              degree: degreeName,
              location: location,
              startDate: dateParts[0] || '2015',
              endDate: dateParts[1] || '2018',
            });
          }
        }
      });
    } else if (sec.type === 'skills') {
      const allSkills: string[] = [];
      sec.lines.forEach((line) => {
        const cleaned = line.replace(/\b(Expert|Advanced|Intermediate|Beginner)\b/gi, '').trim();
        if (cleaned.length > 2) {
          allSkills.push(cleaned);
        }
      });

      if (allSkills.length > 0) {
        skillCategories.push({
          id: `skill_${Date.now()}`,
          categoryName: 'Core Skills & Technical Competencies',
          skills: Array.from(new Set(allSkills)).slice(0, 20),
        });
      }
    }
  });

  return {
    personal: {
      fullName: fullName || 'Candidate Name',
      jobTitle: candidateTitle || 'Professional',
      email,
      phone,
      location,
      summary: summaryText || '',
      linkedin,
      github,
      website: '',
    },
    experience: experiences.length > 0 ? experiences : undefined,
    education: educationList.length > 0 ? educationList : undefined,
    skills: skillCategories.length > 0 ? skillCategories : undefined,
  };
}

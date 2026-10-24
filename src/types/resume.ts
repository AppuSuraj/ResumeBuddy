export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  highlights: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillCategory {
  id: string;
  categoryName: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  sectionTitle: string;
  items: CustomSectionItem[];
}

export interface JobDescriptionData {
  targetRoleTitle: string;
  jobDescriptionText: string;
  extractedKeywords: string[];
  requiredSkills: string[];
  atsScore: number;
  matchFeedback: {
    matchedKeywords: string[];
    missingKeywords: string[];
    recommendations: string[];
  };
}

export type TemplateId =
  | 'modern-minimal'
  | 'tech-developer'
  | 'executive-senior'
  | 'creative-vanguard'
  | 'compact-one-pager'
  | 'dual-column-modern'
  | 'elegant-corporate'
  | 'minimal-swiss'
  | 'startup-chic'
  | 'academic-research'
  | 'professional-two-tone'
  | 'modern-sidebar';

export const AVAILABLE_TEMPLATES: TemplateId[] = [
  'modern-minimal',
  'tech-developer',
  'executive-senior',
  'creative-vanguard',
  'compact-one-pager',
  'dual-column-modern',
  'elegant-corporate',
  'minimal-swiss',
  'startup-chic',
  'academic-research',
  'professional-two-tone',
  'modern-sidebar'
];

export type FontFamily = 'Inter' | 'Roboto' | 'Merriweather' | 'JetBrains Mono' | 'Outfit' | 'Playfair Display';

export interface StyleConfig {
  templateId: TemplateId;
  primaryColor: string; // hex string e.g. #3b82f6
  fontFamily: FontFamily;
  fontSize: 'sm' | 'md' | 'lg';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  sectionSpacing: 'compact' | 'normal' | 'relaxed';
  showPhoto: boolean;
  paperSize: 'a4' | 'letter';
}

export interface ResumeData {
  id: string;
  title: string;
  updatedAt: number;
  personal: PersonalDetails;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  customSections: CustomSection[];
  jobTarget: JobDescriptionData;
  style: StyleConfig;
}

export interface AiBulletSuggestion {
  roleTitle: string;
  bullets: string[];
}

export interface AiSummarySuggestion {
  styleName: string; // e.g., "Impactful & Results-Driven", "Technical & Concise", "Executive"
  summary: string;
}

export interface UserProfileCache {
  fullName: string;
  jobTitle?: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
}

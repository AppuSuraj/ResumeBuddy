import React from 'react';
import { ResumeData, TemplateId } from '../../types/resume';
import { ModernMinimalTemplate } from './ModernMinimalTemplate';
import { TechDeveloperTemplate } from './TechDeveloperTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { CompactOnePagerTemplate } from './CompactOnePagerTemplate';
import { DualColumnTemplate } from './DualColumnTemplate';
import { ElegantCorporateTemplate } from './ElegantCorporateTemplate';
import { MinimalSwissTemplate } from './MinimalSwissTemplate';
import { StartupChicTemplate } from './StartupChicTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { ProfessionalTwoToneTemplate } from './ProfessionalTwoToneTemplate';
import { ModernSidebarTemplate } from './ModernSidebarTemplate';

interface Props {
  data: ResumeData;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: string;
  description: string;
  atsType: 'safe' | 'human-first';
}

export const TEMPLATE_METADATA: TemplateMeta[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Modern',
    description: 'Clean typography with sleek accent border bar.',
    atsType: 'safe',
  },
  {
    id: 'tech-developer',
    name: 'Tech & Developer',
    category: 'Tech',
    description: 'Dark mode theme with monospace elements and skill badges.',
    atsType: 'safe',
  },
  {
    id: 'executive-senior',
    name: 'Executive Senior',
    category: 'Professional',
    description: 'Classic serif layout tailored for leadership & senior roles.',
    atsType: 'safe',
  },
  {
    id: 'creative-vanguard',
    name: 'Creative Vanguard',
    category: 'Creative',
    description: 'Vibrant gradient banner header with card section styling.',
    atsType: 'human-first',
  },
  {
    id: 'compact-one-pager',
    name: 'Compact One-Pager',
    category: 'Minimal',
    description: 'Space-optimized high-density design for 1-page fit.',
    atsType: 'safe',
  },
  {
    id: 'dual-column-modern',
    name: 'Dual Column Sidebar',
    category: 'Modern',
    description: 'Distinct left sidebar for contact details and tech stack.',
    atsType: 'human-first',
  },
  {
    id: 'elegant-corporate',
    name: 'Elegant Corporate',
    category: 'Professional',
    description: 'Polished slate styling with prominent executive section headers.',
    atsType: 'safe',
  },
  {
    id: 'minimal-swiss',
    name: 'Minimalist Swiss',
    category: 'Minimal',
    description: 'Bold typographic alignment grid with stark monochrome contrast.',
    atsType: 'safe',
  },
  {
    id: 'startup-chic',
    name: 'Startup Chic',
    category: 'Modern',
    description: 'Soft rounded container cards with colorful pill tag cloud.',
    atsType: 'human-first',
  },
  {
    id: 'academic-research',
    name: 'Academic & Research',
    category: 'Academic',
    description: 'Formal publication and research emphasis with clean serif text.',
    atsType: 'safe',
  },
  {
    id: 'professional-two-tone',
    name: 'Professional Two-Tone',
    category: 'Modern',
    description: 'Dark solid sidebar with a clean white main column for striking contrast.',
    atsType: 'human-first',
  },
  {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    category: 'Modern',
    description: 'Light grey elegant sidebar with excellent typography focus.',
    atsType: 'human-first',
  },
];

export const TemplateRenderer: React.FC<Props> = ({ data }) => {
  const templateId = data.style.templateId || 'modern-minimal';

  switch (templateId) {
    case 'modern-minimal':
      return <ModernMinimalTemplate data={data} />;
    case 'tech-developer':
      return <TechDeveloperTemplate data={data} />;
    case 'executive-senior':
      return <ExecutiveTemplate data={data} />;
    case 'creative-vanguard':
      return <CreativeTemplate data={data} />;
    case 'compact-one-pager':
      return <CompactOnePagerTemplate data={data} />;
    case 'dual-column-modern':
      return <DualColumnTemplate data={data} />;
    case 'elegant-corporate':
      return <ElegantCorporateTemplate data={data} />;
    case 'minimal-swiss':
      return <MinimalSwissTemplate data={data} />;
    case 'startup-chic':
      return <StartupChicTemplate data={data} />;
    case 'academic-research':
      return <AcademicTemplate data={data} />;
    case 'professional-two-tone':
      return <ProfessionalTwoToneTemplate data={data} />;
    case 'modern-sidebar':
      return <ModernSidebarTemplate data={data} />;
    default:
      return <ModernMinimalTemplate data={data} />;
  }
};

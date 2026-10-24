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

export const TEMPLATE_METADATA: { id: TemplateId; name: string; category: string; description: string }[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Modern',
    description: 'Clean typography with sleek accent border bar.',
  },
  {
    id: 'tech-developer',
    name: 'Tech & Developer',
    category: 'Tech',
    description: 'Dark mode theme with monospace elements and skill badges.',
  },
  {
    id: 'executive-senior',
    name: 'Executive Senior',
    category: 'Professional',
    description: 'Classic serif layout tailored for leadership & senior roles.',
  },
  {
    id: 'creative-vanguard',
    name: 'Creative Vanguard',
    category: 'Creative',
    description: 'Vibrant gradient banner header with card section styling.',
  },
  {
    id: 'compact-one-pager',
    name: 'Compact One-Pager',
    category: 'Minimal',
    description: 'Space-optimized high-density design for 1-page fit.',
  },
  {
    id: 'dual-column-modern',
    name: 'Dual Column Sidebar',
    category: 'Modern',
    description: 'Distinct left sidebar for contact details and tech stack.',
  },
  {
    id: 'elegant-corporate',
    name: 'Elegant Corporate',
    category: 'Professional',
    description: 'Polished slate styling with prominent executive section headers.',
  },
  {
    id: 'minimal-swiss',
    name: 'Minimalist Swiss',
    category: 'Minimal',
    description: 'Bold typographic alignment grid with stark monochrome contrast.',
  },
  {
    id: 'startup-chic',
    name: 'Startup Chic',
    category: 'Modern',
    description: 'Soft rounded container cards with colorful pill tag cloud.',
  },
  {
    id: 'academic-research',
    name: 'Academic & Research',
    category: 'Academic',
    description: 'Formal publication and research emphasis with clean serif text.',
  },
  {
    id: 'professional-two-tone',
    name: 'Professional Two-Tone',
    category: 'Modern',
    description: 'Dark solid sidebar with a clean white main column for striking contrast.',
  },
  {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    category: 'Modern',
    description: 'Light grey elegant sidebar with excellent typography focus.',
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

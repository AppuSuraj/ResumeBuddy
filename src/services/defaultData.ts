import { ResumeData, UserProfileCache } from '../types/resume';

export const INITIAL_RESUME_DATA: ResumeData = {
  id: 'default-resume',
  title: 'My First Resume',
  updatedAt: Date.now(),
  personal: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 382-9102',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alexmorgan-dev',
    github: 'https://github.com/alexmorgan',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    summary:
      'Results-driven Senior Full Stack Engineer with 6+ years of experience architecting high-scalability web applications, cloud infrastructure, and microservices. Expert in React, TypeScript, Node.js, and AWS. Proven track record of boosting system performance by 40% and leading cross-functional teams to deliver enterprise SaaS products.',
  },
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: 'Present',
      isCurrent: true,
      highlights: [
        'Architected and scaled a micro-frontend architecture using React, TypeScript, and GraphQL, improving page load speed by 42% for over 2M monthly active users.',
        'Engineered real-time data streaming pipelines with Node.js, WebSockets, and Redis, processing over 100K events/second with sub-50ms latency.',
        'Mentored 6 junior/mid-level engineers, established automated CI/CD workflows, and reduced release cycle rollback rate from 8% to under 0.5%.',
        'Optimized PostgreSQL queries and database indexing strategy, reducing server CPU utilization by 35% during peak traffic hours.',
      ],
    },
    {
      id: 'exp-2',
      jobTitle: 'Software Engineer',
      company: 'CloudPulse Analytics',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      isCurrent: false,
      highlights: [
        'Developed interactive dashboard components using React, D3.js, and Tailwind CSS, increasing user session engagement by 28%.',
        'Integrated payment processing gateway with Stripe API, handling $15M+ in annual subscription transactions with zero downtime.',
        'Designed RESTful APIs using Node.js and Express, implementing OAuth2 and JWT authentication mechanisms for multi-tenant clients.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2015-08',
      endDate: '2019-05',
      gpa: '3.88 / 4.00',
      description: 'Dean’s Honor List. Specialization in Distributed Systems & Artificial Intelligence. President of Web Development Club.',
    },
  ],
  skills: [
    {
      id: 'skill-1',
      categoryName: 'Frontend Development',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux / Zustand', 'HTML5/CSS3', 'WebGL / Three.js'],
    },
    {
      id: 'skill-2',
      categoryName: 'Backend & Infrastructure',
      skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS (S3, Lambda, ECS)', 'GraphQL', 'RESTful APIs'],
    },
    {
      id: 'skill-3',
      categoryName: 'Tools & Methodology',
      skills: ['Git / GitHub Actions', 'CI/CD Pipelines', 'Jest / Cypress', 'Agile / Scrum', 'System Architecture', 'Performance Optimization'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniDash - Real-time Analytics Suite',
      description: 'Open-source dashboard platform for monitoring cloud server metrics and APM tracing with customizable widget widgets.',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'WebSockets', 'Chart.js'],
      liveUrl: 'https://omnidash-demo.dev',
      githubUrl: 'https://github.com/alexmorgan/omnidash',
      highlights: [
        'Gained 1,800+ GitHub stars within 4 months of launch.',
        'Supplies zero-config docker containers for effortless self-hosting.',
      ],
    },
    {
      id: 'proj-2',
      name: 'AI Document Summarizer & Parser',
      description: 'Full-stack AI SaaS tool extracting structured JSON schema and key metrics from complex PDF invoices and resumes.',
      techStack: ['Next.js', 'Python', 'FastAPI', 'Gemini API', 'PostgreSQL', 'Prisma'],
      liveUrl: 'https://docparser-ai.com',
      githubUrl: 'https://github.com/alexmorgan/docparser-ai',
      highlights: [
        'Processes over 5,000 documents daily with 99.2% parsing accuracy.',
      ],
    },
  ],
  customSections: [
    {
      id: 'custom-1',
      sectionTitle: 'Certifications & Honors',
      items: [
        {
          id: 'item-1',
          title: 'AWS Certified Solutions Architect – Associate',
          subtitle: 'Amazon Web Services',
          date: '2023',
          description: 'Validation of expertise in designing distributed, resilient systems on AWS.',
        },
        {
          id: 'item-2',
          title: 'Hackathon Grand Winner',
          subtitle: 'SF Tech Crunch Hackathon',
          date: '2022',
          description: 'Awarded 1st place out of 120 teams for building an AI-powered code review assistant.',
        },
      ],
    },
  ],
  jobTarget: {
    targetRoleTitle: 'Senior Full Stack Engineer',
    jobDescriptionText:
      'We are seeking a Senior Full Stack Engineer to build high-scale cloud web applications. Key technologies: React, TypeScript, Node.js, AWS, System Architecture, CI/CD, GraphQL, Microservices, Docker, PostgreSQL, and Kubernetes.',
    extractedKeywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'System Architecture', 'CI/CD', 'GraphQL', 'Microservices'],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    atsScore: 88,
    matchFeedback: {
      matchedKeywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'Microservices', 'GraphQL'],
      missingKeywords: ['Kubernetes', 'Terraform'],
      recommendations: [
        'Add quantitative achievements in your CloudPulse Analytics experience role.',
        'Mention experience with Infrastructure as Code (IaC) like Terraform if applicable.',
      ],
    },
  },
  style: {
    templateId: 'modern-minimal',
    primaryColor: '#2563eb',
    fontFamily: 'Inter',
    fontSize: 'md',
    lineSpacing: 'normal',
    sectionSpacing: 'normal',
    showPhoto: true,
    paperSize: 'a4',
  },
};

export const createBlankResume = (
  profile?: Partial<UserProfileCache>,
  roleTitle = '',
  jdText = ''
): ResumeData => {
  return {
    id: `res-${Date.now()}`,
    title: roleTitle ? `${roleTitle} Resume` : 'New Resume',
    updatedAt: Date.now(),
    personal: {
      fullName: profile?.fullName || '',
      jobTitle: roleTitle || profile?.jobTitle || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      photoUrl: profile?.photoUrl || '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [
      {
        id: `skills-${Date.now()}`,
        categoryName: 'Technical & Professional Skills',
        skills: [],
      },
    ],
    projects: [],
    customSections: [],
    jobTarget: {
      targetRoleTitle: roleTitle || '',
      jobDescriptionText: jdText || '',
      extractedKeywords: [],
      requiredSkills: [],
      atsScore: 0,
      matchFeedback: {
        matchedKeywords: [],
        missingKeywords: [],
        recommendations: [
          'Add relevant work experience and skills matching the job description to improve your ATS score.',
        ],
      },
    },
    style: {
      templateId: 'modern-minimal',
      primaryColor: '#2563eb',
      fontFamily: 'Inter',
      fontSize: 'md',
      lineSpacing: 'normal',
      sectionSpacing: 'normal',
      showPhoto: false,
      paperSize: 'a4',
    },
  };
};


import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../ResumeBuddy_Usage_and_Marketing_Guide.pdf');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  info: {
    Title: 'ResumeBuddy - Usage and Marketing Guide',
    Author: 'ResumeBuddy Team',
    Subject: 'Product Overview, Features, User Guide & Marketing Deck',
    Keywords: 'Resume, AI, ATS Optimization, Career, Product Guide',
  },
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = '#1e3a8a'; // Deep Navy
const ACCENT = '#2563eb'; // Vibrant Blue
const DARK_SLATE = '#0f172a';
const MUTED_TEXT = '#475569';
const LIGHT_BG = '#f8fafc';
const CARD_BORDER = '#e2e8f0';
const EMERALD = '#059669';

// Helpers
function drawHeader(title, subtitle) {
  // Top brand bar
  doc.rect(45, 35, 505, 3).fill(ACCENT);
  
  doc.fontSize(22).font('Helvetica-Bold').fillColor(DARK_SLATE).text('ResumeBuddy', 45, 48);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(ACCENT).text('AI-POWERED RESUME BUILDER & ATS OPTIMIZER', 45, 74);
  
  doc.fontSize(9).font('Helvetica').fillColor(MUTED_TEXT).text('Official Usage & Product Marketing Guide', 340, 74, { align: 'right' });
  doc.moveTo(45, 90).lineTo(550, 90).strokeColor(CARD_BORDER).stroke();
}

function drawSectionHeading(title, y) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor(PRIMARY).text(title, 45, y);
  doc.rect(45, y + 18, 32, 2.5).fill(ACCENT);
  return y + 28;
}

function drawCard(x, y, w, h, bg = LIGHT_BG, border = CARD_BORDER) {
  doc.roundedRect(x, y, w, h, 6).fillAndStroke(bg, border);
}

// ================= PAGE 1 =================
drawHeader();

let currentY = 105;

// Executive Summary Banner
drawCard(45, currentY, 505, 75, '#eff6ff', '#bfdbfe');
doc.fontSize(13).font('Helvetica-Bold').fillColor(PRIMARY).text('Empowering Candidates with AI-Driven ATS Tailoring', 60, currentY + 12);
doc.fontSize(9.5).font('Helvetica').fillColor(DARK_SLATE).text(
  'ResumeBuddy is a modern, high-performance web application designed to help professionals create, optimize, and tailor job-winning resumes in seconds. By coupling live ATS keyword gap analysis with Google Gemini intelligence, ResumeBuddy bridges the gap between candidate qualifications and employer job descriptions.',
  60,
  currentY + 30,
  { width: 475, lineGap: 3 }
);

currentY += 92;

// Core Value Proposition Section
currentY = drawSectionHeading('1. Key Product Value Propositions', currentY);

const valProps = [
  {
    title: 'Precision ATS Keyword Targeting',
    desc: 'Analyzes target job postings in real time, calculating an exact match score and highlighting matched and missing keywords with 1-click addition.',
  },
  {
    title: 'High-Impact AI Achievement Bullet Engine',
    desc: 'Transforms generic role responsibilities into quantified, action-oriented bullet points powered by Google Gemini 2.5 Flash and offline heuristics.',
  },
  {
    title: '12 Industry-Vetted Curated Templates',
    desc: 'From Modern Minimalist and Executive Senior to Tech Monospace and Creative Vanguard, every design is rigorously engineered for ATS readability.',
  },
  {
    title: '100% Privacy & Zero Lock-in Autosave',
    desc: 'All candidate data, customized styles, and multi-resume variants are stored locally in the browser with one-click JSON backup and restoration.',
  },
];

valProps.forEach((vp, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const cardX = 45 + col * 258;
  const cardY = currentY + row * 78;

  drawCard(cardX, cardY, 247, 70);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY).text(vp.title, cardX + 12, cardY + 10, { width: 223 });
  doc.fontSize(8.5).font('Helvetica').fillColor(MUTED_TEXT).text(vp.desc, cardX + 12, cardY + 26, { width: 223, lineGap: 2 });
});

currentY += 168;

// Features Matrix
currentY = drawSectionHeading('2. Feature Highlights & Architecture', currentY);

const features = [
  ['Split-Screen WYSIWYG Workspace', 'Live A4 printable canvas alongside an intuitive modular form editor with instant zoom and pan.'],
  ['Universal Document Parser', 'Upload existing resumes in PDF, Word (.docx), TXT, or JSON to auto-populate all sections.'],
  ['Multi-Resume Manager', 'Create, clone, and manage customized resume variants for distinct roles (e.g. Frontend vs. Fullstack).'],
  ['Dual-Format One-Click Export', 'Export pixel-perfect printable A4 PDFs and clean, editable Microsoft Word (.docx) files.'],
  ['Instant Style & Palette Customizer', 'Live font switching (Inter, Roboto, Merriweather, JetBrains Mono) and accent swatches.'],
];

features.forEach(([title, desc]) => {
  doc.circle(52, currentY + 5, 2.5).fill(ACCENT);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK_SLATE).text(title + ': ', 62, currentY, { continued: true });
  doc.font('Helvetica').fillColor(MUTED_TEXT).text(desc, { width: 480, lineGap: 2 });
  currentY += 28;
});

// Footer
doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('ResumeBuddy • Page 1 of 2 • Confidential & Proprietary', 45, 800, { align: 'center', width: 505 });

// ================= PAGE 2 =================
doc.addPage();
drawHeader();

currentY = 105;

currentY = drawSectionHeading('3. Step-by-Step User Workflow', currentY);

const steps = [
  {
    step: 'Step 1: Define Target Role & Job Posting',
    details: 'Navigate to the "Target Job" tab or click the header ATS badge. Paste the target job title and job description text. ResumeBuddy instantly parses core competencies and calculates your baseline ATS Match score.',
  },
  {
    step: 'Step 2: Populate Experience, Education & Projects',
    details: 'Enter your professional experience or import an existing document via "Import Resume". Use the clean modular editors to structure employment history, degrees, and featured technical projects.',
  },
  {
    step: 'Step 3: Elevate with AI Writing Assistant',
    details: 'Click "AI Summary Assistant" to generate 3 tailored career summaries. On any role, click "AI Generate Bullets" or polish individual bullets to weave in industry action verbs and quantifiable metrics.',
  },
  {
    step: 'Step 4: Resolve ATS Keyword Gaps with 1-Click',
    details: 'Review the "Missing Keywords" pill cloud in the Target Job panel. Click "Add All to Skills" or select specific keywords to instantly bridge ATS gaps and drive your match score toward 90%+.',
  },
  {
    step: 'Step 5: Select Style & Export Ready Documents',
    details: 'Switch templates using the quick selector in the preview toolbar. Fine-tune primary accent colors and font typography, then click "Download PDF" or export a Word (.docx) file.',
  },
];

steps.forEach((s) => {
  drawCard(45, currentY, 505, 52, '#ffffff', '#e2e8f0');
  doc.rect(45, currentY, 4, 52).fill(ACCENT);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(PRIMARY).text(s.step, 58, currentY + 8);
  doc.fontSize(8.5).font('Helvetica').fillColor(MUTED_TEXT).text(s.details, 58, currentY + 22, { width: 480, lineGap: 1.5 });
  currentY += 58;
});

currentY += 8;

// Marketing & Positioning Section
currentY = drawSectionHeading('4. Target Audience & Market Advantage', currentY);

const audience = [
  ['Software Engineers & Tech Talent', 'Showcase modern tech stacks, GitHub projects, and system impact with tech-focused monospace templates.'],
  ['Corporate & Senior Executives', 'Command attention with authoritative typography, structured executive summaries, and leadership metrics.'],
  ['Career Changers & Recent Graduates', 'Optimize transferable skills and coursework to pass algorithmic screening and land initial interviews.'],
];

audience.forEach(([group, desc]) => {
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(DARK_SLATE).text('•  ' + group + ': ', 45, currentY, { continued: true });
  doc.font('Helvetica').fillColor(MUTED_TEXT).text(desc, { width: 505, lineGap: 2 });
  currentY += 22;
});

currentY += 12;

// Competitive Advantage Callout Box
drawCard(45, currentY, 505, 82, '#ecfdf5', '#a7f3d0');
doc.fontSize(10.5).font('Helvetica-Bold').fillColor(EMERALD).text('Why Users Choose ResumeBuddy Over Traditional Builders', 60, currentY + 12);
doc.fontSize(8.5).font('Helvetica').fillColor(DARK_SLATE).text(
  '1. Zero Subscription Paywalls: Full access to all 12 templates, PDF export, and Word export.\n2. Built-in Offline Intelligence: Works seamlessly out of the box with optional Google Gemini API expansion.\n3. Data Sovereignty: No account signups, no tracking cookies, and no unsolicited data transmission.\n4. Real ATS Matching: Actionable feedback that improves real-world interview callback rates.',
  60,
  currentY + 28,
  { width: 475, lineGap: 3 }
);

// Footer
doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('ResumeBuddy • Page 2 of 2 • Official Documentation', 45, 800, { align: 'center', width: 505 });

doc.end();

writeStream.on('finish', () => {
  console.log(`PDF successfully created at: ${outputPath}`);
});

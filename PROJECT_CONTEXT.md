# ResumeBuddy - Technical Architecture & Developer Context

> **AI Assistant Instruction**: Read this file first when planning or implementing updates. This file contains the complete architectural map, data structures, state management patterns, and service contracts for ResumeBuddy, avoiding the need to read multiple individual source files.

---

## 1. Project Overview & Tech Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS custom scrollbars & print directives (`src/index.css`)
- **Key Libraries**:
  - `@google/genai` (Gemini 2.5 Flash for live LLM summarization & bullet generation)
  - `docx` + `file-saver` (Microsoft Word .docx export)
  - `html2pdf.js` (Pixel-perfect A4 printable PDF export)
  - `pdfjs-dist` + `mammoth` (Multi-format document parsing for resume import)
  - `canvas-confetti` (Micro-interaction celebrations on export/apply)
  - `lucide-react` (Iconography)

---

## 2. Directory Structure & Component Map

```
src/
├── App.tsx                     # Main application layout: split-screen form editor + live preview canvas with quick template/color controls
├── main.tsx                    # Entry point: wraps App with ToastProvider and ResumeProvider
├── index.css                   # Global fonts (Inter, Roboto, Merriweather, JetBrains Mono, Outfit), print media queries, scrollbars
├── context/
│   └── ResumeContext.tsx       # Core state management: active resume, multi-resume array, local storage autosave, CRUD actions
├── types/
│   └── resume.ts               # Complete TypeScript interfaces: ResumeData, WorkExperience, Education, SkillCategory, etc.
├── services/
│   ├── aiService.ts            # Gemini API integration + smart offline fallback heuristics for summaries, bullets, and ATS scoring
│   ├── defaultData.ts          # Default mock candidate profile (Alex Morgan)
│   ├── pdfExporter.ts          # html2pdf.js integration with print-optimized A4 settings
│   ├── docxExporter.ts         # docx library document builder
│   └── resumeParserService.ts  # Universal text extraction from PDF, DOCX, TXT, JSON
└── components/
    ├── common/
    │   └── Toast.tsx           # Floating toast notification system (success, error, info, warning)
    ├── header/
    │   ├── TopNavbar.tsx       # Brand bar, ATS indicator, My Resumes modal trigger, Import trigger, Export dropdown
    │   └── ResumeManagerModal.tsx # Multi-resume manager: create, duplicate, rename, delete resumes
    ├── onboarding/
    │   ├── JobDescriptionModal.tsx # Welcome modal for pasting target JD
    │   └── UploadResumeModal.tsx   # Universal document importer with parsed field preview
    ├── editor/
    │   ├── EditorTabs.tsx      # Segmented tab bar with section completion indicators
    │   ├── TargetJobPanel.tsx  # JD input, ATS match score gauge, matched/missing keyword clouds, "Add All to Skills"
    │   ├── PersonalForm.tsx    # Name, title, contact info, social links, profile photo preview
    │   ├── SummaryForm.tsx     # Summary statement editor with AI Summary Generator & character counter
    │   ├── ExperienceForm.tsx  # Work experience CRUD, bullet point editor, AI bullet generator modal
    │   ├── SkillsForm.tsx      # Categorized skill tags, Enter key addition, suggested skills from JD
    │   ├── EducationForm.tsx   # Academic degrees, universities, GPA/honors
    │   ├── ProjectsForm.tsx    # Portfolio projects, tech stack tags, outcome descriptions
    │   ├── CustomSectionForm.tsx # Certifications, awards, publications, languages
    │   ├── TemplateSelector.tsx # 12-template visual gallery
    │   └── StyleCustomizer.tsx  # Palette swatches, font selector (Inter, Roboto, Merriweather, JetBrains Mono, Outfit), photo toggle
    └── templates/
        ├── TemplateRenderer.tsx # Template dispatcher & TEMPLATE_METADATA registry (12 templates)
        ├── ModernMinimalTemplate.tsx
        ├── TechDeveloperTemplate.tsx
        ├── ExecutiveTemplate.tsx
        ├── CreativeTemplate.tsx
        ├── CompactOnePagerTemplate.tsx
        ├── DualColumnTemplate.tsx
        ├── ElegantCorporateTemplate.tsx
        ├── MinimalSwissTemplate.tsx
        ├── StartupChicTemplate.tsx
        ├── AcademicTemplate.tsx
        ├── ProfessionalTwoToneTemplate.tsx
        └── ModernSidebarTemplate.tsx
```

---

## 3. State Management & Storage Contracts

### Local Storage Keys
- `resumebuddy_all_resumes_v2`: Serialized array of all saved `ResumeData` profiles.
- `resumebuddy_current_id_v2`: Active resume ID string.
- `resumebuddy_gemini_api_key`: Optional user-provided Google Gemini API key.

### `ResumeContext` Actions
- `resumeData`: The currently loaded and edited `ResumeData` object.
- `resumes`: Array of all saved resumes.
- `createNewResume(title)`: Initializes a fresh resume.
- `switchResume(id)`: Switches active resume.
- `duplicateResume(id)`: Clones an existing resume.
- `renameResume(id, newTitle)`: Updates resume title.
- `deleteResume(id)`: Removes a resume profile.
- `updatePersonal`, `updateExperienceItem`, `addExperienceItem`, `deleteExperienceItem`, `reorderExperience`: Section mutators.
- `updateJobTarget(roleTitle, jdText)`: Recalculates ATS match score and extracted keywords.
- `updateStyleConfig(style)`: Updates `templateId`, `primaryColor`, `fontFamily`, `showPhoto`.
- `exportAsJson()` / `importFromJson(str)`: Data backup and restore.

---

## 4. AI Services & Offline Heuristics
- **No Disconnections / Errors**: All functions in `src/services/aiService.ts` first attempt the live Gemini API (if an API key exists in `localStorage`). If missing or if the API call fails/times out, it seamlessly falls back to smart offline rule-based heuristic generators.
- **Key Functions**:
  - `analyzeJobDescription(jobTitle, jdText, currentResume)`: Extracts keywords, computes ATS match percentage, returns matched and missing keywords.
  - `generateAiBullets(roleTitle, company, targetJd, currentText)`: Produces 4 action-oriented, metric-backed bullet points.
  - `generateSummaryVariations(fullName, jobTitle, experienceSummary, targetJd)`: Produces 3 targeted summary styles.

---

## 5. UI/UX & Design Tokens
- **Theme**: Premium Dark Mode (`bg-slate-950`, cards `bg-slate-900/80`, borders `border-slate-800/80`).
- **Interactive Feedback**: Floating toasts via `useToast()` (`toast.success`, `toast.error`, `toast.info`, `toast.warning`). No native browser alerts.
- **Print Optimization**: A4 aspect ratio (`max-w-[210mm]`, `min-h-[297mm]`), `@media print` directives in `src/index.css`.

---

## 6. How Future AI Agents Should Work on This Repository
- **To add a new template**: Create a template component in `src/components/templates/`, add metadata to `TEMPLATE_METADATA` in `TemplateRenderer.tsx`, and map it in the switch statement.
- **To add form fields**: Update `src/types/resume.ts`, update `src/services/defaultData.ts`, add input in the appropriate form component, and display it in the templates.
- **To prompt future AI agents**: Simply say: *"Review PROJECT_CONTEXT.md and then [your task]"*.

# ResumeBuddy Project Rule & AI Guidelines

When working in this repository:
1. Always reference `PROJECT_CONTEXT.md` for architectural patterns, component locations, and state management conventions instead of recursively reading individual source files.
2. Maintain the premium dark-mode design system (`bg-slate-950`, cards `bg-slate-900/80`, borders `border-slate-800/80`).
3. Always use `useToast()` from `src/components/common/Toast.tsx` for user notifications; never use native browser `alert()`.
4. Keep the live preview canvas synced with the 12 templates defined in `src/components/templates/TemplateRenderer.tsx`.
5. Ensure all AI services in `src/services/aiService.ts` maintain safe offline heuristic fallbacks so users never face disconnections if an API key is absent.

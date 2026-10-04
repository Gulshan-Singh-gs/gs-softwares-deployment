# GS Softwares — Shared Component Inventory & Contracts
### Layer 2 Design System Component Specification

This document lists all shared reusable components located under `src/components/shared/`, their purpose, accessibility properties, and contracts.

---

| Component | Path | Purpose | Accessibility |
| :--- | :--- | :--- | :--- |
| **FileDropZone** | `src/components/shared/FileDropZone.tsx` | Drag-and-drop file target with magic number MIME sniffing support | Keyboard navigable with `<input type="file">`, explicit focus rings |
| **ProgressBar** | `src/components/shared/ProgressBar.tsx` | Visual operation feedback with percentage and stage label | `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` |
| **InstallBanner** | `src/components/InstallBanner.tsx` | Non-intrusive landing page PWA promotion with 7-day dismissal cooldown | `role="region"`, dismiss button keyboard accessible |
| **GlobalToastRegion** | `src/components/GlobalToastRegion.tsx` | In-app notification queue driven by `PlatformEvent`s | `role="status"`, `aria-live="polite"` |
| **CanvasA11yOutline** | `src/components/canvas/CanvasA11yOutline.tsx` | Screen-reader accessible vector object tree and keyboard nudger | `role="list"`, `role="listitem"`, arrow key focus management |
| **OpenSourceNoticesModal** | `src/components/OpenSourceNoticesModal.tsx` | Machine-generated open-source provenance and license viewer | Modal focus trap, ESC key close, WCAG 2.2 contrast compliant |

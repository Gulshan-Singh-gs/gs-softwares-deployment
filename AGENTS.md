# GS Softwares — Master Architecture & Agent-Steering Specification
### File: `AGENTS.md` · The Single Source of Truth for Autonomous Implementation
### Version: 1.0 · Status: LOCKED · Authority: Platform Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║  THIS DOCUMENT STEERS THE AI CODING AGENT.                           ║
║  Read it fully before writing any code. Obey the Prime Directives    ║
║  absolutely. When ambiguous, follow the contract. When still         ║
║  ambiguous, STOP and ask — never invent.                             ║
║                                                                      ║
║  Product: GS Softwares Suite  ·  12 Suites · 109 Tools               ║
║  Model:  100% client-side PWA · zero upload · offline-first          ║
║  Stack:  React 19 · Vite 6 · TS 5.7 · Tailwind v4 · Workers · WASM   ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Purpose.** This is not prose. It is an *operating manual for an autonomous agent*. It converts every architectural decision made across this engagement into unambiguous, executable instructions. An agent that follows this document will produce a consistent, performant, privacy-preserving suite without drift. Build **one subsystem at a time**, in the order given, and never proceed past a phase until its acceptance criteria pass.

---

## PART 0 — Prime Directives (Immutable Laws)

These override all other guidance. If any later instruction conflicts with these, **these win.**

| # | Directive |
|---|---|
| **D1** | **Zero upload.** No file, key, payload, or derivative ever leaves the device. The network tab must remain empty during any processing operation. No analytics on content. |
| **D2** | **Offline-capable.** Every feature must function in airplane mode after first load. No runtime dependency on any remote service. |
| **D3** | **Never block the main thread** with heavy work. All image/video/audio/PDF/AI processing runs in Web Workers, OffscreenCanvas, or WASM. The UI must stay at 60fps / INP < 200ms. |
| **D4** | **No memory leaks.** Every `createObjectURL` is paired with a `revokeObjectURL`. Every Worker is terminated. Every stream is closed. Enforce via `useEffect` cleanup and explicit lifecycle hooks. |
| **D5** | **Non-destructive editing.** Editing stores *operations*, not pixel snapshots. The original file is never mutated. |
| **D6** | **Performance is adaptive.** All computational decisions flow through the Performance Tier store. No hard-coded worker counts, quality values, or model choices. |
| **D7** | **Privacy is structural, not a toggle.** EXIF stripping, metadata scrubbing, and encryption must be guaranteed by architecture, not by best-effort post-processing. |
| **D8** | **Honesty over capability.** If a feature cannot be done well client-side (e.g., RAR creation, DSD encoding, true PDF/A certification), refuse it openly with an explanation. Never fake an output. |
| **D9** | **Schema is the source of truth.** Settings, tools, and recipes are declared as data. UI is generated from schema. No hand-duplicated forms. |
| **D10** | **One contract, many tools.** Every tool consumes the same core subsystems. Adding a tool must require zero changes to the core. |

---

## PART 1 — System Model

GS Softwares is a **browser-native operating system**, not a website. Three layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3 · TOOL PLUGINS (12 suites · 109 tools)                  │
│  Lazy-loaded, isolated, registered via the Tool Registry.        │
│  Each declares: accepts / produces / chainable / weight.         │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2 · CORE SUBSYSTEMS (the "kernel")                        │
│  PerfTier · Settings · Registry · DataBus · WorkerPool ·         │
│  FileRouter · Automation · Notifications · Persistence           │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1 · PLATFORM (browser capabilities)                       │
│  Web Workers · OffscreenCanvas · WebGPU/WebGL · Web Crypto ·     │
│  WASM · File System Access · OPFS · IndexedDB · Service Worker   │
└─────────────────────────────────────────────────────────────────┘
```

**The flow of everything:** A file is dropped → **FileRouter** identifies it by magic number → **Registry** resolves the tool → tool reads defaults from **Settings** (tier-adjusted) → processing executes in the **WorkerPool** → results land in the **DataBus** → user exports or chains into **Automation**. The **NotificationService** reports completion. **Persistence** makes it survive reload.

---

## PART 2 — Locked Technology Stack

Do not substitute without architectural sign-off.

| Concern | Choice | Version | Rationale |
|---|---|---|---|
| UI framework | React | 19 | Concurrent features, `use` hook, Server-Components-ready |
| Build | Vite | 6 | Route-based code splitting, fast HMR, PWA plugin |
| Language | TypeScript | 5.7 | `strict: true`, no `any` in committed code |
| Styling | Tailwind CSS | v4 | Utility-first, design-token driven |
| State | Zustand | latest | Lightweight, supports Command Pattern, no boilerplate |
| Routing | React Router | 7 | Lazy routes per tool |
| PDF | `pdf-lib`, `pdfjs-dist` | latest | Manipulation + rendering |
| OCR | `tesseract.js` | latest | WASM, multi-language, worker-based |
| Image compress | `browser-image-compression` | latest | Worker-capable |
| Crop UI | `react-image-crop` | latest | Outputs % coords our pipeline expects |
| BG removal | `@imgly/background-removal` | latest | 100% on-device ONNX/WASM |
| Vector math | `paper.js` | latest | Bézier math for GS-Canvas |
| Vector render | `pixi.js` | latest | WebGL infinite canvas |
| Media | `ffmpeg.wasm` | latest | Video/audio transcode |
| Archives | `fflate`, `jszip` | latest | ZIP + AES via zip.js |
| Crypto | Web Crypto API + `libsodium.js` | native | AES-GCM, Argon2id, signatures |
| AI | `transformers.js` | latest | WebGPU local models |
| IDB | `idb` | latest | Promise-wrapped IndexedDB |

---

## PART 3 — Repository Structure (Exact)

The agent must create and maintain this tree. Do not deviate.

```
gs-softwares/
├── AGENTS.md                      # THIS FILE — never delete
├── public/
│   ├── icons/                     # PWA + tool icons (WebP/SVG)
│   └── models/                    # lazy AI/WASM models (cache-able)
├── src/
│   ├── main.tsx
│   ├── App.tsx                    # Router + Suspense boundaries
│   ├── core/                      # ← LAYER 2: THE KERNEL
│   │   ├── perf-tier/
│   │   │   ├── detect.ts          # auto-detection algorithm
│   │   │   ├── store.ts           # Zustand tier store
│   │   │   └── types.ts
│   │   ├── settings/
│   │   │   ├── schema.ts          # THE setting declarations
│   │   │   ├── store.ts
│   │   │   └── SettingsPanel.tsx  # auto-generated UI
│   │   ├── registry/
│   │   │   ├── tools.ts           # all 109 tool entries
│   │   │   └── types.ts
│   │   ├── data-bus/
│   │   │   ├── store.ts           # Command Pattern store
│   │   │   └── commands.ts        # operation definitions
│   │   ├── workers/
│   │   │   ├── pool.ts            # WorkerPool manager
│   │   │   ├── image.worker.ts
│   │   │   ├── pdf.worker.ts
│   │   │   ├── media.worker.ts
│   │   │   └── crypto.worker.ts
│   │   ├── file-router/
│   │   │   ├── magic.ts           # file-signature sniffer
│   │   │   └── router.ts
│   │   ├── automation/
│   │   │   ├── engine.ts          # queue + checkpointing
│   │   │   ├── recipes.ts         # built-in recipes
│   │   │   └── types.ts
│   │   ├── notifications/
│   │   │   └── service.ts
│   │   └── persistence/
│   │       ├── idb.ts             # IndexedDB helpers
│   │       └── opfs.ts            # OPFS staging
│   ├── suites/                    # ← LAYER 3: TOOL PLUGINS
│   │   ├── image/                 # GS-Pixels (13 tools)
│   │   ├── video/                 # (12 tools)
│   │   ├── pdf/                   # (12 tools)
│   │   ├── text/                  # (10 tools)
│   │   ├── archive/               # (8 tools)
│   │   ├── qr/                    # (6 tools)
│   │   ├── spreadsheet/           # (8 tools)
│   │   ├── audio/                 # (8 tools)
│   │   ├── ebook/                 # (8 tools)
│   │   ├── presentation/          # (8 tools)
│   │   ├── vector/                # GS-Canvas (8 tools)
│   │   └── security/              # (8 tools)
│   ├── ui/                        # shared components
│   │   ├── DropZone.tsx
│   │   ├── ToolShell.tsx          # the contextual workspace chrome
│   │   ├── ProgressBar.tsx
│   │   └── primitives/            # neumorphic buttons, toggles, sliders
│   ├── hooks/
│   │   ├── useWorker.ts
│   │   └── useProcessingState.ts
│   └── lib/
│       ├── fileUtils.ts
│       └── memory.ts              # Blob URL lifecycle manager
├── tests/
│   ├── unit/
│   └── e2e/                       # Playwright
└── vite.config.ts                 # PWA plugin + worker config
```

---

## PART 4 — Core Subsystem Contracts

The agent implements these **interfaces exactly**. Tools depend only on these contracts.

### 4.1 Performance Tier Engine

```typescript
// src/core/perf-tier/types.ts
export type PerfTier = 'eco' | 'balanced' | 'performance';

export interface TierProfile {
  workers: number;              // eco:2 · balanced:4 · perf:hardwareConcurrency
  gpu: 'off' | 'auto' | 'force';
  memoryCeilingMB: number;      // 256 · 512 · 1024
  aiModels: 'none' | 'lite' | 'full';
  batchConcurrency: number;     // 1 · 3 · max
  maxPreviewDim: number;        // 1080 · 1920 · 3840
  videoPreset: 'ultrafast' | 'medium' | 'slow';
  encodingPasses: 1 | 2;
  motion: 'none' | 'reduced' | 'full';
  autosaveSec: number;          // 30 · 10 · 5
}

// src/core/perf-tier/store.ts
export const usePerfTier = create<{
  tier: PerfTier;
  detected: PerfTier;          // from auto-detect
  override: boolean;
  profile: TierProfile;        // derived, reactive
  setTier(t: PerfTier): void;
  runBenchmark(): Promise<PerfTier>;
}>();
```

**Auto-detect rule:** score from `hardwareConcurrency`, `deviceMemory`, WebGPU probe, `prefers-reduced-motion`, Battery API. **Lowest signal wins.** Always disclose the reason in UI. Override shows a warning if it differs from `detected`.

### 4.2 Settings Store (schema-driven)

```typescript
// src/core/settings/schema.ts
export interface SettingDef {
  key: string;                 // e.g. 'files.image.quality'
  category: 'performance'|'appearance'|'general'|'privacy'|'files'|'advanced'|'tools'|'shortcuts'|'data';
  type: 'enum'|'boolean'|'number'|'color'|'string'|'secret'|'tier'|'action'|'computed';
  label: string;
  description: string;
  default: unknown;
  options?: { value: unknown; label: string; desc?: string }[];
  min?: number; max?: number;
  tierAware?: boolean;         // resolves through the tier profile
  dependsOn?: string;          // conditional visibility
  warning?: string;
}
export const SETTINGS: SettingDef[] = [ /* all declarations */ ];

// src/core/settings/store.ts
export const useSettings = create<{
  get<K extends string>(key: K): unknown;
  set(key: string, value: unknown): void;
  resolve(toolId: string, param: string): unknown;  // precedence chain
  export(): Promise<string>;
  import(json: string): Promise<void>;
  resetAll(): Promise<void>;
}>();
```

**Precedence:** `explicit override > suite default > global default > tier baseline`. Storage: `localStorage` for all except `secret`/heavy → `IndexedDB`.

### 4.3 Tool Registry

```typescript
// src/core/registry/types.ts
export interface ToolDef {
  id: string;                  // 'image.compressor'
  suite: string;               // 'image'
  name: string;
  slug: string;                // URL + i18n key root
  category: 'view'|'edit'|'convert'|'optimize'|'generate'|'secure'|'analyze'|'automate';
  accepts: string[];           // MIME types
  produces: string[];
  weight: 'L'|'M'|'H';         // lazy-load + progress if H
  automation: { batchable: boolean; chainable: boolean; params: string[] };
  privacy: { offline: true; uploads: false };  // ALWAYS this
  seo: { title: string; description: string; keywords: string[]; index: boolean };
  icon: string;
  component: () => Promise<{ default: React.ComponentType }>;  // lazy
}
```

Adding a tool = adding one entry. The All-Tools page, command palette, SEO route, and Automation picker all derive from this array. **No other file changes.**

### 4.4 Data Bus — Command Pattern (non-destructive)

```typescript
// src/core/data-bus/commands.ts
export type Command =
  | { type: 'crop';    args: { x:number; y:number; w:number; h:number } }
  | { type: 'resize';  args: { width:number; height:number } }
  | { type: 'rotate';  args: { deg: 0|90|180|270 } }
  | { type: 'flip';    args: { axis: 'h'|'v' } }
  | { type: 'adjust';  args: { brightness:number; contrast:number; blur:number } }
  | { type: 'filter';  args: { name:'grayscale'|'sepia'|'invert' } }
  | { type: 'bgRemove';args: {} }
  | { type: 'format';  args: { type:string; quality:number } };

// src/core/data-bus/store.ts
export const useDataBus = create<{
  source: File | null;                 // immutable original
  commands: Command[];                 // the edit history
  output: Blob | null;                 // last render
  push(cmd: Command): void;            // redo
  pop(): void;                         // undo
  setLast(cmd: Command): void;         // live slider drag (no history spam)
  reset(): void;
}>();
```

**Rule:** The worker renders `source + commands → output`. Undo/redo manipulates the array. Never store pixel snapshots.

### 4.5 Worker Pool

```typescript
// src/core/workers/pool.ts
export class WorkerPool {
  constructor(size = usePerfTier.getState().profile.workers);
  run<T>(kind: 'image'|'pdf'|'media'|'crypto', payload: unknown): Promise<T>;
  // Uses Transferable Objects ([arrayBuffer]) for zero-copy.
  // Terminates idle workers; enforces memoryCeilingMB.
}

// Worker contract (image.worker.ts)
// onmessage: { id, file, commands, profile }
// → createImageBitmap → OffscreenCanvas → apply commands → convertToBlob
// → postMessage({ id, blob }, [blob])   // transfer ownership back
```

### 4.6 File Router (magic numbers)

```typescript
// src/core/file-router/magic.ts
export async function identify(file: File): Promise<{ mime: string; toolId: string }>;
// Reads first 16 bytes. Signatures:
// FF D8 FF → jpeg · 89 50 4E 47 → png · 52 49 46 46+WEBP → webp
// 25 50 44 46 → pdf · 49 44 33 / FF FB → mp3 · 66 74 79 70 → mp4
// 50 4B 03 04 → zip/docx/xlsx/pptx/epub (probe inner mimetype)
```

Never trust `file.type` alone. Route on signature.

### 4.7 Automation Engine

```typescript
// src/core/automation/types.ts
export interface Recipe {
  id: string; name: string;
  steps: { tool: string; params: Record<string, unknown> }[];
  onError: 'isolate' | 'abort';
  output: { destination: 'download'|'zip'|'fs'; naming: string };
}
// engine.ts: queue → WorkerPool → OPFS checkpoint (resumable) → per-file isolation
```

### 4.8 Notification Service (local only — D1/D2)

```typescript
export const Notifications = {
  request(): Promise<boolean>;
  notify(o: { title: string; body: string; tag?: string; route?: string }): Promise<void>;
  batchComplete(r: { total:number; ok:number; failed:number }): Promise<void>;
};
// NO Web Push. NO server. Local Notification API + Badge + Media Session only.
```

### 4.9 Persistence

| Store | Technology | Contents |
|---|---|---|
| Prefs | `localStorage` | All non-secret settings |
| Vault / History / Projects | `IndexedDB` (`idb`) | Encrypted secrets, job history, autosaves |
| Scratch / large staging | `OPFS` | Worker temp files, checkpoints |

---

## PART 5 — Coding Standards (Mandatory)

1. **Strict TypeScript.** `strict: true`. No `any`. No `@ts-ignore` without a linked issue.
2. **Named exports** for components and utilities. One component per file.
3. **File naming:** `PascalCase.tsx` for components, `camelCase.ts` for logic, `*.worker.ts` for workers, `*.test.ts` for tests.
4. **Every Blob URL** is created through `lib/memory.ts` (`trackBlob`) and revoked on cleanup. Direct `URL.createObjectURL` calls in components are forbidden.
5. **Every async operation** surfaces `{ status, progress, error }` via `useProcessingState`.
6. **No inline styles** except dynamic transforms. Tailwind for all static styling.
7. **All user-facing strings** go through i18n keys, even if English-only now.
8. **Accessibility floor:** semantic landmarks, one H1 per route, keyboard-navigable controls, `aria-live` for processing results, never disable zoom.
9. **Comments explain *why*, not *what*.** Contracts are documented in `types.ts`.
10. **Deterministic outputs:** same input + same commands → byte-identical output (enables testing + diffing).

---

## PART 6 — Anti-Patterns (The Agent Must NEVER Do These)

| ❌ Forbidden | ✅ Do Instead |
|---|---|
| Upload a file/key/payload anywhere | Process locally; keep network tab empty |
| Run image/video/PDF/AI work on the main thread | Worker + OffscreenCanvas / WASM |
| Store pixel snapshots for undo | Command Pattern (store operations) |
| Leave a `createObjectURL` un-revoked | Centralized `lib/memory.ts` lifecycle |
| Trust `file.type` for routing | Magic-number identification |
| Hard-code worker count / quality / model | Read from PerfTier profile |
| Hand-write a settings form | Generate from `SETTINGS` schema |
| Fake an impossible feature (RAR create, DSD) | Refuse honestly with explanation |
| Mutate the original file | Non-destructive; original is immutable |
| Add a hard dependency on a remote API at runtime | Local-only; opt-in network calls disclosed |
| Let one bad file kill a batch | Per-file error isolation |
| Disable pinch-zoom or trap keyboard focus | Full accessibility preserved |

---

## PART 7 — Build Order (Dependencies are Strict)

The agent builds **in this order** and does not advance until the phase's acceptance criteria pass.

```
PHASE 0 · FOUNDATION (blocks everything)
  ├─ Repo scaffold + Tailwind + design tokens
  ├─ Perf-Tier Engine (detect + store + profile)
  ├─ Settings schema + store + auto-generated panel
  └─ Persistence layer (idb + opfs + memory.ts)

PHASE 1 · KERNEL
  ├─ WorkerPool + image.worker.ts
  ├─ Data-Bus (Command Pattern store)
  ├─ File Router (magic numbers)
  ├─ Notification Service
  └─ Tool Registry (types + first 3 entries)

PHASE 2 · SHELL
  ├─ ToolShell (contextual workspace chrome)
  ├─ Unified DropZone + Smart Router UI
  ├─ All-Tools page + command palette
  └─ Route-based lazy loading

PHASE 3 · FIRST SUITE (GS-Pixels — proves the architecture)
  ├─ Studio, Compress, Convert, Resize, Crop, Rotate
  ├─ EXIF Scrubber, Palette, Base64
  └─ Batch + ZIP export

PHASE 4 · INTERDISCIPLINARY BRIDGES
  ├─ Images↔PDF, Video↔Audio↔Image, Media↔Text
  └─ Automation Engine + built-in recipes

PHASE 5 · REMAINING 11 SUITES
  └─ One suite per iteration, each registered via the Registry

PHASE 6 · ADVANCED
  ├─ GS-Canvas (PixiJS + Paper.js infinite canvas)
  ├─ Local AI plane (transformers.js WebGPU)
  └─ Security suite (Web Crypto + libsodium)
```

---

## PART 8 — Definition of Done (Per Phase Gate)

A phase is **not complete** until all of these are true:

- [ ] `tsc --noEmit` passes with zero errors
- [ ] Unit tests pass for every core subsystem touched
- [ ] Lighthouse: Performance ≥ 95 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO 100
- [ ] **Network tab is empty** during a full processing session (D1 proof)
- [ ] Works in airplane mode after first load (D2 proof)
- [ ] No Blob URL growth over a 100-operation soak test (D4 proof)
- [ ] Main thread never blocks > 50ms during batch processing (D3 proof)
- [ ] All three perf tiers produce correct, tier-appropriate output (D6 proof)
- [ ] Axe accessibility audit: zero critical violations

---

## PART 9 — File Generation Manifest

The agent tracks progress against this checklist. (Core only; suite files generated per Phase 5.)

```
PHASE 0
[ ] vite.config.ts            [ ] src/main.tsx
[ ] src/App.tsx               [ ] src/core/perf-tier/{detect,store,types}.ts
[ ] src/core/settings/{schema,store}.ts  [ ] src/core/settings/SettingsPanel.tsx
[ ] src/core/persistence/{idb,opfs}.ts   [ ] src/lib/memory.ts
PHASE 1
[ ] src/core/workers/pool.ts  [ ] src/core/workers/image.worker.ts
[ ] src/core/data-bus/{store,commands}.ts
[ ] src/core/file-router/{magic,router}.ts
[ ] src/core/notifications/service.ts
[ ] src/core/registry/{tools,types}.ts
PHASE 2
[ ] src/ui/{DropZone,ToolShell,ProgressBar}.tsx
[ ] src/ui/primitives/*       [ ] src/hooks/{useWorker,useProcessingState}.ts
PHASE 3
[ ] src/suites/image/* (13 tool components + engine)
PHASE 4
[ ] src/core/automation/{engine,recipes,types}.ts
[ ] src/suites/{pdf,video,text}/bridges/*
```

---

## PART 10 — Agent Operating Protocol

How the agent must behave while implementing this document:

1. **Read fully first.** Do not write code until Parts 0–6 are internalized.
2. **One subsystem at a time.** Complete and test a subsystem before touching the next.
3. **Contract-first.** Write the `types.ts` interface, then the implementation, then the test.
4. **Verify the directives.** After each phase, self-audit against the Prime Directives and the Definition of Done. Report the audit.
5. **Never invent.** If a decision is not specified here, choose the option that best satisfies D1–D10 and *state the choice and rationale* before proceeding.
6. **Surface trade-offs.** If a requirement conflicts with a Prime Directive, stop and report — do not silently violate the directive.
7. **Keep the manifest honest.** Mark files complete only when they pass their tests.
8. **Small, reviewable increments.** Prefer many small commits over one large one.

---

## Handoff Summary for the Agent

You are building **a privacy-first, offline, browser-native utility operating system** of 12 suites and 109 tools. Your two highest obligations are **D1 (nothing leaves the device)** and **D3 (never block the main thread)**. Every architectural mechanism in this document — the tier engine, the worker pool, the command pattern, the magic router, the schema-driven settings — exists to satisfy the Prime Directives at scale. Build Phase 0 first. Prove the directives hold. Then, and only then, proceed.

**Architecture is locked. Begin at Phase 0, file `vite.config.ts`.**

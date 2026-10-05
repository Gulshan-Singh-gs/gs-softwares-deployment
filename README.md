<div align="center">

  <img src="./public/favicon.svg" alt="GS Softwares Logo" width="88" height="88" />

  # GS Softwares Suite

  <p><strong>The Privacy-Preserving, Client-Native Operating System for Creative, Cryptographic & Document Engineering.</strong></p>
  <p><em>100% In-Memory · Zero Server Uploads · Air-Gapped & Offline-First · WebAssembly & Multi-Core Web Workers</em></p>

  <p>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-0a0a0a?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/React-19-0a0a0a?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.7%20Strict-0a0a0a?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-0a0a0a?style=flat-square&logo=vite&logoColor=646CFF" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-v4-0a0a0a?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Architecture-AGENTS.md%20Compliant-0a0a0a?style=flat-square&logo=blueprint&logoColor=white" alt="AGENTS.md" />
    <img src="https://img.shields.io/badge/PWA-100%25%20Offline-0a0a0a?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## <img src="./public/readme-assets/neu-compass.svg" width="22" height="22" align="center" /> Executive Summary

**GS Softwares** is a zero-telemetry, browser-native operating platform unifying professional workstations into an interconnected, non-destructive ecosystem. 

Unlike traditional cloud-tethered platforms that ship your proprietary documents, media, and keys to remote servers, GS Softwares runs **100% client-side**. Leveraging standard browser primitives—**Web Workers**, **WebAssembly**, **OffscreenCanvas**, **Web Crypto API**, and the **Origin Private File System (OPFS)**—all computations execute in memory on the host machine. 

Disconnect your Wi-Fi, enable airplane mode, and every single feature continues to perform with sub-millisecond responsiveness and zero privacy leaks.

---

## <img src="./public/readme-assets/neu-scale.svg" width="22" height="22" align="center" /> Immutable Prime Directives

Every tool and subsystem strictly complies with the **GS Softwares Prime Directives**:

| Directive | Law | Implementation Reality |
| :--- | :--- | :--- |
| **D1 · Zero Upload** | No file, key, payload, or derivative ever leaves the host device. | Network tab remains completely empty during all processing. No tracking, telemetry, or server round-trips. |
| **D2 · Offline-Capable** | Every feature operates without network connectivity. | PWA Service Worker caching and complete in-browser WASM runtime bundles. |
| **D3 · Non-Blocking Threads** | Never lock the main event loop with heavy calculations. | Heavy compute (PDF rasterization, OCR, transcode, crypto) runs in dedicated Web Worker pools. UI stays at 60 FPS / INP < 200ms. |
| **D4 · Zero Memory Leaks** | Deterministic memory lifecycles. | Every `URL.createObjectURL` is registered through centralized tracking and immediately revoked upon cleanup. |
| **D5 · Non-Destructive** | Edits store operations, not destructive snapshots. | Immutable source buffers coupled with replayable Command Pattern state trees. |
| **D6 · Adaptive Tiers** | Hardware-aware performance profiles. | Responsive execution scaling across `eco`, `balanced`, and `performance` hardware concurrency tiers. |
| **D7 · Structural Privacy** | Security by architecture, not by toggle. | Native cryptographic primitives, EXIF metadata scrubbing, and in-memory sandboxing. |
| **D8 · Honesty Over Hype** | Refuse impossible operations client-side openly. | No fake operations or misleading simulation; exact mathematical and deterministic output guarantees. |

---

## <img src="./public/readme-assets/neu-architecture.svg" width="22" height="22" align="center" /> System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 3 · WORKSTATION STUDIOS & TOOL PLUGINS                          │
│  Pixels · Canvas · PDF · Video · Audio · Text · Archive · QR · Sheets   │
│  EBook · Slides · Security · Hash · Workflow (Automations)             │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2 · CORE SUBSYSTEMS ("The Kernel")                              │
│  • PerfTier Engine (Auto-benchmark & battery-aware thread profiles)    │
│  • Canonical Tool Registry (Discovery, capability metadata, SEO/AEO)   │
│  • DataBus & Command Pattern (Non-destructive undo/redo history)       │
│  • WorkerPool Manager (Comlink Web Workers & SharedArrayBuffers)       │
│  • Magic-Number File Router (Header sniffers: PDF, ZIP, PNG, MP4, etc) │
│  • Workflow Automation DAG (Queueing, isolation, batching)             │
│  • Storage & Memory Lifecycle (OPFS, IndexedDB, tracked Blob URLs)     │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 1 · PLATFORM CAPABILITIES                                       │
│  Web Workers · OffscreenCanvas · WebCrypto API · WASM · OPFS · IDB     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## <img src="./public/readme-assets/neu-studios.svg" width="22" height="22" align="center" /> The 14 Workstation Studios

GS Softwares provides 14 dedicated, domain-specific studios accessible via top-level routing, unified search, and the global Command Palette (`Ctrl+K` / `Cmd+K`):

| Studio | Identifier | Capabilities & Architecture |
| :--- | :--- | :--- |
| **GS-Pixels** | `pixels` | **Canvas-First Image Workstation**: Non-destructive adjustments, crop framing, canvas zoom/pan (25%–400%), before/after split slider, color palette extractor, EXIF metadata scrubber, and batch export. |
| **GS-Canvas** | `canvas` | **Vector Node Canvas**: Infinite vector surface with cubic/quadratic Bézier math, pressure-sensitive smoothing via `perfect-freehand`, shapes, layer graphs, and SVG/PNG vector exports. |
| **GS-PDF** | `pdf` | **Document Engine**: High-fidelity PDF viewing via `pdfjs-dist`, vector page manipulation, document merging/splitting, in-browser compression, watermarking, AcroForm field editing, and OCR text extraction via Tesseract WASM. |
| **GS-Video** | `video` | **WASM Video Studio**: Frame-accurate video trimming, interactive clip scrubbing, animated GIF compilation, and client-side audio track extraction without remote rendering. |
| **GS-Audio** | `audio` | **AI Audio DAW**: Triad Record-Edit-Play pipeline, high-precision WebAudio waveform visualization, non-destructive slicer, volume normalization, and real-time audio playback control. |
| **GS-Text** | `text` | **Structured Text Suite**: Synchronized Markdown matrix with live side-by-side preview, side-by-side Diff Comparator with line-level diffing, and reading analytics. |
| **GS-Archive** | `archive` | **In-Memory Archive Manager**: Multi-file ZIP creation and inspection powered by `JSZip`, recursive directory nesting, file extraction, and in-memory compression. |
| **GS-QR & Barcode** | `qr` | **Branded Matrix Studio**: Deterministic vector QR code generator with error correction levels (L/M/Q/H), vCard/WiFi/URL templates, foreground/background color styling, and barcode synthesis. |
| **GS-Sheets** | `spreadsheet` | **Data Grid Studio**: Fast client-side CSV / TSV tabular processor with column sorting, live row filtering, delimiter sanitization, and export to CSV, JSON, and Markdown tables. |
| **GS-EBook** | `ebook` | **EPUB Reader**: Distraction-free digital publication reader with chapter tree navigation, custom typography scaling, and offline reading persistence. |
| **GS-Slides** | `presentation` | **Deck Studio (Strictly Non-AI)**: 4 explicit editor view modes (`Canvas`, `Markdown`, `Outline`, `Present`), synchronized `---` slide delimiter parsing, slide organizer rail, fullscreen F5 presenter mode with live timer, and 16:9 vector PDF deck export via `@cantoo/pdf-lib`. |
| **GS-Security** | `security` | **Cryptographic Vault**: Military-grade file encryption and decryption using PBKDF2 (100,000 iterations) key derivation paired with authenticated AES-256-GCM ciphers via native `crypto.subtle`. |
| **GS-Hash** | `hash` | **Integrity & Checksum Engine**: Fast streaming cryptographic digest calculator generating SHA-256, SHA-512, SHA-384, SHA-1, and MD5 file signatures with dual-file checksum match verification. |
| **GS-Workflow** | `bridge` | **Cross-Suite Automation Studio**: Multi-step pipeline builder chaining inputs and outputs across tools (e.g., Image → WebP → Watermark → ZIP Archive) with 40+ prebuilt workflow templates. |

---

## <img src="./public/readme-assets/neu-theme.svg" width="22" height="22" align="center" /> Responsive Theme System (Dark & Light Mode)

GS Softwares features a bespoke, multi-tier design system crafted with **Tailwind CSS v4** and modern CSS variables:

- **Full Dark Mode**: Deep obsidian and cosmic zinc palettes (`#07080A`, `#0C0E14`) engineered with ambient neon accents for focused, low-eye-strain creative sessions.
- **High-Contrast Light Mode**: Clean, editorial-grade daylight palette utilizing balanced slate tones, crisp typography (`#0F172A` / `#1E293B`), refined border contrasts, and customized form controls (range sliders, scrollbars, dropdowns) with complete contrast compliance.
- **Adaptive Aesthetics**: Seamless switching with persistent theme memory across all modal drawers, inspectors, canvas stages, and status bars.

---

## <img src="./public/readme-assets/neu-tech.svg" width="22" height="22" align="center" /> Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **UI Framework** | React | 19.0 | Concurrent rendering, state transitions, modern hooks |
| **Bundler & Dev Server**| Vite | 6.1 | Lightning-fast HMR, route-based code splitting, PWA integration |
| **Language** | TypeScript | 5.7 | `strict: true`, strict types, zero `any` in production code |
| **Styling** | Tailwind CSS | 4.0 | Utility-first token design, ultra-clean CSS bundling |
| **State Architecture** | Zustand | 5.0 | Lightweight reactive state, Command Pattern stores, cross-slice sync |
| **PDF Manipulation** | `@cantoo/pdf-lib` | 2.0 | Pure client-side PDF document synthesis and vector export |
| **PDF Rendering** | `pdfjs-dist` | 6.2 | High-fidelity canvas rasterization and page text parsing |
| **Optical Character Recognition** | `tesseract.js` | 7.0 | Offline WASM OCR running inside isolated workers |
| **Vector Geometry** | `perfect-freehand` | 1.2 | Pressure-sensitive smoothing algorithms for freehand drawing |
| **Archive Compression**| `jszip` | 3.10 | In-browser multi-file ZIP compression and extraction |
| **Cryptography** | Web Crypto API | Native | Native `SubtleCrypto` AES-256-GCM, SHA-256/512, PBKDF2 |
| **Icons** | `lucide-react` | 1.51 | Modern, consistent iconography across all tools and suites |

---

## <img src="./public/readme-assets/neu-folder.svg" width="22" height="22" align="center" /> Repository Layout

```bash
gs-softwares-deployment/
├── public/                 # Static assets, PWA manifest, and icons
├── src/
│   ├── platform/           # Layer 2 Kernel
│   │   ├── registry.ts     # Canonical registry of all 14 studios & 100+ tools
│   │   ├── types.ts        # Global contracts, permissions, execution modes
│   │   └── storage.ts      # Multi-tier storage orchestration (OPFS / IDB)
│   ├── suites/             # Layer 3 Workstation Studios
│   │   ├── image/          # GS-Pixels Image Workstation
│   │   ├── pdf/            # GS-PDF Document Operating System
│   │   ├── video/          # GS-Video Trimmer, GIF & Converter Studio
│   │   ├── audio/          # GS-Audio WebAudio DAW
│   │   ├── presentation/   # GS-Slides Deck Studio (Canvas, Markdown, Outline, PDF)
│   │   ├── security/       # GS-Security AES-256-GCM Cryptographic Vault
│   │   ├── hash/           # GS-Hash Integrity & Checksum Calculator
│   │   ├── text/           # GS-Text Markdown Matrix & Diff Comparator
│   │   ├── archive/        # GS-Archive In-Memory ZIP/TAR Compression
│   │   ├── qr/             # GS-QR Matrix & Barcode Studio
│   │   ├── spreadsheet/    # GS-Sheets Tabular Grid Processor
│   │   └── workflow/       # GS-Workflow Cross-Suite Automation Pipeline
│   ├── components/         # Shared workspace chrome, modals, topbars & dropzones
│   ├── lib/                # Engine helpers (pdfEngine, markdownSync, fileUtils)
│   ├── App.tsx             # Main application shell with lazy route boundaries
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global Tailwind v4 design tokens and theme styles
├── vite.config.ts          # Bundler configuration and PWA plugins
├── tsconfig.json           # Strict TypeScript configuration
└── package.json            # Scripts and platform dependencies
```

---

## <img src="./public/readme-assets/neu-rocket.svg" width="22" height="22" align="center" /> Getting Started

### Prerequisites

* **Node.js** >= 20.0.0
* **npm** >= 9.0.0 (or **pnpm** / **yarn**)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gulshan-singh-gs/gs-softwares-deployment.git
   cd gs-softwares-deployment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Verify TypeScript compilation:**
   ```bash
   npm run typecheck
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## <img src="./public/readme-assets/neu-security.svg" width="22" height="22" align="center" /> Security & Privacy Guarantees

- **No Remote Telemetry**: No Google Analytics, no error telemetry servers, no marketing beacons.
- **Air-Gapped Operation**: Run inside completely offline corporate networks or classified environments with zero external dependencies.
- **Secure Sandbox Headers**:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - Strict Content Security Policy (`CSP`) restricting outbound connections.

---

## <img src="./public/readme-assets/neu-license.svg" width="22" height="22" align="center" /> License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for full details.

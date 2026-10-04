<div align="center">

  <img src="./public/favicon.svg" alt="GS Softwares Logo" width="80" height="80" />

  # GS Softwares

  <p><strong>A high-performance, privacy-first, client-side web application suite and creative workstation platform built for modern workflows.</strong></p>

  <p>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-0a0a0a?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/React-19-0a0a0a?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-0a0a0a?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-0a0a0a?style=flat-square&logo=vite&logoColor=646CFF" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-v4-0a0a0a?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind" />
    <img src="https://img.shields.io/badge/PWA-Offline--First-0a0a0a?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## 🧭 Overview

**GS Softwares** is an offline-capable, air-gapped web platform housing a comprehensive suite of media workstations, cryptographic utilities, and productivity tools. Every operation runs natively inside your browser using client-side Web APIs, Web Workers, and WebAssembly — guaranteeing zero latency from network roundtrips, offline reliability, and absolute data privacy.

---

## 🏛️ Architecture & Platform Model

GS Softwares functions as a **browser-native operating system**, transforming isolated utilities into an interconnected, non-destructive workstation ecosystem:

```
┌────────────────────────────────────────────────────────────────────────┐
│ GS SOFTWARES PLATFORM SHELL                                           │
│ Header • Router • Command Palette (Ctrl+K) • Adaptive Performance Tiers│
├────────────────────────────────────────────────────────────────────────┤
│ CANONICAL TOOL REGISTRY                                                │
│ Single source of truth for all tools, metadata, permissions & routing  │
├────────────────────────────────────────────────────────────────────────┤
│ GLOBAL STORAGE & ASSET LAYER                                           │
│ Multi-Tiered Storage: OPFS (Large Binaries) + IndexedDB + BroadcastSync │
│ Stable Asset IDs • Version Histories • Cross-App Lineage • Trash       │
├────────────────────────────────────────────────────────────────────────┤
│ WORKSTATION STUDIOS                                                    │
│ • GS-Pixels Studio (Canvas-First Image Workstation)                   │
│ • GS-Canvas (Bézier Vector Studio & Node Graph)                        │
│ • GS-PDF • GS-Video • GS-Audio • GS-Security • GS-Text • GS-Bridge     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 GS-Pixels V2 Workstation

GS-Pixels has been upgraded into a professional, non-destructive **Canvas-First Workstation**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: GS-Pixels • Multi-Asset Tabs • Undo/Redo • Paste • Export ZIP │
├────────────┬────────────────────────────────────────────┬──────────────┤
│ TOOL RAIL  │               CANVAS VIEWPORT              │  INSPECTOR   │
│ • Adjust   │ ┌────────────────────────────────────────┐ │ Context-     │
│ • Crop     │ │ [Processed] [Original] [Split]  [Zoom] │ │ sensitive    │
│ • Resize   │ │                                        │ │ sliders,     │
│ • Rotate   │ │    Interactive Before/After Slider     │ │ presets &    │
│ • AI Cutout│ │    with Drag Divider & Crop Overlays   │ │ fine-grained │
│ • Watermark│ │                                        │ │ parameters   │
│ • Privacy  │ └────────────────────────────────────────┘ │              │
│ • Palette  │                                            │ [Reset All]  │
│ • Convert  │                                            │ [Apply All]  │
│ • ... (18) │                                            │              │
├────────────┴────────────────────────────────────────────┴──────────────┤
│ STATUS BAR: 🔒 LOCAL AIR-GAPPED • WebWorker • 1920×1080px • 1.2MB → 420KB (-65%)
└────────────────────────────────────────────────────────────────────────┘
```

### Key Workstation Capabilities:
- **Canvas-First Viewport**: High-resolution image canvas with zoom (`25%` to `400%`), fit-to-screen, and centered checkered canvas texture.
- **Before / After Split Compare**: Interactive split-view comparison with a draggable divider handle.
- **Contextual Inspector**: Sliders and controls dynamically adapt to the active capability (`Adjust`, `Crop`, `Resize`, `Rotate`, `BG Remove`, `Watermark`, `Privacy`, `Palette`, `Convert`, `Vectorize`, `Upscale`, `Inpaint`, `Dither`, `Grid`, `Diff`, `Stitch`, `Batch`).
- **Multi-Asset Tabs**: Seamless tab switcher (`[ image1.png ✕ ] [ image2.jpg ✕ ] [+]`) with isolated history stacks and state.
- **AI & Computer Vision**: Client-side background removal, blemish removal via harmonic diffusion, 2x/4x super-resolution upscaling, and contour tracing to SVG.
- **Privacy & EXIF**: Lossless metadata scrubbing (GPS, camera, timestamp) with mosaic/blackout redaction.
- **Palette Studio**: 32-color extractor with live Eyedropper API, CSS Variables, and Tailwind CSS tokens.

---

## 📦 Core Suites

| Studio | Capabilities & Engine |
| :--- | :--- |
| **GS-Pixels** | Canvas-first image workstation, non-destructive adjustments, crop, resize, AI cutout, inpaint, dithering, and batch export. |
| **GS-Canvas** | Infinite vector node canvas featuring cubic & quadratic Bézier math, smart shape detection, layer composition, and SVG/PNG export. |
| **GS-Audio** | Multi-track audio recorder, live waveform visualizers, non-destructive slicing, and playback manipulation via `WebAudio API`. |
| **GS-Video** | Client-side video trimming, canvas frame extraction, format transformation, and local transcode without server roundtrips. |
| **GS-PDF** | In-browser PDF parsing, multi-document merging, page extraction, watermarking, and structural document inspection. |
| **GS-Security & Hash** | Air-gapped cryptographic hashing (SHA-256, SHA-512, MD5, SHA-1), checksum comparisons, and ciphers via `SubtleCrypto`. |
| **GS-Bridge & Workflows** | Inter-studio asset bridge passing documents and media seamlessly across tools without re-uploading. |
| **Productivity** | Local spreadsheet editor, formatted text processor, presentations, QR generator, and ZIP archiving. |

---

## 🔒 Security & Privacy Guarantee

- **Zero Uploads**: No files, tokens, or personal payloads are transmitted over the network. Processing stays strictly inside your browser tab.
- **Strict Headers**: Configured with `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and a strict `Content-Security-Policy`.
- **Air-Gapped & Offline Ready**: Service worker caches runtime bundles for offline execution anywhere.

---

## 📂 Project Structure

```bash
gs-softwares-deployment/
├── public/                 # Static assets, PWA manifest, and security headers
├── src/
│   ├── components/         # Workstation and studio components
│   │   ├── pixels/         # GS-Pixels Tool Rail, Canvas, Inspector, TopBar, StatusBar
│   │   ├── audio/          # Workstation visualizers, editors, recorders
│   │   ├── canvas/         # Viewport engines, minimaps, radial menus
│   │   ├── settings/       # Dynamic hardware controls & preference panels
│   │   └── shared/         # Standardized drop-zones, loading stages, cards
│   ├── platform/           # Core Platform Engine
│   │   ├── registry.ts     # Canonical Tool Registry & discovery metadata
│   │   ├── storage.ts      # Multi-tier Global Storage (OPFS, IDB, Memory)
│   │   └── types.ts        # Tool contracts, capabilities, and permission schemas
│   ├── context/            # Hardware & performance tier context providers
│   ├── lib/                # Media engines & mathematical utilities
│   │   ├── imageEngine.ts  # Canvas pixel manipulation, AI segmentation, inpainting
│   │   ├── audioEngine.ts  # WebAudio graph orchestrator
│   │   ├── cryptoEngine.ts # WebCrypto hash/cipher implementations
│   │   ├── pdfEngine.ts    # PDF page extraction and manipulation
│   │   └── canvas/         # Bézier math, export pipelines, storage
│   ├── pages/              # Studio view controllers
│   └── App.tsx             # Registry-driven application shell & routing
├── vite.config.ts          # Bundler configuration and PWA plugins
└── package.json            # Dependencies and pipeline scripts
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** >= 20.0.0
* **npm** >= 9.0.0 (or **pnpm** / **yarn**)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gulshan-singh-gs/gs-softwares-deployment.git
cd gs-softwares-deployment
```

2. Install dependencies:
```bash
npm install
```

3. Launch development server:
```bash
npm run dev
```

4. Typecheck & Build production bundle:
```bash
npm run typecheck
npm run build
```

---

## 📜 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

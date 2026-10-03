<div align="center">

  <img src="./public/favicon.svg" alt="GS Softwares Logo" width="80" height="80" />

  # GS Softwares

  <p><strong>A high-performance, privacy-first client-side web application suite built for modern workflows.</strong></p>

  <p>
    <a href="./LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-0a0a0a?style=flat-square&logo=opensourceinitiative&logoColor=white" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/React-19-0a0a0a?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-Strict-0a0a0a?style=flat-square&logo=typescript&logoColor=3178C6" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-Bundler-0a0a0a?style=flat-square&logo=vite&logoColor=646CFF" alt="Vite" />
    <img src="https://img.shields.io/badge/PWA-Offline--First-0a0a0a?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  </p>

</div>

---

## <img src="https://api.iconify.design/lucide:compass.svg?color=%23888888" width="18" height="18" align="center" /> Overview

**GS Softwares** is an offline-capable, air-gapped web platform housing a comprehensive suite of media processing, cryptographic, and productivity tools[cite: 1]. Every operation runs natively inside your browser using client-side Web APIs, Web Workers, and WebAssembly, guaranteeing zero latency from network roundtrips and complete data privacy[cite: 1].

---

## <img src="https://api.iconify.design/lucide:layout-grid.svg?color=%23888888" width="18" height="18" align="center" /> Core Pillars

<table>
  <thead>
    <tr>
      <th width="30%">Pillar</th>
      <th width="70%">Capabilities & Underlying Engine</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:pen-tool.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Canvas & Vector Studio</strong>
      </td>
      <td>
        Interactive vector node canvas featuring cubic & quadratic Bézier math, smart shape detection, layer composition, minimap previews, and raster/vector export[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:music.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Audio Workstation</strong>
      </td>
      <td>
        Multi-track recorder, waveform visualization, non-destructive slicing, playback scrubbing, and real-time audio manipulation backed by <code>WebAudio API</code>[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:video.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Video Engine</strong>
      </td>
      <td>
        Client-side video playback, frame-accurate trimming, canvas recording, and format transformation without server uploads[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:file-text.svg?color=%23888888" width="15" height="15" align="center" /> <strong>PDF & Document Suite</strong>
      </td>
      <td>
        In-browser PDF parsing, multi-file merging, page extraction, watermarking, and structural document inspection[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:shield-check.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Security & Crypto Core</strong>
      </td>
      <td>
        Air-gapped checksum verification, file hashing (SHA-256, SHA-512, MD5), and symmetric cipher operations powered by <code>SubtleCrypto</code>[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:image.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Pixels & Image Lab</strong>
      </td>
      <td>
        Pixel manipulation, EXIF inspection/stripping, batch resizing, adaptive compression, and palette extraction via hardware-accelerated 2D canvas[cite: 1].
      </td>
    </tr>
    <tr>
      <td>
        <img src="https://api.iconify.design/lucide:table.svg?color=%23888888" width="15" height="15" align="center" /> <strong>Productivity Utilities</strong>
      </td>
      <td>
        Client-side spreadsheet viewing/editing, formatted text processors, presentation decks, QR code generators, and archive packaging[cite: 1].
      </td>
    </tr>
  </tbody>
</table>

---

## <img src="https://api.iconify.design/lucide:cpu.svg?color=%23888888" width="18" height="18" align="center" /> Technical Architecture

<br />


```

┌─────────────────────────────────────────────────────────────┐
│                    GS Softwares Client                      │
└──────────────┬───────────────────────────────┬──────────────┘
│                               │
┌───────▼────────┐             ┌────────▼───────┐
│ Presentation   │             │ System Tier    │
│ & UI Layer     │             │ Engine         │
└───────┬────────┘             └────────┬───────┘
│                               │
┌───────▼───────────────────────────────▼───────┐
│           Client-Side Engine Layer            │
│  • Canvas & Bézier Math   • Audio Buffer Hub  │
│  • WebCrypto Pipeline     • PDF / Pixels Wasm │
└───────────────────────┬───────────────────────┘
│
┌───────────────────────▼───────────────────────┐
│          Storage & Persistence Core           │
│  • IndexedDB / Cache  • Offline PWA Service   │
└───────────────────────────────────────────────┘

```

<br />

* <img src="https://api.iconify.design/lucide:gauge.svg?color=%23888888" width="14" height="14" align="center" /> **Adaptive Performance Tiers**: Benchmarks hardware concurrency and memory availability upon startup, automatically dialing UI frame rates and worker density to match system capabilities[cite: 1].
* <img src="https://api.iconify.design/lucide:lock.svg?color=%23888888" width="14" height="14" align="center" /> **Air-Gapped Processing**: Sensitive media, documents, and credentials never leave the user's browser, preventing external leaks[cite: 1].
* <img src="https://api.iconify.design/lucide:zap.svg?color=%23888888" width="14" height="14" align="center" /> **PWA State & Service Worker**: Pre-caches runtime bundles and dynamic assets, enabling uninterrupted workflow execution with or without an active internet connection[cite: 1].

---

## <img src="https://api.iconify.design/lucide:folder-tree.svg?color=%23888888" width="18" height="18" align="center" /> Project Structure

```bash
gs-softwares-deployment/
├── public/                 # Static assets, manifests, and system icons[cite: 1]
├── src/
│   ├── components/         # Modular pillar components & overlays[cite: 1]
│   │   ├── audio/          # Workstation visualizers, editors, recorders[cite: 1]
│   │   ├── canvas/         # Viewport engines, minimaps, radial menus[cite: 1]
│   │   ├── settings/       # Dynamic hardware controls & preference panels[cite: 1]
│   │   └── shared/         # Standardized drop-zones, loading stages[cite: 1]
│   ├── context/            # Performance and hardware tier context providers[cite: 1]
│   ├── lib/                # Engine layer[cite: 1]
│   │   ├── audioEngine.ts  # WebAudio graph orchestrator[cite: 1]
│   │   ├── cryptoEngine.ts # WebCrypto hash/cipher implementations[cite: 1]
│   │   ├── imageEngine.ts  # Canvas pixel manipulation utilities[cite: 1]
│   │   ├── pdfEngine.ts    # PDF page extraction and manipulation[cite: 1]
│   │   └── canvas/         # Bézier calculations, export pipelines, storage[cite: 1]
│   ├── pages/              # Discrete pillar view controllers[cite: 1]
│   └── styles/             # Global system typography and design tokens[cite: 1]
├── vite.config.ts          # Bundler configuration and optimization plugins[cite: 1]
└── package.json            # Dependencies and pipeline scripts[cite: 1]

```

---

##  Getting Started

### Prerequisites

* **Node.js** >= 18.0.0
* **npm** >= 9.0.0 (or **pnpm** / **yarn**)

### Installation

1. Clone the repository:
```bash
git clone [https://github.com/gulshan-singh-gs/gs-softwares-deployment.git](https://github.com/gulshan-singh-gs/gs-softwares-deployment.git)
cd gs-softwares-deployment

```


2. Install runtime and build dependencies:
```bash
npm install

```


3. Launch the development server:
```bash
npm run dev

```


4. Build the production bundle:
```bash
npm run build

```



---

##  License

Distributed under the MIT License. See `LICENSE` for details.

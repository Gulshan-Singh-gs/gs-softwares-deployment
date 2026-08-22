# Design Specification: Glassmorphic Spatial Prism & Ambient Fluid Mesh PWA Loading Screen

**Date**: 2026-08-22  
**Status**: Approved  
**Target Project**: `gs-softwares-react`  

---

## Executive Overview
Engineering a state-of-the-art, high-performance PWA loading screen & splash system for GS Softwares Suite. The design blends 3D spatial glassmorphism, multi-layered fluid background mesh gradients, precision hardware telemetry, and zero-latency initial HTML pre-hydration.

---

## 1. Visual Identity & Color System

### Color Palette
- **Obsidian Main**: `#07090e` / `#0f172a`
- **Fluid Mesh Gradients**:
  - Indigo Glow: `rgba(99, 102, 241, 0.35)`
  - Emerald Glow: `rgba(16, 185, 129, 0.3)`
  - Cyber Cyan Glow: `rgba(56, 189, 248, 0.25)`
  - Electric Magenta Accent: `rgba(236, 72, 153, 0.2)`
- **Glass Card Surface**: `rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(28px) saturate(190%)`
- **Specular Border**: `1px solid rgba(255, 255, 255, 0.18)` with `border-top-color: rgba(255, 255, 255, 0.4)`

### Typography
- **Headings**: *Outfit* (800 / 900 weight, metallic gradient `-webkit-background-clip: text`)
- **Body & Subtitles**: *Plus Jakarta Sans*
- **Telemetry Numbers & Codes**: *JetBrains Mono* (monospaced tracking)

---

## 2. Component Architecture

### A. Pre-Hydration HTML Shell (`index.html`)
- Inline `<style>` block implementing lightweight ambient mesh animation (`@keyframes fluid-mesh`) and spatial glass container (`#pwa-splash`).
- Renders in `<50ms` on first paint before JS bundles or WASM binaries execute.
- Fades out smoothly with a 400ms CSS transition when React signals readiness.

### B. React Telemetry Preloader (`src/components/PWALoadingScreen.tsx`)
- **Fluid Ambient Mesh Background**: CSS animated blur orbs translating in floating Lissajous loops.
- **Floating Spatial Prism Card**:
  - Top specular highlight bar
  - 3D Prismatic Icon Badge with dual counter-rotating orbital rings (`@keyframes orbit-spin`)
  - Eyebrow pill: `100% PRIVATE • LOCAL WASM ENGINE`
- **Dual-Track Progress Bar**:
  - Laser sweep accent (`linear-gradient(90deg, #6366f1, #10b981, #38bdf8)`)
  - Real-time percentage counter (0% -> 100%)
- **4 Telemetry Diagnostic Modules**:
  1. Service Worker & Offline Asset Cache
  2. WebAssembly & SharedArrayBuffer Thread Matrix
  3. Hardware Acceleration & Web Workers
  4. Origin Private File System (OPFS) Sandbox
- **Hardware Status Pills**:
  - `COOP/COEP`: Cross-Origin Isolation status (Green = Isolated, Amber = Standard)
  - `WASM v2.0`: Multi-threaded C++ engine ready
  - `Zero Server Logs`: Verified 100% local privacy guarantee
- **Action & Controls**:
  - "Launch GS Suite" primary button (activates when progress reaches 100%)
  - "Skip Preloader" quick launch button in top right
  - Session storage caching (`gs_pwa_loaded_session`) to bypass on subsequent page reloads while allowing manual re-test via footer.

---

## 3. Key Animations & CSS Keyframes

```css
@keyframes fluid-mesh {
  0%, 100% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 40px) scale(0.95); }
}

@keyframes orbit-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes laser-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
```

---

## 4. Verification & Quality Gates
- Zero TypeScript errors (`npx tsc --noEmit`).
- Seamless visual transition from static HTML splash screen to React component.
- High-contrast accessibility compliance across Light, Semi-Dark, and Deep Dark theme modes.

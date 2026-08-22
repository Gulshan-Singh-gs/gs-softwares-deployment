# Glassmorphic Spatial Prism PWA Loading Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the PWA loading screen in `gs-softwares-react` into a world-class, 3D spatial glassmorphism experience with floating ambient fluid mesh gradients, multi-stage hardware telemetry, and zero-latency HTML pre-hydration.

**Architecture:** A 2-tier preloader system consisting of:
1. Static `#pwa-splash` HTML/CSS shell rendering in `<50ms` in `index.html`.
2. React `<PWALoadingScreen />` featuring CSS fluid mesh ambient animations, spatial glass cards (`backdrop-filter: blur(28px)`), dual orbital spinning halos, telemetry diagnostic pills, and cross-origin hardware isolation status (`COOP/COEP`).

**Tech Stack:** React, Tailwind CSS v4, TypeScript, Lucide Icons, Vanilla CSS keyframes, Vite PWA.

## Global Constraints
- Zero external CSS library additions (use existing `@import "tailwindcss";` and custom keyframes in `index.css`).
- High-contrast visual readability across Light, Semi-Dark, and Dark themes.
- TypeScript strictness (`npx tsc --noEmit` zero errors).
- Session-based caching (`gs_pwa_loaded_session`).

---

### Task 1: Pre-Hydration Spatial Glass HTML Shell

**Files:**
- Modify: `index.html:13-130`
- Modify: `src/index.css:350-370`

**Interfaces:**
- Consumes: Static DOM insertion inside `index.html`
- Produces: `#pwa-splash` element with `.loaded` class transition target

- [ ] **Step 1: Update index.html inline CSS & DOM for spatial glass splash**

Write the updated inline `<style>` and `#pwa-splash` markup in `index.html`:
```html
<style>
  #pwa-splash {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #07090e;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    overflow: hidden;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.4s;
  }
  #pwa-splash.loaded {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .splash-fluid-bg {
    position: absolute;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.4;
    animation: splash-fluid-bounce 8s ease-in-out infinite alternate;
  }
  .splash-fluid-1 {
    top: 15%;
    left: 20%;
    background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
  }
  .splash-fluid-2 {
    bottom: 15%;
    right: 20%;
    background: radial-gradient(circle, #10b981 0%, rgba(16, 185, 129, 0) 70%);
    animation-delay: -4s;
  }
  @keyframes splash-fluid-bounce {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(40px, -40px) scale(1.15); }
  }
  .splash-card {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2.5rem;
    border-radius: 2rem;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(28px) saturate(190%);
    max-width: 400px;
    width: 90%;
    text-align: center;
  }
</style>
```

- [ ] **Step 2: Add global keyframe animations in index.css**

Add `@keyframes fluid-mesh`, `@keyframes orbit-rotate`, and `@keyframes laser-sweep` to `src/index.css`.

- [ ] **Step 3: Run build check to verify syntax**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

---

### Task 2: Spatial Prism & Telemetry React Component

**Files:**
- Modify: `src/components/PWALoadingScreen.tsx`

**Interfaces:**
- Consumes: `PWALoadingScreenProps { onComplete: () => void; forceShow?: boolean; }`
- Produces: React glassmorphic component with hardware isolation detection (`window.crossOriginIsolated`)

- [ ] **Step 1: Implement PWALoadingScreen with spatial glass visual aesthetics**

Write updated `PWALoadingScreen.tsx` featuring:
- HSL ambient fluid mesh spheres
- Spatial glass container with specular light top border
- 3D Prismatic Icon Badge with dual counter-rotating orbital halo rings (`orbit-rotate`)
- Dual-track laser-sweep progress bar (`laser-sweep`)
- 4 telemetry diagnostic cards with glowing status indicators
- COOP/COEP isolation, WASM 2.0, and 0-server-log hardware badges
- "Launch GS Suite" and "Skip" action triggers

- [ ] **Step 2: Run TypeScript validation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

---

### Task 3: Integration & Transition Verification

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `#pwa-splash` in HTML & `PWALoadingScreen` React component
- Produces: Instant cold-boot splash transition + on-demand footer trigger

- [ ] **Step 1: Ensure main.tsx handles smooth splash transition**
- [ ] **Step 2: Ensure App.tsx handles session caching and footer status modal**
- [ ] **Step 3: Verify TypeScript compilation & full Vite build**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

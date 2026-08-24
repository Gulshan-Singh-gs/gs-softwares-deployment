# Product Requirements Document (PRD): GS-Canvas
**Document Version:** 1.0 (Decisive)  
**Product Name:** GS-Canvas (Internal Codename: *Infinite*)  
**Platform:** Web (PWA), Client-Side Only  
**Target Release:** Q3 2026  

---

## 1. Executive Summary
**GS-Canvas** is a privacy-first, client-side Progressive Web App that provides an **infinite vector canvas** for visual thinking, sketching, and precise design. Inspired by the paradigm of native apps like *Concepts*, GS-Canvas bridges the gap between the fluid, natural feel of raster drawing and the mathematical precision of vector graphics. 

Every stroke drawn is captured as a scalable Bézier curve, allowing users to sketch freely and edit nodes, colors, and thicknesses *after* the stroke is made. Operating entirely in the browser with **zero server uploads**, GS-Canvas targets designers, architects, students, and visual thinkers who need a powerful, install-free digital sketchbook that respects their privacy and device storage.

---

## 2. Scope & Boundaries (The "No-Mess" Mandate)

To ensure a high-performance, bug-free V1 release, we are strictly defining what is IN and OUT of scope. We are skipping features that introduce high architectural complexity, flaky third-party dependencies, or severe performance degradation on mobile web.

### ✅ IN SCOPE (Core Implementation)
*   **Infinite Canvas:** Pan and zoom without boundaries, utilizing viewport culling.
*   **Vector-Raster Hybrid Engine:** Pressure-sensitive drawing that feels like physical media but stores mathematical paths.
*   **Post-Stroke Editing:** Selecting and manipulating nodes/paths after drawing.
*   **Smart Shapes:** Heuristic "snap-to-shape" for circles, rectangles, and lines.
*   **Layer System:** Standard layer stack (add, delete, reorder, hide, lock, opacity).
*   **Standard Exports:** SVG (vector), PNG (raster), PDF (print-ready vector).
*   **Local File Management:** IndexedDB autosave + File System Access API for local `.gscanvas` files.

### ❌ OUT OF SCOPE (Skipped for V1 due to complexity/mess)
*   **PSD Export:** *Skipped.* The `ag-psd` library is notoriously flaky with complex blend modes and layer effects in the browser. 
*   **DXF/CAD Import/Export:** *Skipped.* Parsing 30 years of AutoCAD legacy formats in a web worker is a massive, messy undertaking.
*   **Complex Raster Textures (Watercolor bleed, wet-on-wet):** *Skipped.* Simulating fluid dynamics in WebGL tanks mobile frame rates. We will stick to solid, marker, and basic pencil textures.
*   **Real-time Multi-user Collaboration:** *Skipped.* CRDTs for infinite vector canvases are highly complex. GS-Canvas is a single-player offline tool.
*   **3D Extrusion / Perspective Warping:** *Skipped.* Keeps the math 2D and performant.

---

## 3. Technical Architecture

GS-Canvas will be built on a hybrid rendering and logic architecture to ensure 60fps performance on mid-range devices.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **UI Shell** | SvelteKit + Neumorphic CSS | Toolbars, radial menus, panels, state management. |
| **Rendering Engine** | **PixiJS** (WebGL) | High-performance rendering of strokes, textures, and canvas transformations. |
| **Vector Math & Logic** | **Paper.js** (Headless) | Bézier curve math, path smoothing, boolean operations, and node manipulation. |
| **Input Handling** | Pointer Events API | Capturing `pressure`, `tilt`, and `twist` from styluses and touch. |
| **Local Storage** | IndexedDB (`idb`) | Storing project JSON and cached assets offline. |
| **File I/O** | File System Access API | Reading/writing `.gscanvas` files directly to the user's hard drive. |
| **Export Engine** | `svg-pathdata` + `pdf-lib` | Serializing vector math to clean SVG and embedding into PDF. |

---

## 4. Feature Specifications

### 4.1 The Infinite Canvas & Navigation
*   **Pan & Zoom:** Two-finger pinch to zoom, two-finger drag to pan (touch). Spacebar + drag to pan, `Ctrl/Cmd` + scroll to zoom (desktop).
*   **Viewport Culling:** The engine must only render strokes that intersect the current camera viewport. Objects outside the view are ignored by the WebGL draw call.
*   **Coordinate System:** 64-bit floating point for internal logic to prevent "jitter" at extreme zoom levels, mapped to 32-bit for WebGL rendering.
*   **Grid System:** Toggleable dot grid or line grid that scales dynamically with zoom level.

### 4.2 Drawing Engine (The "Feel")
*   **Input Smoothing:** Raw pointer events are passed through a **Ramer-Douglas-Peucker** algorithm to remove jitter, then converted into smooth cubic Bézier curves.
*   **Brush Types (V1):**
    *   *Pen:* Solid, opaque, pressure affects width.
    *   *Marker:* Semi-transparent, overlapping strokes build up opacity (multiply blend mode), pressure affects width.
    *   *Pencil:* Slight opacity variation based on pressure, fixed width.
    *   *Eraser:* Vector knockout (removes intersecting paths) or raster mask (white overlay).
*   **Color Picker:** HSL wheel + Hex input + "Professional Marker" preset palettes (grays, skin tones, primary colors).

### 4.3 Post-Stroke Vector Editing (The "Magic")
*   **Select Tool:** Tapping a stroke highlights it and reveals its control points (nodes).
*   **Node Manipulation:** Users can drag nodes to reshape the curve. 
*   **Style Editing:** When selected, the user can change the stroke's color, width, and opacity without redrawing.
*   **Path Operations:** Join two open paths, close an open path, or reverse path direction.

### 4.4 Smart Shapes (Heuristic Snapping)
*   **Logic:** When the user draws a shape and *holds* the stylus/finger at the end of the stroke for 400ms, the engine analyzes the path variance.
*   **Execution:** 
    *   If the path is a closed loop with low variance from a perfect circle → **Snap to Circle**.
    *   If the path has 4 distinct corners → **Snap to Rectangle**.
    *   If the path is a straight line → **Snap to Line**.
*   **Visual Feedback:** A subtle haptic vibration (if supported) and a visual "snap" animation.

### 4.5 Layer Management
*   **Structure:** Linear stack of layers.
*   **Controls:** Add, Delete, Duplicate, Rename.
*   **Visibility:** Toggle eye icon (hide/show).
*   **Locking:** Toggle padlock icon (prevents selection/editing).
*   **Reordering:** Drag and drop layers in the UI panel.
*   *Note for V1:* Blend modes are restricted to Normal and Multiply to maintain WebGL performance.

### 4.6 File Management & Export
*   **Autosave:** Every 5 seconds, or on every "stroke end" event, the project JSON is serialized and saved to IndexedDB.
*   **Save to Device:** Uses File System Access API to save a `.gscanvas` file (a zipped JSON + asset manifest) to the user's local drive.
*   **Export Options:**
    *   **SVG:** Clean, minified vector output. Perfect for handing off to Illustrator or web dev.
    *   **PNG:** Rasterized at 1x, 2x, or 4x resolution.
    *   **PDF:** Vector paths embedded in a PDF document for print.

---

## 5. UI/UX Guidelines

The UI must stay out of the way of the canvas. We will use a **Floating Neumorphic** design system.

*   **The Radial Tool Wheel:** Instead of a top ribbon, the primary tools (Pen, Eraser, Select, Lasso, Pan) live in a radial menu that appears when the user taps a floating action button (FAB) or uses a keyboard shortcut.
*   **Contextual Properties:** When a tool is selected, a small floating neumorphic pill appears near the canvas edge showing *only* the relevant settings (e.g., Width and Color for the Pen; Opacity for the Marker).
*   **Left/Right Hand Mode:** A toggle in settings that mirrors the UI for left-handed users.
*   **Distraction-Free Mode:** A single button to hide all UI panels, leaving only the canvas and a minimal floating undo/redo button.

---

## 6. Performance & Privacy Requirements

### Performance Targets
*   **Frame Rate:** Must maintain **60 FPS** during pan/zoom and drawing on an iPad Air (M1) and a mid-range Android tablet (Snapdragon 7 Gen 1).
*   **Stroke Latency:** Time from stylus touch to pixel render must be **< 20ms**.
*   **Memory Management:** If a single layer exceeds 5,000 vector objects, the engine must prompt the user to "Flatten/Rasterize" the layer to free up memory, or automatically do so in the background while keeping a vector backup in IndexedDB.

### Privacy & Security
*   **Zero Uploads:** The network tab must remain completely empty during use. No telemetry, no asset fetching, no cloud sync.
*   **Local Only:** All processing, rendering, and saving happens in the browser sandbox.

---

## 7. Phased Rollout Plan

### Phase 1: The Sketchpad (Weeks 1-4)
*   Initialize SvelteKit + PixiJS + Paper.js architecture.
*   Implement infinite canvas pan/zoom and viewport culling.
*   Implement Pointer Events for pressure-sensitive drawing (Pen and Marker).
*   Implement basic IndexedDB autosave.
*   *Milestone: Users can draw smoothly on an infinite canvas and it saves when they refresh.*

### Phase 2: The Vector Editor (Weeks 5-8)
*   Implement the Select tool and node manipulation (post-stroke editing).
*   Implement the Smart Shape heuristic snapping.
*   Implement the Layer system (add, delete, reorder, hide).
*   Implement the Radial Tool Wheel UI.
*   *Milestone: Users can draw, reshape vectors, and organize layers.*

### Phase 3: The Professional Export (Weeks 9-12)
*   Implement File System Access API for local `.gscanvas` file saving/loading.
*   Implement SVG, PNG, and PDF export engines.
*   Implement the Color Picker and Professional Marker palettes.
*   Performance profiling and optimization (garbage collection, memory limits).
*   *Milestone: V1 Release Candidate.*

---

## 8. Definition of Done (V1)

1.  [ ] A user can open the PWA on an iPad, draw a complex sketch with an Apple Pencil at 60fps, and close the browser.
2.  [ ] The user can reopen the PWA the next day, and the sketch is exactly as they left it (IndexedDB persistence).
3.  [ ] The user can select a drawn line, grab a node, and bend the line into a new shape.
4.  [ ] The user can draw a rough circle, hold the pen, and watch it snap into a perfect geometric circle.
5.  [ ] The user can export the sketch as a clean SVG file and open it in Adobe Illustrator with all paths intact.
6.  [ ] Lighthouse Performance score is > 90; Network tab shows 0 bytes uploaded during a session.

---
**Approval:**  
*Product Architecture Team, GS Softwares*  
*Status: APPROVED FOR DEVELOPMENT* 
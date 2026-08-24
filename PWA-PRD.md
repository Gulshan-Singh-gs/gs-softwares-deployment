### I AGENT DIRECTIVES (The "Constitution")

**Before writing any code, the AI Agent must internalize these non-negotiable constraints:**

1.  **Target Environment:** 2016-era mobile devices (e.g., iPhone 6s, Galaxy S7, low-end Redmi). **Max RAM per tab: ~800MB.** CPU is weak; main thread blocking is fatal.
2.  **The Memory Airlock (Crucial):** `pdf-lib` loads entire PDFs into RAM. **NEVER** hold more than one `PDFDocument` instance in memory at a time. The Global State only holds metadata and IndexedDB IDs. `pdfEngine.ts` must load the `ArrayBuffer` from IndexedDB, mutate it, save it back, and immediately dereference it for Garbage Collection.
3.  **Strict File Boundaries:**
    *   `src/pages/PdfApp.tsx`: UI, Glassmorphic Tailwind styling, Lucide icons, Global State interactions. **Zero PDF parsing logic here.**
    *   `src/lib/pdfEngine.ts`: All `pdf-lib`, `pdfjs-dist`, and canvas mutation logic.
    *   `src/lib/db.ts`: IndexedDB (`GS_Softwares_DB` / `workspace_files`) CRUD operations.
4.  **Worker Mandate:** Heavy compute (rendering, pixel diffing, image downsampling, stream parsing) **MUST** run in Web Workers.
5.  **No Hallucinations:** Do not invent APIs. If `pdf-lib` lacks a feature (like native AES encryption or content stream operator deletion), explicitly use the prescribed workaround (WebCrypto, custom stream parsing).

---

# 🏗️ CORE INFRASTRUCTURE FRAMEWORK

### 1. Global State Architecture (Single Source of Truth)
The global state manages the **Document Queue** (`pdfFiles`), not the binary data.
```typescript
// Types for Global State
interface PDFFileItem {
  id: string; // UUID
  name: string;
  size: number;
  pageCount: number;
  type: 'pdf' | 'image';
  status: 'idle' | 'processing' | 'error';
  // ArrayBuffer is NEVER stored here. It lives in IndexedDB.
}

interface AppState {
  pdfFiles: PDFFileItem[];
  activeFileId: string | null;
  currentTool: ToolType;
  // ... UI states
}
```

### 2. The IndexedDB Persistence Layer (`src/lib/db.ts`)
Strict adherence to the provided schema.
```typescript
// src/lib/db.ts
const DB_NAME = 'GS_Softwares_DB';
const STORE_NAME = 'workspace_files';

export const saveFileToDB = async (file: PDFFileItem, data: ArrayBuffer) => {
  // Implementation using idb or native IndexedDB API
  // Record: { id: file.id, app: 'pdf', name: file.name, type: file.type, size: file.size, data, timestamp: Date.now() }
};

export const getFileFromDB = async (id: string): Promise<ArrayBuffer> => { ... };
```

### 3. The Engine Proxy (`src/lib/pdfEngine.ts`)
All tools must route through this file. It acts as the bridge between the Main Thread and Web Workers.
```typescript
// src/lib/pdfEngine.ts
export const executeTool = async (toolName: string, fileIds: string[], options: any) => {
  // 1. Load ArrayBuffer from DB (Memory Airlock)
  // 2. Initialize pdf-lib PDFDocument
  // 3. Execute tool logic
  // 4. Save back to DB
  // 5. Trigger GC
};
```

---

# 🛠️ TOOL-SPECIFIC IMPLEMENTATION FRAMEWORKS

Below is the exact blueprint for the AI agent to implement/fix each of the 14 active tools.

### 1. 📄 Page Operations (Merge, Reorder, Rotate, Delete)
*   **Non-Negotiable:** Batch processing must be sequential to prevent OOM on 2016 mobiles.
*   **Data Flow:** UI Queue -> `pdfEngine.ts` -> Load File A & B from IDB -> `pdf-lib` `copyPages` -> Save Merged to IDB -> Clear RAM.
*   **Low-End Opt:** Never use `Promise.all()` for merging multiple large files. Use a `for...of` loop with `await` to process one merge at a time, allowing the browser to breathe and GC between iterations.
*   **Playwright Test:** Merge five 50MB PDFs. Assert final page count is correct. Assert memory heap snapshot does not exceed 400MB during process.

### 2. 👁️ View & Navigation (Zoom, Fit, Spread)
*   **Non-Negotiable:** 60FPS scrolling/zooming on weak CPUs.
*   **Data Flow:** UI captures gesture -> CSS `transform: scale()` applied immediately for visual feedback -> Debounce (300ms) -> Worker triggers `pdfjs-dist` `getViewport({ scale })` -> Re-renders canvas.
*   **Low-End Opt:** Use `OffscreenCanvas` in the Worker. Transfer the canvas back to the main thread using `transferControlToOffscreen()` to avoid pixel copying overhead.

### 3. ✍️ Text Studio (Typewriter & Patch)
*   **Non-Negotiable:** Text must be vector, not rasterized.
*   **Data Flow:** UI renders HTML `<input>` overlay on canvas -> User types -> On "Commit/Blur", coordinates mapped to PDF User Space -> `pdf-lib` `embedFont` (Standard 14) -> `drawText`.
*   **Low-End Opt:** Do not re-render the `pdfjs-dist` canvas on every keystroke. Only bake the text into the PDF and re-render the canvas when the user clicks away or saves.

### 4. 🖼️ Image & Objects (Overlays)
*   **Non-Negotiable:** Transparent PNGs must retain alpha channels.
*   **Data Flow:** UI drag/drop -> Worker downsamples image if >2MP -> `pdf-lib` `embedPng` -> `drawImage` with transformation matrix.
*   **Low-End Opt:** High-res images will crash the tab. The Worker **must** use `OffscreenCanvas` to resize the image binary before passing it to `pdf-lib`.

### 5. 🖍️ Annotations (Highlight, Markup)
*   **Non-Negotiable:** Annotations must be native PDF `/Annots`, not HTML overlays.
*   **Data Flow:** UI draws shapes -> Stored as lightweight JSON in Global State -> On "Save", `pdfEngine.ts` iterates JSON and creates `/Subtype /Highlight` or `/Ink` dictionaries via `pdf-lib`.
*   **Low-End Opt:** Keep annotations in JS memory during the session. Only mutate the heavy PDF binary when the user explicitly saves or exports.

### 6. 📝 Form Creator (AcroForm)
*   **Non-Negotiable:** Must generate native AcroForm with Appearance Streams (`/AP`) for tab navigation.
*   **Data Flow:** UI draws bounding box -> `pdfEngine.ts` calls `pdfDoc.getForm().createTextField()` / `createCheckBox()`.
*   **Low-End Opt:** Form fields are lightweight. No special memory constraints, but ensure the `/Rect` coordinates are perfectly mapped from screen space to PDF space to prevent overlapping fields.

### 7. ✒️ Signatures (Canvas Pad)
*   **Non-Negotiable:** Smooth strokes on low-polling-rate touchscreens.
*   **Data Flow:** HTML5 Canvas captures `pointermove` -> Catmull-Rom spline smoothing -> `toBlob('image/png')` -> `pdf-lib` `embedPng`.
*   **Low-End Opt:** Limit canvas resolution to `window.devicePixelRatio` (max 2.0). Throttle `pointermove` events to 60Hz using `requestAnimationFrame` to prevent CPU spikes on 2016 devices.

### 8. 🔒 Security & Encryption
*   **Non-Negotiable:** Standard PDF Security Handler with AES.
*   **Data Flow:** *Warning: `pdf-lib` does NOT support encryption natively.* The Agent must implement a Web Worker that uses a WASM-compiled PDF encryption library (like a port of `qpdf` or `mupdf`), OR use the Web Crypto API to manually encrypt the streams and construct the `/Encrypt` dictionary in the PDF trailer.
*   **Low-End Opt:** Stream encryption in the Worker. Do not load the entire decrypted PDF into memory just to encrypt it.

### 9. 🛡️ Redaction (True Redaction - TC1)
*   **Non-Negotiable:** **PHYSICALLY SEVER TEXT OPERATORS.** Drawing a black box is a failure state.
*   **Data Flow:**
    1.  User draws redaction rect.
    2.  Worker uses `pdfjs-dist` to find all text chunks intersecting the rect.
    3.  Worker parses the raw page Content Stream.
    4.  Worker filters out `Tj`/`TJ` operators that fall within the rect.
    5.  Worker injects `re` (rectangle) and `f` (fill) operators with black color space.
    6.  `pdf-lib` saves the modified stream.
*   **Low-End Opt:** Content stream parsing is CPU heavy. Run strictly in a Web Worker. Process one page at a time.
*   **Playwright Test:** Redact a known SSN. Extract text from the resulting PDF using `pdfjs-dist`. Assert the SSN string is completely absent from the extracted text.

### 10. 🔄 Conversion (TXT / Images)
*   **Non-Negotiable:** Zero memory leaks during batch conversion.
*   **Data Flow:**
    *   *TXT:* `pdfjs-dist` `getTextContent()` -> Stream to `.txt` file.
    *   *Images:* `pdfjs-dist` render to canvas -> `canvas.toBlob()` -> Trigger download -> `URL.revokeObjectURL()`.
*   **Low-End Opt:** Process pages sequentially. **Crucial:** Call `URL.revokeObjectURL()` immediately after download triggers to free memory.

### 11. 🗜️ Compression
*   **Non-Negotiable:** Must reduce file size without destroying vector text.
*   **Data Flow:** `pdf-lib` object streams + Image downsampling.
*   **Low-End Opt:** Image downsampling MUST happen in a Worker using `OffscreenCanvas`. Never load full-res images onto the main thread.

### 12. 📐 Measurement
*   **Non-Negotiable:** Accurate spatial calculation.
*   **Data Flow:** Pure math. Map screen coordinates to PDF User Space (72 DPI). Calculate Euclidean distance / Polygon area.
*   **Low-End Opt:** Zero memory overhead. Just ensure the coordinate mapping matrix is perfectly calibrated.

### 13. 🏷️ Stamps & Bates
*   **Non-Negotiable:** Sequential numbering across the entire queue.
*   **Data Flow:** UI configures prefix/padding -> `pdfEngine.ts` loops through pages -> `pdf-lib` `drawText` with formatted string.
*   **Low-End Opt:** Do not attempt to render the UI preview for 500 pages with Bates numbers. Apply to the `pdf-lib` document in memory, save to IDB, and show a success toast.

### 14. 🔍 Comparison (Side-by-Side)
*   **Non-Negotiable:** Dual pane text Myers' diff + pixel diff.
*   **Data Flow:**
    1.  Extract Text A & B -> Run Myers' diff in Worker -> Highlight word changes.
    2.  Render Page A & B to hidden canvases -> Run pixel difference algorithm (e.g., absolute difference of `ImageData` arrays) -> Overlay neon highlights.
*   **Low-End Opt:** **Extremely heavy.** Never hold both full documents in `pdf-lib` simultaneously. Extract text, discard PDF A from RAM. Extract text, discard PDF B from RAM. Render canvases at low DPI (72) for the diff view.

---

# 🧪 PLAYWRIGHT VALIDATION FRAMEWORK

The AI Agent must write Playwright tests (`playwright.config.ts`) that verify the **binary output**, not just the UI.

```typescript
// Example: True Redaction Validation Test
test('True Redaction severs text operators', async ({ page }) => {
  // 1. Upload PDF with known PII ("SSN: 123-45-6789")
  // 2. Draw redaction box over PII
  // 3. Click "Apply Redaction"
  // 4. Download the resulting PDF
  // 5. Parse the downloaded PDF using a Node.js PDF parser in the test environment
  // 6. ASSERT: The string "123-45-6789" is NOT present in the raw text extraction.
});
```

---

# 🚀 EXECUTION ROADMAP FOR THE AI AGENT

**Phase 1: Core Infrastructure & Memory Airlock**
*   Implement `db.ts` and strict IndexedDB schema.
*   Implement Global State (metadata only).
*   Implement `pdfEngine.ts` with the "Load -> Mutate -> Save -> GC" pattern.

**Phase 2: The Rendering Engine**
*   Implement `pdfjs-dist` Worker with `OffscreenCanvas`.
*   Implement Proxy Rendering (visible + 2 buffer pages).
*   Build the View & Navigation suite.

**Phase 3: Vector & Object Mutation**
*   Implement Text Studio, Image Objects, and Annotations.
*   Ensure all mutations are deferred until "Save/Export" to keep UI snappy.

**Phase 4: Heavy Compute & True Redaction**
*   Implement Redaction (TC1) with custom stream parsing.
*   Implement Compression and Comparison.

**Phase 5: Polish & PWA**
*   Implement Vite dynamic imports to keep main bundle < 2MB.
*   Configure Service Worker for 100% offline capability.

---
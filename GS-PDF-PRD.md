# Product Requirements Document (PRD)
## GS-PDF Studio — 100% Client-Side Enterprise PDF Editor PWA

| | |
|---|---|
| **Document Version** | 1.0 |
| **Status** | Approved for Engineering |
| **Product Name** | GS-PDF Studio |
| **Platform** | Web (PWA) — Desktop, Tablet |
| **Core Principle** | *Zero-upload architecture: All PDF parsing, mutation, and rendering occur strictly within the client's browser memory.* |

---

## 1. Executive Summary
**GS-PDF Studio** is a comprehensive, enterprise-grade PDF manipulation suite built as a Progressive Web App. It replicates the functionality of heavy desktop software (like Adobe Acrobat Pro) entirely in the browser. By leveraging `pdf-lib` for document mutation, `pdf.js` for rendering, Web Workers for heavy computation, and IndexedDB for local persistence, GS-PDF Studio guarantees absolute data privacy. No document bytes ever touch a server.

---

## 2. Product Architecture & Technical Constraints
To achieve 100% client-side processing without freezing the UI, the application enforces the following architectural boundaries:

*   **Rendering Engine:** `pdf.js` running in an `OffscreenCanvas` or dedicated Web Worker to render pages to the UI without blocking the main thread.
*   **Mutation Engine:** `pdf-lib` utilized in the main thread (or a dedicated state worker) to manipulate the PDF Abstract Syntax Tree (AST), Page Trees, and Content Streams.
*   **Heavy Compute (OCR, Diffing, Compression):** Offloaded to background Web Workers utilizing WebAssembly (WASM) modules (e.g., `Tesseract.js` for OCR, custom WASM for image downsampling).
*   **Storage:** **IndexedDB** (`/lib/db.ts`) is used to store raw `ArrayBuffer` file blobs and project state, enabling session persistence and offline capabilities.
*   **Mandated Constraint (TC-1):** **True Redaction.** Drawing a black box is insufficient. Redaction must physically sever text operators from the PDF content stream.
*   **Mandated Constraint (TC-2):** **Memory Management.** Large PDFs must be processed in chunks or via proxy-rendering to prevent browser Out-Of-Memory (OOM) crashes.

---

## 3. Detailed Functional Requirements: The 15 Master Suites

Below is the detailed functional and technical breakdown of the 15 core modules.

### 1. 📄 Page Operations (Page Suite)
*   **User Story:** As a user, I want to merge multiple PDFs and reorder their pages so I can compile a single master document.
*   **Functional Requirements:**
    *   **FR-1.1:** Ingest multiple PDF binaries and display them in a queue.
    *   **FR-1.2:** Allow drag-and-drop reordering of pages across different source files.
    *   **FR-1.3:** Display live aggregate page counts and file size metrics.
*   **Technical Functioning:** The engine parses the `/Root` and `/Pages` dictionaries of all uploaded files. When merging, it creates a new master document and copies the page reference arrays. Reordering simply mutates the JavaScript array of page references before the final `pdfDoc.save()` serialization. No page content streams are re-encoded, making this operation $O(1)$ in terms of CPU cost.
*   **Acceptance Criteria:** Merging ten 50-page PDFs completes in < 2 seconds.

### 2. 👁️ View & Navigation (View Suite)
*   **User Story:** As a user, I want to zoom and change layouts so I can read dense text or view blueprints easily.
*   **Functional Requirements:**
    *   **FR-2.1:** Continuous zoom slider (50% to 200%+).
    *   **FR-2.2:** "Fit Width" and "2-Page Spread" layout toggles.
*   **Technical Functioning:** Utilizes the `pdf.js` viewport matrix. Zooming recalculates the `scale` parameter passed to `page.getViewport({ scale })`. Layout presets trigger CSS Grid reflows in the UI container, while the rendering worker recalculates the canvas dimensions to match the new CSS pixel ratio, ensuring crisp text rendering at any DPI.
*   **Acceptance Criteria:** Zooming does not cause pixelation; text remains vector-sharp via canvas re-rendering.

### 3. ✍️ Text Studio (Text Suite)
*   **User Story:** As a user, I want to type directly onto the PDF to add notes or patch text.
*   **Functional Requirements:**
    *   **FR-3.1:** Click-to-type text overlay with font family, size (8pt-36pt), and color selection.
*   **Technical Functioning:** Captures DOM click coordinates and translates them into PDF User Space coordinates (1 unit = 1/72 inch). Uses `pdf-lib` to embed standard fonts (or custom TTF subsets) into the document's `/Resources` dictionary. Injects `BT` (Begin Text), `Tf` (Set Font), `Td` (Move Text Position), and `Tj` (Show Text) operators directly into the page's raw content stream.
*   **Acceptance Criteria:** Added text is selectable and searchable in standard third-party PDF readers.

### 4. 🖼️ Image & Objects (Object Suite)
*   **User Story:** As a user, I want to stamp logos or images onto pages.
*   **Functional Requirements:**
    *   **FR-4.1:** Upload PNG/JPG and place on canvas with drag-to-resize and rotate handles.
*   **Technical Functioning:** Reads the image binary, embeds it as an **Image XObject** in the PDF structure. Generates a transformation matrix (`cm` operator) in the content stream to handle scaling, translation, and rotation. Alpha channels in PNGs are preserved by embedding an `/SMask` (Soft Mask) dictionary alongside the RGB data.
*   **Acceptance Criteria:** Transparent PNGs render correctly without white bounding boxes.

### 5. 🖍️ Annotations (Annotation Suite)
*   **User Story:** As a reviewer, I want to highlight text and add sticky notes without altering the base document.
*   **Functional Requirements:**
    *   **FR-5.1:** Highlighter tool with blend modes (Multiply).
    *   **FR-5.2:** Sticky notes and freehand drawing.
*   **Technical Functioning:** Interacts with the page's `/Annots` array. Highlights are created as `/Subtype /Highlight` annotations using QuadPoints to map precisely to text glyphs. Freehand drawings use `/Subtype /Ink` with an array of coordinate paths. This ensures annotations are treated as distinct, toggleable layers by external PDF viewers.
*   **Acceptance Criteria:** Annotations can be deleted or moved after saving and reopening the file.

### 6. 📝 Form Creator (Form Suite)
*   **User Story:** As an admin, I want to turn a flat PDF into a fillable form.
*   **Functional Requirements:**
    *   **FR-6.1:** Draw Text Box and Checkbox fields onto the canvas.
    *   **FR-6.2:** Assign field names and default values.
*   **Technical Functioning:** Constructs **AcroForm** dictionaries. For text fields, it creates `/Tx` widget annotations, defines the `/Rect` (bounding box), and generates an Appearance Stream (`/AP`) for the visual state. Links the widget to the root `/AcroForm` dictionary so the PDF reader recognizes the interactive elements.
*   **Acceptance Criteria:** Exported PDF opens in Adobe Acrobat with fully functional, tab-navigable form fields.

### 7. ✒️ Signatures (Signature Suite)
*   **User Story:** As a signatory, I want to draw my signature and apply it to the contract.
*   **Functional Requirements:**
    *   **FR-7.1:** HTML5 Canvas signature pad with pressure/velocity smoothing.
    *   **FR-7.2:** Apply signature as a flattened image stamp.
*   **Technical Functioning:** The UI captures pointer events and uses Catmull-Rom splines to smooth jagged mouse/touch strokes. The canvas is exported to a transparent PNG blob. The engine then embeds this PNG as an Image XObject (similar to the Object Suite) and places it at the designated coordinates.
*   **Acceptance Criteria:** Signature scales cleanly and retains transparency over underlying text.

### 8. 🔒 Security & Encryption (Security Suite)
*   **User Story:** As a data owner, I want to password-protect my PDF to prevent unauthorized viewing or printing.
*   **Functional Requirements:**
    *   **FR-8.1:** Set "Open" password and "Permissions" password.
    *   **FR-8.2:** Toggle restrictions (Disable Printing, Disable Copying).
*   **Technical Functioning:** Implements the PDF Standard Security Handler. Uses the **Web Crypto API** to hash passwords (MD5/SHA-256) and derive encryption keys. Applies AES-128 or AES-256 encryption to all string and stream objects in the PDF. Updates the `/Encrypt` dictionary in the document trailer with the computed `/O` (Owner) and `/U` (User) hashes and `/P` (Permissions) integer flag.
*   **Acceptance Criteria:** Encrypted file prompts for a password in external readers; restricted actions (like copy-paste) are grayed out.

### 9. 🛡️ Redaction (Redaction Suite)
*   **User Story:** As a legal professional, I want to permanently destroy PII so it cannot be recovered.
*   **Functional Requirements:**
    *   **FR-9.1:** Draw redaction boxes over sensitive text.
    *   **FR-9.2:** "Apply Redactions" burns the changes permanently.
*   **Technical Functioning:** **Critical:** When applied, the engine parses the page's content stream, identifies the text drawing operators (`Tj`, `TJ`) that intersect with the redaction box coordinates, and **physically deletes those operators from the stream**. It then draws a solid black vector rectangle (`re` and `f` operators) over the now-empty space. The original text bytes are permanently erased from the file buffer.
*   **Acceptance Criteria:** Copy-pasting over a redacted area yields nothing; searching for the redacted word returns 0 results.

### 10. 🧠 OCR & AI (OCR Suite)
*   **User Story:** As a user, I want to extract text from a scanned image PDF.
*   **Functional Requirements:**
    *   **FR-10.1:** One-click OCR processing.
    *   **FR-10.2:** Copy extracted text to clipboard.
*   **Technical Functioning:** Renders the target page to a hidden, high-DPI canvas. Passes the `ImageData` to a Web Worker running **Tesseract.js** (WASM). The worker performs binarization, segmentation, and character recognition. The resulting text is mapped with bounding boxes and either returned to the UI clipboard or injected back into the PDF as an invisible text layer (`render mode 3`).
*   **Acceptance Criteria:** OCR completes a standard letter-sized page in < 3 seconds without freezing the UI.

### 11. 🔄 Conversion (Conversion Suite)
*   **User Story:** As a user, I want to export my PDF as plain text or images.
*   **Functional Requirements:**
    *   **FR-11.1:** Export to `.txt` (preserving reading order).
    *   **FR-11.2:** Export pages to `.png` / `.jpg` at 72, 150, or 300 DPI.
*   **Technical Functioning:**
    *   *To TXT:* Iterates through the parsed content stream, extracting text strings and using Y-coordinate heuristics to reconstruct line breaks and paragraphs.
    *   *To Images:* Uses `pdf.js` to render the page to a canvas at the requested scale factor (e.g., 300 DPI = scale 4.16). Calls `canvas.toBlob()` and triggers a download via the File System Access API or standard `<a download>` fallback.
*   **Acceptance Criteria:** 300 DPI image exports are print-quality and free of rendering artifacts.

### 12. 🗜️ Compression (Compress Suite)
*   **User Story:** As a user, I want to reduce my file size so I can email it.
*   **Functional Requirements:**
    *   **FR-12.1:** Low, Medium, High compression presets.
*   **Technical Functioning:**
    1.  **Object Streams:** Groups loose PDF objects into compressed `FlateDecode` streams.
    2.  **Image Downsampling:** Extracts embedded JPEGs/PNGs, draws them to a canvas, reduces resolution/quality, and replaces the original XObject.
    3.  **Garbage Collection:** Rebuilds the Cross-Reference (XREF) table, stripping out orphaned objects and previous revision histories (linearization).
*   **Acceptance Criteria:** "High" compression reduces a 10MB image-heavy PDF to < 2MB with acceptable visual fidelity.

### 13. 📐 Measurement (Measure Suite)
*   **User Story:** As an engineer, I want to measure distances on a scaled blueprint.
*   **Functional Requirements:**
    *   **FR-13.1:** Calibrate scale (e.g., 1 inch = 10 feet).
    *   **FR-13.2:** Line, Perimeter, and Area measurement tools.
*   **Technical Functioning:** Maps screen pixels to PDF User Space (72 DPI base). When a user draws a polygon, the engine calculates the geometric area in square points. It then applies the user-defined calibration ratio to convert the raw point calculation into real-world units (feet, meters) and renders the result in a floating UI tooltip.
*   **Acceptance Criteria:** Measurements remain mathematically accurate regardless of the current UI zoom level.

### 14. 🏷️ Stamps & Bates (Bates Suite)
*   **User Story:** As a paralegal, I want to apply sequential Bates numbering to 500 pages.
*   **Functional Requirements:**
    *   **FR-14.1:** Configure Prefix, Suffix, Start Number, and Padding (e.g., `CASE_0001`).
    *   **FR-14.2:** Apply to all pages or specific ranges.
*   **Technical Functioning:** Iterates through the target page array. For each page, it dynamically generates the string based on the current index. It injects the text operators into the page's content stream (usually appending to the end of the stream so it renders on top) or creates a Stamp Annotation.
*   **Acceptance Criteria:** Numbering increments correctly across merged documents with varying page counts.

### 15. 🔍 Comparison (Comparison Suite)
*   **User Story:** As a reviewer, I want to see exactly what changed between v1 and v2 of a contract.
*   **Functional Requirements:**
    *   **FR-15.1:** Side-by-side synchronized scrolling.
    *   **FR-15.2:** Visual highlighting of added/removed text and graphics.
*   **Technical Functioning:** Runs two parallel workers.
    1.  **Text Diff:** Extracts text from both PDFs and applies a **Myers' Diff Algorithm** to identify word-level insertions/deletions.
    2.  **Visual Diff:** Renders both pages to canvases and performs a pixel-by-pixel absolute difference blend. Changed pixels are highlighted in a neon overlay color. The UI syncs the `scrollTop` of both containers.
*   **Acceptance Criteria:** Diffing a 50-page document completes in < 5 seconds; scrolling one pane perfectly mirrors the other.

---

## 4. Core Infrastructure Requirements

### 4.1 Workspace Storage (IndexedDB)
*   **Requirement:** The app must remember the user's workspace (uploaded files, current tool state, unsaved annotations) even if the browser tab is closed.
*   **Implementation:** `/lib/db.ts` wraps the IndexedDB API. When a file is uploaded, its `ArrayBuffer` is saved with a UUID. The application state (JSON representation of annotations, form fields, and UI layout) is saved as a separate object. On launch, the app checks IndexedDB and prompts: *"Resume previous session?"*

### 4.2 Watermarking Engine
*   **Requirement:** Apply global, repeating watermarks across the document queue.
*   **Implementation:** Generates a tiling pattern (`/Pattern` color space) or iterates through all pages to inject text/image XObjects. Supports custom opacity (0-100%) by manipulating the `/ExtGState` (Extended Graphics State) dictionary to apply an `/CA` (Alpha) value to the watermark object, ensuring it doesn't obscure underlying text readability.

---

## 5. Non-Functional Requirements (NFRs)

| Category | Requirement | Metric / Target |
| :--- | :--- | :--- |
| **Privacy** | **Zero Egress** | Network tab must show 0 bytes of document data transmitted to external servers. |
| **Performance** | **Time-to-Interactive** | App shell loads in < 1.5s. First page of a 50MB PDF renders in < 2s. |
| **Memory** | **OOM Prevention** | App must gracefully handle 500+ page documents without exceeding browser heap limits (use chunked processing). |
| **Compatibility** | **Browser Support** | Chrome/Edge 90+, Firefox 90+, Safari 15+ (with fallback warnings for missing WebCodecs/WASM features). |
| **Offline** | **PWA Capability** | Service Worker caches all JS/WASM assets. App functions 100% in Airplane Mode after first load. |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Browser Memory Limits (OOM)** | High | Large PDFs crash the tab. **Mitigation:** Implement a "Proxy Rendering" system where only visible pages + 2 buffer pages are kept in memory; purge others. |
| **Safari `pdf.js` Quirks** | Medium | Safari handles Canvas memory and WASM differently. **Mitigation:** Rigorous cross-browser testing; fallback to standard DOM rendering for annotations if Canvas fails. |
| **True Redaction Failure** | Critical | Leaving text in the stream violates legal compliance. **Mitigation:** Automated QA script that attempts to extract text from redacted zones post-export to verify 0-byte return. |
| **WASM Load Times** | Medium | Tesseract/Compression WASM files are large (10MB+). **Mitigation:** Lazy-load WASM modules only when the user clicks the specific tool; show a skeleton loader. |

---

## 7. Roadmap

*   **Phase 1 (Weeks 1-4):** Core Viewer, Page Operations, Text/Image Suites, IndexedDB persistence.
*   **Phase 2 (Weeks 5-8):** Annotations, Forms, Signatures, Watermarking, Compression.
*   **Phase 3 (Weeks 9-12):** Security (Encryption), True Redaction, Bates Numbering.
*   **Phase 4 (Weeks 13-16):** Advanced Compute: OCR (Tesseract), Comparison (Diffing), Measurement.

--- 
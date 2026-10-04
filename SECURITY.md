# GS Softwares — Platform Security Specification & Threat Model
### Authority: Platform Security & Integrity · Version: 2.5 (Wave 5 Hardened)

GS Softwares is a **100% client-side Progressive Web Application (PWA)** engineered under zero-trust, local-first principles. Computing executes entirely within the browser's sandbox using Web Workers, WebAssembly (WASM), and the Origin Private File System (OPFS).

---

## 1. Core Threat Model

### 1.1 Technical Air-Gap Guarantee
- **Network Boundaries:** `connect-src 'self'` is enforced via HTTP response headers (`public/_headers`, `vercel.json`, `netlify.toml`). Outbound network requests to third-party tracking, telemetry, or storage services are technically prohibited by browser security engines.
- **Zero Server Processing:** No file, key, vector, audio frame, or hash ever leaves the user's host machine. All transformation engines operate within in-memory buffers or isolated Web Workers.

### 1.2 Studio-Specific Threat Models
| Studio | Threat Vector | Defense Mechanism |
| :--- | :--- | :--- |
| **GS-Archive** | Zip Slip (directory traversal) & Decompression Bombs | Normalizes paths, rejects leading slashes / `..` segments; caps expansion ratio at 100:1 and maximum cumulative payload at 2GB. |
| **GS-PDF** | Metadata leaks & incomplete blackouts | Performs full content-stream rasterization sanitization (`hardRedactPdfPageByRasterization`), obliterating underlying font and vector operators. Purges interactive annotations. |
| **GS-Text** | ReDoS (Catastrophic Regular Expression Backtracking) | Time-budgeted regex engine (200ms threshold) detects pathological patterns (e.g. `(a+)+`) and terminates execution before freezing the UI. |
| **GS-EBook** | Script injection & hostile styling in EPUB HTML | Renders EPUB book chapters inside a sandboxed `iframe` without `allow-scripts` and sanitizes HTML fragments via DOMPurify. |
| **GS-Canvas** | Plaintext key leak in collaborative shares | E2EE scene serialization uses Web Crypto AES-256-GCM. Encryption keys reside strictly in the URL hash fragment (`#e2ee=...`), which is never sent in HTTP request headers to servers. |
| **GS-Security** | Key derivation brute-force & stream tampering | Authenticated `GSSTRM` container with 600,000 PBKDF2 iterations (or Argon2id) and AES-256-GCM authentication tags per 64KB chunk. |

---

## 2. Sensitive File Handling Rules

1. **Zero Logging:** File names, paths, and contents are strictly forbidden from `console.log`, internal state dumps, error messages, and diagnostic exports.
2. **Generic System Notifications:** Background task completion banners display generic summary titles (e.g. `Processing Complete`) by default. Filename inclusion is opt-in and disabled by default.
3. **Blob URL Lifecycle:** All `URL.createObjectURL` references are tracked in a lifecycle registry and revoked immediately upon task termination or component unmount.

---

## 3. Platform Boundaries & Limitations

### 3.1 What GS Softwares Protects Against
- Server-side data interception, cloud breaches, and man-in-the-middle network attacks.
- Third-party tracking scripts, advertising trackers, and usage telemetry.
- Accidental transmission of sensitive biometric or confidential corporate documents.

### 3.2 What the Platform Cannot Protect Against
- **Compromised Host Machine:** If the user's operating system has active keyloggers, screen scrapers, or browser extensions with `all-urls` permissions, client-side isolation cannot protect against memory inspection.
- **No Secure Deletion / Wear-Leveling Wipe:** Browsers and solid-state drives (SSDs) manage physical wear-leveling. While OPFS files and IndexedDB entries are deleted through browser storage APIs, physical bit-level overwriting is controlled by OS storage controllers.

---

## 4. Reporting Vulnerabilities

If you discover a security vulnerability or potential privacy boundary escape, please report it via GitHub Private Vulnerability Reporting. Disclosures are triaged promptly.

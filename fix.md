# GS Softwares

## Comprehensive DevOps, Deployment & Cloud Architecture Audit

**Repository:** `Gulshan-Singh-gs/gs-softwares-deployment`
**Branch:** `main`
**Repository type:** Public TypeScript/React/Vite PWA
**Audit perspective:** Senior DevOps Engineer / Cloud Architect
**Audit scope:** Deployment architecture, CI/CD, build system, hosting assumptions, security, reliability, maintainability, supply chain, caching, observability and release management.

---

# 1. Executive Summary

GS Softwares is a browser-native media/productivity suite built around React, TypeScript and Vite. The application attempts to perform processing locally using browser APIs, Web Workers/WebAssembly-oriented infrastructure, IndexedDB and a PWA service worker.

The current repository is significantly more mature than a simple frontend prototype.

The build system is typed and strict, Vite is configured with explicit code splitting, the PWA layer uses Workbox, security headers are defined, and the application has been deliberately designed to operate without a conventional backend. The package manifest also has a lockfile, which provides a foundation for reproducible dependency installation.

However, from a **DevOps/cloud architecture** perspective, the repository has a major weakness:

> **There is no clearly defined, version-controlled CI/CD deployment pipeline in the repository.**

The repository does not contain an evident `.github/workflows` deployment workflow, Dockerfile, `docker-compose.yml`, Vercel configuration, Netlify configuration, Cloudflare deployment configuration, or equivalent infrastructure-as-code deployment definition. A direct check of the expected GitHub Actions workflow directory returns `404`.

The GitHub repository metadata also currently reports GitHub Pages as disabled (`has_pages: false`) and no deployments are exposed through the repository metadata.

This means the project has a reasonably sophisticated **application build architecture**, but its **delivery architecture is comparatively immature**.

The current model appears closer to:

```text
Developer
   │
   ├── git push
   │
   └── manually deploy/build through hosting platform
                     │
                     ▼
                Static hosting
                     │
                     ▼
                 Browser/PWA
```

rather than:

```text
Developer
   │
   ▼
Git push / Pull Request
   │
   ▼
CI
 ├── install locked dependencies
 ├── lint
 ├── type-check
 ├── unit tests
 ├── security audit
 ├── production build
 ├── PWA validation
 └── artifact generation
   │
   ▼
Immutable artifact
   │
   ├── Preview deployment
   │
   └── Production deployment
          │
          ▼
      Smoke tests
          │
          ▼
       Monitoring
          │
          ▼
      Rollback
```

That is the principal DevOps gap.

---

# 2. Current Architecture

## 2.1 Application topology

The application is essentially a static SPA/PWA.

The runtime architecture is:

```text
                   Internet / Static Host
                           │
                           ▼
                    HTML / JS / CSS
                           │
                           ▼
                    React Application
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      Studio UI       Engine Layer      Settings
          │                │                │
          └────────────────┼────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           Browser      Web Workers   Web APIs
           Storage       / WASM       / Canvas
              │
              ▼
          IndexedDB
              │
              ▼
        Service Worker
              │
              ▼
        Offline Cache
```

There is intentionally no application server in the normal processing path.

That is a valid architecture for this product.

The important consequence is that **the deployment platform becomes the backend infrastructure**:

* static asset hosting
* HTTPS
* CDN
* cache policy
* immutable asset delivery
* service-worker delivery
* security headers
* DNS
* release management
* availability
* rollback

Therefore those responsibilities need to be explicitly engineered.

---

# 3. Build Pipeline Analysis

The current `package.json` exposes only four scripts:

```text
npm run dev
npm run build
npm run preview
npm run test:bot
```

The production build is:

```text
tsc && vite build
```

This is a good foundation because TypeScript compilation is a prerequisite to producing the artifact.

However, the pipeline is incomplete from a production engineering perspective.

There is no first-class:

```text
lint
test
test:e2e
security:audit
validate:pwa
analyze
release
deploy
smoke
```

stage.

Consequently, the production pipeline currently has approximately:

```text
Source
  ↓
TypeScript compilation
  ↓
Vite build
  ↓
Deployment
```

instead of:

```text
Source
 ↓
Dependency installation
 ↓
Static analysis
 ↓
Type checking
 ↓
Unit tests
 ↓
E2E tests
 ↓
Security scanning
 ↓
Production build
 ↓
Artifact verification
 ↓
Preview
 ↓
Smoke tests
 ↓
Production
 ↓
Post-deployment verification
```

---

# 4. Critical Finding: No Version-Controlled CI/CD Pipeline

### Severity: CRITICAL

There is no evident `.github/workflows` directory in the repository, and searching the repository for deployment workflow configuration produces no deployment workflow.

This is the single biggest DevOps deficiency.

A modern production repository should not depend on an undocumented developer-local sequence such as:

```text
npm install
npm run build
upload dist/
```

because that makes deployment dependent on:

* developer machine
* Node version
* npm version
* local environment
* local credentials
* manual steps
* human memory

The package specifies Node/npm prerequisites only in README instructions, while the actual pipeline does not enforce them.

### Risks

* inconsistent production builds
* accidental deployment of untested code
* no mandatory quality gates
* no automatic rollback
* no deployment audit trail
* no reproducible release process
* no PR validation
* no security gate
* no automated smoke test

### Recommended architecture

Use GitHub Actions:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm audit --audit-level=high
      - run: npm run build
```

The production deployment should be a separate job requiring successful validation.

---

# 5. Critical Finding: No Explicit Deployment Target

### Severity: HIGH

The Vite configuration says:

```text
base: './'
```

and its comment explicitly claims compatibility with:

* GitHub Pages
* Vercel
* local previews.

But these platforms have materially different deployment semantics.

There is no repository-owned deployment definition specifying:

```text
hosting provider
build command
artifact directory
environment
routing
headers
cache policy
rollback mechanism
```

The application therefore has **hosting ambiguity**.

A production repository should answer one question immediately:

> "What exact infrastructure serves this artifact?"

Currently that answer is not encoded in the repository.

---

# 6. GitHub Pages Compatibility Is Not Equivalent to GitHub Pages Deployment

### Severity: HIGH

The repository contains:

```text
public/404.html
```

with the GitHub Pages SPA redirect mechanism.

This indicates that GitHub Pages was considered as a deployment target.

But the repository metadata currently says:

```text
has_pages: false
```

and no GitHub Actions Pages deployment workflow is visible.

Therefore the repository currently contains **GitHub Pages support logic without an explicit GitHub Pages delivery pipeline**.

That's not inherently wrong, but it is operationally incomplete.

---

# 7. High Risk: Absolute Asset Paths Conflict With Relative Vite Base Strategy

### Severity: HIGH

Vite is configured with:

```ts
base: './'
```

which is intended to support deployment below the root path.

However, `index.html` contains:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

and:

```html
<script type="module" src="/src/main.tsx"></script>
```

The latter is expected to be transformed by Vite during production builds, so it is not itself necessarily a production defect.

The favicon is more interesting.

With a GitHub Pages project URL such as:

```text
https://example.github.io/gs-softwares-deployment/
```

the absolute:

```text
/favicon.png
```

resolves to:

```text
https://example.github.io/favicon.png
```

rather than:

```text
https://example.github.io/gs-softwares-deployment/favicon.png
```

unless the deployed host has separately configured the asset.

### Recommended solution

Use Vite-aware paths:

```html
<link rel="icon" href="./favicon.png">
```

or configure the favicon through generated assets.

More robustly, derive asset paths from the configured Vite base.

---

# 8. PWA Architecture: Good Foundation, Dangerous Update Strategy

### Severity: HIGH

The PWA configuration uses:

```text
registerType: autoUpdate
skipWaiting: true
clientsClaim: true
```

and caches JavaScript/CSS/HTML/image/WASM assets.

This is attractive for a fast offline-first application.

However, it creates a classic service-worker release problem:

```text
Version N
   │
   ├── old application
   └── old cached chunks

Version N+1
   │
   ├── new application shell
   └── new chunks

skipWaiting()
   │
   ▼
new SW immediately controls clients
```

If a user has an old application open while a new release arrives, the service worker can switch versions while the existing page is still using old chunks/state.

For a highly code-split application, this deserves explicit testing.

### Recommended approach

Use an explicit update UX:

```text
New version available
[Reload to update]
```

rather than silently forcing an update during an active editing session.

For an application processing files locally, preserving the user's active session is more important than updating immediately.

---

# 9. Service Worker Cache Size Policy Is Not the Same as Runtime Resource Policy

### Severity: MEDIUM

The Workbox configuration allows:

```text
maximumFileSizeToCacheInBytes: 50 MB
```

and caches:

```text
js
css
html
ico
png
svg
wasm
```

This is reasonable.

But there is an architectural distinction between:

```text
precache
```

and:

```text
runtime caching
```

The repository needs explicit rules for:

* application shell
* dynamic chunks
* WASM
* PDF worker
* fonts
* generated files
* service worker
* stale assets
* cache invalidation

Otherwise a future large WASM/engine asset could silently fall outside the cache policy and break offline functionality.

---

# 10. Security Finding: `unsafe-inline` Remains in CSP

### Severity: MEDIUM

The deployed CSP contains:

```text
style-src 'self' 'unsafe-inline'
```

This is not automatically exploitable, particularly because it only affects inline styles rather than inline scripts.

However, for a security-sensitive privacy-first application, the long-term goal should be to remove unnecessary CSP relaxations.

This should be treated as:

```text
defense-in-depth improvement
```

rather than a critical vulnerability.

---

# 11. Security Finding: `wasm-unsafe-eval` Is Deliberately Permissive

### Severity: MEDIUM

The CSP includes:

```text
script-src 'self' 'wasm-unsafe-eval' blob:
```

This is understandable if the application actually needs WebAssembly execution.

But it should be documented as an explicit architectural requirement.

The security model should answer:

> Which dependency requires `wasm-unsafe-eval`, and can that requirement be removed?

If the answer is "WASM processing," keep it.

If the application doesn't actually require it in the production bundle, remove it.

---

# 12. Security Finding: No Automated Dependency Security Gate

### Severity: HIGH

The project has a lockfile, which is good, but there is no visible automated security pipeline.

The dependency graph contains important parsing/media/security-related libraries:

```text
pdf-lib
pdfjs-dist
jszip
tesseract.js
piexifjs
React
Vite
Playwright
```

These libraries process potentially untrusted user-controlled files.

That creates a meaningful attack surface.

At minimum, CI should run:

```bash
npm audit --audit-level=high
```

and preferably:

* GitHub Dependabot
* dependency review
* CodeQL
* secret scanning
* lockfile validation

---

# 13. Security Finding: No SAST / CodeQL Pipeline

### Severity: MEDIUM

The repository contains:

* cryptography
* file parsers
* archive processing
* image processing
* PDF processing
* media handling
* client-side storage

This is precisely the sort of application where static security analysis is valuable.

A CodeQL workflow should be added.

Example:

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  security-events: write
  contents: read

jobs:
  analyze:
    uses: github/codeql-action/.github/workflows/codeql.yml@v3
    with:
      languages: javascript-typescript
```

---

# 14. Reliability Finding: No Automated Rollback Strategy

### Severity: HIGH

There is no repository-defined rollback mechanism.

For a static application, rollback should be easy.

The deployment model should produce immutable artifacts:

```text
release/
  2026.10.04-abc123/
       assets/
       index.html
       manifest.webmanifest
       sw.js
```

Then production points to a known-good artifact.

A rollback becomes:

```text
production
    ↓
previous artifact
```

rather than:

```text
developer
    ↓
checkout old commit
    ↓
rebuild
    ↓
manually redeploy
```

The latter is slower and less deterministic.

---

# 15. Reliability Finding: No Post-Deployment Smoke Tests

### Severity: HIGH

The repository has Playwright as a development dependency.

That is useful.

But the DevOps pipeline does not visibly use Playwright as a production deployment gate.

A proper deployment pipeline should perform:

```text
deploy
 ↓
GET /
 ↓
assert 200
 ↓
load JS
 ↓
register service worker
 ↓
open major studios
 ↓
run representative operation
 ↓
verify download/output
```

For this project, an even more important test is:

```text
deploy
 ↓
open application
 ↓
disable network
 ↓
reload
 ↓
run local operation
```

That directly verifies the product's primary operational promise.

---

# 16. Reliability Finding: No Browser Compatibility Matrix

### Severity: MEDIUM

The application relies heavily on browser APIs.

Examples include:

* WebCrypto
* Canvas
* MediaRecorder
* WebAudio
* IndexedDB
* Service Workers
* WebAssembly
* potentially WebCodecs-related functionality

Yet there is no visible automated browser matrix.

At minimum:

```text
Chromium
Firefox
WebKit
```

should be tested for core functionality.

The media-heavy portions deserve especially careful testing because browser codec support differs substantially.

---

# 17. Maintainability Finding: README and package metadata are stale

### Severity: MEDIUM

The README badge claims:

```text
React 18
```

while `package.json` currently specifies:

```text
react: ^19.0.0
react-dom: ^19.0.0
```

That is a small issue, but it is exactly the kind of drift that signals a missing documentation-release process.

The README also describes the project as:

> WebAssembly

while individual implementations need to be audited against those claims.

Documentation should be generated or validated against the actual build where possible.

---

# 18. Maintainability Finding: README Claims MIT License but Repository Doesn't Clearly Expose LICENSE

### Severity: MEDIUM

The README states:

```text
Distributed under the MIT License. See LICENSE for details.
```

but a repository search does not currently show a `LICENSE` file.

That should be fixed immediately.

Either:

```text
LICENSE
```

must exist,

or the README must not claim that it does.

For an open-source repository this is especially important because the license determines downstream rights.

---

# 19. Maintainability Finding: Versioning Is Not Connected to Releases

### Severity: MEDIUM

`package.json` currently says:

```text
version: 2.0.0
```

But there is no visible release automation.

A production release should connect:

```text
Git commit
 ↓
Git tag
 ↓
package version
 ↓
build artifact
 ↓
deployment
```

For example:

```text
v2.0.1
```

should identify an immutable production artifact.

Otherwise the package version is essentially documentation.

---

# 20. Supply-Chain Finding: Dependency Installation Is Not Explicitly Enforced as Reproducible

### Severity: MEDIUM

The repository has `package-lock.json`, which is good.

However, the documented installation command is:

```bash
npm install
```

rather than:

```bash
npm ci
```

For CI/CD, `npm ci` should be mandatory.

It ensures the lockfile is authoritative.

Recommended:

```bash
npm ci
npm run build
```

rather than:

```bash
npm install
npm run build
```

---

# 21. Supply-Chain Finding: Node Version Is Not Pinned

### Severity: MEDIUM

README says:

```text
Node.js >= 18.0.0
npm >= 9.0.0
```

This is too broad for a reproducible production pipeline.

The project should choose an explicit supported runtime.

For example:

```json
{
  "engines": {
    "node": ">=22 <23",
    "npm": ">=10 <11"
  }
}
```

and ideally add:

```text
.nvmrc
```

or:

```text
.node-version
```

Example:

```text
22.20.0
```

CI should use the exact same major/minor policy.

---

# 22. Build Finding: `chunkSizeWarningLimit: 1200` Can Hide Bundle Problems

### Severity: LOW/MEDIUM

The Vite configuration raises:

```text
chunkSizeWarningLimit: 1200
```

to 1.2 MB.

This isn't inherently bad because the application contains media/PDF processing engines.

But a warning threshold is not a performance budget.

A better system would fail CI if:

```text
main bundle > X MB
vendor chunk > Y MB
initial JS > Z MB
```

while allowing known heavy lazy-loaded engines.

---

# 23. Build Architecture: Manual Chunks Are Good but Need Validation

### Severity: LOW

The project explicitly separates:

```text
vendor-react
engine-pdf
engine-crypto
engine-image
engine-audio
engine-video
engine-archive
```

This is a strong architectural decision.

But manual chunking creates coupling between the dependency graph and build configuration.

Every major dependency change should therefore trigger bundle analysis.

Otherwise:

```text
manualChunks
     ↓
unexpected dependency duplication
     ↓
larger output
```

A CI bundle-size report would solve this.

---

# 24. Reliability Finding: Cache-Control Policy Is Too Generic

### Severity: HIGH

The headers currently specify:

```text
Cache-Control: public, max-age=0, must-revalidate
```

Applying the same policy broadly to every static resource sacrifices a significant CDN caching opportunity.

For fingerprinted Vite assets such as:

```text
assets/index-B7x9....js
assets/vendor-react-....
```

the correct policy is generally closer to:

```text
Cache-Control:
public,
max-age=31536000,
immutable
```

while the HTML/service-worker entry points should remain revalidated.

A better model:

```text
index.html
→ no-cache / must-revalidate

sw.js
→ no-cache / must-revalidate

manifest.webmanifest
→ short cache

assets/*.js
→ 1 year + immutable

assets/*.css
→ 1 year + immutable

icons/*
→ long-lived
```

This can significantly improve global performance.

---

# 25. Reliability Finding: Service Worker + CDN Cache Requires Explicit Version Strategy

### Severity: HIGH

There are two independent caching systems:

```text
CDN/browser HTTP cache
+
Service Worker cache
```

Therefore deployment behavior becomes:

```text
Git push
 ↓
new static assets
 ↓
CDN cache
 ↓
service worker
 ↓
browser cache
```

If these are not coordinated, users can receive combinations of:

```text
new HTML
+
old JS
+
new service worker
```

or:

```text
old HTML
+
new JS
```

Asset fingerprinting reduces this problem, but the release process still needs explicit service-worker lifecycle testing.

---

# 26. Operational Finding: No Observability Architecture

### Severity: HIGH

For a privacy-first local application, traditional server metrics are limited.

However, that does not mean observability should be absent.

You still need:

### Build observability

* build duration
* bundle sizes
* dependency changes
* failed builds

### Deployment observability

* deployment success/failure
* artifact hash
* deployment timestamp
* commit SHA

### Client observability

Potentially privacy-preserving:

* application version
* browser family
* crash/error category
* service-worker failures

without sending user files or personal data.

A privacy-respecting telemetry design could collect only:

```text
app_version
browser_major
platform
error_code
timestamp
```

with explicit consent.

---

# 27. Security Architecture: Strong Headers, But Hosting Ownership Is Unclear

The repository's `_headers` configuration is well-oriented toward a hardened static application:

```text
COOP: same-origin
COEP: require-corp
CORP: same-origin
nosniff
Referrer-Policy
CSP
```

The problem is that `_headers` is **hosting-provider-specific behavior**.

It is particularly associated with hosts that support this file convention.

If the application is deployed to:

* GitHub Pages
* Vercel
* Netlify
* Cloudflare Pages

the behavior differs.

Therefore:

> The repository currently contains security policy, but not a canonical declaration of which infrastructure enforces it.

This is an important cloud-architecture gap.

---

# 28. No Infrastructure-as-Code

### Severity: MEDIUM

For a static application you do not need Terraform just for the sake of using Terraform.

However, you should still have deployment configuration as code.

Depending on provider:

### GitHub Pages

```text
.github/workflows/deploy.yml
```

### Cloudflare Pages

```text
wrangler.toml
```

### Netlify

```text
netlify.toml
```

### Vercel

```text
vercel.json
```

### AWS

Terraform/CDK/CloudFormation.

The current repository does not clearly establish one.

---

# 29. Recommended Production Architecture

For this application, I would **not** introduce Kubernetes, containers, EC2 or a backend merely for architectural prestige.

The application is fundamentally static/client-side.

A modern deployment architecture should instead be:

```text
                         GitHub
                           │
                           │ Pull Request
                           ▼
                    ┌──────────────┐
                    │ GitHub CI    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Typecheck      Tests       Security
              │            │            │
              └────────────┼────────────┘
                           ▼
                     Production Build
                           │
                           ▼
                    Artifact Validation
                           │
                           ▼
                    Preview Deployment
                           │
                    Playwright Smoke
                           │
                           ▼
                    Production Deploy
                           │
                           ▼
                    CDN / Static Host
                           │
                           ▼
                      Browser PWA
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Cache        Service      Local Engines
                        Worker
```

---

# 30. Recommended CI Pipeline

Create:

```text
.github/workflows/ci.yml
```

with stages:

```text
PR
 │
 ├── npm ci
 ├── typecheck
 ├── lint
 ├── unit tests
 ├── Playwright
 ├── npm audit
 ├── CodeQL
 └── build
```

A practical `package.json` should become:

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "audit": "npm audit --audit-level=high",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

---

# 31. Recommended Deployment Pipeline

Production:

```text
main
 │
 ▼
CI
 │
 ├── typecheck ✓
 ├── tests ✓
 ├── security ✓
 └── build ✓
 │
 ▼
dist/
 │
 ▼
artifact hash
 │
 ▼
deployment
 │
 ▼
smoke test
 │
 ├── HTTP 200
 ├── JS loads
 ├── SW registers
 ├── PWA manifest loads
 └── core tool works
 │
 ▼
production
```

For a static site, the artifact should be immutable.

---

# 32. Recommended Rollback

Store:

```text
commit SHA
release version
artifact hash
deployment timestamp
```

Example:

```text
GS-SOFTWARES
Version: 2.0.1
Commit: 20f9786
Artifact: sha256:...
```

Then rollback becomes:

```text
2.0.1
 ↓
2.0.0
```

instead of rebuilding old source.

---

# 33. Recommended Security Pipeline

At minimum:

```text
Dependabot
     +
npm audit
     +
CodeQL
     +
secret scanning
     +
dependency review
```

PR policy:

```text
Critical vulnerability → block
High vulnerability → block
Medium → report
Low → report
```

---

# 34. Recommended Deployment Headers

Separate immutable assets from application entry points.

Conceptually:

```text
/*
  security headers
```

and:

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

while:

```text
/index.html
/sw.js
/manifest.webmanifest
```

receive short/no-cache policies.

This is significantly more CDN-efficient than:

```text
everything → max-age=0
```

---

# 35. Recommended PWA Update Model

Instead of silently forcing:

```text
skipWaiting: true
clientsClaim: true
```

consider:

```text
new SW detected
       ↓
show update notification
       ↓
"user is currently editing?"
       │
       ├── yes → wait
       │
       └── no → update
```

For a file-processing application, an unexpected reload can destroy an active workflow.

---

# 36. Recommended Release Policy

Adopt:

```text
main
 │
 ├── PR
 │    └── CI
 │
 └── merge
      │
      ▼
   release candidate
      │
      ▼
   production
```

Use semantic versions:

```text
v2.0.0
v2.0.1
v2.1.0
```

and connect them to GitHub Releases.

---

# 37. Recommended Repository Structure

A cleaner production repository would look like:

```text
gs-softwares/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── security.yml
│       └── deploy.yml
│
├── public/
│   ├── icons/
│   ├── manifest/
│   └── _headers
│
├── src/
│   ├── components/
│   ├── engines/
│   ├── workers/
│   ├── pages/
│   ├── context/
│   └── shared/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── fixtures/
│
├── docs/
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .nvmrc
├── LICENSE
└── README.md
```

---

# 38. Priority Remediation Matrix

| Finding                                 | Severity     | Recommended action                                     |
| --------------------------------------- | ------------ | ------------------------------------------------------ |
| No explicit CI/CD workflow              | **Critical** | Add GitHub Actions CI + deployment                     |
| No canonical deployment target          | **High**     | Select and encode hosting provider                     |
| No rollback strategy                    | **High**     | Immutable versioned artifacts                          |
| No post-deployment smoke tests          | **High**     | Playwright production smoke suite                      |
| Generic cache policy                    | **High**     | Immutable caching for hashed assets                    |
| No automated dependency security gate   | **High**     | npm audit + Dependabot + CodeQL                        |
| PWA update lifecycle risk               | **High**     | Controlled update strategy                             |
| GitHub Pages support but Pages disabled | **High**     | Either deploy explicitly or remove Pages-specific code |
| Absolute favicon path                   | **High**     | Make asset path base-aware                             |
| No browser matrix                       | **Medium**   | Chromium + Firefox + WebKit                            |
| No IaC/deployment config                | **Medium**   | Provider-specific deployment definition                |
| Node version not pinned                 | **Medium**   | `.nvmrc` + CI pinning                                  |
| README React version stale              | **Medium**   | Automate/update documentation                          |
| Missing/unclear LICENSE                 | **Medium**   | Add actual license file                                |
| No observability                        | **Medium**   | Privacy-preserving error telemetry                     |
| `unsafe-inline` CSS                     | **Medium**   | Remove if practical                                    |
| Manual chunk threshold only             | **Low**      | Add bundle-size CI budgets                             |

---

# 39. Overall Architecture Assessment

The project currently has an unusual maturity profile.

### Application engineering

**Moderately mature → strong**

The repository has:

* TypeScript strict mode
* Vite
* React 19
* code splitting
* PWA support
* service worker
* security headers
* local processing architecture
* dependency lockfile
* browser-native processing

The build configuration explicitly defines engine-specific chunks and PWA precaching.

### DevOps engineering

**Early/intermediate**

The largest missing pieces are:

* CI/CD
* release automation
* deployment-as-code
* rollback
* security gates
* automated production verification
* observability
* cache strategy
* browser compatibility testing

### Cloud architecture

**Appropriately simple, but under-specified**

The decision to avoid a backend is appropriate for the application's local-first model.

The mistake would be adding unnecessary cloud infrastructure.

The correct architecture is:

```text
GitHub
  ↓
CI/CD
  ↓
Static CDN
  ↓
PWA
  ↓
Browser
```

not:

```text
Kubernetes
  ↓
Node API
  ↓
Object storage
  ↓
Database
```

because that would fundamentally undermine the application's local-first design.

---

# 40. Final Verdict

The repository is **not suffering from an inherently wrong cloud architecture**.

The architectural choice—static CDN + browser-side processing + PWA—is appropriate.

The primary weakness is that the project has invested considerably more effort into the **runtime application architecture than the software-delivery architecture**.

In other words:

```text
Application Architecture
████████████████████░  ~80%

DevOps / CI/CD
████████░░░░░░░░░░░░  ~40%

Release Engineering
██████░░░░░░░░░░░░░░  ~30%

Operational Verification
█████░░░░░░░░░░░░░░░  ~25%
```

Those percentages are qualitative maturity indicators, **not objective scores**.

The most important next step is therefore not another major feature.

It is to establish a deterministic delivery system:

```text
                 ┌───────────────┐
                 │ GitHub        │
                 │ Source        │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ CI            │
                 │               │
                 │ Typecheck     │
                 │ Test          │
                 │ Security      │
                 │ Build         │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Immutable     │
                 │ Artifact      │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Preview       │
                 │ + E2E         │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Production    │
                 │ CDN/PWA       │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ Smoke Tests   │
                 │ + Monitoring  │
                 └───────────────┘
```

Once that exists, GS Softwares would have a much more defensible **production engineering story**: not merely "a sophisticated React/PWA application," but a reproducibly built, security-gated, automatically deployed, test-verified and rollback-capable software platform.

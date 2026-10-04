# GS Softwares — Schema Versioning & Compatibility Matrix
### Authority: Platform Architecture · Version: 2.5 (Wave 5 Hardened)

This document specifies the schema versions across persisted client stores, migration paths, and backward/forward compatibility behaviors.

---

## 1. Schema Version Registry

| Domain | Current Version | Primary Storage | Forward Compatibility Behavior |
| :--- | :--- | :--- | :--- |
| **Settings** | `v2` | `localStorage` | Read-only safe mode on `v > 2`. Missing keys populate from defaults. |
| **Workspace Assets** | `v2` | `IndexedDB` / `OPFS` | Read-only mode; never overwrites assets created with newer schema. |
| **Workflow DAG** | `v1` | `IndexedDB` | Validates port types; aborts execution on unknown future node types. |
| **Crypto Container** | `v1` (`GSSTRM`) | Blob / Disk | Authenticated header validation. Rejects unknown version tags. |

---

## 2. Migration Execution Flow

All migrations run during platform boot via `src/platform/migrations.ts`:

```
Persisted Object → Inspect schemaVersion
  ├─ schemaVersion === CURRENT → No-op, pass through
  ├─ schemaVersion < CURRENT   → Run sequential linear migrations (v1 → v2 → ... → CURRENT)
  └─ schemaVersion > CURRENT   → Enter Safe-Mode (Read-Only, alert user, no writes)
```

### Rollback Strategy
If a deployment release must be rolled back, user data created on the rolled-back version will be safely opened in **Safe Mode** by earlier clients without crashing or silently corrupting keys.

---

## 3. Cache & Service Worker Update Policy

1. **Fingerprinted Assets (`/assets/*`):** `Cache-Control: public, max-age=31536000, immutable`.
2. **HTML Shell (`/index.html`):** `Cache-Control: public, max-age=0, must-revalidate`.
3. **Service Worker (`/sw.js`):** Revalidates on every navigation. When an update is detected, a toast prompts the user to refresh, which is deferred if active background workers are running.

/**
 * GS Softwares Platform - Data Schema Versioning & Forward-Compatibility Migrations
 * Implements Layer 16 of GS Architecture Specification
 * - Every persisted shape carries a strict schemaVersion: number
 * - Migrations are ordered, linear, and idempotent
 * - Forward-compatibility: unknown higher version triggers safe read-only mode to prevent corruption
 */

export interface VersionedEntity {
  schemaVersion: number;
  [key: string]: unknown;
}

export type DomainType = 'settings' | 'workspace' | 'workflow' | 'crypto_container';

export interface MigrationStep {
  fromVersion: number;
  toVersion: number;
  migrate: (data: Record<string, unknown>) => Record<string, unknown>;
}

export const CURRENT_SCHEMA_VERSIONS: Record<DomainType, number> = {
  settings: 2,
  workspace: 2,
  workflow: 1,
  crypto_container: 1,
};

const MIGRATIONS_REGISTRY: Record<DomainType, MigrationStep[]> = {
  settings: [
    {
      fromVersion: 1,
      toVersion: 2,
      migrate: (data) => {
        // Migration v1 -> v2: Ensure feedback and notification keys are populated
        return {
          ...data,
          'general.systemNotifications': data['general.systemNotifications'] ?? 'background',
          'general.haptics': data['general.haptics'] ?? true,
          'general.showFileNames': data['general.showFileNames'] ?? false,
          'general.batchSummaryThreshold': data['general.batchSummaryThreshold'] ?? 4,
          schemaVersion: 2,
        };
      },
    },
  ],
  workspace: [
    {
      fromVersion: 1,
      toVersion: 2,
      migrate: (data) => {
        return {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : [],
          lineage: Array.isArray(data.lineage) ? data.lineage : [],
          schemaVersion: 2,
        };
      },
    },
  ],
  workflow: [],
  crypto_container: [],
};

export interface MigrationResult {
  data: Record<string, unknown>;
  migrated: boolean;
  safeMode: boolean;
  notice?: string;
}

/**
 * Executes idempotent migrations or enters safe mode if data is from a newer future version
 */
export function migrateEntity(
  domain: DomainType,
  raw: Record<string, unknown>
): MigrationResult {
  const currentTarget = CURRENT_SCHEMA_VERSIONS[domain];
  const dataVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;

  // Forward-compatibility check: data written by future version
  if (dataVersion > currentTarget) {
    return {
      data: { ...raw },
      migrated: false,
      safeMode: true,
      notice: `This ${domain} data was created with a newer release (schema v${dataVersion}). Opening in read-only safe mode to prevent corruption.`,
    };
  }

  // Already up-to-date
  if (dataVersion === currentTarget) {
    return {
      data: { ...raw, schemaVersion: currentTarget },
      migrated: false,
      safeMode: false,
    };
  }

  // Execute sequential migrations
  let currentData = { ...raw };
  const steps = MIGRATIONS_REGISTRY[domain] || [];

  for (let v = dataVersion; v < currentTarget; v++) {
    const step = steps.find((s) => s.fromVersion === v);
    if (step) {
      currentData = step.migrate(currentData);
    } else {
      // Step omitted; simply stamp current version
      currentData.schemaVersion = v + 1;
    }
  }

  currentData.schemaVersion = currentTarget;

  return {
    data: currentData,
    migrated: true,
    safeMode: false,
  };
}

/**
 * GS Softwares Platform: Tool SDK & Execution Manager
 * Implements Section 11.2 Tool SDK Contract & Section 11.3 Memory Budget Scheduler
 */

import { AssetHandle, releaseAsset } from './workspaceStore';

export interface ResourceHints {
  peakMemoryMB: number;
  requiresThreads?: boolean;
  requiresWebGPU?: boolean;
}

export interface ToolMetadata {
  id: string;
  studio: string;
  version: string;
  requiredPermissions: Array<'camera' | 'microphone' | 'file-system-access'>;
  resourceHints: ResourceHints;
}

export interface ToolDefinition {
  id: string; // Unique ID e.g. 'gs-pixels/resize'
  studio: string;
  name: string;
  description: string;
  inputTypes: string[]; // e.g. ['WorkspaceImage']
  outputType: string;
  parameters: Record<string, { type: 'number' | 'string' | 'boolean' | 'enum'; default: unknown }>;
  version: string;
  provenance?: {
    license: string;
    spdx: string;
    localVendoring: boolean;
  };
}

/**
 * Section 11.2 & Page 22: Declarative Workflow Graph Specification (DAG)
 */
export interface WorkflowStep {
  id: string;
  toolId: string;
  name: string;
  inputs: Record<string, string>; // Maps input name to asset ID or step ID
  parameters?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  resourceProfile: 'low' | 'medium' | 'high';
  steps: WorkflowStep[];
  version: string;
}

/**
 * Page 24: Prioritized High-Value Workflow Templates Catalog
 */
export const HIGH_VALUE_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-social-post',
    name: 'Create Social Media Post',
    description: 'Take a photo, crop square, apply filter, add typography overlay, and export asset',
    resourceProfile: 'low',
    version: '1.0.0',
    steps: [
      { id: 'step-1', toolId: 'gs-pixels/crop', name: 'Crop to Square', inputs: { image: 'source' }, parameters: { aspect: '1:1' } },
      { id: 'step-2', toolId: 'gs-pixels/filter', name: 'Apply Stylized Filter', inputs: { image: 'step-1' }, parameters: { filter: 'vibrant' } },
      { id: 'step-3', toolId: 'gs-slides/render', name: 'Typeset Typography Layer', inputs: { image: 'step-2' } }
    ]
  },
  {
    id: 'wf-searchable-pdf',
    name: 'Prepare Document for Sharing (Searchable PDF)',
    description: 'Split scanned PDF pages, perform neural Tesseract OCR, and merge with searchable vector text layer',
    resourceProfile: 'high',
    version: '1.0.0',
    steps: [
      { id: 'step-1', toolId: 'gs-pdf/split', name: 'Deconstruct PDF Pages', inputs: { pdf: 'source' } },
      { id: 'step-2', toolId: 'gs-bridge/ocr', name: 'Tesseract Neural OCR', inputs: { pages: 'step-1' } },
      { id: 'step-3', toolId: 'gs-pdf/merge-layer', name: 'Synthesize Searchable PDF', inputs: { text: 'step-2' } }
    ]
  },
  {
    id: 'wf-animated-gif',
    name: 'Create Animated GIF from Video',
    description: 'Trim key video segments and convert to optimized GIF with smart palette quantization',
    resourceProfile: 'medium',
    version: '1.0.0',
    steps: [
      { id: 'step-1', toolId: 'gs-video/trim', name: 'Frame-Accurate Trim', inputs: { video: 'source' } },
      { id: 'step-2', toolId: 'gs-video/palettegen', name: 'Generate Quantized Palette', inputs: { video: 'step-1' } },
      { id: 'step-3', toolId: 'gs-video/gif', name: 'Encode Web-Ready GIF', inputs: { palette: 'step-2' } }
    ]
  },
  {
    id: 'wf-verify-integrity',
    name: 'Verify Download Integrity Manifest',
    description: 'Calculate cryptographic hash checksums and compare against verified directory manifest',
    resourceProfile: 'low',
    version: '1.0.0',
    steps: [
      { id: 'step-1', toolId: 'gs-hash/compute', name: 'Compute SHA/MD5 Hashes', inputs: { file: 'source' } },
      { id: 'step-2', toolId: 'gs-hash/verify-manifest', name: 'Audit Manifest Matching', inputs: { hash: 'step-1' } }
    ]
  }
];

export interface PreFlightCheck {
  ok: boolean;
  errors: string[];
  estimatedOutputSize?: number;
}

export interface ToolContract<P = Record<string, unknown>> {
  metadata: ToolMetadata;
  validate(inputs: AssetHandle[], params: P): Promise<PreFlightCheck>;
  run(
    inputs: AssetHandle[],
    params: P,
    signal?: AbortSignal,
    onProgress?: (percent: number, status?: string) => void
  ): Promise<AssetHandle>;
  dispose(): void | Promise<void>;
}

/**
 * Execution Manager & Memory Budget Scheduler
 * Controls concurrent execution to prevent mobile 1.5GB / desktop 4GB tab OOM crashes.
 */
class ExecutionManager {
  private activeTools = new Set<ToolContract<any>>();
  private memoryBudgetMB: number;

  constructor() {
    // Dynamic ceiling based on hardware heuristics or 1500MB mobile baseline
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
    this.memoryBudgetMB = isMobile ? 1200 : 3800;
  }

  public getBudget(): number {
    return this.memoryBudgetMB;
  }

  public getActiveMemoryUsageMB(): number {
    let sum = 0;
    for (const tool of this.activeTools) {
      sum += tool.metadata.resourceHints.peakMemoryMB;
    }
    return sum;
  }

  /**
   * Acquire execution slot under memory budget or dispose idle tools
   */
  public async schedule<P>(tool: ToolContract<P>): Promise<void> {
    const requested = tool.metadata.resourceHints.peakMemoryMB;
    const current = this.getActiveMemoryUsageMB();

    if (current + requested > this.memoryBudgetMB) {
      // Force cleanup of existing tools to free WASM linear memory
      console.warn(`[ExecutionManager] Memory pressure (${current + requested}MB > ${this.memoryBudgetMB}MB). Disposing active tools...`);
      for (const active of Array.from(this.activeTools)) {
        try {
          await active.dispose();
          this.activeTools.delete(active);
        } catch (e) {
          console.error('[ExecutionManager] Dispose error:', e);
        }
      }
    }

    this.activeTools.add(tool);
  }

  /**
   * Release tool execution slot and trigger cleanup
   */
  public async release(tool: ToolContract<any>): Promise<void> {
    try {
      await tool.dispose();
    } finally {
      this.activeTools.delete(tool);
    }
  }
}

export const executionManager = new ExecutionManager();

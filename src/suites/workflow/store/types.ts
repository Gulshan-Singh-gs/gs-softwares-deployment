// src/suites/workflow/store/types.ts

export type WorkflowDataType =
  | 'File'
  | 'File[]'
  | 'Image'
  | 'Image[]'
  | 'PDF'
  | 'PDF[]'
  | 'Video'
  | 'Video[]'
  | 'Audio'
  | 'Audio[]'
  | 'Text'
  | 'Markdown'
  | 'JSON'
  | 'YAML'
  | 'XML'
  | 'CSV'
  | 'SVG'
  | 'EPUB'
  | 'Archive'
  | 'QR'
  | 'Hash'
  | 'Metadata'
  | 'Unknown';

export type WorkflowNodeType =
  | 'input'
  | 'tool'
  | 'transform'
  | 'condition'
  | 'filter'
  | 'loop'
  | 'merge'
  | 'split'
  | 'output';

export type NodeExecutionStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped'
  | 'cancelled';

export interface WorkflowNodePort {
  id: string;
  name: string;
  dataType: WorkflowDataType;
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  toolId?: string; // e.g. 'image.compressor'
  suite?: string;  // e.g. 'pixels', 'pdf', 'video'
  name: string;
  category?: string;
  description?: string;
  position: { x: number; y: number };
  inputs: WorkflowNodePort[];
  outputs: WorkflowNodePort[];
  parameters: Record<string, unknown>;
  status: NodeExecutionStatus;
  progress?: number;
  outputData?: unknown;
  errorMessage?: string;
  localOnly?: boolean;
  requiresAI?: boolean;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export interface WorkflowTemplate {
  id: string;
  version: string;
  name: string;
  description: string;
  category:
    | 'Featured'
    | 'Image'
    | 'PDF'
    | 'Video'
    | 'Audio'
    | 'Text'
    | 'Data'
    | 'Archive'
    | 'QR'
    | 'Security'
    | 'Cross-Media'
    | 'Custom';
  tags: string[];
  inputType: WorkflowDataType;
  outputType: WorkflowDataType;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isCustom?: boolean;
  isFavorite?: boolean;
  lastRun?: number;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: number;
  nodeId?: string;
  nodeName?: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface WorkflowHistoryRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: number;
  finishedAt: number;
  status: 'success' | 'failed' | 'cancelled';
  inputNames: string[];
  outputFilesCount: number;
  logs: ExecutionLogEntry[];
}

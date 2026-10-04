/**
 * GS Softwares Platform Architecture - Core Types & SDK
 * Section 5: Tool SDK / Contract & Platform Boundary
 */

import React from 'react';

export type ToolCategory = 
  | 'view' 
  | 'edit' 
  | 'convert' 
  | 'optimize' 
  | 'generate' 
  | 'secure' 
  | 'analyze' 
  | 'automate';

export type StudioId = 
  | 'pixels'
  | 'canvas'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'text'
  | 'security'
  | 'hash'
  | 'bridge'
  | 'archive'
  | 'qr'
  | 'spreadsheet'
  | 'ebook'
  | 'presentation';

export type SuiteCategory = 'media' | 'documents' | 'developer' | 'security';

export interface ToolInputDefinition {
  name: string;
  type: string; // MIME, extension, or Asset taxonomy
  description?: string;
  required?: boolean;
}

export interface ToolOutputDefinition {
  name: string;
  type: string;
  description?: string;
}

export interface ToolExecutionDefinition {
  mode: 'worker' | 'wasm' | 'browser-api' | 'main-thread';
  weight: 'L' | 'M' | 'H';
  supportsBatch: boolean;
  supportsChaining: boolean;
  parameters?: Record<string, { type: 'number' | 'string' | 'boolean' | 'enum'; default: unknown; options?: string[] }>;
}

export interface ToolPermissionDefinition {
  network: boolean; // Must always be false for privacy
  persistentStorage: boolean;
  camera?: boolean;
  microphone?: boolean;
}

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  studioId: StudioId;
  category: ToolCategory;
  description: string;
  version: string;
  iconName: string;
  inputs: ToolInputDefinition[];
  outputs: ToolOutputDefinition[];
  execution: ToolExecutionDefinition;
  permissions: ToolPermissionDefinition;
}

export interface StudioRegistration {
  id: StudioId;
  name: string;
  badge: string;
  category: SuiteCategory;
  description: string;
  iconName: string;
  gradient: string;
  toolsCountLabel: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  tools: ToolMetadata[];
}

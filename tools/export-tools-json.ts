/**
 * Build-time Discovery Generator: exports /tools.json
 * Generates an answer-engine optimized (AEO) JSON manifest of all 109 tools directly from ToolRegistry
 */

import fs from 'fs';
import path from 'path';
import { ToolRegistry } from '../src/platform/registry';

function generateToolsJson() {
  console.log('[Discovery & AEO] Generating /tools.json from canonical ToolRegistry...');

  const studios = ToolRegistry.listStudios();
  const allTools = ToolRegistry.getAllTools();

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    platform: 'GS Softwares Suite',
    description: '100% Client-Side Local-First WebAssembly Tool Ecosystem',
    studiosCount: studios.length,
    toolsCount: allTools.length,
    studios: studios.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      badge: s.badge,
      description: s.description,
      tools: s.tools.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        description: t.description,
        inputs: t.inputs,
        outputs: t.outputs,
        execution: {
          mode: t.execution.mode,
          weight: t.execution.weight,
        },
        permissions: t.permissions,
      })),
    })),
  };

  const outPath = path.resolve(process.cwd(), 'public/tools.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[Discovery & AEO] Successfully generated ${outPath} (${allTools.length} tools across ${studios.length} studios).`);
}

generateToolsJson();

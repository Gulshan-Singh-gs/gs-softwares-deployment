import { CanvasProject } from './types';
import { saveWorkspaceFile, getWorkspaceFilesByApp, deleteWorkspaceFile } from '../db';

const ACTIVE_CANVAS_PROJECT_KEY = 'gs_canvas_active_project_id';

/**
 * Creates a default blank Canvas project.
 */
export function createDefaultProject(name: string = 'Untitled Sketchbook'): CanvasProject {
  const layer1Id = `layer_${Date.now()}`;
  return {
    id: `canvas_proj_${Date.now()}`,
    name,
    version: '1.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    camera: {
      x: 0,
      y: 0,
      zoom: 1
    },
    grid: {
      type: 'dot',
      size: 28,
      opacity: 0.28,
      color: '#94a3b8'
    },
    layers: [
      {
        id: layer1Id,
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'source-over',
        createdAt: Date.now()
      }
    ],
    strokes: [],
    backgroundColor: '#0c1015'
  };
}

/**
 * Autosaves project to IndexedDB workspace storage.
 */
export async function autoSaveProject(project: CanvasProject): Promise<void> {
  try {
    const json = JSON.stringify(project);
    await saveWorkspaceFile({
      id: project.id,
      app: 'canvas',
      name: project.name,
      type: 'application/json',
      size: json.length,
      data: json,
      metadata: {
        layerCount: project.layers.length,
        strokeCount: project.strokes.length,
        updatedAt: Date.now()
      },
      timestamp: Date.now()
    });
    localStorage.setItem(ACTIVE_CANVAS_PROJECT_KEY, project.id);
  } catch (err) {
    console.warn('GS-Canvas Autosave Error:', err);
  }
}

/**
 * Restores the most recently active or last updated project from IndexedDB.
 */
export async function loadLastActiveProject(): Promise<CanvasProject | null> {
  try {
    const activeId = localStorage.getItem(ACTIVE_CANVAS_PROJECT_KEY);
    const files = await getWorkspaceFilesByApp('canvas');
    if (!files || files.length === 0) return null;

    let targetFile = files.find(f => f.id === activeId);
    if (!targetFile) {
      // Sort by timestamp desc
      files.sort((a, b) => b.timestamp - a.timestamp);
      targetFile = files[0];
    }

    if (targetFile && targetFile.data) {
      const json = typeof targetFile.data === 'string'
        ? targetFile.data
        : new TextDecoder().decode(targetFile.data as ArrayBuffer);
      return JSON.parse(json) as CanvasProject;
    }
  } catch (err) {
    console.warn('GS-Canvas Restore Error:', err);
  }
  return null;
}

/**
 * Retrieves all saved canvas project summaries for project management.
 */
export async function listSavedProjects(): Promise<
  { id: string; name: string; timestamp: number; strokeCount: number; layerCount: number }[]
> {
  try {
    const files = await getWorkspaceFilesByApp('canvas');
    return files.map(f => ({
      id: f.id,
      name: f.name || 'Untitled Sketch',
      timestamp: f.timestamp,
      strokeCount: (f.metadata?.strokeCount as number) || 0,
      layerCount: (f.metadata?.layerCount as number) || 1
    }));
  } catch (err) {
    console.warn('GS-Canvas List Error:', err);
    return [];
  }
}

/**
 * Deletes a project from IndexedDB.
 */
export async function deleteProject(id: string): Promise<void> {
  await deleteWorkspaceFile(id);
}

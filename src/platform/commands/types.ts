/**
 * GS Softwares — Global Command & Keyboard Shortcut Types
 * Layered scope: Global -> Suite -> Tool/Context
 */

export type ShortcutScope = 'global' | 'suite' | 'tool';

export interface ShortcutDefinition {
  id: string;                      // e.g., 'app.undo', 'video.playPause'
  command: string;                 // Semantic command ID
  title: string;                   // Human readable label e.g., 'Undo Action'
  description?: string;
  category: 'Application' | 'File' | 'Editing' | 'Navigation' | 'View' | 'Playback' | 'Tools';
  scope: ShortcutScope;
  suiteId?: string;                // Specific to suite if scope === 'suite'
  toolId?: string;                 // Specific to tool if scope === 'tool'
  
  // Platform key combinations:
  // e.g. ['PRIMARY+Z'], ['Space'], ['Shift+ArrowRight'], ['?']
  keys: string[];
  
  // Execution behavior
  preventDefault?: boolean;        // Defaults to true for matched shortcuts
  allowInInputs?: boolean;         // False by default (only Esc, Cmd+K allowed in inputs)
}

export interface ActiveContext {
  suiteId: string | null;          // Currently active suite (e.g. 'pixels', 'video', 'pdf')
  toolId?: string | null;           // Active tool within suite
  isModalOpen?: boolean;           // True if modal dialog is open
  isPresentationMode?: boolean;    // Fullscreen presentation view
  isCanvasFocused?: boolean;       // Freehand canvas or viewport focus
}

export type CommandHandler = (commandId: string, context: ActiveContext) => boolean | void;

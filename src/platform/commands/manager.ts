import { SHORTCUT_REGISTRY } from './registry';
import { ActiveContext, CommandHandler, ShortcutDefinition } from './types';
import { isInputFocused, normalizeEventToKeyCombo } from './formatter';

/**
 * GS Softwares — Global Command Manager & Keyboard Event Dispatcher
 * Provides single source of truth for hotkeys, conflict prevention,
 * and contextual routing.
 */
class CommandManager {
  private handlers = new Map<string, Set<CommandHandler>>();
  private activeContext: ActiveContext = { suiteId: 'home' };
  private isListening = false;

  public setContext(context: Partial<ActiveContext>) {
    this.activeContext = { ...this.activeContext, ...context };
  }

  public getContext(): ActiveContext {
    return this.activeContext;
  }

  public registerHandler(commandId: string, handler: CommandHandler) {
    if (!this.handlers.has(commandId)) {
      this.handlers.set(commandId, new Set());
    }
    this.handlers.get(commandId)!.add(handler);

    return () => {
      this.handlers.get(commandId)?.delete(handler);
    };
  }

  public execute(commandId: string): boolean {
    const handlers = this.handlers.get(commandId);
    if (!handlers || handlers.size === 0) return false;

    let handled = false;
    handlers.forEach((h) => {
      const res = h(commandId, this.activeContext);
      if (res !== false) handled = true;
    });

    return handled;
  }

  public startListening() {
    if (this.isListening || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDown, { capture: true });
    this.isListening = true;
  }

  public stopListening() {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    this.isListening = false;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const inputFocused = isInputFocused();
    const combo = normalizeEventToKeyCombo(e);

    // Find all potential matching shortcuts
    const candidateShortcuts = SHORTCUT_REGISTRY.filter((def) =>
      def.keys.includes(combo)
    );

    if (candidateShortcuts.length === 0) return;

    // Resolve priority order:
    // 1. Tool context match (highest)
    // 2. Suite context match
    // 3. Global scope match
    let matched: ShortcutDefinition | undefined;

    if (this.activeContext.toolId) {
      matched = candidateShortcuts.find(
        (s) => s.scope === 'tool' && s.toolId === this.activeContext.toolId
      );
    }

    if (!matched && this.activeContext.suiteId) {
      matched = candidateShortcuts.find(
        (s) => s.scope === 'suite' && s.suiteId === this.activeContext.suiteId
      );
    }

    if (!matched) {
      matched = candidateShortcuts.find((s) => s.scope === 'global');
    }

    if (!matched) return;

    // Input safety check: Do not execute single letter shortcuts or editing tools when typing
    if (inputFocused && !matched.allowInInputs) {
      return;
    }

    if (matched.preventDefault !== false) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.execute(matched.command);
  };
}

export const GlobalCommandManager = new CommandManager();

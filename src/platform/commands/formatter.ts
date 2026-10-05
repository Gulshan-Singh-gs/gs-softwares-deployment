/**
 * GS Softwares — Platform Key Formatter & Abstraction
 * Detects macOS vs Windows/Linux and formats PRIMARY modifiers cleanly.
 */

export const isMacOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
};

/**
 * Formats key combination into human-readable platform string
 * e.g., 'PRIMARY+Z' -> 'Cmd + Z' (Mac) or 'Ctrl + Z' (Windows/Linux)
 */
export const formatShortcutKey = (keyCombo: string): string => {
  const isMac = isMacOS();
  const primaryModifier = isMac ? 'Cmd' : 'Ctrl';

  return keyCombo
    .replace(/PRIMARY/g, primaryModifier)
    .replace(/\+/g, ' + ')
    .replace(/ArrowRight/g, '→')
    .replace(/ArrowLeft/g, '←')
    .replace(/ArrowUp/g, '↑')
    .replace(/ArrowDown/g, '↓');
};

/**
 * Normalizes keyboard event into canonical shortcut pattern string
 * e.g., Ctrl+z -> 'PRIMARY+Z', Shift+ArrowRight -> 'Shift+ArrowRight'
 */
export const normalizeEventToKeyCombo = (e: KeyboardEvent): string => {
  const isMac = isMacOS();
  const parts: string[] = [];

  const isPrimary = isMac ? e.metaKey : e.ctrlKey;
  if (isPrimary) parts.push('PRIMARY');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  let key = e.key;

  // Single letter normalization
  if (key.length === 1) {
    key = key.toUpperCase();
  } else if (key === ' ') {
    key = 'Space';
  } else if (key === 'Escape') {
    key = 'Esc';
  }

  // Avoid adding duplicate modifiers if key itself is Control/Meta/Shift/Alt
  if (['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
    return parts.join('+');
  }

  parts.push(key);
  return parts.join('+');
};

/**
 * Checks if active DOM element is an editable text element
 */
export const isInputFocused = (): boolean => {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;

  const tagName = el.tagName.toLowerCase();
  const isContentEditable = el.getAttribute('contenteditable') === 'true';

  if (tagName === 'input') {
    const type = (el as HTMLInputElement).type?.toLowerCase();
    // Non-text inputs (range, checkbox, button) can still accept standard hotkeys
    const textTypes = ['text', 'search', 'password', 'email', 'url', 'number', 'tel'];
    return textTypes.includes(type) || !type;
  }

  return (
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable ||
    el.classList.contains('monaco-editor') ||
    el.classList.contains('cm-content')
  );
};

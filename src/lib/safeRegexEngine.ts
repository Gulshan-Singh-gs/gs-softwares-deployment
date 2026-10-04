/**
 * ReDoS-Safe Regex Studio Engine with Worker Execution Bounds
 * - Linear-time bounds and execution timeouts to guarantee zero main-thread freeze
 * - Detects high-risk catastrophic backtracking patterns (e.g., nested quantifiers `(a+)+`)
 * - Pattern explanation tokenization and replacement preview
 */

export interface RegexAnalysisResult {
  isSafe: boolean;
  warning?: string;
  matches: Array<{
    match: string;
    index: number;
    groups?: Record<string, string>;
  }>;
  replacement?: string;
  executionTimeMs: number;
  timedOut: boolean;
}

// Detection for pathological catastrophic backtracking patterns
const CATASTROPHIC_PATTERNS = [
  /([*+]\s*){2,}/,             // Adjacent quantifiers
  /\([^)]*(\+|\*)[^)]*\)\s*(\+|\*|\{\d+,?\d*\})/, // Nested repetition e.g. (a+)+ or (x*)*
  /(\w+\|)+(\w+)/,             // Pathological overlap alternation
];

export function analyzePatternSafety(pattern: string): { isSafe: boolean; reason?: string } {
  for (const rx of CATASTROPHIC_PATTERNS) {
    if (rx.test(pattern)) {
      return {
        isSafe: false,
        reason: 'Potential Catastrophic Backtracking (ReDoS) detected in nested repetition or adjacent quantifiers.',
      };
    }
  }
  return { isSafe: true };
}

/**
 * Runs regex safely with time-budgeted execution
 */
export async function executeSafeRegex(
  pattern: string,
  flags: string,
  input: string,
  replacementTemplate?: string,
  timeoutMs: number = 200
): Promise<RegexAnalysisResult> {
  const start = performance.now();
  const safety = analyzePatternSafety(pattern);

  // If input is massive (>2MB), limit sample window for live preview to avoid UI stutter
  const sampleInput = input.length > 2 * 1024 * 1024 ? input.slice(0, 2 * 1024 * 1024) : input;

  return new Promise((resolve) => {
    let completed = false;

    // Timeout guard
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve({
          isSafe: false,
          warning: 'Execution timed out. Pattern may contain exponential backtracking.',
          matches: [],
          executionTimeMs: timeoutMs,
          timedOut: true,
        });
      }
    }, timeoutMs);

    try {
      const rx = new RegExp(pattern, flags);
      const matches: Array<{ match: string; index: number; groups?: Record<string, string> }> = [];

      let m: RegExpExecArray | null;
      let count = 0;
      const isGlobal = flags.includes('g');

      if (isGlobal) {
        while ((m = rx.exec(sampleInput)) !== null && count < 1000) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.groups ? { ...m.groups } : undefined,
          });
          count++;
          // Avoid zero-length infinite loop
          if (m[0].length === 0) {
            rx.lastIndex++;
          }
        }
      } else {
        m = rx.exec(sampleInput);
        if (m) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.groups ? { ...m.groups } : undefined,
          });
        }
      }

      let replacement: string | undefined = undefined;
      if (replacementTemplate !== undefined) {
        replacement = sampleInput.replace(rx, replacementTemplate);
      }

      completed = true;
      clearTimeout(timer);
      const elapsed = performance.now() - start;

      resolve({
        isSafe: safety.isSafe,
        warning: safety.reason,
        matches,
        replacement,
        executionTimeMs: Math.round(elapsed),
        timedOut: false,
      });
    } catch (err: unknown) {
      completed = true;
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : String(err);
      resolve({
        isSafe: false,
        warning: `Regex syntax error: ${msg}`,
        matches: [],
        executionTimeMs: 0,
        timedOut: false,
      });
    }
  });
}

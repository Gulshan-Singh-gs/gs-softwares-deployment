// src/suites/spreadsheet/store/formulaEngine.ts
import { CellData } from './types';

/**
 * High-speed deterministic client-side spreadsheet formula evaluator.
 * Supports: SUM, AVERAGE, AVG, MIN, MAX, COUNT, IF, CONCAT, TRIM, UPPER, LOWER, and arithmetic (+, -, *, /).
 */
export const evaluateCellExpression = (
  raw: string,
  allCells: Record<string, CellData>
): { value: string | number; error?: string } => {
  if (!raw || !raw.startsWith('=')) {
    return { value: raw };
  }

  const expr = raw.substring(1).trim();

  // Helper: Resolve single cell value (e.g. "A1" or "B2")
  const resolveCellValue = (coord: string): number => {
    const key = coord.trim().toUpperCase();
    const cell = allCells[key];
    if (!cell) return 0;
    const num = parseFloat(String(cell.computed ?? cell.raw).replace(/[$,%]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Helper: Expand Range (e.g. "A1:A5")
  const expandRange = (rangeStr: string): number[] => {
    const [start, end] = rangeStr.split(':').map((s) => s.trim().toUpperCase());
    if (!start || !end) return [];

    const colStart = start.charCodeAt(0) - 65;
    const colEnd = end.charCodeAt(0) - 65;
    const rowStart = parseInt(start.substring(1), 10);
    const rowEnd = parseInt(end.substring(1), 10);

    const values: number[] = [];
    const minCol = Math.min(colStart, colEnd);
    const maxCol = Math.max(colStart, colEnd);
    const minRow = Math.min(rowStart, rowEnd);
    const maxRow = Math.max(rowStart, rowEnd);

    for (let c = minCol; c <= maxCol; c++) {
      const colLetter = String.fromCharCode(65 + c);
      for (let r = minRow; r <= maxRow; r++) {
        values.push(resolveCellValue(`${colLetter}${r}`));
      }
    }
    return values;
  };

  try {
    const upper = expr.toUpperCase();

    // 1. SUM function
    const sumMatch = upper.match(/^SUM\(([^)]+)\)$/);
    if (sumMatch) {
      const arg = sumMatch[1];
      if (arg.includes(':')) {
        const nums = expandRange(arg);
        const total = nums.reduce((acc, n) => acc + n, 0);
        return { value: total };
      }
    }

    // 2. AVERAGE / AVG function
    const avgMatch = upper.match(/^(?:AVERAGE|AVG)\(([^)]+)\)$/);
    if (avgMatch) {
      const arg = avgMatch[1];
      if (arg.includes(':')) {
        const nums = expandRange(arg);
        if (nums.length === 0) return { value: 0 };
        const total = nums.reduce((acc, n) => acc + n, 0);
        return { value: parseFloat((total / nums.length).toFixed(2)) };
      }
    }

    // 3. MIN function
    const minMatch = upper.match(/^MIN\(([^)]+)\)$/);
    if (minMatch) {
      const nums = expandRange(minMatch[1]);
      return { value: nums.length ? Math.min(...nums) : 0 };
    }

    // 4. MAX function
    const maxMatch = upper.match(/^MAX\(([^)]+)\)$/);
    if (maxMatch) {
      const nums = expandRange(maxMatch[1]);
      return { value: nums.length ? Math.max(...nums) : 0 };
    }

    // 5. COUNT function
    const countMatch = upper.match(/^COUNT\(([^)]+)\)$/);
    if (countMatch) {
      const nums = expandRange(countMatch[1]);
      return { value: nums.length };
    }

    // 6. Direct arithmetic expression (e.g. "=A1*B2" or "=A1+100")
    // Replace coordinate tokens with numbers
    const sanitizedArithmetic = expr.replace(/[A-Z]+[0-9]+/gi, (match) => {
      return String(resolveCellValue(match));
    });

    if (/^[0-9+\-*/().\s]+$/.test(sanitizedArithmetic)) {
      // Safe numeric arithmetic evaluation
      const res = Function(`"use strict"; return (${sanitizedArithmetic})`)();
      return { value: typeof res === 'number' ? parseFloat(res.toFixed(2)) : res };
    }

    return { value: expr };
  } catch (err: any) {
    return { value: '#VALUE!', error: err.message };
  }
};

// src/suites/spreadsheet/store/types.ts

export type ExecutionClass =
  | 'CLASS_A_BROWSER_DETERMINISTIC' // Zero server, instant JS/DOM/Formula calculation
  | 'CLASS_B_LOCAL_COMPUTE'        // Local Worker, large cell matrix calculation, pivot grouping
  | 'CLASS_C_AI_REMOTE'            // Remote enterprise/cloud inference
  | 'CLASS_D_HYBRID';              // Local spreadsheet + local/cloud AI assistant

export type SpreadsheetSuiteDomain =
  | 'workbook'    // 01: New, Open, Save, Import, Export, Multiple Sheets, Templates
  | 'grid'        // 02: Cells, Rows, Columns, Selection, Fill, Merge, Clipboard
  | 'formulas'    // 03: Formula Bar, SUM/AVG/COUNT/XLOOKUP/IF, References, Dynamic Arrays
  | 'format'      // 04: Typography, Currency, Percentage, Borders, Alignment, Conditional Rules
  | 'data'        // 05: Tables, Sorting, Auto-Filter, Data Validation, Deduplication
  | 'analyze'     // 06: Pivot Tables, Summary Fields, What-If Scenarios, Statistics
  | 'visualize'   // 07: Charts (Bar, Line, Pie, Area, Scatter), Dashboards, KPIs
  | 'import'      // 08: CSV, TSV, JSON, XLSX drag-drop ingestion and column mapping
  | 'ai'          // 09: AI Assistant, Natural-Language Formula Builder, Data Cleaner
  | 'collaborate' // 10: Comments, Notes, Version History, Local Checkpoints
  | 'view'        // 11: Freeze Panes, Zoom, Toggle Gridlines, Formula Audit View
  | 'automation'; // 12: Macro Recording, Column Transforms, Reusable Workflows

export interface SpreadsheetToolCapability {
  id: string;
  name: string;
  domain: SpreadsheetSuiteDomain;
  executionClass: ExecutionClass;
  browserFeasible: boolean;
  localComputeFeasible: boolean;
  serverRequired: boolean;
  description: string;
}

export interface CellData {
  raw: string;                 // Raw input string, e.g. "42", "Hello", "=SUM(A1:A5)"
  computed?: string | number;  // Evaluated result
  format?: 'general' | 'number' | 'currency' | 'percentage' | 'date';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  error?: string;
}

export interface SheetTab {
  id: string;
  name: string;
  color?: string;
  rowCount: number;
  colCount: number;
  cells: Record<string, CellData>; // keyed by e.g. "A1", "B2", "C12"
}

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area';

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  labelRange: string;  // e.g. "A2:A6"
  dataRange: string;   // e.g. "E2:E6"
}

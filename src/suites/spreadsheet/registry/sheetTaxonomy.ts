// src/suites/spreadsheet/registry/sheetTaxonomy.ts
import { SpreadsheetToolCapability, SpreadsheetSuiteDomain } from '../store/types';

export interface DomainMeta {
  id: SpreadsheetSuiteDomain;
  name: string;
  shortLabel: string;
  iconName: string;
  description: string;
}

export const SPREADSHEET_DOMAINS: DomainMeta[] = [
  { id: 'workbook', name: 'Workbook Management', shortLabel: 'Workbook', iconName: 'FileSpreadsheet', description: 'Create workbooks, multiple worksheets, sheet duplication, color tabs, and export' },
  { id: 'grid', name: 'Grid & Cell Matrix', shortLabel: 'Grid', iconName: 'Grid', description: 'Cell navigation, range selection, row/column resizing, freeze headers, autofill' },
  { id: 'formulas', name: 'Formula & Calculation Engine', shortLabel: 'Formulas', iconName: 'FunctionSquare', description: 'SUM, AVERAGE, MIN, MAX, COUNT, IF, XLOOKUP, relative & absolute references' },
  { id: 'format', name: 'Typography & Formats', shortLabel: 'Format', iconName: 'Paintbrush', description: 'Currency ($), percentages (%), decimal places, font styles, borders, color fills' },
  { id: 'data', name: 'Tables, Sort & Filter', shortLabel: 'Data', iconName: 'Filter', description: 'Auto-filter dropdowns, multi-column sorting (A-Z, Z-A), data validation, deduplication' },
  { id: 'analyze', name: 'Pivot & What-If Analysis', shortLabel: 'Analyze', iconName: 'Sigma', description: 'PivotTable field arrangements, row groupings, value aggregations, scenarios' },
  { id: 'visualize', name: 'Charts & Dashboards', shortLabel: 'Charts', iconName: 'BarChart3', description: 'Column, Bar, Line, Area, and Pie chart generators directly from cell ranges' },
  { id: 'import', name: 'Data Ingestion & Connect', shortLabel: 'Import', iconName: 'FolderInput', description: 'Zero-upload CSV, TSV, JSON, and XLSX parsing with delimiter detection' },
  { id: 'ai', name: 'AI Spreadsheet Assistant', shortLabel: 'AI Assistant', iconName: 'Sparkles', description: 'Formula generation from natural language, automated data normalization, insights' },
  { id: 'collaborate', name: 'Review & Versioning', shortLabel: 'History', iconName: 'History', description: 'Session checkpoints, non-destructive undo/redo history, cell comments' },
  { id: 'view', name: 'View & Presentation', shortLabel: 'View', iconName: 'Eye', description: 'Toggle gridlines, formula audit mode, zoom scaling, full-screen canvas' },
  { id: 'automation', name: 'Transforms & Pipelines', shortLabel: 'Automation', iconName: 'Workflow', description: 'Column case transformations, whitespace stripping, bulk mathematical operations' }
];

export const SPREADSHEET_CAPABILITIES: SpreadsheetToolCapability[] = [
  // 01. WORKBOOK
  { id: 'wb.sheets', name: 'Multi-Sheet Workbook Architecture', domain: 'workbook', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Manage multiple isolated sheets with cross-referencing capabilities' },
  { id: 'wb.export', name: 'Multi-Format Client Exporter', domain: 'workbook', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Download as standard CSV, JSON, Markdown tables, or print PDF' },

  // 02. GRID
  { id: 'grid.selection', name: 'High-Speed Virtual Matrix Selection', domain: 'grid', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Sub-millisecond keyboard and mouse cell range highlight' },

  // 03. FORMULAS
  { id: 'formula.evaluator', name: 'Client-Side Expression Evaluator', domain: 'formulas', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant mathematical parsing for SUM, AVG, COUNT, MIN, MAX, IF' },

  // 04. FORMAT
  { id: 'format.currency', name: 'Financial & Percentage Masking', domain: 'format', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Configurable locale formatting with currency symbols and decimals' },

  // 05. DATA
  { id: 'data.sort_filter', name: 'In-Memory Column Sorter & Filter', domain: 'data', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Zero-latency alphanumeric and numeric filtering across thousands of rows' },

  // 06. ANALYZE
  { id: 'analyze.pivot', name: 'Dynamic Pivot Aggregator', domain: 'analyze', executionClass: 'CLASS_B_LOCAL_COMPUTE', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Multidimensional cross-tabulation and grouping by category/region' },

  // 07. VISUALIZE
  { id: 'visualize.charts', name: 'HTML5 Reactive Canvas Charts', domain: 'visualize', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Instant rendering of Bar, Line, Area, and Pie charts linked to live cells' },

  // 08. IMPORT
  { id: 'import.csv', name: 'Smart CSV / Delimiter Sniffer', domain: 'import', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Auto-detect comma, semicolon, tab, and pipe delimiters with quote stripping' },

  // 09. AI
  { id: 'ai.formula_gen', name: 'Natural Language Formula Synthesizer', domain: 'ai', executionClass: 'CLASS_D_HYBRID', browserFeasible: false, localComputeFeasible: true, serverRequired: false, description: 'Convert plain English queries like "Calculate total revenue by region" into formulas' },

  // 10. COLLABORATE
  { id: 'collab.checkpoints', name: 'Local Immutable Checkpoint History', domain: 'collaborate', executionClass: 'CLASS_A_BROWSER_DETERMINISTIC', browserFeasible: true, localComputeFeasible: true, serverRequired: false, description: 'Full non-destructive undo/redo stack with timeline rollback' }
];

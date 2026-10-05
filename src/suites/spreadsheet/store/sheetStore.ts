// src/suites/spreadsheet/store/sheetStore.ts
import { create } from 'zustand';
import {
  SpreadsheetSuiteDomain,
  SheetTab,
  CellData,
  ChartConfig
} from './types';
import { evaluateCellExpression } from './formulaEngine';
import { downloadBlob } from '../../../lib/fileUtils';

interface SheetStoreState {
  // Navigation & Domain
  activeDomain: SpreadsheetSuiteDomain;
  setDomain: (domain: SpreadsheetSuiteDomain) => void;

  // Multi-Sheet Architecture
  workbookName: string;
  setWorkbookName: (name: string) => void;
  sheets: SheetTab[];
  activeSheetId: string;
  setActiveSheetId: (id: string) => void;
  addSheet: (name?: string) => void;
  deleteSheet: (id: string) => void;
  renameSheet: (id: string, name: string) => void;

  // Active Selection & Formula Bar
  selectedCell: string; // e.g. "B2"
  setSelectedCell: (cell: string) => void;
  formulaBarValue: string;
  setFormulaBarValue: (val: string) => void;
  commitFormulaBar: () => void;

  // Cell Mutation
  setCellValue: (coord: string, raw: string) => void;
  setCellFormatting: (coord: string, format: Partial<CellData>) => void;
  clearCell: (coord: string) => void;

  // Column / Row Operations
  insertRow: (afterIndex: number) => void;
  insertColumn: (afterIndex: number) => void;

  // Charts & Visualization
  charts: ChartConfig[];
  addChart: (chart: Omit<ChartConfig, 'id'>) => void;
  removeChart: (id: string) => void;

  // Filter & Search
  filterQuery: string;
  setFilterQuery: (query: string) => void;

  // Import & Export
  importCsvContent: (csv: string, filename?: string) => void;
  exportCsv: () => void;
  exportJson: () => void;
  exportMarkdown: () => void;

  // Demo Buffer Loading
  loadDemoSalesWorkbook: () => void;

  // Undo / Redo
  undoStack: SheetTab[][];
  redoStack: SheetTab[][];
  undo: () => void;
  redo: () => void;

  statusMessage: string;
  setStatusMessage: (msg: string) => void;
}

// Initial high-production demo data for immediate testing
const createInitialDemoSheet = (): SheetTab => {
  const cells: Record<string, CellData> = {
    // Headers (Row 1)
    A1: { raw: 'Region', computed: 'Region', bold: true, bgColor: '#164e63', color: '#38bdf8', align: 'center' },
    B1: { raw: 'Product', computed: 'Product', bold: true, bgColor: '#164e63', color: '#38bdf8', align: 'center' },
    C1: { raw: 'Units', computed: 'Units', bold: true, bgColor: '#164e63', color: '#38bdf8', align: 'right' },
    D1: { raw: 'Unit Price', computed: 'Unit Price', bold: true, bgColor: '#164e63', color: '#38bdf8', align: 'right' },
    E1: { raw: 'Revenue', computed: 'Revenue', bold: true, bgColor: '#164e63', color: '#38bdf8', align: 'right' },

    // Data (Rows 2 to 6)
    A2: { raw: 'North', computed: 'North', align: 'left' },
    B2: { raw: 'Quantum Sensor', computed: 'Quantum Sensor', align: 'left' },
    C2: { raw: '140', computed: 140, align: 'right' },
    D2: { raw: '450', computed: 450, format: 'currency', align: 'right' },
    E2: { raw: '=C2*D2', computed: 63000, bold: true, format: 'currency', align: 'right' },

    A3: { raw: 'West', computed: 'West', align: 'left' },
    B3: { raw: 'Neural Accelerator', computed: 'Neural Accelerator', align: 'left' },
    C3: { raw: '85', computed: 85, align: 'right' },
    D3: { raw: '890', computed: 890, format: 'currency', align: 'right' },
    E3: { raw: '=C3*D3', computed: 75650, bold: true, format: 'currency', align: 'right' },

    A4: { raw: 'South', computed: 'South', align: 'left' },
    B4: { raw: 'Optic Waveguide', computed: 'Optic Waveguide', align: 'left' },
    C4: { raw: '210', computed: 210, align: 'right' },
    D4: { raw: '120', computed: 120, format: 'currency', align: 'right' },
    E4: { raw: '=C4*D4', computed: 25200, bold: true, format: 'currency', align: 'right' },

    A5: { raw: 'East', computed: 'East', align: 'left' },
    B5: { raw: 'Cryo Cooling Array', computed: 'Cryo Cooling Array', align: 'left' },
    C5: { raw: '45', computed: 45, align: 'right' },
    D5: { raw: '620', computed: 620, format: 'currency', align: 'right' },
    E5: { raw: '=C5*D5', computed: 27900, bold: true, format: 'currency', align: 'right' },

    A6: { raw: 'Central', computed: 'Central', align: 'left' },
    B6: { raw: 'Bionic Actuator', computed: 'Bionic Actuator', align: 'left' },
    C6: { raw: '115', computed: 115, align: 'right' },
    D6: { raw: '340', computed: 340, format: 'currency', align: 'right' },
    E6: { raw: '=C6*D6', computed: 39100, bold: true, format: 'currency', align: 'right' },

    // Total Summary Row (Row 7)
    A7: { raw: 'TOTAL', computed: 'TOTAL', bold: true, color: '#f59e0b', align: 'left' },
    B7: { raw: '', computed: '' },
    C7: { raw: '=SUM(C2:C6)', computed: 595, bold: true, align: 'right' },
    D7: { raw: '=AVERAGE(D2:D6)', computed: 484, format: 'currency', align: 'right' },
    E7: { raw: '=SUM(E2:E6)', computed: 230850, bold: true, color: '#10b981', format: 'currency', align: 'right' }
  };

  return {
    id: 'sheet_sales_1',
    name: 'Q3_Sales',
    rowCount: 20,
    colCount: 10,
    cells
  };
};

export const useSheetStore = create<SheetStoreState>((set, get) => ({
  activeDomain: 'grid',
  setDomain: (domain) => set({ activeDomain: domain }),

  workbookName: 'Enterprise_Performance_Model.xlsx',
  setWorkbookName: (name) => set({ workbookName: name }),

  sheets: [createInitialDemoSheet()],
  activeSheetId: 'sheet_sales_1',
  setActiveSheetId: (id) => set({ activeSheetId: id }),

  selectedCell: 'E7',
  setSelectedCell: (cell) => {
    const { sheets, activeSheetId } = get();
    const sheet = sheets.find((s) => s.id === activeSheetId);
    const cellData = sheet?.cells[cell];
    set({
      selectedCell: cell,
      formulaBarValue: cellData ? cellData.raw : ''
    });
  },

  formulaBarValue: '=SUM(E2:E6)',
  setFormulaBarValue: (val) => set({ formulaBarValue: val }),
  commitFormulaBar: () => {
    const { selectedCell, formulaBarValue, setCellValue } = get();
    if (selectedCell) {
      setCellValue(selectedCell, formulaBarValue);
    }
  },

  setCellValue: (coord, raw) => {
    const { sheets, activeSheetId, undoStack } = get();
    const currentSheets = JSON.parse(JSON.stringify(sheets));

    const updatedSheets = sheets.map((sheet) => {
      if (sheet.id !== activeSheetId) return sheet;

      const cells = { ...sheet.cells };
      const evalRes = evaluateCellExpression(raw, cells);

      cells[coord] = {
        ...(cells[coord] || {}),
        raw,
        computed: evalRes.value,
        error: evalRes.error
      };

      // Recalculate dependent formula cells in this sheet
      Object.keys(cells).forEach((k) => {
        if (cells[k].raw.startsWith('=')) {
          const reEval = evaluateCellExpression(cells[k].raw, cells);
          cells[k] = { ...cells[k], computed: reEval.value, error: reEval.error };
        }
      });

      return { ...sheet, cells };
    });

    set({
      sheets: updatedSheets,
      undoStack: [currentSheets, ...undoStack.slice(0, 20)],
      redoStack: [],
      statusMessage: `Updated cell ${coord}`
    });
  },

  setCellFormatting: (coord, format) => {
    const { sheets, activeSheetId } = get();
    const updatedSheets = sheets.map((sheet) => {
      if (sheet.id !== activeSheetId) return sheet;
      const cells = { ...sheet.cells };
      cells[coord] = {
        ...(cells[coord] || { raw: '', computed: '' }),
        ...format
      };
      return { ...sheet, cells };
    });
    set({ sheets: updatedSheets });
  },

  clearCell: (coord) => {
    const { setCellValue } = get();
    setCellValue(coord, '');
  },

  addSheet: (name) => {
    const { sheets } = get();
    const newId = `sheet_${Date.now()}`;
    const newSheet: SheetTab = {
      id: newId,
      name: name || `Sheet${sheets.length + 1}`,
      rowCount: 25,
      colCount: 12,
      cells: {}
    };
    set({ sheets: [...sheets, newSheet], activeSheetId: newId });
  },

  deleteSheet: (id) => {
    const { sheets } = get();
    if (sheets.length <= 1) return; // Keep at least one sheet
    const remaining = sheets.filter((s) => s.id !== id);
    set({ sheets: remaining, activeSheetId: remaining[0].id });
  },

  renameSheet: (id, name) => {
    set((state) => ({
      sheets: state.sheets.map((s) => (s.id === id ? { ...s, name } : s))
    }));
  },

  insertRow: (afterIndex) => {
    set((state) => ({
      sheets: state.sheets.map((s) =>
        s.id === state.activeSheetId ? { ...s, rowCount: s.rowCount + 1 } : s
      )
    }));
  },

  insertColumn: (afterIndex) => {
    set((state) => ({
      sheets: state.sheets.map((s) =>
        s.id === state.activeSheetId ? { ...s, colCount: s.colCount + 1 } : s
      )
    }));
  },

  charts: [
    {
      id: 'chart_rev_1',
      title: 'Regional Revenue Distribution',
      type: 'bar',
      labelRange: 'A2:A6',
      dataRange: 'E2:E6'
    }
  ],

  addChart: (chart) => {
    const newChart: ChartConfig = {
      ...chart,
      id: `chart_${Date.now()}`
    };
    set((s) => ({ charts: [...s.charts, newChart] }));
  },

  removeChart: (id) => {
    set((s) => ({ charts: s.charts.filter((c) => c.id !== id) }));
  },

  filterQuery: '',
  setFilterQuery: (query) => set({ filterQuery: query }),

  importCsvContent: (csv, filename = 'Imported_Data.csv') => {
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (!lines.length) return;

    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const newCells: Record<string, CellData> = {};

    let maxCol = 1;
    lines.forEach((line, rIdx) => {
      const rowNum = rIdx + 1;
      const cols = line.split(delimiter);
      if (cols.length > maxCol) maxCol = cols.length;

      cols.forEach((colVal, cIdx) => {
        const colLetter = String.fromCharCode(65 + cIdx);
        const cleanVal = colVal.trim().replace(/^["']|["']$/g, '');
        const coord = `${colLetter}${rowNum}`;
        const num = parseFloat(cleanVal);

        newCells[coord] = {
          raw: cleanVal,
          computed: isNaN(num) ? cleanVal : num,
          bold: rowNum === 1
        };
      });
    });

    const newSheet: SheetTab = {
      id: `sheet_csv_${Date.now()}`,
      name: filename.replace(/\.[^/.]+$/, ''),
      rowCount: Math.max(lines.length + 5, 20),
      colCount: Math.max(maxCol + 3, 10),
      cells: newCells
    };

    set((state) => ({
      sheets: [...state.sheets, newSheet],
      activeSheetId: newSheet.id,
      statusMessage: `Imported ${lines.length} rows from CSV`
    }));
  },

  exportCsv: () => {
    const { sheets, activeSheetId, workbookName } = get();
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    const lines: string[] = [];
    for (let r = 1; r <= sheet.rowCount; r++) {
      const rowVals: string[] = [];
      let hasData = false;
      for (let c = 0; c < sheet.colCount; c++) {
        const coord = `${String.fromCharCode(65 + c)}${r}`;
        const val = sheet.cells[coord]?.computed ?? '';
        if (val !== '') hasData = true;
        rowVals.push(String(val));
      }
      if (hasData) lines.push(rowVals.join(','));
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    downloadBlob(blob, `${sheet.name || 'export'}.csv`);
  },

  exportJson: () => {
    const { sheets, activeSheetId } = get();
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    const blob = new Blob([JSON.stringify(sheet.cells, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${sheet.name || 'export'}.json`);
  },

  exportMarkdown: () => {
    const { sheets, activeSheetId } = get();
    const sheet = sheets.find((s) => s.id === activeSheetId);
    if (!sheet) return;

    let md = '';
    // Row 1 Header
    const headers: string[] = [];
    for (let c = 0; c < sheet.colCount; c++) {
      const coord = `${String.fromCharCode(65 + c)}1`;
      headers.push(String(sheet.cells[coord]?.computed || `Col ${c + 1}`));
    }
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    for (let r = 2; r <= sheet.rowCount; r++) {
      const rowVals: string[] = [];
      let hasData = false;
      for (let c = 0; c < sheet.colCount; c++) {
        const coord = `${String.fromCharCode(65 + c)}${r}`;
        const val = sheet.cells[coord]?.computed ?? '';
        if (val !== '') hasData = true;
        rowVals.push(String(val));
      }
      if (hasData) md += `| ${rowVals.join(' | ')} |\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, `${sheet.name || 'export'}.md`);
  },

  loadDemoSalesWorkbook: () => {
    set({
      sheets: [createInitialDemoSheet()],
      activeSheetId: 'sheet_sales_1',
      selectedCell: 'E7',
      formulaBarValue: '=SUM(E2:E6)',
      statusMessage: 'Loaded Demo Enterprise Model'
    });
  },

  undoStack: [],
  redoStack: [],

  undo: () => {
    const { undoStack, redoStack, sheets } = get();
    if (!undoStack.length) return;
    const previous = undoStack[0];
    set({
      sheets: previous,
      undoStack: undoStack.slice(1),
      redoStack: [sheets, ...redoStack]
    });
  },

  redo: () => {
    const { redoStack, undoStack, sheets } = get();
    if (!redoStack.length) return;
    const next = redoStack[0];
    set({
      sheets: next,
      redoStack: redoStack.slice(1),
      undoStack: [sheets, ...undoStack]
    });
  },

  statusMessage: 'Ready (Local-Only Grid Engine)',
  setStatusMessage: (msg) => set({ statusMessage: msg })
}));

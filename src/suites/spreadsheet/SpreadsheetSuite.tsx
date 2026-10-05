// src/suites/spreadsheet/SpreadsheetSuite.tsx
import React, { useRef, useState } from 'react';
import { useSheetStore } from './store/sheetStore';
import { SPREADSHEET_DOMAINS } from './registry/sheetTaxonomy';
import { SpreadsheetCanvas } from './components/grid/SpreadsheetCanvas';
import { SpreadsheetInspector } from './components/inspector/SpreadsheetInspector';
import {
  FileSpreadsheet,
  Grid,
  FunctionSquare,
  Paintbrush,
  Filter,
  Sigma,
  BarChart3,
  FolderInput,
  Sparkles,
  History,
  Eye,
  Workflow,
  Plus,
  Trash2,
  Sliders,
  Shield,
  Download,
  Upload,
  Undo2,
  Redo2,
  Search,
  Check
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSpreadsheet,
  Grid,
  FunctionSquare,
  Paintbrush,
  Filter,
  Sigma,
  BarChart3,
  FolderInput,
  Sparkles,
  History,
  Eye,
  Workflow
};

export const SpreadsheetSuite: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeDomain = useSheetStore((s) => s.activeDomain);
  const setDomain = useSheetStore((s) => s.setDomain);
  const workbookName = useSheetStore((s) => s.workbookName);
  const sheets = useSheetStore((s) => s.sheets);
  const activeSheetId = useSheetStore((s) => s.activeSheetId);
  const setActiveSheetId = useSheetStore((s) => s.setActiveSheetId);
  const addSheet = useSheetStore((s) => s.addSheet);
  const deleteSheet = useSheetStore((s) => s.deleteSheet);

  const selectedCell = useSheetStore((s) => s.selectedCell);
  const formulaBarValue = useSheetStore((s) => s.formulaBarValue);
  const setFormulaBarValue = useSheetStore((s) => s.setFormulaBarValue);
  const commitFormulaBar = useSheetStore((s) => s.commitFormulaBar);

  const undo = useSheetStore((s) => s.undo);
  const redo = useSheetStore((s) => s.redo);
  const undoCount = useSheetStore((s) => s.undoStack.length);
  const redoCount = useSheetStore((s) => s.redoStack.length);

  const filterQuery = useSheetStore((s) => s.filterQuery);
  const setFilterQuery = useSheetStore((s) => s.setFilterQuery);

  const importCsvContent = useSheetStore((s) => s.importCsvContent);
  const exportCsv = useSheetStore((s) => s.exportCsv);
  const loadDemoSalesWorkbook = useSheetStore((s) => s.loadDemoSalesWorkbook);
  const statusMessage = useSheetStore((s) => s.statusMessage);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importCsvContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#07080A] text-zinc-200 overflow-hidden font-sans select-none">
      {/* 1. TOP SUITE APPLICATION BAR */}
      <header className="h-[50px] bg-[#0C0E14] border-b border-white/[0.06] px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider text-white uppercase">GS Sheets Studio</span>
            <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline">{workbookName}</span>
          </div>
        </div>

        {/* Global Toolbar Commands */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/5">
            <button
              onClick={undo}
              disabled={undoCount === 0}
              className={`p-1.5 rounded transition-colors ${
                undoCount > 0 ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoCount === 0}
              className={`p-1.5 rounded transition-colors ${
                redoCount > 0 ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.tsv,.txt"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 border border-white/10 text-xs font-medium transition-colors"
            title="Import CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={loadDemoSalesWorkbook}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
            title="Reload Demo Model"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Demo</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Mobile Inspector Toggle */}
          <button
            onClick={() => setMobileDrawerOpen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 xl:hidden"
            title="Toggle Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. FORMULA BAR WORKSPACE */}
      <div className="h-9 bg-[#0E1018] border-b border-white/[0.06] px-3 flex items-center gap-2 shrink-0">
        <div className="w-16 px-2 py-0.5 rounded bg-black/50 border border-white/10 text-center font-mono text-xs text-sky-400 font-bold shrink-0">
          {selectedCell}
        </div>
        <span className="text-zinc-600 font-mono text-xs font-bold">fx</span>
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => setFormulaBarValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitFormulaBar();
          }}
          placeholder="Enter formula e.g. =SUM(A1:A10) or text..."
          className="flex-1 bg-transparent border-none text-xs text-zinc-200 font-mono placeholder-zinc-600 focus:outline-none"
        />
        <button
          onClick={commitFormulaBar}
          className="p-1 rounded hover:bg-white/10 text-emerald-400"
          title="Apply Formula"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT TAXONOMY RAIL (12 DOMAINS) */}
        <nav className="w-48 bg-[#0A0C12] border-r border-white/[0.06] flex flex-col shrink-0 select-none hidden lg:flex">
          <div className="h-9 px-3 border-b border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <span>Capabilities</span>
            <span>12 DOMAINS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {SPREADSHEET_DOMAINS.map((domain) => {
              const IconComp = ICON_MAP[domain.iconName] || Grid;
              const isActive = activeDomain === domain.id;

              return (
                <button
                  key={domain.id}
                  onClick={() => setDomain(domain.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                  title={domain.description}
                >
                  <IconComp
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span className="truncate">{domain.name}</span>
                </button>
              );
            })}
          </div>

          {/* Zero Upload Privacy Badge */}
          <div className="p-3 border-t border-white/[0.04] bg-[#08090E]">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold uppercase tracking-wider">Zero Upload Privacy</span>
            </div>
            <p className="text-[9px] text-zinc-600 mt-0.5">
              100% In-Memory Formula Calculations.
            </p>
          </div>
        </nav>

        {/* CENTER VIEWPORT: SPREADSHEET CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <SpreadsheetCanvas />
        </main>

        {/* RIGHT INSPECTOR */}
        <div className="hidden xl:block shrink-0 h-full">
          <SpreadsheetInspector />
        </div>

        {/* MOBILE SLIDE-OVER */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 flex justify-end xl:hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-80 h-full bg-[#0C0E14] shadow-2xl relative">
              <SpreadsheetInspector />
            </div>
            <div className="flex-1 h-full" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}
      </div>

      {/* 4. SHEET TABS FOOTER */}
      <div className="h-8 bg-[#0B0D14] border-t border-white/[0.06] px-3 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400 shrink-0">
        {/* Sheets switcher */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {sheets.map((sheet) => (
            <div
              key={sheet.id}
              onClick={() => setActiveSheetId(sheet.id)}
              className={`px-3 py-1 rounded-t flex items-center gap-2 cursor-pointer border-b-2 text-[11px] transition-colors ${
                activeSheetId === sheet.id
                  ? 'bg-white/10 text-white font-bold border-emerald-400'
                  : 'hover:bg-white/[0.04] text-zinc-400 border-transparent'
              }`}
            >
              <span>{sheet.name}</span>
              {sheets.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(sheet.id);
                  }}
                  className="hover:text-rose-400"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => addSheet()}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
            title="Add Worksheet"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Filter search */}
        <div className="flex items-center gap-1.5 text-[11px] max-w-xs">
          <Search className="w-3 h-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter cells..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-transparent border-none text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none w-24"
          />
        </div>
      </div>

      {/* 5. APPLICATION STATUS FOOTER */}
      <footer className="h-6 bg-[#08090E] border-t border-white/[0.04] px-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-zinc-300">{statusMessage}</span>
        </div>
        <div className="flex items-center gap-3 hidden sm:flex">
          <span>Formula Engine Active</span>
          <span className="text-emerald-400">SUM / AVG / COUNT</span>
          <span>Zero Server Upload</span>
        </div>
      </footer>
    </div>
  );
};

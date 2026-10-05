// src/suites/spreadsheet/components/inspector/SpreadsheetInspector.tsx
import React, { useState } from 'react';
import { useSheetStore } from '../../store/sheetStore';
import {
  Sliders,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Plus,
  Trash2,
  BarChart3,
  Sparkles,
  Download,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { ChartType } from '../../store/types';

export const SpreadsheetInspector: React.FC = () => {
  const activeDomain = useSheetStore((s) => s.activeDomain);
  const selectedCell = useSheetStore((s) => s.selectedCell);
  const sheets = useSheetStore((s) => s.sheets);
  const activeSheetId = useSheetStore((s) => s.activeSheetId);
  const setCellFormatting = useSheetStore((s) => s.setCellFormatting);
  const clearCell = useSheetStore((s) => s.clearCell);
  const insertRow = useSheetStore((s) => s.insertRow);
  const insertColumn = useSheetStore((s) => s.insertColumn);
  const charts = useSheetStore((s) => s.charts);
  const addChart = useSheetStore((s) => s.addChart);
  const removeChart = useSheetStore((s) => s.removeChart);
  const exportCsv = useSheetStore((s) => s.exportCsv);
  const exportJson = useSheetStore((s) => s.exportJson);
  const exportMarkdown = useSheetStore((s) => s.exportMarkdown);
  const setCellValue = useSheetStore((s) => s.setCellValue);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const activeSheet = sheets.find((s) => s.id === activeSheetId);
  const cellData = selectedCell && activeSheet ? activeSheet.cells[selectedCell] : null;

  // AI Assistant action simulation
  const handleRunAi = () => {
    if (!aiPrompt.trim()) return;
    const lower = aiPrompt.toLowerCase();
    if (lower.includes('average') || lower.includes('mean')) {
      setCellValue(selectedCell, '=AVERAGE(E2:E6)');
      setAiResponse(`Generated formula =AVERAGE(E2:E6) and inserted into ${selectedCell}`);
    } else if (lower.includes('sum') || lower.includes('total')) {
      setCellValue(selectedCell, '=SUM(E2:E6)');
      setAiResponse(`Generated formula =SUM(E2:E6) and inserted into ${selectedCell}`);
    } else {
      setCellValue(selectedCell, '=C2*D2');
      setAiResponse(`Generated row calculation =C2*D2 into ${selectedCell}`);
    }
  };

  return (
    <aside className="w-80 h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col overflow-hidden text-xs text-zinc-300 select-none">
      {/* Header */}
      <div className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0F111A]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            Inspector & Controls
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
          {selectedCell}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* 1. Cell Styling & Alignment */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Cell Formatting</label>
          <div className="flex items-center gap-1 bg-[#141724] p-1 rounded border border-white/5">
            <button
              onClick={() => setCellFormatting(selectedCell, { bold: !cellData?.bold })}
              className={`p-1.5 rounded transition-colors ${
                cellData?.bold ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCellFormatting(selectedCell, { italic: !cellData?.italic })}
              className={`p-1.5 rounded transition-colors ${
                cellData?.italic ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <button
              onClick={() => setCellFormatting(selectedCell, { align: 'left' })}
              className={`p-1.5 rounded transition-colors ${
                cellData?.align === 'left' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCellFormatting(selectedCell, { align: 'center' })}
              className={`p-1.5 rounded transition-colors ${
                cellData?.align === 'center' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCellFormatting(selectedCell, { align: 'right' })}
              className={`p-1.5 rounded transition-colors ${
                cellData?.align === 'right' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Number Formats */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Number Display</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setCellFormatting(selectedCell, { format: 'currency' })}
              className={`py-1.5 rounded flex items-center justify-center gap-1 border text-xs font-mono transition-colors ${
                cellData?.format === 'currency'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>Currency</span>
            </button>
            <button
              onClick={() => setCellFormatting(selectedCell, { format: 'percentage' })}
              className={`py-1.5 rounded flex items-center justify-center gap-1 border text-xs font-mono transition-colors ${
                cellData?.format === 'percentage'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>Percent</span>
            </button>
            <button
              onClick={() => setCellFormatting(selectedCell, { format: 'general' })}
              className={`py-1.5 rounded border text-xs font-mono transition-colors ${
                !cellData?.format || cellData.format === 'general'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              General
            </button>
          </div>
        </div>

        {/* 3. AI Assistant */}
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Formula Generator</span>
          </div>
          <input
            type="text"
            placeholder="e.g. 'Calculate average revenue'..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full bg-[#141724] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleRunAi}
            className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            Synthesize Formula
          </button>
          {aiResponse && (
            <p className="text-[10px] font-mono text-emerald-300 mt-1">{aiResponse}</p>
          )}
        </div>

        {/* 4. Chart Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-mono text-zinc-400 uppercase flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Embedded Charts</span>
            </label>
            <button
              onClick={() =>
                addChart({
                  title: 'Revenue Bar Chart',
                  type: 'bar',
                  labelRange: 'A2:A6',
                  dataRange: 'E2:E6'
                })
              }
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Add Chart</span>
            </button>
          </div>

          {charts.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
            >
              <div>
                <span className="text-white font-medium block truncate max-w-[170px]">{c.title}</span>
                <span className="text-[10px] text-zinc-500">{c.type.toUpperCase()} · {c.dataRange}</span>
              </div>
              <button
                onClick={() => removeChart(c.id)}
                className="text-zinc-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* 5. Matrix Mutations (Insert Row/Col) */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Grid Manipulation</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => insertRow(activeSheet?.rowCount || 20)}
              className="py-1.5 px-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors"
            >
              + Insert Row
            </button>
            <button
              onClick={() => insertColumn(activeSheet?.colCount || 10)}
              className="py-1.5 px-2 rounded bg-white/[0.02] border border-white/5 hover:bg-white/10 text-zinc-300 text-xs transition-colors"
            >
              + Insert Column
            </button>
          </div>
        </div>

        {/* 6. Multi-format Exporters */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Export Workbook</label>
          <button
            onClick={exportCsv}
            className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={exportJson}
              className="py-1.5 px-2 rounded bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-zinc-200 transition-colors"
            >
              JSON Array
            </button>
            <button
              onClick={exportMarkdown}
              className="py-1.5 px-2 rounded bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs text-zinc-200 transition-colors"
            >
              Markdown Table
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

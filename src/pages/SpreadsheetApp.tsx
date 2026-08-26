import React, { useState } from 'react';
import { 
  Table, 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Code,
  FileText
} from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { downloadBlob } from '../lib/fileUtils';

export const SpreadsheetApp: React.FC = () => {
  const [headers, setHeaders] = useState<string[]>(['ID', 'Name', 'Category', 'Price', 'Stock', 'Status']);
  const [rows, setRows] = useState<string[][]>([
    ['101', 'Quantum Microprocessor', 'Hardware', '$450.00', '24', 'In Stock'],
    ['102', 'Neural Sensor Hub', 'Electronics', '$120.00', '8', 'Low Stock'],
    ['103', 'Optical Waveguide Kit', 'Photonics', '$890.00', '15', 'In Stock'],
    ['104', 'Cryo Cooler Node', 'Cooling', '$340.00', '0', 'Out of Stock'],
    ['105', 'Bionic Actuator Matrix', 'Robotics', '$620.00', '19', 'In Stock'],
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState<string>(',');

  // Parse CSV File into Grid
  const handleCsvUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length === 0) return;

    const detectedDelimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    setDelimiter(detectedDelimiter);

    const parsedHeaders = lines[0].split(detectedDelimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const parsedRows = lines.slice(1).map((line) => 
      line.split(detectedDelimiter).map((cell) => cell.trim().replace(/^["']|["']$/g, ''))
    );

    setHeaders(parsedHeaders);
    setRows(parsedRows);
  };

  // Convert Grid to CSV string
  const toCsvString = (): string => {
    const head = headers.join(delimiter);
    const body = rows.map((r) => r.join(delimiter)).join('\n');
    return `${head}\n${body}`;
  };

  // Convert Grid to JSON array of objects
  const toJsonString = (): string => {
    const objs = rows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h || `col_${i}`] = r[i] || '';
      });
      return obj;
    });
    return JSON.stringify(objs, null, 2);
  };

  // Convert Grid to Markdown Table
  const toMarkdownTable = (): string => {
    const head = `| ${headers.join(' | ')} |`;
    const sep = `| ${headers.map(() => '---').join(' | ')} |`;
    const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
    return `${head}\n${sep}\n${body}`;
  };

  const handleDownload = (type: 'csv' | 'json' | 'md') => {
    let content = '';
    let mime = 'text/plain';
    let ext = type;

    if (type === 'csv') {
      content = toCsvString();
      mime = 'text/csv';
    } else if (type === 'json') {
      content = toJsonString();
      mime = 'application/json';
    } else if (type === 'md') {
      content = toMarkdownTable();
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: mime });
    downloadBlob(blob, `gs-data-${Date.now()}.${ext}`);
  };

  const handleCopyFormatted = (type: 'json' | 'md') => {
    const text = type === 'json' ? toJsonString() : toMarkdownTable();
    navigator.clipboard.writeText(text);
    setCopiedFormat(type);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = [...copy[rowIndex]];
      copy[rowIndex][colIndex] = val;
      return copy;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, new Array(headers.length).fill('')]);
  };

  const handleAddColumn = () => {
    const colName = prompt('Enter Column Header Name:', `Col ${headers.length + 1}`);
    if (!colName) return;
    setHeaders((prev) => [...prev, colName]);
    setRows((prev) => prev.map((r) => [...r, '']));
  };

  const filteredRows = rows.filter((r) => 
    r.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              GS-Spreadsheet
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                CSV &amp; Table Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">100% Client-side spreadsheet grid editor, CSV cleaner, JSON converter, and Markdown exporter</p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleCopyFormatted('json')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn text-cyan-400 hover:text-white text-xs font-bold transition-all"
          >
            {copiedFormat === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'json' ? 'JSON Copied!' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={() => handleCopyFormatted('md')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn text-purple-400 hover:text-white text-xs font-bold transition-all"
          >
            {copiedFormat === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedFormat === 'md' ? 'Markdown Copied!' : 'Copy MD Table'}</span>
          </button>
        </div>
      </div>

      {/* Workspace Bar & Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upload Drop Zone Card */}
        <div className="glass-panel p-5 rounded-3xl border-slate-800 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ingest CSV File</h2>
          <FileDropZone
            accept={['.csv', '.tsv', '.txt', 'text/csv']}
            maxFiles={1}
            onFilesSelected={handleCsvUpload}
            title="Upload CSV / TSV"
            subtitle="Auto-detects delimiters"
          />
          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-slate-400">Total Rows: {rows.length}</span>
            <span className="text-slate-400">Columns: {headers.length}</span>
          </div>
        </div>

        {/* Spreadsheet Data Grid */}
        <div className="lg:col-span-3 glass-panel p-6 rounded-3xl border-slate-800 space-y-4 overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Row
              </button>
              <button
                onClick={handleAddColumn}
                className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add Column
              </button>
            </div>
          </div>

          {/* Interactive Editable Table */}
          <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-2xl neu-inset p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700/60 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-2.5 w-10 text-center">#</th>
                  {headers.map((h, i) => (
                    <th key={i} className="p-2.5 min-w-[120px]">
                      {h}
                    </th>
                  ))}
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="p-2 text-center text-slate-500 font-bold text-[10px]">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          className="w-full px-2 py-1 bg-transparent hover:bg-slate-800/60 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-200 text-xs transition-all outline-none"
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      <button
                        onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== rIdx))}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

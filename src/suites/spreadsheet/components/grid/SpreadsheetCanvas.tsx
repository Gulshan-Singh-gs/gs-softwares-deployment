// src/suites/spreadsheet/components/grid/SpreadsheetCanvas.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSheetStore } from '../../store/sheetStore';

export const SpreadsheetCanvas: React.FC = () => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sheets = useSheetStore((s) => s.sheets);
  const activeSheetId = useSheetStore((s) => s.activeSheetId);
  const selectedCell = useSheetStore((s) => s.selectedCell);
  const setSelectedCell = useSheetStore((s) => s.setSelectedCell);
  const setCellValue = useSheetStore((s) => s.setCellValue);
  const filterQuery = useSheetStore((s) => s.filterQuery);

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = (coord: string) => {
    setSelectedCell(coord);
    if (editingCell && editingCell !== coord) {
      commitEdit();
    }
  };

  const handleCellDoubleClick = (coord: string) => {
    setSelectedCell(coord);
    const cell = activeSheet?.cells[coord];
    setEditValue(cell ? cell.raw : '');
    setEditingCell(coord);
  };

  const commitEdit = () => {
    if (editingCell) {
      setCellValue(editingCell, editValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  if (!activeSheet) return null;

  const cols = Array.from({ length: activeSheet.colCount }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: activeSheet.rowCount }, (_, i) => i + 1);

  return (
    <div className="flex-1 overflow-auto bg-[#07080D] relative select-none scrollbar-thin">
      <table className="border-collapse table-fixed w-full text-xs font-mono text-zinc-300">
        {/* Sticky Column Headers (A, B, C...) */}
        <thead className="sticky top-0 z-20 bg-[#0F111A] shadow-sm">
          <tr>
            {/* Top-Left Corner Cell */}
            <th className="w-12 h-7 bg-[#141724] border-b border-r border-white/10 text-center text-[10px] text-zinc-500 font-normal">
              #
            </th>
            {cols.map((col) => (
              <th
                key={col}
                className="w-32 h-7 border-b border-r border-white/10 text-center text-[11px] font-semibold text-zinc-400 bg-[#0F111A]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        {/* Grid Body */}
        <tbody>
          {rows.map((rowNum) => {
            // Apply simple live search filter if query is set
            if (filterQuery.trim()) {
              let match = false;
              for (const col of cols) {
                const val = activeSheet.cells[`${col}${rowNum}`]?.computed;
                if (val && String(val).toLowerCase().includes(filterQuery.toLowerCase())) {
                  match = true;
                  break;
                }
              }
              if (!match && rowNum > 1) return null; // Keep header row 1
            }

            return (
              <tr key={rowNum} className="hover:bg-white/[0.02] transition-colors">
                {/* Sticky Row Number Header */}
                <td className="sticky left-0 z-10 w-12 h-7 bg-[#0E1018] border-b border-r border-white/10 text-center text-[10px] font-mono text-zinc-500">
                  {rowNum}
                </td>

                {/* Cells in Row */}
                {cols.map((col) => {
                  const coord = `${col}${rowNum}`;
                  const cell = activeSheet.cells[coord];
                  const isSelected = selectedCell === coord;
                  const isEditing = editingCell === coord;

                  // Formatting format display
                  let displayVal = cell?.computed ?? '';
                  if (cell?.format === 'currency' && typeof displayVal === 'number') {
                    displayVal = `$${displayVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                  } else if (cell?.format === 'percentage' && typeof displayVal === 'number') {
                    displayVal = `${(displayVal * 100).toFixed(1)}%`;
                  }

                  return (
                    <td
                      key={coord}
                      onClick={() => handleCellClick(coord)}
                      onDoubleClick={() => handleCellDoubleClick(coord)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : cell?.bgColor,
                        color: cell?.color,
                        textAlign: cell?.align || 'left',
                        fontWeight: cell?.bold ? 'bold' : 'normal',
                        fontStyle: cell?.italic ? 'italic' : 'normal'
                      }}
                      className={`h-7 px-2 border-b border-r border-white/[0.06] truncate cursor-cell relative ${
                        isSelected
                          ? 'outline outline-2 outline-sky-400 z-10 bg-sky-500/10'
                          : ''
                      }`}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={handleKeyDown}
                          className="w-full h-full bg-black text-white px-1 outline-none text-xs font-mono"
                        />
                      ) : (
                        <span className={cell?.error ? 'text-rose-400' : ''}>
                          {cell?.error ? cell.error : String(displayVal)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

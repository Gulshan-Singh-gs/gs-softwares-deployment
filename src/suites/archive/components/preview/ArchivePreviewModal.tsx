// src/suites/archive/components/preview/ArchivePreviewModal.tsx
import React from 'react';
import { useArchiveStore } from '../../store/archiveStore';
import { formatBytes } from '../../../../lib/fileUtils';
import { X, Download, FileText, Code, Image as ImageIcon, Binary } from 'lucide-react';

export const ArchivePreviewModal: React.FC = () => {
  const previewItem = useArchiveStore((s) => s.previewItem);
  const previewContent = useArchiveStore((s) => s.previewContent);
  const closePreview = useArchiveStore((s) => s.closePreview);
  const extractSingleItem = useArchiveStore((s) => s.extractSingleItem);

  if (!previewItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0E1118] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-200">
        {/* Header */}
        <div className="h-12 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#121520]">
          <div className="flex items-center gap-2.5 truncate">
            <span className="p-1 rounded bg-amber-500/10 text-amber-400">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold truncate text-white">{previewItem.name}</span>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              ({formatBytes(previewItem.size)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => extractSingleItem(previewItem)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={closePreview}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 bg-[#090A0F] font-mono text-xs">
          {previewContent?.imageUrl ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <img
                src={previewContent.imageUrl}
                alt={previewItem.name}
                className="max-h-[60vh] max-w-full object-contain rounded border border-white/10 shadow-lg"
              />
            </div>
          ) : (
            <pre className="text-zinc-300 whitespace-pre-wrap break-all leading-relaxed select-text font-mono text-[11px] p-2 bg-black/40 rounded border border-white/5">
              {previewContent?.text || 'No preview content available.'}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="h-9 px-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500 bg-[#0C0E14]">
          <span>CRC32: {previewItem.crc32 || 'N/A'}</span>
          <span>Security Status: Zero-Upload Isolated Sandbox</span>
        </div>
      </div>
    </div>
  );
};

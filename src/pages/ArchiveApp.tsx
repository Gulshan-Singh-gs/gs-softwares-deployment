import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Archive, 
  FolderOpen, 
  FileCheck, 
  Download, 
  Trash2, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Search,
  Eye
} from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { ProgressBar } from '../components/shared/ProgressBar';
import { formatBytes, downloadBlob, sanitizeZipPath } from '../lib/fileUtils';
import { useProcessingState } from '../hooks/useProcessingState';

interface ExtractedFile {
  name: string;
  size: number;
  dir: boolean;
  date: Date;
  blob?: Blob;
  isSafe?: boolean;
  securityNotice?: string;
}

export const ArchiveApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extract' | 'create'>('extract');
  const [archiveFile, setArchiveFile] = useState<File | null>(null);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [filesToCompress, setFilesToCompress] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [zipName, setZipName] = useState<string>('gs-archive.zip');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<{ name: string; text: string } | null>(null);

  const { state: processState, process, setProgress, reset } = useProcessingState<Blob | null>();

  // Extract / Inspect ZIP
  const handleArchiveSelect = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setArchiveFile(file);
    setPreviewContent(null);

    await process(async () => {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const list: ExtractedFile[] = [];

      const entries = Object.keys(loadedZip.files);
      let count = 0;

      for (const filename of entries) {
        const item = loadedZip.files[filename];
        const validation = sanitizeZipPath(item.name);
        list.push({
          name: validation.safe ? validation.path : item.name,
          size: (item as any)._data?.uncompressedSize || 0,
          dir: item.dir,
          date: item.date,
          isSafe: validation.safe,
          securityNotice: validation.safe ? undefined : validation.error
        });
        count++;
        setProgress(Math.round((count / entries.length) * 100));
      }

      setExtractedFiles(list);
      return null;
    });
  };

  // Download individual extracted item
  const handleExtractSingle = async (item: ExtractedFile) => {
    if (!archiveFile || item.dir) return;
    if (item.isSafe === false) {
      alert(`Extraction blocked: ${item.securityNotice || 'Zip Slip path traversal risk detected'}`);
      return;
    }
    try {
      const zip = new JSZip();
      const loaded = await zip.loadAsync(archiveFile);
      const zipEntry = loaded.file(item.name);
      if (zipEntry) {
        const blob = await zipEntry.async('blob');
        const filename = item.name.split('/').pop() || 'file';
        downloadBlob(blob, filename);
      }
    } catch (err: any) {
      alert(`Extraction failed: ${err.message}`);
    }
  };

  // Preview text content in modal
  const handlePreviewText = async (item: ExtractedFile) => {
    if (!archiveFile || item.dir) return;
    try {
      const zip = new JSZip();
      const loaded = await zip.loadAsync(archiveFile);
      const zipEntry = loaded.file(item.name);
      if (zipEntry) {
        const text = await zipEntry.async('string');
        setPreviewContent({ name: item.name, text: text.slice(0, 10000) });
      }
    } catch (err: any) {
      alert(`Preview failed: ${err.message}`);
    }
  };

  // Create ZIP from selected files
  const handleCreateZip = async () => {
    if (filesToCompress.length === 0) return;

    await process(async () => {
      const zip = new JSZip();
      let done = 0;

      for (const file of filesToCompress) {
        zip.file(file.name, file);
        done++;
        setProgress(Math.round((done / filesToCompress.length) * 50));
      }

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: compressionLevel }
        },
        (metadata) => {
          setProgress(50 + Math.round(metadata.percent / 2));
        }
      );

      downloadBlob(zipBlob, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
      return zipBlob;
    });
  };

  const filteredEntries = extractedFiles.filter((f) => 
    f.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              GS-Archive
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                ZIP Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">100% Client-side in-memory ZIP inspection, unpacking, and high-ratio multi-file packaging</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-2xl neu-inset gap-1 self-start sm:self-auto">
          <button
            onClick={() => { setActiveTab('extract'); reset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'extract'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Unpack / Inspect</span>
          </button>
          <button
            onClick={() => { setActiveTab('create'); reset(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Create ZIP</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Actions and Controls */}
        <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-6 h-fit">
          {activeTab === 'extract' ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Select ZIP Archive
              </h2>
              <FileDropZone
                accept={['.zip', 'application/zip', 'application/x-zip-compressed']}
                maxFiles={1}
                onFilesSelected={handleArchiveSelect}
                title="Drop ZIP Archive Here"
                subtitle="In-memory extraction with 0 server uploads"
              />
              {archiveFile && (
                <div className="p-3 rounded-xl neu-inset text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span className="truncate">{archiveFile.name}</span>
                    <span className="font-mono text-cyan-400">{formatBytes(archiveFile.size)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Total Entries: {extractedFiles.length}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Bundle &amp; Compress
              </h2>
              <FileDropZone
                multiple
                onFilesSelected={(files) => setFilesToCompress((prev) => [...prev, ...files])}
                title="Add Files to Bundle"
                subtitle="Select any images, documents, or data files"
              />

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Archive Filename</label>
                  <input
                    type="text"
                    value={zipName}
                    onChange={(e) => setZipName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Compression Level</span>
                    <span className="text-orange-400 font-bold font-mono">Level {compressionLevel}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Fast (1)</span>
                    <span>Standard (6)</span>
                    <span>Max Ratio (9)</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateZip}
                  disabled={filesToCompress.length === 0 || processState.status === 'processing'}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 hover:opacity-90 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Build &amp; Download ZIP ({filesToCompress.length} files)</span>
                </button>
              </div>
            </div>
          )}

          {processState.status === 'processing' && (
            <ProgressBar value={processState.progress} label={processState.error || 'Working in-memory...'} color="from-amber-500 to-orange-500" />
          )}
        </div>

        {/* Right Side: Content Inspector / Queue List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-slate-800 space-y-4 min-h-[400px]">
          {activeTab === 'extract' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Archive Contents ({filteredEntries.length} items)
                </h3>
                {extractedFiles.length > 0 && (
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter files..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {extractedFiles.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-40 space-y-2">
                  <Archive className="w-10 h-10 text-slate-400" />
                  <p className="text-xs">No archive loaded. Drop a ZIP file to inspect entries without saving to disk.</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                  {filteredEntries.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl neu-inset flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.dir ? <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" /> : <FileText className="w-4 h-4 text-cyan-400 shrink-0" />}
                        <span className="truncate font-medium text-slate-200">{item.name}</span>
                        {item.isSafe === false && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                            Path Traversal Blocked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-400">{item.dir ? 'DIR' : formatBytes(item.size)}</span>
                        {!item.dir && item.isSafe !== false && (
                          <>
                            <button
                              onClick={() => handlePreviewText(item)}
                              className="p-1.5 rounded-lg neu-btn text-slate-400 hover:text-white"
                              title="Preview text"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleExtractSingle(item)}
                              className="p-1.5 rounded-lg neu-btn text-amber-400 hover:text-amber-300"
                              title="Extract this file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Files to Archive ({filesToCompress.length})
                </h3>
                {filesToCompress.length > 0 && (
                  <button
                    onClick={() => setFilesToCompress([])}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Queue
                  </button>
                )}
              </div>

              {filesToCompress.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-40 space-y-2">
                  <Layers className="w-10 h-10 text-slate-400" />
                  <p className="text-xs">Queue is empty. Select files on the left to package a ZIP payload.</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                  {filesToCompress.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl neu-inset flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate font-medium text-slate-200">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-slate-400">{formatBytes(f.size)}</span>
                        <button
                          onClick={() => setFilesToCompress((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal for extracted text files */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[80vh] rounded-3xl p-6 border-slate-700 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white truncate">{previewContent.name}</h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 rounded-2xl neu-inset text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
              {previewContent.text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

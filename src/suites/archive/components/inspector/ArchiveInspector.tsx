// src/suites/archive/components/inspector/ArchiveInspector.tsx
import React, { useState } from 'react';
import { useArchiveStore } from '../../store/archiveStore';
import { formatBytes } from '../../../../lib/fileUtils';
import { ARCHIVE_CAPABILITIES } from '../../registry/archiveTaxonomy';
import {
  Archive,
  FileCheck,
  ShieldLock,
  Layers,
  Sliders,
  BarChart2,
  Lock,
  Key,
  KeyRound,
  Download,
  FolderOutput,
  CheckCircle2,
  AlertCircle,
  Hash,
  Terminal,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { CompressionPreset, OverwritePolicy } from '../../store/types';

export const ArchiveInspector: React.FC = () => {
  const activeDomain = useArchiveStore((s) => s.activeDomain);
  const metadata = useArchiveStore((s) => s.archiveMetadata);
  const selectedItemIds = useArchiveStore((s) => s.selectedItemIds);
  const items = useArchiveStore((s) => s.items);

  const compressionLevel = useArchiveStore((s) => s.compressionLevel);
  const compressionPreset = useArchiveStore((s) => s.compressionPreset);
  const setCompressionLevel = useArchiveStore((s) => s.setCompressionLevel);
  const setCompressionPreset = useArchiveStore((s) => s.setCompressionPreset);

  const overwritePolicy = useArchiveStore((s) => s.overwritePolicy);
  const setOverwritePolicy = useArchiveStore((s) => s.setOverwritePolicy);

  const encryptArchive = useArchiveStore((s) => s.encryptArchive);
  const setEncryptArchive = useArchiveStore((s) => s.setEncryptArchive);
  const password = useArchiveStore((s) => s.password);
  const setPassword = useArchiveStore((s) => s.setPassword);

  const comment = useArchiveStore((s) => s.comment);
  const setComment = useArchiveStore((s) => s.setComment);

  const splitVolumeMB = useArchiveStore((s) => s.splitVolumeMB);
  const setSplitVolumeMB = useArchiveStore((s) => s.setSplitVolumeMB);

  const extractSelected = useArchiveStore((s) => s.extractSelected);
  const extractAll = useArchiveStore((s) => s.extractAll);
  const testArchiveIntegrity = useArchiveStore((s) => s.testArchiveIntegrity);
  const exportCompiledArchive = useArchiveStore((s) => s.exportCompiledArchive);

  const [testResult, setTestResult] = useState<{ success?: boolean; msg?: string } | null>(null);

  // Selected item (if exactly one is selected)
  const singleSelectedItem = selectedItemIds.size === 1
    ? items.find((it) => selectedItemIds.has(it.id))
    : null;

  // Domain capabilities list
  const domainCapabilities = ARCHIVE_CAPABILITIES.filter((c) => c.domain === activeDomain);

  // Password Generator
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
  };

  const handleRunIntegrityTest = async () => {
    setTestResult({ msg: 'Testing archive contents...' });
    const res = await testArchiveIntegrity();
    setTestResult({
      success: res.success,
      msg: res.success
        ? 'Pass: 0 corruption errors. All CRC32 checksums verified.'
        : `Failed: ${res.errors.join('; ')}`
    });
  };

  return (
    <aside className="w-80 h-full bg-[#0C0E14] border-l border-white/[0.06] flex flex-col overflow-hidden text-xs text-zinc-300 select-none">
      {/* 1. INSPECTOR HEADER */}
      <div className="h-11 px-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0F111A]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white tracking-wide uppercase text-[11px]">
            Inspector & Controls
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
          {activeDomain.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* 2. DYNAMIC DOMAIN CONTROLS */}

        {/* DOMAIN: COMPRESS */}
        {activeDomain === 'compress' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <span className="text-amber-400 font-semibold block text-xs mb-1">Compression Intelligence</span>
              <p className="text-[11px] text-zinc-400">
                Choose between instant store (Level 0) or maximum Deflate compression (Level 9).
              </p>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Preset</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['FAST', 'BALANCED', 'MAXIMUM', 'STORAGE', 'WEB', 'EMAIL'] as CompressionPreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCompressionPreset(p)}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono border transition-colors ${
                      compressionPreset === p
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Level Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">Deflate Level</label>
                <span className="font-mono text-amber-400 font-bold">{compressionLevel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="9"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 bg-white/10 h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                <span>0 (Store)</span>
                <span>6 (Default)</span>
                <span>9 (Max)</span>
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN: EXTRACT */}
        {activeDomain === 'extract' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <span className="text-blue-400 font-semibold block text-xs mb-1">Extraction Engine</span>
              <p className="text-[11px] text-zinc-400">
                Unpack items with client-side path validation (anti-Zip-Slip).
              </p>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Overwrite Policy</label>
              <select
                value={overwritePolicy}
                onChange={(e) => setOverwritePolicy(e.target.value as OverwritePolicy)}
                className="w-full bg-[#141722] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none"
              >
                <option value="overwrite">Overwrite existing</option>
                <option value="skip">Skip conflicts</option>
                <option value="rename">Auto-rename conflicts</option>
                <option value="keep_newer">Keep newer files</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={extractAll}
                className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FolderOutput className="w-4 h-4" />
                <span>Extract All Files</span>
              </button>
              {selectedItemIds.size > 0 && (
                <button
                  onClick={extractSelected}
                  className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white border border-white/10 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Extract {selectedItemIds.size} Selected</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DOMAIN: SECURITY */}
        {activeDomain === 'security' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold block text-xs mb-1">Client-Side Cipher</span>
              <p className="text-[11px] text-zinc-400">
                Protect archive with AES-256 header and payload encryption.
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">AES-256 Encryption</span>
              </div>
              <input
                type="checkbox"
                checked={encryptArchive}
                onChange={(e) => setEncryptArchive(e.target.checked)}
                className="accent-emerald-500 cursor-pointer"
              />
            </div>

            {encryptArchive && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">Archive Password</label>
                  <button
                    onClick={generateSecurePassword}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong archive password..."
                  className="w-full bg-[#141722] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* DOMAIN: INTEGRITY */}
        {activeDomain === 'integrity' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-cyan-400 font-semibold block text-xs mb-1">Bitrot & Checksum Audit</span>
              <p className="text-[11px] text-zinc-400">
                Execute byte-level decompressive test across all payload sectors.
              </p>
            </div>

            <button
              onClick={handleRunIntegrityTest}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Test Archive Integrity</span>
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : testResult.success === false
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-white/5 border-white/10 text-zinc-400'
                }`}
              >
                {testResult.msg}
              </div>
            )}
          </div>
        )}

        {/* DOMAIN: SPLIT */}
        {activeDomain === 'split' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <span className="text-purple-400 font-semibold block text-xs mb-1">Multivolume Slicer</span>
              <p className="text-[11px] text-zinc-400">
                Slice payload into discrete chunks for FAT32 or email transmission limits.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1.5">Preset Volumes</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'No Split', val: 0 },
                  { label: 'Email (25 MB)', val: 25 },
                  { label: 'CD (700 MB)', val: 700 },
                  { label: 'FAT32 (4 GB)', val: 4096 }
                ].map((vol) => (
                  <button
                    key={vol.val}
                    onClick={() => setSplitVolumeMB(vol.val)}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono border transition-colors ${
                      splitVolumeMB === vol.val
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold'
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {vol.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. ARCHIVE METRICS & TELEMETRY */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-mono uppercase text-[10px]">Total Entries</span>
            <span className="font-mono text-white font-semibold">{items.length}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-mono uppercase text-[10px]">Uncompressed Size</span>
            <span className="font-mono text-white">{formatBytes(metadata.uncompressedSize)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-mono uppercase text-[10px]">Compressed Size</span>
            <span className="font-mono text-white">{formatBytes(metadata.compressedSize)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-mono uppercase text-[10px]">Space Savings</span>
            <span className="font-mono text-emerald-400 font-bold">
              {metadata.compressionRatio}%
            </span>
          </div>
        </div>

        {/* 4. SINGLE ITEM INSPECTOR (IF SELECTED) */}
        {singleSelectedItem && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
            <span className="text-[11px] font-semibold text-amber-300 block truncate">
              {singleSelectedItem.name}
            </span>
            <div className="text-[10px] font-mono space-y-1 text-zinc-400">
              <div className="flex justify-between">
                <span>Path:</span>
                <span className="truncate max-w-[140px] text-zinc-300">{singleSelectedItem.path}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="text-zinc-300">{formatBytes(singleSelectedItem.size)}</span>
              </div>
              {singleSelectedItem.crc32 && (
                <div className="flex justify-between">
                  <span>CRC32:</span>
                  <span className="text-amber-400 font-bold">{singleSelectedItem.crc32}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. ARCHIVE COMMENT */}
        <div>
          <label className="text-[11px] font-mono text-zinc-400 uppercase block mb-1">Archive Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Embed global comment into archive..."
            className="w-full bg-[#141722] border border-white/10 rounded p-2 text-xs text-zinc-300 focus:outline-none resize-none"
          />
        </div>

        {/* 6. PRIMARY EXPORT TRIGGER */}
        <div className="pt-2">
          <button
            onClick={exportCompiledArchive}
            className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Archive</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

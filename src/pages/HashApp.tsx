import React, { useState, useRef } from 'react';
import { Hash, Copy, Check, Shield, FileCheck, RefreshCw, Sparkles, AlertCircle, XCircle } from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { ProgressBar } from '../components/shared/ProgressBar';
import { generateHash } from '../lib/cryptoEngine';
import { formatBytes } from '../lib/fileUtils';
import confetti from 'canvas-confetti';

export const HashApp: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [throughput, setThroughput] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [compareHash, setCompareHash] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Manifest Verification states
  const [activeTab, setActiveTab] = useState<'single' | 'manifest'>('single');
  const [manifestText, setManifestText] = useState<string>('');
  const [manifestFiles, setManifestFiles] = useState<File[]>([]);
  const [manifestResults, setManifestResults] = useState<
    { filename: string; expected: string; actual: string; status: 'match' | 'mismatch' | 'missing' }[]
  >([]);

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    setSelectedFile(file);
    await computeHash(file, algorithm);
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setProgressPercent(0);
  };

  const computeHash = async (file: File, algo: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setProgressPercent(0);
    setThroughput(0);
    setGeneratedHash('');

    try {
      const hash = await generateHash(
        file,
        algo,
        (progress) => {
          setProgressPercent(progress.percent);
          setThroughput(progress.throughputMBs);
        },
        controller.signal
      );
      setGeneratedHash(hash);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Hash calculation error:', err);
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const handleVerifyManifest = async () => {
    if (!manifestText.trim() || manifestFiles.length === 0) return;
    setIsProcessing(true);
    const results: { filename: string; expected: string; actual: string; status: 'match' | 'mismatch' | 'missing' }[] = [];

    // Parse standard sha256sum / md5sum format: "<hash>  <filename>" or "<hash> *<filename>"
    const lines = manifestText.split('\n').filter((l) => l.trim().length > 0);
    const parsedEntries: { hash: string; name: string }[] = [];

    for (const line of lines) {
      const match = line.trim().match(/^([a-fA-F0-9]{32,128})\s+[\*]?(.+)$/);
      if (match) {
        parsedEntries.push({ hash: match[1].toLowerCase(), name: match[2].trim() });
      }
    }

    for (const entry of parsedEntries) {
      const matchedFile = manifestFiles.find(
        (f) => f.name.toLowerCase() === entry.name.toLowerCase() || entry.name.endsWith('/' + f.name)
      );

      if (!matchedFile) {
        results.push({
          filename: entry.name,
          expected: entry.hash,
          actual: 'File not loaded',
          status: 'missing',
        });
        continue;
      }

      // Determine algorithm by digest length
      let algo: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-256';
      if (entry.hash.length === 32) algo = 'MD5';
      else if (entry.hash.length === 40) algo = 'SHA-1';
      else if (entry.hash.length === 64) algo = 'SHA-256';
      else if (entry.hash.length === 128) algo = 'SHA-512';

      try {
        const computed = await generateHash(matchedFile, algo);
        const matches = computed.toLowerCase() === entry.hash.toLowerCase();
        results.push({
          filename: entry.name,
          expected: entry.hash,
          actual: computed,
          status: matches ? 'match' : 'mismatch',
        });
      } catch {
        results.push({
          filename: entry.name,
          expected: entry.hash,
          actual: 'Error computing hash',
          status: 'mismatch',
        });
      }
    }

    setManifestResults(results);
    setIsProcessing(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  const handleCopy = () => {
    if (!generatedHash) return;
    navigator.clipboard.writeText(generatedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatching = compareHash.trim()
    ? compareHash.trim().toLowerCase() === generatedHash.toLowerCase()
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/20 neu-flat shrink-0">
            <Hash className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Cryptographic Hash Generator</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Streaming Web Worker
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Flat RAM (&lt;64MB)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Verify file integrity, generate cryptographic fingerprints, and detect data tampering entirely in your browser with multi-gigabyte streaming support.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Single File</span>
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'manifest'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Verify Manifest</span>
          </button>
        </div>
      </div>

      {/* Honest Cryptographic Collision Warning */}
      {(algorithm === 'MD5' || algorithm === 'SHA-1') && activeTab === 'single' && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Integrity Only Notice ({algorithm} — Not for Cryptographic Security)</p>
            <p className="text-amber-200/80 leading-relaxed">
              {algorithm} is cryptographically broken for collision resistance. It is provided strictly for non-cryptographic checksum comparison and accidental corruption detection. For security against intentional tampering, use <strong>SHA-256</strong> or <strong>SHA-512</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Single File Checksum Generator */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Select File for Checksum Verification</span>
              </h3>

              <FileDropZone
                multiple={false}
                maxSizeMB={50000} // High limit: Streaming worker handles multi-gigabyte files
                title="Drop any file here to compute hash"
                subtitle="Streaming engine handles multi-gigabyte ISOs, video, binaries with flat memory"
                iconColor="text-cyan-400"
                onFilesSelected={handleFileSelect}
              />

              {selectedFile && (
                <div className="p-4 rounded-2xl neu-inset flex items-center justify-between gap-4">
                  <div className="space-y-0.5 truncate">
                    <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{formatBytes(selectedFile.size)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isProcessing && (
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                    <button
                      onClick={() => computeHash(selectedFile, algorithm)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      <span>Re-calculate</span>
                    </button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <ProgressBar
                    value={progressPercent}
                    label={`Streaming ${algorithm} digest${throughput > 0 ? ` (${throughput} MB/s)` : ''}...`}
                  />
                </div>
              )}

              {generatedHash && !isProcessing && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{algorithm} Digest</label>
                      <button
                        onClick={handleCopy}
                        className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Hash'}</span>
                      </button>
                    </div>
                    <div className="p-4 rounded-2xl neu-inset font-mono text-xs text-white break-all select-all leading-relaxed">
                      {generatedHash}
                    </div>
                  </div>

                  {/* Compare Checksum Box */}
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-300">Verify Against Expected Checksum</label>
                    <input
                      type="text"
                      placeholder="Paste expected hash to verify integrity..."
                      value={compareHash}
                      onChange={(e) => setCompareHash(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl neu-inset text-xs text-white font-mono"
                    />

                    {compareHash.trim() && (
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                          isMatching
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {isMatching ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Checksum Matches! The file integrity is 100% authentic and uncorrupted.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Mismatch Detected! The file content differs from the expected hash.</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Algorithm Choice & Security Info */}
          <div className="space-y-6">
            <div className="neu-card p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Hash Algorithm</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {(['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const).map((algo) => (
                  <button
                    key={algo}
                    onClick={() => {
                      setAlgorithm(algo);
                      if (selectedFile) computeHash(selectedFile, algo);
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all ${
                      algorithm === algo
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
                        : 'neu-btn text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>{algo}</div>
                    <span className="text-[9px] font-normal opacity-70">
                      {algo === 'MD5' || algo === 'SHA-1' ? 'Integrity' : 'Secure'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl neu-inset space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Streaming Web Worker Engine</span>
                </p>
                <p>
                  Digests execute off the main thread in a dedicated Web Worker using chunked stream slices, ensuring the UI remains 60FPS responsive even with 10GB+ files.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Checksum Manifest Verification */}
      {activeTab === 'manifest' && (
        <div className="space-y-6">
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Verify sha256sum / MD5SUMS Manifest</span>
              </h3>
              <span className="text-xs text-slate-400">Batch Verification</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manifest Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  1. Paste Manifest Content (<code className="text-purple-300">sha256sum.txt</code>, <code className="text-purple-300">MD5SUMS</code>)
                </label>
                <textarea
                  rows={8}
                  value={manifestText}
                  onChange={(e) => setManifestText(e.target.value)}
                  placeholder={`e.g.\n2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae  ubuntu-24.04.iso\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  checksum.txt`}
                  className="w-full p-3 rounded-2xl neu-inset text-xs font-mono text-white leading-relaxed resize-y"
                />
              </div>

              {/* Files to verify */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  2. Select Matching Files to Audit
                </label>
                <FileDropZone
                  multiple={true}
                  maxSizeMB={50000}
                  title="Drop all files matching manifest"
                  subtitle="Multiple files accepted simultaneously"
                  iconColor="text-purple-400"
                  onFilesSelected={(files) => setManifestFiles(files)}
                />
                {manifestFiles.length > 0 && (
                  <p className="text-xs text-purple-300 font-mono">
                    {manifestFiles.length} file(s) loaded for audit.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleVerifyManifest}
              disabled={isProcessing || !manifestText.trim() || manifestFiles.length === 0}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 disabled:hover:from-purple-600 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Verify Manifest Checksums ({manifestFiles.length} files)</span>
            </button>

            {/* Manifest Results Table */}
            {manifestResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audit Results</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Filename</th>
                        <th className="p-3">Expected Hash</th>
                        <th className="p-3">Actual Hash</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {manifestResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-900/30">
                          <td className="p-3 font-sans font-medium text-white">{r.filename}</td>
                          <td className="p-3 truncate max-w-xs" title={r.expected}>{r.expected}</td>
                          <td className="p-3 truncate max-w-xs" title={r.actual}>{r.actual}</td>
                          <td className="p-3 font-sans">
                            {r.status === 'match' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                Match
                              </span>
                            )}
                            {r.status === 'mismatch' && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                                Mismatch
                              </span>
                            )}
                            {r.status === 'missing' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                                Missing File
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

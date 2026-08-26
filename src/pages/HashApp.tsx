import React, { useState } from 'react';
import { Hash, Copy, Check, Shield, FileCheck, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { ProgressBar } from '../components/shared/ProgressBar';
import { generateHash } from '../lib/cryptoEngine';
import { formatBytes } from '../lib/fileUtils';
import confetti from 'canvas-confetti';

export const HashApp: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [compareHash, setCompareHash] = useState<string>('');

  const handleFileSelect = async (files: File[]) => {
    const file = files[0];
    setSelectedFile(file);
    await computeHash(file, algorithm);
  };

  const computeHash = async (file: File, algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512') => {
    setIsProcessing(true);
    setGeneratedHash('');
    try {
      const hash = await generateHash(file, algo);
      setGeneratedHash(hash);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
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
                Checksum &amp; Integrity
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Verify file integrity, generate cryptographic fingerprints, and detect data tampering entirely in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Select File for Checksum Verification</span>
            </h3>

            <FileDropZone
              multiple={false}
              maxSizeMB={500}
              title="Drop any file here to compute hash"
              subtitle="Supports software binaries, media, ISOs, documents (up to 500MB)"
              iconColor="text-cyan-400"
              onFilesSelected={handleFileSelect}
            />

            {selectedFile && (
              <div className="p-4 rounded-2xl neu-inset flex items-center justify-between gap-4">
                <div className="space-y-0.5 truncate">
                  <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{formatBytes(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => computeHash(selectedFile, algorithm)}
                  className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-calculate</span>
                </button>
              </div>
            )}

            {isProcessing && <ProgressBar value={60} label="Computing cryptographic checksum..." />}

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
                    placeholder="Paste expected SHA hash to verify integrity..."
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

        {/* Right 1 Column: Algorithm Choice & Info */}
        <div className="space-y-6">
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Hash Algorithm</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const).map((algo) => (
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
                  {algo}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl neu-inset space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cryptographic Security</span>
              </p>
              <p>
                Calculations execute on your local CPU cores via the native Web Crypto API (<code className="text-cyan-300">crypto.subtle.digest</code>) with zero server latency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

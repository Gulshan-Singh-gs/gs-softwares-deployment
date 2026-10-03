import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, Download, ShieldCheck, FileKey, AlertTriangle, Sparkles } from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { ProgressBar } from '../components/shared/ProgressBar';
import { useProcessingState } from '../hooks/useProcessingState';
import { encryptFile, decryptFile } from '../lib/cryptoEngine';
import { downloadBlob, formatBytes } from '../lib/fileUtils';
import confetti from 'canvas-confetti';

export const SecurityApp: React.FC = () => {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [stageMessage, setStageMessage] = useState<string>('');
  const { state, process, reset } = useProcessingState<Blob>();

  const handleProcess = async () => {
    if (!selectedFile) return;
    if (!password) {
      alert('Please enter a secure password.');
      return;
    }
    if (mode === 'encrypt' && password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      setStageMessage(mode === 'encrypt' ? 'Deriving key via PBKDF2 (600k rounds)...' : 'Verifying package header...');
      await process(async (updateProgress: (p: number) => void) => {
        const onProgressWithStage = (p: number, stage?: string) => {
          if (stage) setStageMessage(stage);
          updateProgress(p);
        };
        if (mode === 'encrypt') {
          return await encryptFile(selectedFile, password, onProgressWithStage);
        } else {
          return await decryptFile(selectedFile, password, onProgressWithStage);
        }
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!state.result || !selectedFile) return;
    const originalName = selectedFile.name;
    let outName = '';
    if (mode === 'encrypt') {
      outName = `${originalName}.gsenc`;
    } else {
      outName = originalName.replace(/\.gsenc$/i, '') || `decrypted_${originalName}`;
    }
    downloadBlob(state.result, outName);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/20 neu-flat shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">GS-Security &amp; Encryption</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AES-256-GCM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                .gsenc Open Format
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Client-side authenticated file encryption using AES-256-GCM &amp; PBKDF2-HMAC-SHA256 (600,000 iterations, OWASP standard). Standardized open <code className="text-emerald-400 font-mono">.gsenc</code> format guarantees zero vendor lock-in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setMode('encrypt');
              reset();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'encrypt'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypt</span>
          </button>
          <button
            onClick={() => {
              setMode('decrypt');
              reset();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'decrypt'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Decrypt</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: File Selection & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileKey className="w-4 h-4 text-emerald-400" />
              <span>1. Select Target File</span>
            </h3>

            <FileDropZone
              multiple={false}
              maxSizeMB={500}
              title={mode === 'encrypt' ? 'Drop any file to encrypt' : 'Drop .gsenc file to decrypt'}
              subtitle="Supports images, PDFs, archives, audio, video & documents (up to 500MB)"
              iconColor={mode === 'encrypt' ? 'text-emerald-400' : 'text-cyan-400'}
              onFilesSelected={(files) => {
                setSelectedFile(files[0]);
                reset();
              }}
            />

            {selectedFile && (
              <div className="p-4 rounded-2xl neu-inset flex items-center justify-between gap-4">
                <div className="space-y-0.5 truncate">
                  <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{formatBytes(selectedFile.size)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-emerald-400 shrink-0">
                  Ready
                </span>
              </div>
            )}

            {state.status === 'processing' && (
              <ProgressBar
                value={state.progress || 25}
                label={stageMessage || 'Cryptographic processing in progress...'}
                color={mode === 'encrypt' ? 'from-emerald-500 to-teal-400' : 'from-cyan-500 to-indigo-400'}
              />
            )}

            {state.status === 'error' && (
              <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Operation Failed</p>
                  <p className="opacity-90">{state.error}</p>
                </div>
              </div>
            )}

            {state.status === 'complete' && state.result && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {mode === 'encrypt' ? 'File Encrypted Successfully!' : 'File Decrypted Successfully!'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">Payload Size: {formatBytes(state.result.size)}</p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {mode === 'encrypt' ? 'Encrypted Container (.gsenc)' : 'Decrypted File'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Key & Password Control */}
        <div className="space-y-6">
          <div className="neu-card p-6 rounded-3xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>2. Security Password</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold">Master Passphrase</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter strong password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl neu-inset text-xs text-white"
                />
              </div>

              {mode === 'encrypt' && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold">Confirm Passphrase</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl neu-inset text-xs text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Show password</span>
                </label>
              </div>
            </div>

            <button
              disabled={!selectedFile || !password || state.status === 'processing'}
              onClick={handleProcess}
              className={`w-full py-4 rounded-2xl text-xs font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${
                !selectedFile || !password || state.status === 'processing'
                  ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                  : mode === 'encrypt'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 text-white shadow-cyan-600/30 hover:scale-[1.02]'
              }`}
            >
              {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{mode === 'encrypt' ? 'Encrypt File Now' : 'Decrypt File Now'}</span>
            </button>

            <div className="p-3.5 rounded-2xl neu-inset space-y-1 text-[11px] text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Knowledge Architecture</span>
              </p>
              <p>
                We do not store or transmit your password or encryption keys. If you forget your password, the data cannot be recovered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

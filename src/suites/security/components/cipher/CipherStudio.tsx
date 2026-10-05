// src/suites/security/components/cipher/CipherStudio.tsx
import React, { useState } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { downloadBlob, formatBytes } from '../../../../lib/fileUtils';
import {
  Lock,
  Unlock,
  KeyRound,
  Download,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CipherStudioProps {
  mode: 'encrypt' | 'decrypt';
}

export const CipherStudio: React.FC<CipherStudioProps> = ({ mode }) => {
  const activeFile = useSecurityStore((s) => s.activeFile);
  const isProcessing = useSecurityStore((s) => s.isProcessing);
  const progressPercent = useSecurityStore((s) => s.progressPercent);
  const statusMessage = useSecurityStore((s) => s.statusMessage);
  const encryptActiveFile = useSecurityStore((s) => s.encryptActiveFile);
  const decryptActiveFile = useSecurityStore((s) => s.decryptActiveFile);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleExecute = async () => {
    setErrorText(null);
    if (!activeFile) {
      setErrorText('Please select or drop a file first.');
      return;
    }
    if (!password.trim()) {
      setErrorText('Password cannot be empty.');
      return;
    }
    if (mode === 'encrypt' && password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    try {
      let resultBlob: Blob;
      if (mode === 'encrypt') {
        resultBlob = await encryptActiveFile(password);
      } else {
        resultBlob = await decryptActiveFile(password);
      }
      setProcessedBlob(resultBlob);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      setErrorText(err.message || 'Operation failed. Verify password or container authenticity.');
    }
  };

  const handleDownload = () => {
    if (!processedBlob || !activeFile) return;
    const baseName = activeFile.name;
    const outName = mode === 'encrypt'
      ? `${baseName}.gsenc`
      : baseName.replace(/\.gsenc$/i, '') || `decrypted_${baseName}`;

    downloadBlob(processedBlob, outName);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              mode === 'encrypt'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-teal-500/10 border border-teal-500/30 text-teal-400'
            }`}
          >
            {mode === 'encrypt' ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {mode === 'encrypt' ? 'Symmetric File Encryption' : 'Authenticated Decryption'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AES-256-GCM
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PBKDF2 600K
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === 'encrypt'
                ? 'Derives key via PBKDF2-HMAC-SHA256 (OWASP 2024 standard) and packages into authenticated .gsenc streaming container.'
                : 'Validates integrity tag (poly1305 / GCM tag) and unpacks the original payload in browser memory.'}
            </p>
          </div>
        </div>
      </div>

      {/* Target File Overview */}
      {activeFile ? (
        <div className="bg-[#12141C] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">{activeFile.name}</div>
              <div className="text-[11px] text-zinc-500 font-mono">
                {formatBytes(activeFile.size)} · {activeFile.type || 'application/octet-stream'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded border border-white/5">
            Active Buffer
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No file selected. Please open or drop a file using the top bar.</span>
        </div>
      )}

      {/* Password and Options Form */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Passphrase</span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-[11px] normal-case"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong encryption password..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {mode === 'encrypt' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Confirm Passphrase</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password to verify..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}

        {errorText && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorText}</span>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Gauge className="w-3.5 h-3.5" /> {statusMessage}
              </span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleExecute}
            disabled={isProcessing || !activeFile}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-lg ${
              mode === 'encrypt'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40'
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-950/40'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : mode === 'encrypt' ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            <span>{isProcessing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt & Seal (.gsenc)' : 'Authenticate & Decrypt'}</span>
          </button>

          {processedBlob && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Result ({formatBytes(processedBlob.size)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

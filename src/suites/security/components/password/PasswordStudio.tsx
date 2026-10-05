// src/suites/security/components/password/PasswordStudio.tsx
import React, { useEffect, useState } from 'react';
import { useSecurityStore } from '../../store/securityStore';
import { KeyRound, RefreshCw, Copy, Check, Shield, Clock, Sliders, Sparkles } from 'lucide-react';

export const PasswordStudio: React.FC = () => {
  const passwordConfig = useSecurityStore((s) => s.passwordConfig);
  const setPasswordConfig = useSecurityStore((s) => s.setPasswordConfig);
  const generatedPassword = useSecurityStore((s) => s.generatedPassword);
  const passwordAudit = useSecurityStore((s) => s.passwordAudit);
  const generatePRNGPassword = useSecurityStore((s) => s.generatePRNGPassword);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!generatedPassword) {
      generatePRNGPassword();
    }
  }, []);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Banner */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Cryptographic PRNG Token Generator</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                crypto.getRandomValues
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Shannon entropy calculation and unbiased uniform distribution token generator.
            </p>
          </div>
        </div>
      </div>

      {/* Generated Token Display */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
          <span>Cryptographic Passphrase</span>
          <button
            onClick={generatePRNGPassword}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-Roll PRNG
          </button>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
          <span className="font-mono text-base text-indigo-300 break-all select-all flex-1 tracking-wider">
            {generatedPassword}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Entropy Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> Shannon Entropy
            </span>
            <div className="text-base font-mono font-bold text-emerald-400 mt-1">
              {passwordAudit.entropyBits} bits
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Crack Resistance
            </span>
            <div className="text-sm font-semibold text-zinc-200 mt-1">
              {passwordAudit.crackTimeEstimate}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/30 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Classification</span>
            <div className="text-sm font-bold text-indigo-300 mt-1">
              {passwordAudit.strengthLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Generator Configuration Parameters */}
      <div className="bg-[#12141C] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> Generator Parameters
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>Passphrase Length:</span>
            <span className="font-mono text-indigo-400 font-bold">{passwordConfig.length} characters</span>
          </div>
          <input
            type="range"
            min={12}
            max={64}
            value={passwordConfig.length}
            onChange={(e) => setPasswordConfig({ length: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordConfig.includeUppercase}
              onChange={(e) => setPasswordConfig({ includeUppercase: e.target.checked })}
              className="rounded accent-indigo-500"
            />
            <span>Uppercase (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordConfig.includeLowercase}
              onChange={(e) => setPasswordConfig({ includeLowercase: e.target.checked })}
              className="rounded accent-indigo-500"
            />
            <span>Lowercase (a-z)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordConfig.includeNumbers}
              onChange={(e) => setPasswordConfig({ includeNumbers: e.target.checked })}
              className="rounded accent-indigo-500"
            />
            <span>Numbers (0-9)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={passwordConfig.includeSymbols}
              onChange={(e) => setPasswordConfig({ includeSymbols: e.target.checked })}
              className="rounded accent-indigo-500"
            />
            <span>Symbols (!@#$)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

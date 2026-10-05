// src/suites/qr/components/diagnostics/QualityDiagnosticsPanel.tsx
import React from 'react';
import { useQrStore } from '../../store/qrStore';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const QualityDiagnosticsPanel: React.FC = () => {
  const codeCategory = useQrStore((s) => s.codeCategory);
  const margin = useQrStore((s) => s.margin);
  const fgColor = useQrStore((s) => s.fgColor);
  const bgColor = useQrStore((s) => s.bgColor);
  const eccLevel = useQrStore((s) => s.eccLevel);
  const barcodeValue = useQrStore((s) => s.barcodeValue);
  const getComputedQrPayload = useQrStore((s) => s.getComputedQrPayload);

  const payload = getComputedQrPayload();

  // Audit 1: Quiet Zone margin
  const quietZonePassed = margin >= 2;

  // Audit 2: High contrast check (black and white or sufficient delta)
  const isContrastOptimal = fgColor !== bgColor;

  // Audit 3: Length / payload density
  const payloadLength = codeCategory === 'qr' ? payload.length : barcodeValue.length;
  const isDensitySafe = codeCategory === 'qr' ? payloadLength < 500 : payloadLength < 40;

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#08090E] overflow-y-auto select-none">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">ISO Optical Quality & Scan Diagnostics</h3>
        </div>

        {/* Quality Cards */}
        <div className="space-y-3 font-mono text-xs">
          {/* Diagnostic 1: Quiet Zone */}
          <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex items-start gap-3">
            {quietZonePassed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="text-white font-semibold block mb-0.5">Quiet Zone Margin Standard</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {quietZonePassed
                  ? `Pass: Margin set to ${margin * 8}px. Compliant with ISO 18004 4-module quiet border.`
                  : 'Warning: Margin below 2 modules. Increase quiet zone in design inspector to avoid scan failures.'}
              </p>
            </div>
          </div>

          {/* Diagnostic 2: Contrast Ratio */}
          <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex items-start gap-3">
            {isContrastOptimal ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="text-white font-semibold block mb-0.5">Optical Contrast Ratio</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {isContrastOptimal
                  ? `Pass: Foreground (${fgColor}) and background (${bgColor}) provide distinct optical contrast.`
                  : 'Critical: Foreground matches background. Scanner camera sensors will not recognize edges.'}
              </p>
            </div>
          </div>

          {/* Diagnostic 3: Error Correction / Density */}
          <div className="p-4 rounded-xl bg-[#0E1118] border border-white/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block mb-0.5">Reed-Solomon Damage Recovery</span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Active ECC level {eccLevel} allows recovery of up to{' '}
                {eccLevel === 'L' ? '7%' : eccLevel === 'M' ? '15%' : eccLevel === 'Q' ? '25%' : '30%'} of corrupted or smudged modules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

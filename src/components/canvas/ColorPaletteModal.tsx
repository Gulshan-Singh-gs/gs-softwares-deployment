import React, { useState } from 'react';
import { Palette, Sparkles, X, Check, Droplets, Sliders } from 'lucide-react';

interface ColorPaletteModalProps {
  currentColor: string;
  onSelectColor: (color: string) => void;
  onClose: () => void;
}

const PRO_MARKER_PALETTES = [
  {
    name: 'Architect & Industrial Grays',
    description: 'Neutral, warm, and cool shading scales for industrial sketchers',
    colors: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Cool Gray 1', hex: '#f1f5f9' },
      { name: 'Cool Gray 3', hex: '#cbd5e1' },
      { name: 'Cool Gray 5', hex: '#94a3b8' },
      { name: 'Cool Gray 7', hex: '#64748b' },
      { name: 'Cool Gray 9', hex: '#334155' },
      { name: 'Charcoal', hex: '#1e293b' },
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Warm Gray 3', hex: '#d6d3d1' },
      { name: 'Warm Gray 7', hex: '#78716c' }
    ]
  },
  {
    name: 'Cyberpunk & Neon Spectrum',
    description: 'Electrifying high-impact accents & neon glow highlights',
    colors: [
      { name: 'Cyber Cyan', hex: '#06b6d4' },
      { name: 'Electric Sky', hex: '#0284c7' },
      { name: 'Neon Violet', hex: '#8b5cf6' },
      { name: 'Deep Purple', hex: '#6366f1' },
      { name: 'Hyper Magenta', hex: '#ec4899' },
      { name: 'Crimson Pulse', hex: '#f43f5e' },
      { name: 'Solar Amber', hex: '#f59e0b' },
      { name: 'Acid Lemon', hex: '#eab308' },
      { name: 'Emerald Flux', hex: '#10b981' },
      { name: 'Matrix Mint', hex: '#22c55e' }
    ]
  },
  {
    name: 'Skin & Character Portrait Tones',
    description: 'Gradated flesh tones from porcelain to deep espresso',
    colors: [
      { name: 'Porcelain Bisque', hex: '#fef3c7' },
      { name: 'Peach Cream', hex: '#fed7aa' },
      { name: 'Soft Apricot', hex: '#fdba74' },
      { name: 'Warm Almond', hex: '#fb923c' },
      { name: 'Rose Ochre', hex: '#f87171' },
      { name: 'Sienna Tan', hex: '#d97706' },
      { name: 'Chestnut', hex: '#b45309' },
      { name: 'Cocoa Brown', hex: '#92400e' },
      { name: 'Deep Umber', hex: '#78350f' },
      { name: 'Espresso Roast', hex: '#451a03' }
    ]
  },
  {
    name: 'Pastel Aesthetic & Editorial',
    description: 'Subtle desaturated hues for wireframes, layouts and journals',
    colors: [
      { name: 'Pastel Lavender', hex: '#e9d5ff' },
      { name: 'Lilac Fog', hex: '#d8b4fe' },
      { name: 'Soft Sky', hex: '#bae6fd' },
      { name: 'Iceberg Blue', hex: '#7dd3fc' },
      { name: 'Pale Mint', hex: '#a7f3d0' },
      { name: 'Sage Frost', hex: '#6ee7b7' },
      { name: 'Buttercream', hex: '#fef08a' },
      { name: 'Peach Fuzz', hex: '#ffedd5' },
      { name: 'Powder Blush', hex: '#fbcfe8' },
      { name: 'Rosewater', hex: '#f472b6' }
    ]
  },
  {
    name: 'Earth, Moss & Botanical',
    description: 'Organic forest greens, moss tones, terracotta and earth ochres',
    colors: [
      { name: 'Matcha Moss', hex: '#84cc16' },
      { name: 'Olive Grove', hex: '#65a30d' },
      { name: 'Forest Pine', hex: '#15803d' },
      { name: 'Deep Evergreen', hex: '#14532d' },
      { name: 'Terracotta', hex: '#ea580c' },
      { name: 'Burnt Clay', hex: '#c2410c' },
      { name: 'Mustard Dune', hex: '#ca8a04' },
      { name: 'Raw Ochre', hex: '#a16207' },
      { name: 'Slate River', hex: '#475569' },
      { name: 'Volcanic Soil', hex: '#292524' }
    ]
  }
];

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({
  currentColor,
  onSelectColor,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'pro' | 'custom'>('pro');
  const [hexInput, setHexInput] = useState(currentColor);

  // Custom HSL state
  const [hue, setHue] = useState(190);
  const [saturation, setSaturation] = useState(90);
  const [lightness, setLightness] = useState(50);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onSelectColor(val);
    }
  };

  const updateHslColor = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    const hex = hslToHex(h, s, l);
    setHexInput(hex);
    onSelectColor(hex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="neu-card rounded-3xl p-6 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-700/40 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                Color & Professional Marker Studio
              </h3>
              <p className="text-xs text-slate-400">Curated swatch sets & custom HSL spectrum</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Color Preview + HEX Bar */}
        <div className="neu-inset p-3.5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl shadow-lg border-2 border-white/20"
              style={{ backgroundColor: currentColor }}
            />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Color</p>
              <p className="text-sm font-mono font-black text-white uppercase">{currentColor}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">HEX:</span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              placeholder="#06b6d4"
              className="w-24 px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-mono font-bold uppercase text-center focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('pro')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pro'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'neu-btn text-slate-400 hover:text-white'
            }`}
          >
            🎨 Professional Marker Sets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'neu-btn text-slate-400 hover:text-white'
            }`}
          >
            🎛 Custom HSL Sliders
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-glow">
          {activeTab === 'pro' && (
            <div className="space-y-5">
              {PRO_MARKER_PALETTES.map((set, idx) => (
                <div key={idx} className="neu-card p-4 rounded-2xl space-y-2 border border-slate-700/20">
                  <div>
                    <h4 className="text-xs font-black text-white">{set.name}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{set.description}</p>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1">
                    {set.colors.map(col => {
                      const isSelected = currentColor.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          onClick={() => {
                            onSelectColor(col.hex);
                            setHexInput(col.hex);
                          }}
                          style={{ backgroundColor: col.hex }}
                          className={`group relative h-9 rounded-xl border transition-all flex items-center justify-center ${
                            isSelected
                              ? 'scale-110 ring-2 ring-cyan-400 border-white shadow-lg'
                              : 'border-slate-700/50 hover:scale-105'
                          }`}
                          title={`${col.name} (${col.hex})`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="neu-card p-5 rounded-2xl space-y-4 border border-slate-700/20">
              {/* Hue */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Hue ({hue}°)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={e => updateHslColor(Number(e.target.value), saturation, lightness)}
                  className="w-full h-3 rounded-full cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                  }}
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Saturation ({saturation}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={saturation}
                  onChange={e => updateHslColor(hue, Number(e.target.value), lightness)}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Lightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Lightness ({lightness}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={e => updateHslColor(hue, saturation, Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-700/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// HSL to Hex helper
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

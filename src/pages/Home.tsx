import React, { useState } from 'react';
import { 
  Sparkles, 
  Image, 
  FileText, 
  Video, 
  Music, 
  FileCode, 
  Zap, 
  Cpu, 
  Lock, 
  ArrowRight,
  HardDrive,
  UploadCloud,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Wand2,
  Sliders,
  RefreshCw,
  Crop,
  RotateCw,
  Stamp,
  FileSearch,
  Palette,
  Code,
  Users,
  Camera,
  Globe,
  Share2
} from 'lucide-react';

interface HomeProps {
  onSelectApp: (appId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectApp }) => {
  const [activePersonaTab, setActivePersonaTab] = useState<'photographers' | 'developers' | 'social' | 'students'>('photographers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 12 Tools grid
  const tools = [
    {
      id: 'pixels',
      title: 'Photo Studio',
      desc: 'Unified Workspace: Crop, Adjustments, Filters & Text Overlays',
      icon: Wand2,
      subTool: 'studio'
    },
    {
      id: 'pixels',
      title: 'Smart Compressor',
      desc: 'Shrink without the squish — live A/B wipe preview',
      icon: Sliders,
      subTool: 'compress'
    },
    {
      id: 'pixels',
      title: 'Universal Converter',
      desc: 'JPG ↔ PNG ↔ WebP ↔ AVIF — all local',
      icon: RefreshCw,
      subTool: 'convert'
    },
    {
      id: 'pixels',
      title: 'Resize & Fit',
      desc: 'px • % • MP • print DPI — aspect-locked or free',
      icon: Layers,
      subTool: 'resize'
    },
    {
      id: 'pixels',
      title: 'Crop & Straighten',
      desc: 'Freeform • fixed ratios • circle avatar • horizon dial',
      icon: Crop,
      subTool: 'crop'
    },
    {
      id: 'pixels',
      title: 'Rotate & Flip',
      desc: '90° • 180° • custom angle • mirror — EXIF-aware',
      icon: RotateCw,
      subTool: 'rotate'
    },
    {
      id: 'pixels',
      title: 'Watermark & Annotate',
      desc: 'Text • logo • tiling • 3×3 anchor grid',
      icon: Stamp,
      subTool: 'watermark'
    },
    {
      id: 'pixels',
      title: 'Metadata Scrubber',
      desc: 'View & strip EXIF, GPS, camera info — privacy-first',
      icon: FileSearch,
      subTool: 'metadata'
    },
    {
      id: 'pixels',
      title: 'Background Remover',
      desc: 'On-device AI segmentation — no server upload',
      icon: Sparkles,
      subTool: 'studio'
    },
    {
      id: 'pixels',
      title: 'Image to Base64',
      desc: 'Convert images to inline Data URIs, HTML img tags & CSS',
      icon: Code,
      subTool: 'base64'
    },
    {
      id: 'pixels',
      title: 'Palette Extractor',
      desc: 'Extract dominant color palettes, HEX, RGB & CSS vars',
      icon: Palette,
      subTool: 'palette'
    },
    {
      id: 'pdf',
      title: 'Image → Document',
      desc: 'Convert images to PDF or DOCX — page layout, margins',
      icon: FileText,
      subTool: 'doc'
    }
  ];

  const comparisonRows = [
    { feature: 'File Upload Required?', gs: 'No', gsIcon: X, gsColor: 'text-rose-500', typical: 'Yes', typicalIcon: Check, typicalColor: 'text-emerald-500' },
    { feature: 'Processing Speed', gs: 'Instant', gsIcon: Zap, gsColor: 'text-indigo-500', typical: 'Depends on Internet', typicalIcon: Globe, typicalColor: 'text-amber-500' },
    { feature: 'Privacy Guarantee', gs: '100% Local', gsIcon: Lock, gsColor: 'text-emerald-500', typical: 'Server Storage', typicalIcon: ShieldCheck, typicalColor: 'text-rose-500' },
    { feature: 'Watermarks', gs: 'Never', gsIcon: X, gsColor: 'text-rose-500', typical: 'Paid Removal', typicalIcon: DollarSignFallback, typicalColor: 'text-amber-500' },
    { feature: 'Offline Access', gs: 'Yes', gsIcon: Check, gsColor: 'text-emerald-500', typical: 'No', typicalIcon: X, typicalColor: 'text-rose-500' },
    { feature: 'Max File Size', gs: 'RAM Limited', gsIcon: HardDrive, gsColor: 'text-indigo-500', typical: 'Often 5-10MB', typicalIcon: X, typicalColor: 'text-rose-500' },
  ];

  function DollarSignFallback(props: any) {
    return <span {...props}>$</span>;
  }

  const faqs = [
    {
      q: 'Is it really free?',
      a: 'Yes, every single tool is completely free. No paywalls, no pro tiers, no hidden costs. Everything runs locally in your browser using WebAssembly.'
    },
    {
      q: 'Is GS Softwares really 100% free?',
      a: 'Absolutely. We do not require account creation, credits, or subscriptions. You can process unlimited batches of images, PDFs, video, audio, and text.'
    },
    {
      q: 'Does it work offline?',
      a: 'Yes! Thanks to modern Service Workers and client-side WebAssembly, once the application loads, you can disconnect your internet and continue editing.'
    },
    {
      q: 'What formats are supported?',
      a: 'Images (JPG, PNG, WebP, AVIF, SVG), PDFs, Videos (MP4, WebM, MOV, MKV), Audio (MP3, WAV, FLAC, AAC, OGG), and Documents (Markdown, JSON, TXT).'
    },
    {
      q: 'Is my data safe?',
      a: 'Your data is 100% private. Files never leave your device memory (RAM). Nothing is ever transmitted or stored on remote servers.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. HERO SECTION WITH DROPZONE */}
      <section className="pt-6 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-flat text-indigo-600 font-bold text-xs tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
            <span>100% Local Browser Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your Files <br />
            <span className="text-gradient-loop">
              Never Leave Your Device.
            </span>
          </h1>

          <p className="text-base sm:text-xl font-medium opacity-90 max-w-xl leading-relaxed">
            Professional-grade image, PDF, video, audio & text processing running entirely in your browser. 
            No uploads, no servers, no accounts. Just drop your file and get results in milliseconds.
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold opacity-80">
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-emerald-500" /> Zero Data Transmission</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Instant Processing</span>
            <span className="flex items-center gap-1.5"><X className="w-4 h-4 text-rose-500" /> No Watermarks</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Works Offline</span>
          </div>
        </div>

        {/* Hero Interactive Dropzone Card */}
        <div className="lg:col-span-5">
          <div 
            onClick={() => onSelectApp('pixels')}
            className="neu-card p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-5 cursor-pointer group hover:scale-[1.01] transition-all min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold">Drop any file here</h3>
              <p className="text-xs opacity-75">We'll suggest the best studio tool. No uploads, ever.</p>
            </div>
            <button className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all">
              Browse Files
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS VALUE BANNER */}
      <section className="neu-card p-6 sm:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-indigo-500">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">No Upload Wait</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            Processing happens on your CPU/GPU, not our server. Even 50MB files process instantly.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-emerald-500">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">Total Privacy</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            We physically cannot see your files. No data leaves your browser tab.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-pink-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">Pure Quality</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            No hidden compression artifacts. No watermarks. No locks on any features.
          </p>
        </div>
      </section>

      {/* 3. 12 THE LOCAL STUDIO TOOLS GRID */}
      <section className="space-y-8 text-center">
        <div className="space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The Local Suite Studios</h2>
          <p className="text-sm font-medium opacity-80">
            Powerful utilities running on WebAssembly, directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {tools.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectApp(t.id)}
                className="group neu-card rounded-3xl p-6 cursor-pointer flex flex-col justify-between hover:scale-[1.01] transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-2xl neu-inset flex items-center justify-center text-indigo-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold group-hover:text-indigo-500 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs font-medium opacity-80 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-500/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-500 group-hover:underline flex items-center gap-1">
                    Try It <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. THE GS ADVANTAGE COMPARISON TABLE */}
      <section className="space-y-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The GS Softwares Advantage</h2>

        <div className="neu-card rounded-3xl overflow-hidden p-6 max-w-4xl mx-auto text-left">
          <div className="grid grid-cols-12 border-b border-slate-500/20 pb-4 text-xs font-extrabold uppercase tracking-wider opacity-75">
            <div className="col-span-5">Feature</div>
            <div className="col-span-3 text-indigo-500">GS Softwares</div>
            <div className="col-span-4">Typical Online Tools</div>
          </div>

          <div className="divide-y divide-slate-500/10 text-xs sm:text-sm font-medium">
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 py-3.5 items-center">
                <div className="col-span-5 font-bold">{row.feature}</div>
                <div className={`col-span-3 font-bold flex items-center gap-1.5 ${row.gsColor}`}>
                  <row.gsIcon className="w-4 h-4 shrink-0" />
                  <span>{row.gs}</span>
                </div>
                <div className={`col-span-4 font-semibold flex items-center gap-1.5 opacity-80 ${row.typicalColor}`}>
                  <row.typicalIcon className="w-4 h-4 shrink-0" />
                  <span>{row.typical}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUSTED BY PROFESSIONALS */}
      <section className="space-y-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trusted by Professionals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          <div className="neu-card p-6 rounded-3xl space-y-4">
            <p className="text-xs sm:text-sm font-medium italic opacity-90 leading-relaxed">
              "Finally, a tool I can use for client work without worrying about NDAs. It's crazy fast."
            </p>
            <p className="text-xs font-bold text-indigo-500">— Sarah J., Photographer</p>
          </div>

          <div className="neu-card p-6 rounded-3xl space-y-4">
            <p className="text-xs sm:text-sm font-medium italic opacity-90 leading-relaxed">
              "Compressed 50 wedding photos in seconds. No upload bar! The AVIF conversion is flawless."
            </p>
            <p className="text-xs font-bold text-indigo-500">— Mark T., Web Developer</p>
          </div>
        </div>
      </section>

      {/* 6. BUILT FOR YOU - PERSONA TABS */}
      <section className="space-y-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Built For You</h2>

        <div className="neu-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          {/* Persona Tabs Header */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 border-b border-slate-500/20 scrollbar-glow">
            {[
              { id: 'photographers', label: 'Photographers' },
              { id: 'developers', label: 'Web Developers' },
              { id: 'social', label: 'Social Media' },
              { id: 'students', label: 'Students' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePersonaTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activePersonaTab === tab.id
                    ? 'neu-inset text-indigo-500 shadow'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Persona Content */}
          <div className="text-xs sm:text-sm font-medium opacity-90 max-w-2xl mx-auto leading-relaxed py-2">
            {activePersonaTab === 'photographers' && (
              <p>
                Batch resize and watermark entire portfolios locally. Preserve EXIF data or strip it for client delivery without ever uploading a gigabyte of data.
              </p>
            )}
            {activePersonaTab === 'developers' && (
              <p>
                Convert images to WebP/AVIF, extract CSS color palettes, convert assets to Base64 strings, and validate JSON payloads instantly.
              </p>
            )}
            {activePersonaTab === 'social' && (
              <p>
                Crop to perfect 9:16 reels, 1:1 Instagram posts, compress videos for Discord 25MB limits, and burn subtitles with zero watermark.
              </p>
            )}
            {activePersonaTab === 'students' && (
              <p>
                Merge multi-source lecture PDFs, redact private notes, extract audio lectures, and format markdown essays with live reading time metrics.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="space-y-8 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h2>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="neu-card rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm font-extrabold gap-4"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" /> : <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 text-xs font-medium opacity-85 leading-relaxed border-t border-slate-500/10 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. CALL TO ACTION FOOTER BANNER */}
      <section className="neu-card p-8 sm:p-12 rounded-3xl text-center space-y-6 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Ready to regain control of your files?</h2>
        <div>
          <button
            onClick={() => onSelectApp('pixels')}
            className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-cyan-500/30 transition-transform hover:scale-105"
          >
            Start Editing Now — It's Free
          </button>
        </div>
      </section>

    </div>
  );
};

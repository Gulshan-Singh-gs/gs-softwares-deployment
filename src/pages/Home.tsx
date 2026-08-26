import React, { useState } from 'react';
import { 
  Sparkles, 
  Image, 
  FileText, 
  Video, 
  Music, 
  FileCode, 
  PenTool,
  Shapes,
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
  Share2,
  Archive,
  QrCode,
  Table,
  BookOpen,
  Presentation
} from 'lucide-react';

interface HomeProps {
  onSelectApp: (appId: string) => void;
  onSelectLanding?: (slug: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectApp, onSelectLanding }) => {
  const [activePersonaTab, setActivePersonaTab] = useState<'photographers' | 'developers' | 'social' | 'students'>('photographers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 14 Dedicated Tool Suites
  const suiteTiles = [
    {
      id: 'pixels',
      title: 'GS-Pixels',
      badge: 'Image Studio',
      desc: 'Compress, crop, resize, convert formats, extract palettes, and scrub EXIF metadata.',
      icon: Image,
      gradient: 'from-cyan-600 to-teal-500',
      toolsCount: '6 Tools'
    },
    {
      id: 'canvas',
      title: 'GS-Canvas',
      badge: 'Vector Canvas',
      desc: 'Endless freehand drawing canvas with shapes, smart smoothing, and layer management.',
      icon: PenTool,
      gradient: 'from-blue-600 to-indigo-500',
      toolsCount: '3 Tools'
    },
    {
      id: 'pdf',
      title: 'GS-PDF',
      badge: 'PDF Tools',
      desc: 'Merge, split, compress, reorder, convert, and stamp PDF files 100% offline.',
      icon: FileText,
      gradient: 'from-rose-600 to-pink-500',
      toolsCount: '5 Tools'
    },
    {
      id: 'video',
      title: 'GS-Video',
      badge: 'WASM Video',
      desc: 'Frame-accurate video trimmer, converter, GIF maker, and audio extractor powered by WebAssembly.',
      icon: Video,
      gradient: 'from-purple-600 to-indigo-600',
      toolsCount: '4 Tools'
    },
    {
      id: 'audio',
      title: 'GS-Audio',
      badge: 'WebAudio Studio',
      desc: 'High-res audio trimmer, 10-band equalizer, format converter, and spectrum visualizer.',
      icon: Music,
      gradient: 'from-pink-600 to-rose-500',
      toolsCount: '3 Tools'
    },
    {
      id: 'text',
      title: 'GS-Text',
      badge: 'Code & Diff',
      desc: 'Side-by-side diff comparator, JSON/YAML formatter, Regex testing studio, and Base64 encoder.',
      icon: FileCode,
      gradient: 'from-emerald-600 to-teal-500',
      toolsCount: '4 Tools'
    },
    {
      id: 'archive',
      title: 'GS-Archive',
      badge: 'ZIP & TAR',
      desc: 'Inspect, compress, extract, and convert multi-file ZIP and TAR archives in-memory.',
      icon: Archive,
      gradient: 'from-amber-600 to-orange-500',
      toolsCount: '3 Tools'
    },
    {
      id: 'qr',
      title: 'GS-QR & Barcode',
      badge: 'QR & Barcode Studio',
      desc: 'Generate custom branded QR codes, WiFi access cards, vCards, and Code128 barcodes.',
      icon: QrCode,
      gradient: 'from-violet-600 to-purple-500',
      toolsCount: '2 Tools'
    },
    {
      id: 'spreadsheet',
      title: 'GS-Sheets',
      badge: 'CSV & Data Grid',
      desc: 'Fast offline spreadsheet viewer, delimiter cleaner, and CSV to JSON/Markdown converter.',
      icon: Table,
      gradient: 'from-emerald-600 to-green-500',
      toolsCount: '2 Tools'
    },
    {
      id: 'ebook',
      title: 'GS-EBook',
      badge: 'EPUB Studio',
      desc: 'Distraction-free EPUB reader and Markdown-to-EPUB 3.0 publication builder.',
      icon: BookOpen,
      gradient: 'from-amber-600 to-yellow-500',
      toolsCount: '2 Tools'
    },
    {
      id: 'presentation',
      title: 'GS-Slides',
      badge: 'Deck Studio',
      desc: 'Markdown to 16:9 slide presenter mode with vector printable PDF handouts.',
      icon: Presentation,
      gradient: 'from-indigo-600 to-blue-500',
      toolsCount: '2 Tools'
    },
    {
      id: 'security',
      title: 'GS-Security',
      badge: 'AES-256',
      desc: 'Client-side PBKDF2 password-protected AES-256-GCM file encryption and decryption.',
      icon: Lock,
      gradient: 'from-blue-600 to-indigo-600',
      toolsCount: '2 Tools'
    },
    {
      id: 'hash',
      title: 'GS-Hash',
      badge: 'Checksum & Verify',
      desc: 'Compute SHA-256, SHA-512, SHA-1, and MD5 file digests for tamper verification.',
      icon: Sliders,
      gradient: 'from-teal-600 to-cyan-500',
      toolsCount: '4 Algorithims'
    },
    {
      id: 'bridge',
      title: 'GS-Bridge',
      badge: 'Transmutation',
      desc: 'Cross-domain transmutation pipeline linking video, audio, image, PDF, and OCR text.',
      icon: Sparkles,
      gradient: 'from-amber-500 via-rose-500 to-cyan-500',
      toolsCount: 'Transmute Pipeline'
    }
  ];

  const comparisonRows = [
    { feature: 'File Upload Required?', gs: 'No (100% Local)', gsIcon: X, gsColor: 'text-rose-400 font-medium', typical: 'Yes (Uploaded to Cloud)', typicalIcon: Check, typicalColor: 'text-emerald-400/90 font-medium' },
    { feature: 'Processing Speed', gs: 'Instant', gsIcon: Zap, gsColor: 'text-cyan-400 font-medium', typical: 'Slow / Queued', typicalIcon: Globe, typicalColor: 'text-amber-400/90 font-medium' },
    { feature: 'Privacy Guarantee', gs: 'Completely Private', gsIcon: Lock, gsColor: 'text-emerald-400 font-medium', typical: 'Stored on Remote Servers', typicalIcon: ShieldCheck, typicalColor: 'text-rose-400/90 font-medium' },
    { feature: 'Watermarks', gs: 'Never', gsIcon: X, gsColor: 'text-rose-400 font-medium', typical: 'Paid Removal Only', typicalIcon: DollarSignFallback, typicalColor: 'text-amber-400/90 font-medium' },
    { feature: 'Offline Access', gs: 'Yes', gsIcon: Check, gsColor: 'text-emerald-400 font-medium', typical: 'No', typicalIcon: X, typicalColor: 'text-rose-400/90 font-medium' },
    { feature: 'File Limits and Cost', gs: 'Unlimited and Free', gsIcon: HardDrive, gsColor: 'text-cyan-400 font-medium', typical: 'Strict Size Caps and Paywalls', typicalIcon: X, typicalColor: 'text-rose-400/90 font-medium' },
  ];

  function DollarSignFallback(props: any) {
    return <span {...props}>$</span>;
  }

  const faqs = [
    {
      q: 'Is this really 100% free?',
      a: 'Yes, completely free. There are no subscriptions, credits, or locked paid tiers. You can edit and convert as many files as you need without limits.'
    },
    {
      q: 'Are my files safe and private?',
      a: 'Yes. Your files are never uploaded to any remote server or cloud system. Everything is processed entirely in your device memory, meaning nobody else can access your data.'
    },
    {
      q: 'Does this work without an internet connection?',
      a: 'Yes. Once the website is loaded in your browser, you can disconnect from the internet and continue using all editing tools offline.'
    },
    {
      q: 'Will there be watermarks on my downloads?',
      a: 'Never. All exported images, PDFs, and media files are clean and free of watermarks.'
    },
    {
      q: 'Do I need to install any heavy software?',
      a: 'No. Everything runs directly inside your web browser on phones, tablets, Mac, or Windows PC. You can also select "Add to Home Screen" to use it like a standalone app.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 1. HERO SECTION WITH DROPZONE */}
      <section className="pt-6 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Your Files <br />
            <span className="text-gradient-loop">
              Never Leave Your Device.
            </span>
          </h1>

          <p className="text-base sm:text-xl font-medium opacity-90 max-w-xl leading-relaxed">
            Crop photos, convert formats, edit PDFs, trim audio, and sketch ideas with zero waiting. 
            No uploads, no servers, and no accounts. Just drop your file and get results instantly.
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs font-bold opacity-90">
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 value-badge-icon" /> 100% Private</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 value-badge-icon" /> Instant Speed</span>
            <span className="flex items-center gap-1.5"><X className="w-4 h-4 value-badge-icon" /> No Watermarks</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 value-badge-icon" /> Works Offline</span>
          </div>
        </div>

        {/* Hero Interactive Dropzone Card */}
        <div className="lg:col-span-5">
          <div 
            onClick={() => onSelectApp('pixels')}
            className="neu-card p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-5 cursor-pointer group hover:scale-[1.01] transition-all min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold">Drop any file here</h3>
              <p className="text-xs opacity-75">We will suggest the right tool instantly. Nothing ever leaves your device.</p>
            </div>
            <button className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all">
              Choose File
            </button>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS VALUE BANNER */}
      <section className="neu-card p-6 sm:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-cyan-500">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">Instant Speed</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            No upload queues or network lag. Tasks run directly on your device and finish in milliseconds.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-emerald-500">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">Complete Privacy</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            We physically cannot see your files. Everything stays strictly inside your browser tab.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-2xl neu-inset mx-auto flex items-center justify-center text-pink-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold">Zero Catches</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            No watermarks, no hidden compression limits, and no features locked behind paywalls.
          </p>
        </div>
      </section>

      {/* 3. THE STUDIO TOOL SUITES GRID */}
      <section className="space-y-8 text-center">
        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" /> 14 Complete Tool Suites
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore the Private Tool Suites</h2>
          <p className="text-sm font-medium opacity-80">
            Dedicated client-side creative, document, media, and security suites running directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 text-left">
          {suiteTiles.map((suite) => {
            const Icon = suite.icon;
            return (
              <div
                key={suite.id}
                onClick={() => onSelectApp(suite.id)}
                className="group neu-card rounded-3xl p-6 cursor-pointer flex flex-col justify-between hover:scale-[1.02] transition-all space-y-4 border border-slate-500/10 hover:border-cyan-500/30"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full neu-inset text-cyan-400">
                      {suite.badge}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold group-hover:text-cyan-500 transition-colors">
                        {suite.title}
                      </h3>
                      <span className="text-[10px] opacity-60 font-semibold font-mono">
                        {suite.toolsCount}
                      </span>
                    </div>
                    <p className="text-xs font-medium opacity-80 mt-1.5 leading-relaxed">
                      {suite.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-500/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-500 group-hover:underline flex items-center gap-1">
                    Open {suite.title} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
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

        {/* Desktop Table View */}
        <div className="neu-card rounded-3xl overflow-hidden p-4 sm:p-6 max-w-4xl mx-auto text-left hidden sm:block">
          <div className="grid grid-cols-12 border-b border-slate-500/20 pb-4 text-xs font-extrabold uppercase tracking-wider opacity-75">
            <div className="col-span-5">Feature</div>
            <div className="col-span-3 text-cyan-500">GS Softwares</div>
            <div className="col-span-4">Typical Online Tools</div>
          </div>

          <div className="divide-y divide-slate-500/10 text-xs sm:text-sm font-medium">
            {comparisonRows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 py-3.5 items-center">
                <div className="col-span-5 font-semibold opacity-80">{row.feature}</div>
                <div className="col-span-3 flex items-center gap-1.5 font-bold">
                  <row.gsIcon className="w-4 h-4 shrink-0 value-badge-icon" />
                  <span className="value-badge-text">{row.gs}</span>
                </div>
                <div className="col-span-4 flex items-center gap-1.5 font-bold opacity-90">
                  <row.typicalIcon className="w-4 h-4 shrink-0 value-badge-icon" />
                  <span className="value-badge-text">{row.typical}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3 max-w-md mx-auto">
          {comparisonRows.map((row, i) => (
            <div key={i} className="neu-card rounded-2xl p-4 text-left space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-wide opacity-70">{row.feature}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="neu-inset rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">GS Softwares</p>
                  <div className="flex items-center gap-1.5">
                    <row.gsIcon className="w-3.5 h-3.5 shrink-0 value-badge-icon" />
                    <span className="text-xs font-bold value-badge-text">{row.gs}</span>
                  </div>
                </div>
                <div className="neu-inset rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Typical Tools</p>
                  <div className="flex items-center gap-1.5">
                    <row.typicalIcon className="w-3.5 h-3.5 shrink-0 value-badge-icon" />
                    <span className="text-xs font-bold value-badge-text">{row.typical}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. BUILT FOR YOU - PERSONA TABS */}
      <section className="space-y-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tailored for How You Work</h2>

        <div className="neu-card rounded-3xl p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
          {/* Persona Tabs Header */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-2 border-b border-slate-500/20">
            {[
              { id: 'photographers', label: 'Photographers & Creators' },
              { id: 'developers', label: 'Everyday Users & Students' },
              { id: 'social', label: 'Social Media Managers' },
              { id: 'students', label: 'Professionals & Teams' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePersonaTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activePersonaTab === tab.id
                    ? 'neu-inset text-cyan-500 shadow'
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
                Batch resize and watermark photo collections on your device. Remove hidden location data before client delivery without uploading files.
              </p>
            )}
            {activePersonaTab === 'developers' && (
              <p>
                Merge lecture handouts, extract pages from study guides, trim audio recordings, and convert downloaded files into ready-to-share PDFs with one click.
              </p>
            )}
            {activePersonaTab === 'social' && (
              <p>
                Crop photos for reels and posts, trim video clips, and shrink file sizes under chat limits—completely watermark-free.
              </p>
            )}
            {activePersonaTab === 'students' && (
              <p>
                Clean sensitive client data from photos, quickly convert format types, extract color schemes, and edit documents in total privacy.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
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
                  {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-500 shrink-0" /> : <ChevronDown className="w-4 h-4 opacity-60 shrink-0" />}
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

      {/* 7. CALL TO ACTION FOOTER BANNER */}
      <section className="neu-card p-8 sm:p-12 rounded-3xl text-center space-y-6 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Ready to edit without the hassle?</h2>
        <p className="text-xs sm:text-sm font-medium opacity-80 max-w-lg mx-auto">
          No sign-up required. Choose a tool and start creating in seconds.
        </p>
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

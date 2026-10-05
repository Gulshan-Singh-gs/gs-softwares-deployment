import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  BookOpen, 
  BookPlus, 
  Download, 
  FileText, 
  Type, 
  Moon, 
  Sun, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight,
  List,
  Sparkles
} from 'lucide-react';
import { FileDropZone } from '../components/shared/FileDropZone';
import { downloadBlob } from '../lib/fileUtils';

interface Chapter {
  title: string;
  content: string;
}

export const EbookApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reader' | 'builder'>('reader');
  
  // Reader State
  const [bookTitle, setBookTitle] = useState<string>('The Art of Client-Side Engineering');
  const [bookAuthor, setBookAuthor] = useState<string>('GS Softwares Architecture');
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      title: 'Chapter 1: The Zero-Upload Paradigm',
      content: `In an era of ubiquitous cloud telemetry, the client device has been relegated to a dumb terminal. Yet modern browsers host high-performance WASM engines, Web Audio nodes, OffscreenCanvas 2D/3D pipelines, and multi-core Web Worker pools capable of teraflop compute throughput.\n\nBy executing 100% on-device, latency drops to zero, operational server costs vanish, and user privacy transitions from a legal liability into an immutable structural mathematical guarantee.`
    },
    {
      title: 'Chapter 2: Memory & Blob Lifecycle',
      content: `Client-side processing requires rigorous memory management. Because browsers do not expose explicit low-level garbage collection APIs to JavaScript code, un-revoked object URLs will leak heap space until tab crash.\n\nEvery createObjectURL invocation must be registered in a centralized lifecycle manager and purged upon component unmount.`
    },
    {
      title: 'Chapter 3: The Command Pattern & Non-Destructive Flow',
      content: `Destructive pixel manipulation destroys raw image fidelity. Storing operation deltas (crop coordinates, tone adjustments, rotation angles) allows infinite non-destructive re-rendering at export time with zero quality loss.`
    }
  ]);

  const [currentChapterIdx, setCurrentChapterIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');

  // Builder State
  const [newBookTitle, setNewBookTitle] = useState<string>('My Custom E-Book');
  const [newBookAuthor, setNewBookAuthor] = useState<string>('Author Name');
  const [rawMarkdownText, setRawMarkdownText] = useState<string>(`# Chapter 1: Introduction\n\nWrite your book in simple Markdown...\n\n# Chapter 2: Core Concepts\n\nEach # Heading 1 becomes a new chapter.`);

  // Ingest Text / Markdown or EPUB files
  const handleEpubUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (file.name.endsWith('.epub')) {
      try {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(file);
        const extractedChapters: Chapter[] = [];
        
        // Find HTML / XHTML / XML files in the EPUB archive
        for (const filename of Object.keys(loaded.files)) {
          if (filename.endsWith('.html') || filename.endsWith('.xhtml') || filename.endsWith('.htm')) {
            const rawHtml = await loaded.files[filename].async('string');
            // Basic HTML strip to plain text for reader
            const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
            const heading = doc.querySelector('h1, h2, h3')?.textContent || filename.split('/').pop() || 'Chapter';
            const body = doc.body?.textContent || '';
            if (body.trim().length > 50) {
              extractedChapters.push({ title: heading, content: body.trim() });
            }
          }
        }

        if (extractedChapters.length > 0) {
          setBookTitle(file.name.replace('.epub', ''));
          setChapters(extractedChapters);
          setCurrentChapterIdx(0);
        } else {
          alert('Could not find readable chapters in EPUB.');
        }
      } catch (e) {
        alert('Failed to parse EPUB file.');
      }
    } else {
      // Plain text or markdown
      const text = await file.text();
      const parts = text.split(/^#\s+/m).filter((p) => p.trim().length > 0);
      if (parts.length > 1) {
        const parsed = parts.map((part) => {
          const lines = part.split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          return { title, content };
        });
        setBookTitle(file.name.replace(/\.[^/.]+$/, ''));
        setChapters(parsed);
        setCurrentChapterIdx(0);
      } else {
        setBookTitle(file.name);
        setChapters([{ title: 'Chapter 1', content: text }]);
        setCurrentChapterIdx(0);
      }
    }
  };

  // Build clean EPUB 3.0 package in-memory via JSZip
  const handleGenerateEpub = async () => {
    const zip = new JSZip();
    
    // 1. mimetype (must be uncompressed first entry)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. META-INF/container.xml
    zip.file('META-INF/container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // Parse chapters from markdown
    const parts = rawMarkdownText.split(/^#\s+/m).filter((p) => p.trim().length > 0);
    const parsedChapters = parts.map((part, i) => {
      const lines = part.split('\n');
      const title = lines[0].trim() || `Chapter ${i + 1}`;
      const content = lines.slice(1).join('\n').trim();
      return { title, content, id: `chap_${i + 1}` };
    });

    // 3. OEBPS content chapters
    parsedChapters.forEach((chap) => {
      zip.file(`OEBPS/${chap.id}.xhtml`, `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${chap.title}</title></head>
<body style="font-family: serif; padding: 2em; line-height: 1.6;">
  <h1>${chap.title}</h1>
  ${chap.content.split('\n\n').map((p) => `<p>${p}</p>`).join('')}
</body>
</html>`);
    });

    // 4. OEBPS/content.opf Manifest
    const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${newBookTitle}</dc:title>
    <dc:creator>${newBookAuthor}</dc:creator>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${parsedChapters.map((c) => `<item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine toc="toc">
    ${parsedChapters.map((c) => `<itemref idref="${c.id}"/>`).join('\n    ')}
  </spine>
</package>`;
    zip.file('OEBPS/content.opf', opf);

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${newBookTitle.replace(/[^a-z0-9]/gi, '_')}.epub`);
  };

  const currentChap = chapters[currentChapterIdx] || { title: '', content: '' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 text-white shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              GS-EBook
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                EPUB Studio
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">100% Client-side EPUB e-book reader, typography styling, and Markdown-to-EPUB 3.0 creator</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl neu-inset gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'reader'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Reader Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] sm:min-h-0 ${
              activeTab === 'builder'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookPlus className="w-4 h-4" />
            <span>EPUB Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'reader' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Chapters & Settings */}
          <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-6 h-fit">
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Open E-Book File</h2>
              <FileDropZone
                accept={['.epub', '.txt', '.md', 'application/epub+zip']}
                maxFiles={1}
                onFilesSelected={handleEpubUpload}
                title="Drop EPUB or MD"
                subtitle="In-memory client-side parse"
              />
            </div>

            {/* Typography Controls */}
            <div className="space-y-4 pt-3 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Font Size</span>
                  <span className="text-amber-400 font-bold font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Font Family</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['serif', 'sans', 'mono'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontFamily(f)}
                      className={`py-1 rounded-lg text-xs font-bold uppercase ${
                        fontFamily === f ? 'bg-amber-600 text-white' : 'neu-inset text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Reader Color Tone</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'dark', label: 'Dark', bg: 'bg-black text-white' },
                    { id: 'sepia', label: 'Sepia', bg: 'bg-[#f4ecd8] text-[#5b4636]' },
                    { id: 'light', label: 'Light', bg: 'bg-white text-black' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setReaderTheme(t.id as any)}
                      className={`py-1 rounded-lg text-xs font-bold ${
                        readerTheme === t.id ? 'ring-2 ring-amber-500' : 'opacity-70'
                      } ${t.bg}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapters Table of Contents */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <List className="w-3.5 h-3.5 text-amber-400" />
                Table of Contents
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {chapters.map((chap, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentChapterIdx(idx)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all truncate block ${
                      currentChapterIdx === idx
                        ? 'bg-amber-600/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {chap.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 3 Columns: E-Book Reading Deck */}
          <div className="lg:col-span-3 glass-panel p-6 sm:p-10 rounded-3xl border-slate-800 flex flex-col justify-between space-y-8 min-h-[600px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">{bookTitle}</h2>
                  <p className="text-xs text-slate-400">{bookAuthor}</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full neu-inset text-amber-400">
                  Chapter {currentChapterIdx + 1} of {chapters.length}
                </span>
              </div>

              {/* Reader Surface */}
              <div 
                className={`p-8 rounded-2xl transition-all max-h-[500px] overflow-y-auto leading-relaxed shadow-inner ${
                  readerTheme === 'dark'
                    ? 'bg-black/60 text-slate-200'
                    : readerTheme === 'sepia'
                    ? 'bg-[#f4ecd8] text-[#433422]'
                    : 'bg-white text-slate-900'
                }`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'monospace' : 'sans-serif'
                }}
              >
                <h3 className="font-extrabold mb-6 pb-2 border-b border-current/20 text-xl">{currentChap.title}</h3>
                <div className="whitespace-pre-wrap space-y-4">
                  {currentChap.content}
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentChapterIdx((p) => Math.max(0, p - 1))}
                disabled={currentChapterIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl neu-btn text-xs font-bold text-slate-300 disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Chapter
              </button>

              <button
                onClick={() => setCurrentChapterIdx((p) => Math.min(chapters.length - 1, p + 1))}
                disabled={currentChapterIdx === chapters.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-30 shadow-md"
              >
                Next Chapter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Builder View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-3xl border-slate-800 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <BookPlus className="w-4 h-4" /> E-Book Metadata
            </h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Book Title</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Author Name</label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl neu-inset bg-transparent border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                onClick={handleGenerateEpub}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 mt-4"
              >
                <Download className="w-4 h-4" />
                <span>Build &amp; Download EPUB 3.0</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Book Content (Markdown)
              </h3>
              <span className="text-[11px] text-amber-400">Use # Chapter Heading to divide chapters</span>
            </div>
            <textarea
              rows={16}
              value={rawMarkdownText}
              onChange={(e) => setRawMarkdownText(e.target.value)}
              className="w-full p-4 rounded-2xl neu-inset bg-transparent border border-slate-700 text-xs text-slate-200 font-mono leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

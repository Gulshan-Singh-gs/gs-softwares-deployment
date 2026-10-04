/**
 * Smart file inspector to determine suited GS-Softwares studio and suggested workflows
 */

export interface FileSuggestion {
  appId: string;
  appName: string;
  reason: string;
  actions: { label: string; actionId?: string }[];
}

export function inspectFileForRouting(file: File): FileSuggestion {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const ext = name.split('.').pop() || '';

  // 1. Image
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'bmp', 'avif', 'tiff'].includes(ext)) {
    if (ext === 'svg') {
      return {
        appId: 'canvas',
        appName: 'GS-Canvas Vector Studio',
        reason: 'SVG vector graphic detected.',
        actions: [
          { label: 'Open in Vector Board' },
          { label: 'Edit Shapes & Paths' },
          { label: 'Export Raster PNG' }
        ]
      };
    }
    return {
      appId: 'pixels',
      appName: 'GS-Pixels Image Studio',
      reason: `Image file detected (${ext.toUpperCase() || 'Raster'}).`,
      actions: [
        { label: 'Compress & Optimize' },
        { label: 'Crop & Resize' },
        { label: 'Extract Color Palette' },
        { label: 'Scrub EXIF Privacy Data' }
      ]
    };
  }

  // 2. PDF
  if (mime === 'application/pdf' || ext === 'pdf') {
    return {
      appId: 'pdf',
      appName: 'GS-PDF Studio',
      reason: 'PDF Document detected.',
      actions: [
        { label: 'Merge or Split Pages' },
        { label: 'Compress PDF Size' },
        { label: 'Extract Images / Convert' },
        { label: 'Add Watermark / Stamp' }
      ]
    };
  }

  // 3. Video
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'].includes(ext)) {
    return {
      appId: 'video',
      appName: 'GS-Video Studio',
      reason: `Video container detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Trim & Cut Clips' },
        { label: 'Convert to GIF' },
        { label: 'Extract Audio Track' },
        { label: 'Mute / Strip Audio' }
      ]
    };
  }

  // 4. Audio
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) {
    return {
      appId: 'audio',
      appName: 'GS-Audio Workstation',
      reason: `Audio track detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Trim & Slice Audio' },
        { label: 'Apply 10-Band EQ' },
        { label: 'Convert Format' },
        { label: 'Visualize Waveform' }
      ]
    };
  }

  // 5. Spreadsheets / CSV / TSV / XLSX
  if (mime.includes('csv') || mime.includes('spreadsheet') || ['csv', 'tsv', 'xlsx', 'xls'].includes(ext)) {
    return {
      appId: 'spreadsheet',
      appName: 'GS-Sheets Data Grid',
      reason: `Tabular dataset detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'View & Edit Data Table' },
        { label: 'Convert to JSON / Markdown' },
        { label: 'Clean Delimiters & Nulls' }
      ]
    };
  }

  // 6. E-Books
  if (['epub', 'mobi', 'azw3'].includes(ext) || mime.includes('epub')) {
    return {
      appId: 'ebook',
      appName: 'GS-EBook Studio',
      reason: `E-Book publication file detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Read Distraction-Free' },
        { label: 'Inspect Table of Contents' },
        { label: 'Extract Chapters' }
      ]
    };
  }

  // 7. Presentations / Markdown decks
  if (['pptx', 'ppt', 'deck'].includes(ext)) {
    return {
      appId: 'presentation',
      appName: 'GS-Slides Studio',
      reason: `Presentation deck detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Present 16:9 Slides' },
        { label: 'Export Printable Handouts' }
      ]
    };
  }

  // 8. Archives
  if (['zip', 'tar', 'gz', 'bz2', '7z'].includes(ext) || mime.includes('zip') || mime.includes('tar') || mime.includes('compressed')) {
    return {
      appId: 'archive',
      appName: 'GS-Archive ZIP & TAR',
      reason: `Compressed archive package detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Inspect Archive Contents' },
        { label: 'Extract Selected Files' },
        { label: 'Convert Archive' }
      ]
    };
  }

  // 9. Text, Code, JSON, Markdown
  if (mime.startsWith('text/') || ['txt', 'md', 'json', 'yaml', 'yml', 'js', 'ts', 'html', 'css', 'py', 'sh', 'xml'].includes(ext)) {
    return {
      appId: 'text',
      appName: 'GS-Text & Code Studio',
      reason: `Text or source code file detected (${ext.toUpperCase()}).`,
      actions: [
        { label: 'Side-by-side Diff Compare' },
        { label: 'Format & Validate JSON/YAML' },
        { label: 'Regex Extraction' },
        { label: 'Base64 Encode/Decode' }
      ]
    };
  }

  // Fallback: Security / Hash / Bridge
  return {
    appId: 'security',
    appName: 'GS-Security & Integrity',
    reason: `Binary or unknown file type (${ext.toUpperCase() || 'bin'}).`,
    actions: [
      { label: 'Encrypt with AES-256-GCM' },
      { label: 'Compute Cryptographic Hash' },
      { label: 'Cross-Domain Transmutation' }
    ]
  };
}

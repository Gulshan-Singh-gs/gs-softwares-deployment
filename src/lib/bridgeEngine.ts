/**
 * GS Softwares Suite: Interdisciplinary Cross-Domain Pipeline Engine
 * Zero-Server, Client-Side Media & Document Transmutation
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import { audioBufferToWavBlob, decodeAudioFile } from './audioEngine';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

// ---------------------------------------------------------------------------
// 1. DOCUMENT & VISUAL CROSS-DOMAIN BRIDGE
// ---------------------------------------------------------------------------

/**
 * Images to PDF: Compiles multiple images (JPG, PNG, WebP) into a high-res PDF.
 */
export async function imagesToPdf(
  imageFiles: File[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const file = imageFiles[i];
    const arrayBuffer = await file.arrayBuffer();

    let embeddedImage;
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // For WebP or other formats, convert to PNG via Canvas first
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context error'));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Conversion failed'))), 'image/png');
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        img.src = url;
      });
      const pngBuffer = await pngBlob.arrayBuffer();
      embeddedImage = await pdfDoc.embedPng(pngBuffer);
    }

    const { width, height } = embeddedImage;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

/**
 * PDF to High-Res Images: Renders each page to Canvas and packages them into a ZIP.
 */
export async function pdfToImagesZip(
  pdfFile: File,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  dpiScale = 2,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const zip = new JSZip();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: dpiScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport } as any).promise;
      const mimeType = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const base64 = dataUrl.split(',')[1];
      zip.file(`page_${i}.${format}`, base64, { base64: true });
    }

    page.cleanup();
    if (onProgress) {
      onProgress(i, numPages);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Text/Markdown to PDF: Transforms raw text or Markdown notes into formatted PDF documents.
 */
export async function textToPdf(
  textContent: string,
  title = 'Document'
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595.28; // Standard A4 width
  const pageHeight = 841.89; // Standard A4 height
  const maxWidth = pageWidth - margin * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title Header
  currentPage.drawText(title, {
    x: margin,
    y: y,
    size: 18,
    font: boldFont,
    color: rgb(0.08, 0.12, 0.2),
  });
  y -= 30;

  // Split lines and handle word wrapping
  const lines = textContent.split('\n');

  for (const rawLine of lines) {
    if (y < margin + 30) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (rawLine.trim() === '') {
      y -= lineHeight;
      continue;
    }

    // Word wrap calculation
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width < maxWidth) {
        currentLine = testLine;
      } else {
        if (y < margin + 20) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        currentPage.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.15, 0.18, 0.22),
        });
        y -= lineHeight;
        currentLine = word;
      }
    }

    if (currentLine) {
      currentPage.drawText(currentLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.18, 0.22),
      });
      y -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

// ---------------------------------------------------------------------------
// 2. MEDIA TRANSMUTATION BRIDGE (Video ↔ Audio ↔ Image)
// ---------------------------------------------------------------------------

/**
 * Video to Audio Extractor: High-performance audio track extraction from video into WAV.
 * Employs direct Web Audio decoding for high-speed extraction, falling back to MediaStream capture.
 */
export async function videoToAudioBlob(
  videoFile: File,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  // Method A: Fast ArrayBuffer decode through Web Audio API
  try {
    if (onProgress) onProgress(15);
    const arrayBuffer = await videoFile.arrayBuffer();
    if (onProgress) onProgress(35);
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      if (onProgress) onProgress(75);
      const wavBlob = audioBufferToWavBlob(decodedBuffer, 16);
      if (onProgress) onProgress(100);
      audioCtx.close().catch(() => {});
      return wavBlob;
    } catch {
      audioCtx.close().catch(() => {});
    }
  } catch (err) {
    console.warn('Fast direct audio decode fallback to stream capture:', err);
  }

  // Method B: High-speed MediaStream capture fallback
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = false;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = async () => {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const streamDestination = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createMediaElementSource(video);
        source.connect(streamDestination);

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';

        const recorder = new MediaRecorder(streamDestination.stream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          URL.revokeObjectURL(url);
          audioCtx.close().catch(() => {});
          const webmBlob = new Blob(chunks, { type: mimeType });
          try {
            const decoded = await decodeAudioFile(webmBlob);
            const wavBlob = audioBufferToWavBlob(decoded, 16);
            resolve(wavBlob);
          } catch (err) {
            resolve(webmBlob);
          }
        };

        const duration = video.duration || 10;
        video.playbackRate = 4.0; // 4x turbo capture speed
        video.ontimeupdate = () => {
          if (onProgress) {
            onProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
          }
        };

        video.onended = () => {
          recorder.stop();
          if (onProgress) onProgress(100);
        };

        recorder.start(100);
        await video.play();
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video media'));
    };
  });
}

/**
 * Video Frame Extractor: Captures video frames at intervals and exports them in a ZIP.
 */
export async function videoFramesToZip(
  videoFile: File,
  fps = 1,
  onProgress?: (currentSec: number, totalSec: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const interval = 1 / fps;
        const totalFrames = Math.floor(duration * fps);
        const zip = new JSZip();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error('Canvas context failure'));
        }

        let currentTime = 0;
        let frameIndex = 1;

        const captureNextFrame = async () => {
          if (currentTime > duration) {
            URL.revokeObjectURL(url);
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            resolve(zipBlob);
            return;
          }

          video.currentTime = currentTime;
          await new Promise((r) => {
            video.onseeked = r;
          });

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
          zip.file(`frame_${String(frameIndex).padStart(4, '0')}.jpg`, base64, { base64: true });

          if (onProgress) {
            onProgress(Math.floor(currentTime), Math.floor(duration));
          }

          currentTime += interval;
          frameIndex++;
          setTimeout(captureNextFrame, 10);
        };

        captureNextFrame();
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file for frame extraction'));
    };
  });
}

// ---------------------------------------------------------------------------
// 3. MEDIA & INTELLIGENCE BRIDGE (Media ↔ Text OCR & Speech)
// ---------------------------------------------------------------------------

/**
 * Image to Text (OCR): Extracts text from images via multi-language Tesseract WASM.
 */
export async function imageToTextOCR(
  imageFile: File,
  language = 'eng',
  onProgress?: (percent: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(imageFile, language, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100), m.status);
      }
    },
  });

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

/**
 * Text to Speech (TTS): Uses native browser SpeechSynthesis API to synthesize voice.
 */
export function playTextToSpeech(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
  }
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      return reject(new Error('Speech Synthesis API is not supported in this browser.'));
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;
    if (options?.volume) utterance.volume = options.volume;

    if (options?.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.name === options.voiceName);
      if (match) utterance.voice = match;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(new Error(`Speech error: ${e.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

// ---------------------------------------------------------------------------
// 4. THE UNIVERSAL ARCHIVE HUB
// ---------------------------------------------------------------------------

/**
 * Smart ZIP Creator: Bundles arbitrary client files with real-time compression.
 */
export async function createSmartZip(
  files: File[],
  zipFilename = 'GS_Archive.zip',
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    const buffer = await file.arrayBuffer();
    zip.file(file.name, buffer);
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 50));
    }
  }

  return await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(50 + Math.round(metadata.percent * 0.5));
      }
    }
  );
}

/**
 * Smart Extract & List: Unpacks ZIP files client-side into inspectable and downloadable items.
 */
export async function extractSmartZip(
  zipFile: File
): Promise<{ name: string; blob: Blob; size: number }[]> {
  const zip = new JSZip();
  const unzipped = await zip.loadAsync(zipFile);
  const results: { name: string; blob: Blob; size: number }[] = [];

  for (const [filename, fileObj] of Object.entries(unzipped.files)) {
    if (fileObj.dir) continue;
    const blob = await fileObj.async('blob');
    results.push({
      name: filename,
      blob,
      size: blob.size,
    });
  }

  return results;
}

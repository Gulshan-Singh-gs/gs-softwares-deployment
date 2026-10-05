// src/suites/presentation/engine/pdfExport.ts
import { PDFDocument, rgb, StandardFonts } from '@cantoo/pdf-lib';
import { SlideData } from '../store/types';

export interface PdfExportOptions {
  includeHidden?: boolean;
  slideNumbers?: boolean;
}

/**
 * Generates a clean 16:9 PDF slide deck client-side with @cantoo/pdf-lib.
 * No server round-trip, 100% offline and memory-safe.
 */
export async function exportSlideDeckToPdf(
  slides: SlideData[],
  deckTitle: string,
  options: PdfExportOptions = { includeHidden: false, slideNumbers: true }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const slidesToExport = options.includeHidden
    ? slides
    : slides.filter((s) => !s.hidden);

  if (slidesToExport.length === 0) {
    throw new Error('No slides available to export.');
  }

  // Standard 16:9 PDF dimensions in points: 960 x 540 pt
  const PAGE_WIDTH = 960;
  const PAGE_HEIGHT = 540;

  for (let idx = 0; idx < slidesToExport.length; idx++) {
    const slide = slidesToExport[idx];
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    // Background fill
    // Default to dark palette
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(0.05, 0.06, 0.09) // #0D0F17
    });

    // Top accent bar
    page.drawRectangle({
      x: 60,
      y: PAGE_HEIGHT - 30,
      width: PAGE_WIDTH - 120,
      height: 3,
      color: rgb(0.38, 0.44, 0.98) // Indigo accent #6366F1
    });

    // Draw Slide Title
    const titleText = slide.title || `Slide ${idx + 1}`;
    page.drawText(titleText, {
      x: 60,
      y: PAGE_HEIGHT - 80,
      size: 28,
      font: boldFont,
      color: rgb(0.22, 0.74, 0.97) // Sky-400
    });

    // Render slide objects or markdown body
    let currentY = PAGE_HEIGHT - 130;

    for (const obj of slide.objects) {
      if (obj.content && obj.content !== slide.title) {
        // Strip markdown header indicators if already in title
        const cleanContent = obj.content
          .replace(/^#+\s+/gm, '')
          .replace(/```[a-z]*/g, '')
          .replace(/```/g, '');

        const lines = cleanContent.split('\n');
        for (const line of lines) {
          if (currentY < 60) break; // Don't overflow bottom
          const trimmed = line.trim();
          if (!trimmed) {
            currentY -= 12;
            continue;
          }

          const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const displayText = isBullet ? `• ${trimmed.substring(2)}` : trimmed;

          // Safe character encoding fallback (standard 14 fonts only support WinAnsi)
          const safeText = displayText.replace(/[^\x00-\x7F]/g, ' ');

          page.drawText(safeText.substring(0, 95), {
            x: isBullet ? 80 : 60,
            y: currentY,
            size: isBullet ? 15 : 16,
            font: regularFont,
            color: rgb(0.89, 0.91, 0.94) // zinc-200
          });

          currentY -= 24;
        }
      }
    }

    // Optional Slide Number in footer
    if (options.slideNumbers) {
      page.drawText(`${idx + 1} / ${slidesToExport.length}`, {
        x: PAGE_WIDTH - 110,
        y: 25,
        size: 11,
        font: regularFont,
        color: rgb(0.45, 0.48, 0.55) // zinc-500
      });

      page.drawText(deckTitle || 'GS-Slides Presentation', {
        x: 60,
        y: 25,
        size: 11,
        font: regularFont,
        color: rgb(0.45, 0.48, 0.55)
      });
    }
  }

  return await pdfDoc.save();
}

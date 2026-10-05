// src/suites/presentation/engine/markdownSync.ts
import { SlideData, SlideObject } from '../store/types';

/**
 * Parses markdown source into an array of structured SlideData objects.
 * Slides are separated by '---' on its own line.
 * Speaker notes can be denoted by 'Note:' or 'Notes:' or '<!-- notes: ... -->' or '?'.
 */
export function parseMarkdownToSlides(markdown: string): SlideData[] {
  // Normalize line endings
  const rawSlides = markdown
    .split(/\r?\n---\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSlides.length === 0) {
    return [
      {
        id: 'slide_1',
        title: 'Untitled Slide',
        layout: 'title',
        background: 'linear-gradient(135deg, #090A0F 0%, #0F172A 100%)',
        markdown: '# Untitled Slide\n\nEnter your presentation content here.',
        notes: '',
        hidden: false,
        objects: [
          {
            id: 'obj_title_1',
            type: 'text',
            x: 80,
            y: 200,
            width: 800,
            height: 80,
            content: 'Untitled Slide',
            style: {
              color: '#38BDF8',
              fontSize: 44,
              fontWeight: 'bold',
              textAlign: 'left'
            }
          }
        ]
      }
    ];
  }

  return rawSlides.map((slideText, idx) => {
    // Separate speaker notes if present
    let content = slideText;
    let notes = '';

    const noteSplit = content.split(/\r?\n(?:Notes?|speaker-notes):\s*/i);
    if (noteSplit.length > 1) {
      content = noteSplit[0].trim();
      notes = noteSplit.slice(1).join('\n').trim();
    } else {
      const commentMatch = content.match(/<!--\s*notes?:?([\s\S]*?)-->/i);
      if (commentMatch) {
        notes = commentMatch[1].trim();
        content = content.replace(commentMatch[0], '').trim();
      }
    }

    const lines = content.split(/\r?\n/);
    let title = `Slide ${idx + 1}`;
    const bodyLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ') && title === `Slide ${idx + 1}`) {
        title = trimmed.replace(/^#\s+/, '').trim();
      } else {
        bodyLines.push(line);
      }
    }

    // Determine layout
    const isFirstSlide = idx === 0;
    const bodyText = bodyLines.join('\n').trim();
    let layout: SlideData['layout'] = isFirstSlide ? 'title' : 'content';
    if (bodyText.startsWith('>')) {
      layout = 'quote';
    } else if (bodyText.includes('|') && bodyText.includes('---')) {
      layout = 'content';
    }

    const objects: SlideObject[] = [];

    // Title object
    objects.push({
      id: `obj_${idx}_title`,
      type: 'text',
      x: 80,
      y: isFirstSlide ? 180 : 60,
      width: 800,
      height: 70,
      content: title,
      style: {
        color: '#38BDF8',
        fontSize: isFirstSlide ? 42 : 32,
        fontWeight: 'bold',
        textAlign: 'left'
      }
    });

    // Content object
    if (bodyText) {
      objects.push({
        id: `obj_${idx}_body`,
        type: 'text',
        x: 80,
        y: isFirstSlide ? 270 : 150,
        width: 800,
        height: 320,
        content: bodyText,
        style: {
          color: '#E2E8F0',
          fontSize: 18,
          textAlign: 'left'
        }
      });
    }

    return {
      id: `slide_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      layout,
      background: isFirstSlide
        ? 'linear-gradient(135deg, #090A0F 0%, #0F172A 100%)'
        : '#0F121C',
      markdown: slideText,
      notes,
      hidden: false,
      objects
    };
  });
}

/**
 * Serializes an array of SlideData back into a coherent Markdown document.
 */
export function serializeSlidesToMarkdown(slides: SlideData[]): string {
  return slides
    .map((slide) => {
      if (slide.markdown && slide.markdown.trim().length > 0) {
        let md = slide.markdown.trim();
        // Append notes if not already embedded
        if (slide.notes && !md.toLowerCase().includes('note:')) {
          md += `\n\nNotes: ${slide.notes}`;
        }
        return md;
      }

      // Synthesize from slide objects
      let parts: string[] = [];
      if (slide.title) {
        parts.push(`# ${slide.title}`);
      }

      const otherObjects = slide.objects.filter(
        (o) => !slide.title || o.content.trim() !== slide.title.trim()
      );

      for (const obj of otherObjects) {
        if (obj.content) {
          parts.push(obj.content);
        }
      }

      if (slide.notes) {
        parts.push(`Notes: ${slide.notes}`);
      }

      return parts.join('\n\n');
    })
    .join('\n\n---\n\n');
}

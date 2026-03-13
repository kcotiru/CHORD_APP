import { ContentBlock, EnharmonicPreference, TransposeOptions } from '../types';

// ── Chromatic Scale ────────────────────────────────────────────────────────────

const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map every enharmonic spelling to its chromatic index
const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

/**
 * Regex that matches a musical chord root + optional quality.
 * Anchored to word boundaries so it won't match "V" in "[Verse]" or "A" in "[Chorus]".
 * Captures: root note (e.g. G, F#, Bb) + optional suffix (m, maj7, sus4, dim, aug, …)
 *
 * The negative lookbehind (?<!\[) combined with the \b word boundary ensures
 * chords inside bracket labels are never touched.
 */
const CHORD_REGEX = /(?<!\[)\b([A-G][#b]?)((?:maj|min|m|aug|dim|sus|add|M)?(?:\d+)?(?:\/[A-G][#b]?)?)\b/g;

// ── Parser ─────────────────────────────────────────────────────────────────────

/**
 * Splits a raw `content` string into typed content blocks.
 *
 * Section headers: lines that match `[Label]` syntax.
 * Chord lines:     all other non-empty lines.
 * Empty lines:     preserved as chord_line with empty raw_text for spacing.
 */
export function parseContent(content: string): ContentBlock[] {
  const lines = content.split('\n');
  const blocks: ContentBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\[.+\]$/.test(trimmed)) {
      blocks.push({ type: 'section_header', raw_text: trimmed });
    } else {
      // Include blank lines so the UI can preserve vertical spacing
      blocks.push({ type: 'chord_line', raw_text: line });
    }
  }

  return blocks;
}

// ── Transposer ─────────────────────────────────────────────────────────────────

/**
 * Transposes a single note name by `semitones`.
 * Respects enharmonic preference (sharp vs flat).
 */
function transposeNote(note: string, semitones: number, preference: EnharmonicPreference): string {
  const index = NOTE_TO_INDEX[note];
  if (index === undefined) return note; // unknown note — pass through

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return preference === 'flat' ? FLAT_SCALE[newIndex] : SHARP_SCALE[newIndex];
}

/**
 * Transposes all chord tokens inside a single chord-line string.
 * Bar symbols (|), dashes (-), and slashes (/) are left untouched.
 */
function transposeChordLine(
  line: string,
  semitones: number,
  preference: EnharmonicPreference
): string {
  return line.replace(CHORD_REGEX, (match, root: string, suffix: string) => {
    // Handle slash chords: e.g. G/B — transpose both root and bass note
    if (suffix.includes('/')) {
      const slashIdx = suffix.indexOf('/');
      const chordSuffix = suffix.slice(0, slashIdx);
      const bassNote = suffix.slice(slashIdx + 1);
      const transposedRoot = transposeNote(root, semitones, preference);
      const transposedBass = transposeNote(bassNote, semitones, preference);
      return `${transposedRoot}${chordSuffix}/${transposedBass}`;
    }

    return transposeNote(root, semitones, preference) + suffix;
  });
}

/**
 * Transposes an array of ContentBlocks by `semitones`.
 * Section headers are passed through unchanged.
 * root_key is also transposed and returned for storage.
 */
export function transposeContent(
  blocks: ContentBlock[],
  rootKey: string,
  options: TransposeOptions
): { blocks: ContentBlock[]; newRootKey: string } {
  const { semitones, preference = 'sharp' } = options;

  const transposedBlocks = blocks.map((block): ContentBlock => {
    if (block.type === 'section_header') return block;
    return {
      type: 'chord_line',
      raw_text: transposeChordLine(block.raw_text, semitones, preference),
    };
  });

  const newRootKey = transposeNote(rootKey, semitones, preference);

  return { blocks: transposedBlocks, newRootKey };
}

/**
 * Convenience: parse + transpose in one call.
 */
export function parseAndTranspose(
  content: string,
  rootKey: string,
  options: TransposeOptions
): { blocks: ContentBlock[]; newRootKey: string } {
  const blocks = parseContent(content);
  return transposeContent(blocks, rootKey, options);
}

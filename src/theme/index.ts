// ── Stage Lights Design System ────────────────────────────────────────────────
// Dark stage backdrop + amber chord highlights + teal section labels.
// Every design token lives here. Never hardcode values anywhere else.

export const Colors = {
  // ── Base surfaces ───────────────────────────────────────────────────────────
  background:    '#080B0F',   // Stage black
  surface:       '#0F1419',   // Card / panel
  surfaceRaised: '#161D26',   // Elevated (modals, bottom sheets)
  border:        '#1E2A36',   // Subtle divider
  borderBright:  '#2C3E50',   // Focused border

  // ── Brand accents ───────────────────────────────────────────────────────────
  chord:        '#F0C040',            // Amber — chord symbols (highest hierarchy)
  section:      '#4ECDC4',            // Teal  — section labels
  primary:      '#F0C040',
  primaryMuted: 'rgba(240,192,64,0.15)',

  // ── Text ────────────────────────────────────────────────────────────────────
  textPrimary:   '#F0EDE8',   // Warm off-white
  textSecondary: '#7A8FA6',   // Muted blue-grey
  textMuted:     '#3D5066',   // Disabled / placeholder
  textInverse:   '#080B0F',

  // ── State ───────────────────────────────────────────────────────────────────
  success:    '#52C47A',
  warning:    '#F5A623',
  error:      '#E05252',
  errorMuted: 'rgba(224,82,82,0.15)',

  // ── Tab bar ─────────────────────────────────────────────────────────────────
  tabActive:   '#F0C040',
  tabInactive: '#3D5066',
  tabBar:      '#0A0E14',
} as const;

export const Typography = {
  // SpaceMono — chord symbols & musical data (monospace = alignment perfection)
  chordFamily:     'SpaceMono_400Regular',
  chordBoldFamily: 'SpaceMono_700Bold',
  // DM Sans — all UI chrome
  uiFamily:        'DMSans_400Regular',
  uiMediumFamily:  'DMSans_500Medium',
  uiBoldFamily:    'DMSans_700Bold',
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  hero: 30,
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
} as const;

export const Radius = {
  sm:   6,
  md:   10,
  lg:   16,
  xl:   24,
  full: 999,
} as const;

// Musical keys for transpose picker — chromatic cycle
export const CHROMATIC_KEYS_MAJOR = [
  'C','C#','D','D#','E','F','F#','G','G#','A','A#','B',
] as const;

export const CHROMATIC_KEYS_MINOR = [
  'Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm',
] as const;

export const ALL_KEYS = [...CHROMATIC_KEYS_MAJOR, ...CHROMATIC_KEYS_MINOR] as const;
export type MusicalKey = typeof ALL_KEYS[number];

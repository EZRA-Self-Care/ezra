/**
 * Design tokens from the EZRA MVP Figma design. Use these instead of hard-coded
 * values so every screen stays consistent and the look can change in one place (Sprint 4).
 */

// Palette taken from the EZRA MVP design.
export const colors = {
  background: '#F7F4EE',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EFE6',
  primary: '#3E7457',
  primaryText: '#FFFFFF',
  text: '#1F3A2C',
  textMuted: '#6B7A70',
  border: '#E6E1D6',
  // Card tones: mint for encouragement, peach for gentle attention, sky for progress.
  mint: '#DDEBDF',
  peach: '#FBEAE0',
  sky: '#E3EBF3',
  danger: '#B4533A',
} as const;

/** Spacing scale in points, used for padding, margins and gaps. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

/** Corner radii. `pill` makes fully rounded buttons and chips. */
export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

/** Text styles. Spread them into a style, e.g. `{ ...typography.body, fontWeight: '600' }`. */
export const typography = {
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  heading: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.primary },
} as const;

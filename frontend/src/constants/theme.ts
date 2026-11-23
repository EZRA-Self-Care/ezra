/**
 * Design tokens from the EZRA MVP Figma design. Use these instead of hard-coded
 * values so every screen stays consistent and the look can change in one place (Sprint 4).
 */

// Warm EZRA palette used across the app.
export const colors = {
  background: '#55402C',
  surface: '#776352',
  surfaceMuted: '#776352',
  primary: '#F7DDC7',
  primaryText: '#55402C',
  text: '#FFFFFF',
  textMuted: '#F7DDC7',
  border: '#F7DDC7',
  footer: '#242424',
  // Keep every card tone within the same taupe family.
  mint: '#776352',
  peach: '#776352',
  sky: '#776352',
  danger: '#A74934',
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

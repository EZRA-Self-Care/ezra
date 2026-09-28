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
  mint: '#DDEBDF',
  peach: '#FBEAE0',
  sky: '#E3EBF3',
  danger: '#B4533A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  heading: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.primary },
} as const;

import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, disabled, variant = 'primary' }: Props) {
  const secondary = variant === 'secondary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (pressed || disabled) && styles.dimmed,
      ]}>
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondary: { backgroundColor: colors.surfaceMuted },
  dimmed: { opacity: 0.6 },
  label: { color: colors.primaryText, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  secondaryLabel: { color: colors.primary },
});

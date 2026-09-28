import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

export function Button({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
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
  dimmed: { opacity: 0.6 },
  label: { color: colors.primaryText, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
});

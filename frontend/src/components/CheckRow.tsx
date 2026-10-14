import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = {
  title: string;
  meta?: string;
  checked: boolean;
  muted?: boolean; // e.g. skipped
  disabled?: boolean;
  onToggle: () => void;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export function CheckRow({ title, meta, checked, muted, disabled, onToggle, onPress, actionLabel, onAction }: Props) {
  return (
    <View style={[styles.row, muted && styles.muted]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={title}
        hitSlop={8}
        disabled={disabled}
        onPress={onToggle}
        style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </Pressable>
      <Pressable style={styles.text} onPress={onPress} disabled={!onPress}>
        <Text style={[styles.title, checked && styles.titleDone]}>{title}</Text>
        {meta ? <Text style={typography.caption}>{meta}</Text> : null}
      </Pressable>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" hitSlop={8} disabled={disabled} onPress={onAction}>
          <Text style={typography.label}>{actionLabel.toUpperCase()}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  muted: { opacity: 0.55 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  tick: { color: colors.primaryText, fontSize: 13, fontWeight: '700' },
  text: { flex: 1, gap: 2 },
  title: { ...typography.body, fontWeight: '600' },
  titleDone: { color: colors.textMuted },
});

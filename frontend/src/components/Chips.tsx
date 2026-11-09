import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Option<T> = { label: string; value: T };

type Props<T> = {
  options: Option<T>[];
  isSelected: (value: T) => boolean;
  onPress: (value: T) => void;
};

/**
 * Row of selectable pills, used for filters, due dates, goals and schedule days.
 * Generic over the value type, so options can hold strings, numbers, dates or arrays.
 * The parent decides what's selected via `isSelected`, so it works for single- and multi-select.
 */
export function Chips<T>({ options, isSelected, onPress }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const selected = isSelected(o.value);
        return (
          <Pressable
            key={o.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onPress(o.value)}
            style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary },
  label: { fontSize: 12, fontWeight: '700', color: colors.primary },
  labelSelected: { color: colors.primaryText },
});

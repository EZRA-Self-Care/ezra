import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

// Height of the tallest bar; the others scale relative to the busiest day.
const MAX_HEIGHT = 64;

// Completed actions per day. One series, so no legend; every bar is labeled.
// `today` labels the last bar "Today", so the rolling 7 days are easy to place.
export function WeekBars({ days, today }: { days: { date: string; done: number }[]; today?: string }) {
  // At least 1, so an empty week doesn't divide by zero.
  const max = Math.max(1, ...days.map((d) => d.done));
  return (
    <View style={styles.row} accessibilityRole="summary">
      {days.map((d) => {
        // Parse as a local date; new Date('YYYY-MM-DD') would be UTC and could show the wrong weekday.
        const [y, m, day] = d.date.split('-').map(Number);
        const date = new Date(y, m - 1, day);
        const isToday = d.date === today;
        // Short names ("Tue") rather than single letters, which made T/T and S/S ambiguous.
        const label = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });
        const spoken = isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'long' });
        return (
          <View key={d.date} style={styles.col} accessible accessibilityLabel={`${spoken}: ${d.done} completed`}>
            <Text style={styles.value}>{d.done > 0 ? d.done : ''}</Text>
            <View style={styles.track}>
              {/* Days with nothing done get a 2px stub so the baseline stays visible. */}
              <View style={[styles.bar, { height: d.done > 0 ? (d.done / max) * MAX_HEIGHT : 2 }]} />
            </View>
            <Text style={[typography.caption, isToday && styles.today]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, marginTop: spacing.sm },
  col: { flex: 1, alignItems: 'center', gap: spacing.xs },
  value: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
    minHeight: 16,
  },
  track: {
    height: MAX_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  today: { color: colors.text, fontWeight: '700' },
  bar: {
    width: '60%',
    maxWidth: 20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});

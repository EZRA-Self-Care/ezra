import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatDue } from '@/lib/dates';
import type { Task } from '@/types/models';

type Props = {
  task: Task;
  today: string;
  disabled?: boolean;
  onToggle: () => void;
  onPress: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

// A task in the list: name, description, and when it was added and last updated.
// Tap the card to edit it; tap the checkbox to complete it.
export function TaskCard({ task, today, disabled, onToggle, onPress }: Props) {
  const due = task.due_date ? formatDue(task.due_date, today) : 'Any time';
  const carried = due === 'Carried over' && !task.done;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[task.title, task.notes, task.done ? 'Done' : due].filter(Boolean).join(', ')}
      accessibilityHint="Opens the task to edit or delete it"
      onPress={onPress}
      style={({ pressed }) => [styles.card, task.done && styles.done, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done, disabled }}
          accessibilityLabel={`Complete ${task.title}`}
          hitSlop={10}
          disabled={disabled}
          onPress={onToggle}
          style={[styles.box, task.done && styles.boxChecked]}>
          {task.done ? <Text style={styles.tick}>✓</Text> : null}
        </Pressable>
        <Text style={[typography.heading, styles.name, task.done && styles.nameDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={[styles.due, carried && styles.dueCarried]}>{task.done ? 'Done' : due}</Text>
      </View>

      {task.notes ? (
        <Text style={styles.description} numberOfLines={3}>
          {task.notes}
        </Text>
      ) : null}

      <View style={styles.dates}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>ADDED</Text>
          <Text style={styles.dateValue}>{formatDate(task.created_at)}</Text>
        </View>

        {task.updated_at ? (
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>UPDATED</Text>
            <Text style={styles.dateValue}>{formatDate(task.updated_at)}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  done: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
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
  name: { flex: 1 },
  nameDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  due: {
    ...typography.label,
    fontSize: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  dueCarried: { backgroundColor: colors.peach },
  description: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  dates: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateLabel: typography.label,
  dateValue: typography.caption,
});

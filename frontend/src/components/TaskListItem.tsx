import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatAdded, formatDue, formatUpdated } from '@/lib/dates';
import type { Task } from '@/types/models';

type Props = {
  task: Task;
  today: string;
  disabled?: boolean;
  onToggle: () => void;
  onPress: () => void;
};

// One row in the task list: name, a short description preview, and when it's due,
// added and last updated. Tapping the row opens the task; the checkbox completes it.
export function TaskListItem({ task, today, disabled, onToggle, onPress }: Props) {
  const due = task.due_date ? formatDue(task.due_date, today) : 'Any time';
  const carried = due === 'Carried over' && !task.done;
  const updated = formatUpdated(task.updated_at);
  const dates = [formatAdded(task.created_at), updated].filter(Boolean).join(' · ');

  return (
    <View style={[styles.row, task.done && styles.done]}>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[task.title, task.notes, due, dates].filter(Boolean).join('. ')}
        accessibilityHint="Opens the task to edit or delete it"
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}>
        <View style={styles.text}>
          <Text style={[styles.title, task.done && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
          {task.notes ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.notes}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={[styles.due, carried && styles.dueCarried]}>{task.done ? 'Done' : due}</Text>
            <Text style={styles.dates} numberOfLines={1}>
              {dates}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
  },
  done: { opacity: 0.6 },
  box: {
    width: 22,
    height: 22,
    marginTop: 1,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  tick: { color: colors.primaryText, fontSize: 13, fontWeight: '700' },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: spacing.sm },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 4 },
  title: { ...typography.body, fontWeight: '600' },
  titleDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  description: { ...typography.caption, color: colors.text, lineHeight: 17 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
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
  dates: { ...typography.caption, fontSize: 11, flexShrink: 1 },
  chevron: { fontSize: 22, color: colors.textMuted, marginLeft: spacing.sm },
});

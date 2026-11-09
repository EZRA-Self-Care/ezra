import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { SwipeableTask } from '@/components/SwipeableTask';
import { TaskCard } from '@/components/TaskCard';
import { UndoToast } from '@/components/UndoToast';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { addDays, formatDue, localDate } from '@/lib/dates';
import { useApi, useMutation } from '@/lib/useApi';
import type { Goal, Task } from '@/types/models';

/** The three views of the task list, shown as chips at the top. */
type Filter = 'today' | 'upcoming' | 'all';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'TODAY', value: 'today' },
  { label: 'UPCOMING', value: 'upcoming' },
  { label: 'ALL', value: 'all' },
];

// What to say when a filter has no tasks, so the empty screen still suggests a next step.
const EMPTY: Record<Filter, { title: string; description: string }> = {
  today: { title: 'Nothing due today', description: 'Enjoy the space, or add one small step.' },
  upcoming: { title: 'Nothing coming up', description: 'Tasks with a future date will show here.' },
  all: {
    title: 'No tasks yet',
    description: 'Add a small, practical step. It can belong to a goal or stand on its own.',
  },
};

const TONES = [colors.peach, colors.mint, colors.sky];
// Tone follows the goal, not its position, so a group keeps its colour across filters.
const toneFor = (goalId: number | null) => (goalId === null ? colors.surfaceMuted : TONES[goalId % TONES.length]);

/** Whether a task belongs in the given filter. Completed tasks only appear under All. */
function matches(task: Task, filter: Filter, today: string) {
  if (filter === 'all') return true;
  if (task.done) return false;
  // Undated to-dos are "anytime", so they belong in Today.
  if (filter === 'today') return !task.due_date || task.due_date <= today;
  return !!task.due_date && task.due_date > today;
}

/**
 * UI-02: Task list. Loads tasks and goals from the backend, then groups the tasks by goal
 * (plus an "Other to-dos" group) under the selected filter. Tasks render as TaskCards;
 * the checkbox completes a task and tapping the card opens it for editing.
 */
export default function ListsScreen() {
  const today = useMemo(() => localDate(), []);
  const [filter, setFilter] = useState<Filter>('today');
  const load = useCallback(() => Promise.all([api.tasks.list(), api.goals.list()]), []);
  const { data, setData, error, loading, reload } = useApi<[Task[], Goal[]]>(load);
  const mutation = useMutation();

  // The last swipe-left, kept so the toast's Undo can put the old due date back.
  const [moved, setMoved] = useState<{ task: Task; message: string } | null>(null);
  const clearMoved = useCallback(() => setMoved(null), []);

  // Swap in the saved task from the response so the list updates without a full reload.
  // The updater form keeps two quick swipes in a row from overwriting each other.
  const replace = (saved: Task) =>
    setData((d) => (d ? [d[0].map((t) => (t.id === saved.id ? saved : t)), d[1]] : d));

  const toggle = async (task: Task) => {
    const saved = await mutation.run(() => api.tasks.update(task.id, { done: !task.done }));
    if (saved) replace(saved);
  };

  // Swipe left: push the task back one day. Overdue or undated tasks land on tomorrow;
  // future ones move a day later, so a swipe never pulls a task earlier.
  const pushBack = async (task: Task) => {
    const from = task.due_date && task.due_date > today ? task.due_date : today;
    const due = addDays(from, 1);
    const saved = await mutation.run(() => api.tasks.update(task.id, { due_date: due }));
    if (!saved) return;
    replace(saved);
    const when = formatDue(due, today);
    setMoved({ task, message: when === 'Tomorrow' ? 'Moved to tomorrow. No pressure.' : `Moved to ${when}.` });
  };

  const undoMove = async () => {
    if (!moved) return;
    const saved = await mutation.run(() => api.tasks.update(moved.task.id, { due_date: moved.task.due_date }));
    if (saved) replace(saved);
  };

  // Number of tasks in each filter, shown on the chips (e.g. "TODAY 3").
  const counts = useMemo(() => {
    const tasks = data?.[0] ?? [];
    return Object.fromEntries(
      FILTERS.map((f) => [f.value, tasks.filter((t) => matches(t, f.value, today)).length]),
    ) as Record<Filter, number>;
  }, [data, today]);

  // Build the visible groups: one per goal that has matching tasks, then "Other to-dos".
  const groups = useMemo(() => {
    if (!data) return [];
    const [tasks, goals] = data;
    const visible = tasks.filter((t) => matches(t, filter, today));
    const byGoal = goals
      .map((g) => ({
        key: `g${g.id}`,
        title: g.title,
        tone: toneFor(g.id),
        tasks: visible.filter((t) => t.goal_id === g.id),
      }))
      .filter((g) => g.tasks.length > 0);
    // One-off tasks, plus any tied to an archived goal.
    const goalIds = new Set(goals.map((g) => g.id));
    const other = visible.filter((t) => t.goal_id === null || !goalIds.has(t.goal_id));
    const groups = other.length
      ? [...byGoal, { key: 'other', title: 'Other to-dos', tone: toneFor(null), tasks: other }]
      : byGoal;
    // Open tasks first within each group; completed ones sink to the bottom.
    return groups.map((g) => ({ ...g, tasks: [...g.tasks].sort((a, b) => Number(a.done) - Number(b.done)) }));
  }, [data, filter, today]);

  const addTask = () => router.push('/tasks/new');

  return (
    // Outer view so the Undo toast can float over the scrolling list.
    <View style={styles.root}>
      <Screen title="My to-do lists" subtitle="Simple actions, organized your way.">
        <Chips
          // Show counts only once data has loaded, so the chips don't flash "0".
          options={FILTERS.map((f) => ({ ...f, label: data ? `${f.label} ${counts[f.value]}` : f.label }))}
          isSelected={(v) => v === filter}
          onPress={setFilter}
        />
        <Button label="+ Add task" onPress={addTask} />
        {loading ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {mutation.error ? <ErrorState message={mutation.error} /> : null}

        {data && groups.length === 0 ? (
          <EmptyState title={EMPTY[filter].title} description={EMPTY[filter].description} />
        ) : null}

        {groups.map((group) => (
          <View key={group.key} style={[styles.group, { backgroundColor: group.tone }]}>
            <View style={styles.groupHeader}>
              <Text style={[typography.heading, styles.groupTitle]} numberOfLines={1}>
                {group.title}
              </Text>
              <Text style={typography.caption}>
                {group.tasks.filter((t) => t.done).length} of {group.tasks.length} done
              </Text>
            </View>
            {group.tasks.map((t) => (
              // Finished tasks can only be swiped right (to undo); there's nothing to push back.
              <SwipeableTask
                key={t.id}
                rightLabel={t.done ? 'Undo' : 'Done'}
                onSwipeRight={() => toggle(t)}
                onSwipeLeft={t.done ? undefined : () => pushBack(t)}
                disabled={mutation.busy}>
                <TaskCard
                  task={t}
                  today={today}
                  disabled={mutation.busy}
                  onToggle={() => toggle(t)}
                  onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: String(t.id) } })}
                />
              </SwipeableTask>
            ))}
          </View>
        ))}

        {groups.length > 0 ? (
          <Text style={typography.caption}>
            Swipe right to finish, left to move to tomorrow. Tap a task to edit or delete it.
          </Text>
        ) : null}
      </Screen>
      {moved ? <UndoToast message={moved.message} onUndo={undoMove} onDismiss={clearMoved} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  group: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  groupTitle: { flexShrink: 1 },
});

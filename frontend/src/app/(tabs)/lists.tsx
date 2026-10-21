import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { TaskListItem } from '@/components/TaskListItem';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { localDate } from '@/lib/dates';
import { useApi, useMutation } from '@/lib/useApi';
import type { Goal, Task } from '@/types/models';

type Filter = 'today' | 'upcoming' | 'all';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'TODAY', value: 'today' },
  { label: 'UPCOMING', value: 'upcoming' },
  { label: 'ALL', value: 'all' },
];

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

function matches(task: Task, filter: Filter, today: string) {
  if (filter === 'all') return true;
  if (task.done) return false;
  // Undated to-dos are "anytime", so they belong in Today.
  if (filter === 'today') return !task.due_date || task.due_date <= today;
  return !!task.due_date && task.due_date > today;
}

// UI-02: To-do list CRUD, grouped by goal
export default function ListsScreen() {
  const today = useMemo(() => localDate(), []);
  const [filter, setFilter] = useState<Filter>('today');
  const load = useCallback(() => Promise.all([api.tasks.list(), api.goals.list()]), []);
  const { data, setData, error, loading, reload } = useApi<[Task[], Goal[]]>(load);
  const mutation = useMutation();

  const toggle = async (task: Task) => {
    const saved = await mutation.run(() => api.tasks.update(task.id, { done: !task.done }));
    if (saved && data) setData([data[0].map((t) => (t.id === saved.id ? saved : t)), data[1]]);
  };

  const counts = useMemo(() => {
    const tasks = data?.[0] ?? [];
    return Object.fromEntries(
      FILTERS.map((f) => [f.value, tasks.filter((t) => matches(t, f.value, today)).length]),
    ) as Record<Filter, number>;
  }, [data, today]);

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

  const addTask = () => router.push({ pathname: '/tasks/[id]', params: { id: 'new' } });

  return (
    <Screen title="My to-do lists" subtitle="Simple actions, organized your way.">
      <Chips
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
            <TaskListItem
              key={t.id}
              task={t}
              today={today}
              disabled={mutation.busy}
              onToggle={() => toggle(t)}
              onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: String(t.id) } })}
            />
          ))}
        </View>
      ))}

      {groups.length > 0 ? (
        <Text style={typography.caption}>Tap a task to edit, reschedule or delete it.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  groupTitle: { flexShrink: 1 },
});

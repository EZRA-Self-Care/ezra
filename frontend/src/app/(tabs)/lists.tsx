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

const TONES = [colors.surfaceMuted, colors.peach, colors.mint, colors.sky];

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

  const groups = useMemo(() => {
    if (!data) return [];
    const [tasks, goals] = data;
    const visible = tasks.filter((t) => matches(t, filter, today));
    const byGoal = goals
      .map((g) => ({ key: `g${g.id}`, title: g.title, tasks: visible.filter((t) => t.goal_id === g.id) }))
      .filter((g) => g.tasks.length > 0);
    // One-off tasks, plus any tied to an archived goal.
    const goalIds = new Set(goals.map((g) => g.id));
    const other = visible.filter((t) => t.goal_id === null || !goalIds.has(t.goal_id));
    return other.length ? [...byGoal, { key: 'other', title: 'Other to-dos', tasks: other }] : byGoal;
  }, [data, filter, today]);

  return (
    <Screen title="My to-do lists" subtitle="Simple actions, organized your way.">
      <Chips options={FILTERS} isSelected={(v) => v === filter} onPress={setFilter} />
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {mutation.error ? <ErrorState message={mutation.error} /> : null}

      {data && groups.length === 0 ? (
        <EmptyState
          title={filter === 'upcoming' ? 'Nothing coming up' : 'Nothing here yet'}
          description="Add a small, practical step. It can belong to a goal or stand on its own."
        />
      ) : null}

      {groups.map((group, i) => (
        <View key={group.key} style={[styles.group, { backgroundColor: TONES[i % TONES.length] }]}>
          <Text style={typography.heading}>{group.title}</Text>
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

      <Button label="+ Add task" onPress={() => router.push({ pathname: '/tasks/[id]', params: { id: 'new' } })} />
      <Text style={typography.caption}>Tap a task to edit, reschedule or delete it.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
});

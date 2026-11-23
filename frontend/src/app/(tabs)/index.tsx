import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { CheckRow } from '@/components/CheckRow';
import { FocusCard } from '@/components/FocusCard';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { spacing, typography } from '@/constants/theme';
import { formatDue, greeting, localDate } from '@/lib/dates';
import { useApi, useMutation } from '@/lib/useApi';
import type { OccurrenceStatus, Today } from '@/types/models';

/**
 * UI-01: Today dashboard.
 * Shows the Today's Focus card, then today's goal check-ins and the to-dos due by today, loaded from GET /api/today.
 * Check-ins can be completed, skipped with no penalty, or undone.
 */
export default function TodayScreen() {
  // Computed once, so the screen keeps showing the same day if it stays open past midnight.
  const date = useMemo(() => localDate(), []);
  // /api/today drops finished to-dos, so count the ones finished today separately for the progress ring.
  const load = useCallback(async () => {
    const [today, tasks] = await Promise.all([api.today(date), api.tasks.list()]);
    const finishedTasks = tasks.filter((t) => t.completed_at && localDate(new Date(t.completed_at)) === date).length;
    return { ...today, finishedTasks };
  }, [date]);
  const { data, setData, error, loading, reload } = useApi<Today & { finishedTasks: number }>(load);
  const mutation = useMutation();

  const setStatus = async (id: number, status: OccurrenceStatus) => {
    const saved = await mutation.run(() => api.setOccurrence(id, status));
    // Reload so the progress ring's counts from the backend stay accurate.
    if (saved) reload();
  };

  const completeTask = async (id: number) => {
    const saved = await mutation.run(() => api.tasks.update(id, { done: true }));
    if (saved && data) {
      // Completed to-dos leave Today, so remove it locally instead of refetching.
      setData({ ...data, tasks: data.tasks.filter((t) => t.id !== id), finishedTasks: data.finishedTasks + 1 });
    }
  };

  // Skipped check-ins leave the total entirely, so a rest day never reads as falling short.
  const skipped = data ? data.occurrences.filter((o) => o.status === 'skipped').length : 0;
  const doneCount = data ? data.summary.goals_done + data.finishedTasks : 0;
  const totalCount = data ? data.summary.goals_total - skipped + data.tasks.length + data.finishedTasks : 0;

  // Check-ins come first, then to-dos in the order the backend returns them (oldest due date first).
  const nextCheckIn = data?.occurrences.find((o) => o.status === 'pending');
  const nextTask = data?.tasks[0];
  const next = nextCheckIn
    ? { title: nextCheckIn.goal.title, meta: 'Goal check-in' }
    : nextTask
      ? { title: nextTask.title, meta: `To-do · ${formatDue(nextTask.due_date ?? date, date)}` }
      : null;
  const finishNext = () => {
    if (nextCheckIn) setStatus(nextCheckIn.id, 'done');
    else if (nextTask) completeTask(nextTask.id);
  };
  const hasRows = !!data && data.occurrences.length + data.tasks.length > 0;

  return (
    <Screen title={greeting()} subtitle="One small step counts today.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {mutation.error ? <ErrorState message={mutation.error} /> : null}

      {data ? (
        <>
          <FocusCard done={doneCount} total={totalCount} next={next} disabled={mutation.busy} onDone={finishNext} />

          {hasRows ? <Text style={[typography.heading, styles.header]}>{"Today's actions"}</Text> : null}

          {/* Once something's been finished, the Focus card's message says it all. */}
          {!hasRows && data.finishedTasks === 0 ? (
            <>
              <EmptyState
                title="Nothing planned for today"
                description="Create a goal to plan small, regular actions."
              />
              <Button label="Create a goal" onPress={() => router.push('/goals/new')} />
            </>
          ) : null}

          {data.occurrences.map((o) => (
            <CheckRow
              key={`o${o.id}`}
              title={o.goal.title}
              meta={o.status === 'skipped' ? 'Skipped. No penalty.' : 'Goal check-in'}
              checked={o.status === 'done'}
              muted={o.status === 'skipped'}
              disabled={mutation.busy}
              onToggle={() => setStatus(o.id, o.status === 'done' ? 'pending' : 'done')}
              // Pending: offer Skip. Skipped: offer Undo. Done: the checkbox itself undoes it.
              actionLabel={o.status === 'pending' ? 'Skip' : o.status === 'skipped' ? 'Undo' : undefined}
              onAction={() => setStatus(o.id, o.status === 'pending' ? 'skipped' : 'pending')}
            />
          ))}

          {data.tasks.map((t) => (
            <CheckRow
              key={`t${t.id}`}
              title={t.title}
              meta={`To-do · ${formatDue(t.due_date ?? date, date)}`}
              checked={false}
              disabled={mutation.busy}
              onToggle={() => completeTask(t.id)}
            />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm },
});

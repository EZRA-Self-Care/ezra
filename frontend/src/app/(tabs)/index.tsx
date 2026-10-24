import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckRow } from '@/components/CheckRow';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatDue, greeting, localDate } from '@/lib/dates';
import { useApi, useMutation } from '@/lib/useApi';
import type { OccurrenceStatus, Today } from '@/types/models';

/**
 * UI-01: Today dashboard.
 * Shows today's goal check-ins and the to-dos due by today, loaded from GET /api/today.
 * Check-ins can be completed, skipped with no penalty, or undone.
 */
export default function TodayScreen() {
  // Computed once, so the screen keeps showing the same day if it stays open past midnight.
  const date = useMemo(() => localDate(), []);
  const load = useCallback(() => api.today(date), [date]);
  const { data, setData, error, loading, reload } = useApi<Today>(load);
  const mutation = useMutation();

  const setStatus = async (id: number, status: OccurrenceStatus) => {
    const saved = await mutation.run(() => api.setOccurrence(id, status));
    // Reload so the "N of M complete" summary from the backend stays accurate.
    if (saved) reload();
  };

  const completeTask = async (id: number) => {
    const saved = await mutation.run(() => api.tasks.update(id, { done: true }));
    if (saved && data) {
      // Completed to-dos leave Today, so remove it locally instead of refetching.
      setData({ ...data, tasks: data.tasks.filter((t) => t.id !== id) });
    }
  };

  const doneCount = data ? data.summary.goals_done : 0;
  const totalCount = data ? data.summary.goals_total : 0;

  return (
    <Screen title={greeting()} subtitle="One small step counts today.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {mutation.error ? <ErrorState message={mutation.error} /> : null}

      {data ? (
        <>
          <Card
            tone="mint"
            // Encouraging message: celebrate when everything is done, never scold when it isn't.
            title={doneCount > 0 && doneCount === totalCount ? 'You showed up today' : 'Your pace is enough'}
            description={
              totalCount === 0
                ? 'Nothing scheduled today. Rest counts too.'
                : 'Begin with one meaningful action.'
            }
          />

          <View style={styles.header}>
            <Text style={typography.heading}>{"Today's actions"}</Text>
            {totalCount > 0 ? (
              <Text style={styles.pill}>
                {doneCount} OF {totalCount} COMPLETE
              </Text>
            ) : null}
          </View>

          {data.occurrences.length === 0 && data.tasks.length === 0 ? (
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  pill: {
    ...typography.label,
    fontSize: 10,
    backgroundColor: colors.peach,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
});

import { router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { WeekBars } from '@/components/WeekBars';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { addDays, localDate } from '@/lib/dates';
import { tapFeedback } from '@/lib/haptics';
import { useApi, useMutation } from '@/lib/useApi';
import type { Progress, Task, Today } from '@/types/models';

const TONES = [colors.surfaceMuted, colors.peach, colors.mint];

/** "1 check-in", "3 to-dos". */
const count = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;

/**
 * UI-04: Progress and recovery.
 * Loads the last 7 days of progress, plus yesterday's check-ins to find any that were missed.
 * Missed ones get a "Plans can change" card instead of a broken streak.
 * Sprint 5: the weekly total now includes finished to-dos (so it agrees with the Today card) and
 * spells out what it's made of, per product owner feedback that weekly progress was hard to read.
 */
export default function ProgressScreen() {
  const today = useMemo(() => localDate(), []);
  const yesterday = addDays(today, -1);
  const load = useCallback(
    // All requests run in parallel. Calling /today for yesterday also creates any check-ins the app never loaded.
    () => Promise.all([api.progress(today, 7), api.today(yesterday), api.tasks.list()]),
    [today, yesterday],
  );
  const { data, error, loading, reload } = useApi<[Progress, Today, Task[]]>(load);
  const mutation = useMutation();

  const progress = data?.[0];

  // /api/progress only counts goal check-ins. Add the to-dos finished on each day, so the week
  // matches the Today card, which counts both.
  const week = useMemo(() => {
    if (!data) return null;
    const [p, , tasks] = data;
    const todosByDay: Record<string, number> = {};
    for (const t of tasks) {
      if (!t.completed_at) continue;
      const day = localDate(new Date(t.completed_at));
      todosByDay[day] = (todosByDay[day] ?? 0) + 1;
    }
    const days = p.per_day.map((d) => ({
      date: d.date,
      done: d.done + (todosByDay[d.date] ?? 0),
    }));
    const todos = p.per_day.reduce((n, d) => n + (todosByDay[d.date] ?? 0), 0);
    return {
      days,
      checkIns: p.total_done,
      todos,
      total: p.total_done + todos,
      activeDays: days.filter((d) => d.done > 0).length,
    };
  }, [data]);
  // Check-ins from yesterday that were neither done nor skipped.
  const missed = data?.[1].occurrences.filter((o) => o.status === 'pending') ?? [];

  // "Let it rest" marks the missed check-in as skipped: a rest day, excluded from the completion rate.
  const letItRest = async (id: number) => {
    const saved = await mutation.run(() => api.setOccurrence(id, 'skipped'));
    if (saved) reload();
  };

  const openGoal = (id: number) => router.push({ pathname: '/goals/[id]', params: { id: String(id) } });

  return (
    <Screen title="Your progress" subtitle="Notice the effort, not just the streak.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {mutation.error ? <ErrorState message={mutation.error} /> : null}

      {progress && week ? (
        <>
          <View style={[styles.hero, { backgroundColor: colors.sky }]}>
            {/* "Last 7 days", not "this week": the chart is a rolling window ending today. */}
            <Text style={typography.label}>LAST 7 DAYS</Text>
            <Text style={typography.title}>{count(week.total, 'action')} completed</Text>
            {/* What the total is made of, and how many days had something, never a streak. */}
            <Text style={styles.breakdown}>
              {count(week.checkIns, 'check-in')} · {count(week.todos, 'to-do')} · active {week.activeDays} of 7 days
            </Text>
            <Text style={typography.caption}>
              {week.total > 0
                ? 'Every return counts, including the ones after a hard day.'
                : 'A fresh week. One small step is enough to begin.'}
            </Text>
            <WeekBars days={week.days} today={today} />
          </View>

          {missed.length > 0 ? (
            <View style={styles.section}>
              <Text style={typography.heading}>Plans can change</Text>
              <Text style={typography.caption}>A missed check-in does not erase progress.</Text>
              {missed.map((o) => (
                <Card
                  key={o.id}
                  tone="peach"
                  title={o.goal.title}
                  description="Missed yesterday. No streak penalty. Choose your next step.">
                  <View style={styles.actions}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={mutation.busy}
                      onPress={() => {
                        tapFeedback();
                        void letItRest(o.id);
                      }}>
                      <Text style={typography.label}>LET IT REST</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        tapFeedback();
                        router.navigate('/');
                      }}>
                      <Text style={typography.label}>TRY TODAY</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        tapFeedback();
                        openGoal(o.goal_id);
                      }}>
                      <Text style={typography.label}>ADJUST PLAN</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          {progress.recovery.length > 0 ? (
            <View style={styles.section}>
              <Text style={typography.heading}>What feels manageable now?</Text>
              {progress.recovery.map((r) => (
                <Card key={r.goal_id} title={r.title} description={r.suggestion}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      tapFeedback();
                      openGoal(r.goal_id);
                    }}>
                    <Text style={[typography.label, styles.cta]}>MAKE IT SMALLER</Text>
                  </Pressable>
                </Card>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={typography.heading}>By goal</Text>
            {progress.goals.length === 0 ? (
              <EmptyState title="No goals yet" description="Progress shows up here once you create a goal." />
            ) : null}
            {progress.goals.map((g, i) => {
              // Rest days are subtracted from the planned total, so they never count as misses.
              const planned = g.scheduled - g.skipped;
              const share = planned > 0 ? Math.min(1, g.done / planned) : 0;
              return (
                <Pressable
                  key={g.goal_id}
                  accessibilityRole="button"
                  onPress={() => {
                    tapFeedback();
                    openGoal(g.goal_id);
                  }}
                  style={[styles.goal, { backgroundColor: TONES[i % TONES.length] }]}>
                  <Text style={typography.heading}>{g.title}</Text>
                  <Text style={typography.caption}>
                    {g.done} of {count(planned, 'check-in')} done
                    {g.skipped > 0 ? ` · ${count(g.skipped, 'rest day')}` : ''}
                  </Text>
                  {/* A simple bar reads faster than the numbers alone. */}
                  <View style={styles.goalTrack}>
                    <View style={[styles.goalFill, { width: `${share * 100}%` }]} />
                  </View>
                </Pressable>
              );
            })}
            <Text style={typography.caption}>Rest days are not counted against you.</Text>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  cta: { marginTop: spacing.sm },
  goal: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs },
  breakdown: { ...typography.body, fontWeight: '600' },
  goalTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  goalFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});

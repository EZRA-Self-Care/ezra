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
import { useApi, useMutation } from '@/lib/useApi';
import type { Progress, Today } from '@/types/models';

const TONES = [colors.surfaceMuted, colors.peach, colors.mint];

/**
 * UI-04: Progress and recovery.
 * Loads the last 7 days of progress, plus yesterday's check-ins to find any that were missed.
 * Missed ones get a "Plans can change" card instead of a broken streak.
 */
export default function ProgressScreen() {
  const today = useMemo(() => localDate(), []);
  const yesterday = addDays(today, -1);
  const load = useCallback(
    // Both requests run in parallel. Calling /today for yesterday also creates any check-ins the app never loaded.
    () => Promise.all([api.progress(today, 7), api.today(yesterday)]),
    [today, yesterday],
  );
  const { data, error, loading, reload } = useApi<[Progress, Today]>(load);
  const mutation = useMutation();

  const progress = data?.[0];
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

      {progress ? (
        <>
          <View style={[styles.hero, { backgroundColor: colors.sky }]}>
            <Text style={typography.label}>THIS WEEK</Text>
            <Text style={typography.title}>
              {progress.total_done} {progress.total_done === 1 ? 'action' : 'actions'} completed
            </Text>
            <Text style={typography.caption}>
              {progress.total_done > 0
                ? 'Every return counts, including the ones after a hard day.'
                : 'A fresh week. One small step is enough to begin.'}
            </Text>
            <WeekBars days={progress.per_day} />
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
                    <Pressable accessibilityRole="button" disabled={mutation.busy} onPress={() => letItRest(o.id)}>
                      <Text style={typography.label}>LET IT REST</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => router.navigate('/')}>
                      <Text style={typography.label}>TRY TODAY</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => openGoal(o.goal_id)}>
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
                  <Pressable accessibilityRole="button" onPress={() => openGoal(r.goal_id)}>
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
            {progress.goals.map((g, i) => (
              <Pressable
                key={g.goal_id}
                accessibilityRole="button"
                onPress={() => openGoal(g.goal_id)}
                style={[styles.goal, { backgroundColor: TONES[i % TONES.length] }]}>
                <Text style={typography.heading}>{g.title}</Text>
                <Text style={typography.caption}>
                  {/* Rest days are subtracted from the planned total, so they never count as misses. */}
                  {g.done} / {g.scheduled - g.skipped} planned actions
                  {g.skipped > 0 ? ` · ${g.skipped} rest ${g.skipped === 1 ? 'day' : 'days'}` : ''}
                </Text>
              </Pressable>
            ))}
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
});

import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { EmptyState, ErrorState, Loading } from '@/components/StateView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { describeDays } from '@/lib/dates';
import { useApi } from '@/lib/useApi';
import type { Goal } from '@/types/models';

// Card colours cycle through the design's tones so neighbouring goals look distinct.
const TONES = [colors.mint, colors.peach, colors.sky, colors.surfaceMuted];

/** UI-03: Goal list. Each card shows the goal, why it matters and its schedule; tap to open and edit it. */
export default function GoalsScreen() {
  const load = useCallback(() => api.goals.list(), []);
  const { data, error, loading, reload } = useApi<Goal[]>(load);

  return (
    <Screen title="Your goals" subtitle="Grow in consistency, one day at a time.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Personal or spiritual, big or small. Start with one that matters to you."
        />
      ) : null}

      {data?.map((g, i) => (
        <Pressable
          key={g.id}
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/goals/[id]', params: { id: String(g.id) } })}
          style={[styles.card, { backgroundColor: TONES[i % TONES.length] }]}>
          <Text style={typography.heading}>{g.title}</Text>
          {g.description ? <Text style={typography.caption}>{g.description}</Text> : null}
          <Text style={styles.schedule}>{describeDays(g.days_of_week).toUpperCase()}</Text>
        </Pressable>
      ))}

      <Button label="Create goal" onPress={() => router.push('/goals/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.xs },
  schedule: { ...typography.label, marginTop: spacing.xs },
});

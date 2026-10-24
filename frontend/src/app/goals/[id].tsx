import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { GoalForm, type GoalDraft } from '@/components/GoalForm';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/StateView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { describeDays } from '@/lib/dates';
import { goBack } from '@/lib/navigation';
import { useApi, useMutation } from '@/lib/useApi';
import type { Goal, Revision } from '@/types/models';

const FIELD_NAMES: Record<string, string> = {
  title: 'Name',
  description: 'Why',
  days_of_week: 'Schedule',
};

function describeChange(field: string, value: unknown) {
  if (field === 'days_of_week') return describeDays(value as number[]);
  return String(value || '(empty)');
}

// UI-03: Goal detail, editing plan revisions and history
export default function GoalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalId = Number(id);
  const load = useCallback(() => Promise.all([api.goals.get(goalId), api.goals.revisions(goalId)]), [goalId]);
  const { data, error, loading, reload } = useApi<[Goal, Revision[]]>(load);
  const goal = data?.[0];

  return (
    <Screen title={goal?.title ?? 'Goal'} subtitle="Adjust the pace whenever you need.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {goal ? <GoalEditor goal={goal} onSaved={reload} /> : null}

      {data && data[1].length > 0 ? (
        <View style={styles.history}>
          <Text style={typography.heading}>History</Text>
          {data[1].map((r) => (
            <View key={r.id} style={styles.revision}>
              <Text style={typography.caption}>{new Date(r.created_at).toLocaleDateString()}</Text>
              {Object.entries(r.changes).map(([field, c]) => (
                <Text key={field} style={typography.body}>
                  {FIELD_NAMES[field] ?? field}: {describeChange(field, c.from)} → {describeChange(field, c.to)}
                </Text>
              ))}
              {r.note ? <Text style={typography.caption}>“{r.note}”</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function GoalEditor({ goal, onSaved }: { goal: Goal; onSaved: () => void }) {
  const goalId = goal.id;
  const mutation = useMutation();
  const [draft, setDraft] = useState<GoalDraft>({
    title: goal.title,
    description: goal.description,
    days: goal.days_of_week,
  });
  const [note, setNote] = useState('');

  const save = async () => {
    if (!draft.title.trim()) {
      mutation.setError('Give your goal a short name.');
      return;
    }
    const saved = await mutation.run(() =>
      api.goals.update(goalId, {
        title: draft.title,
        description: draft.description,
        days_of_week: draft.days,
        note,
      }),
    );
    if (saved) {
      setNote('');
      onSaved();
    }
  };

  const archive = async () => {
    const saved = await mutation.run(() => api.goals.update(goalId, { archived: true }));
    if (saved) goBack('/goals');
  };

  return (
    <>
      <GoalForm draft={draft} onChange={setDraft} />
      <Field
        label="What changed? (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="Mornings are busy right now"
        maxLength={500}
      />
      {mutation.error ? <ErrorState message={mutation.error} /> : null}
      <Button label="Save plan" onPress={save} disabled={mutation.busy} />
      <Button
        label="Add a task for this goal"
        variant="secondary"
        onPress={() => router.push({ pathname: '/tasks/new', params: { goalId: String(goalId) } })}
      />
      <Button label="Pause goal (archive)" variant="secondary" onPress={archive} disabled={mutation.busy} />
    </>
  );
}

const styles = StyleSheet.create({
  history: { gap: spacing.sm, marginTop: spacing.md },
  revision: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: spacing.md, gap: 2 },
});

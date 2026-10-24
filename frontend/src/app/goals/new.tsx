import { useState } from 'react';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { GoalForm, type GoalDraft } from '@/components/GoalForm';
import { Screen } from '@/components/Screen';
import { ErrorState } from '@/components/StateView';
import { localDate } from '@/lib/dates';
import { goBack } from '@/lib/navigation';
import { useMutation } from '@/lib/useApi';

// UI-03: Create a goal, optionally with its first action as a to-do.
export default function NewGoalScreen() {
  const [draft, setDraft] = useState<GoalDraft>({ title: '', description: '', days: [] });
  const [firstAction, setFirstAction] = useState('');
  const mutation = useMutation();

  const create = async () => {
    if (!draft.title.trim()) {
      mutation.setError('Give your goal a short name.');
      return;
    }
    const today = localDate();
    // One mutation for both requests, so the button stays disabled until both finish.
    const saved = await mutation.run(async () => {
      const goal = await api.goals.create({
        title: draft.title,
        description: draft.description,
        days_of_week: draft.days,
        start_date: today, // local date, so the goal starts today wherever the user is
      });
      // The optional first action becomes a to-do linked to the new goal, due today.
      if (firstAction.trim()) {
        await api.tasks.create({ title: firstAction, goal_id: goal.id, due_date: today });
      }
      return goal;
    });
    if (saved) goBack('/goals');
  };

  return (
    <Screen title="Create a goal" subtitle="Start small. You can revise this later.">
      <GoalForm draft={draft} onChange={setDraft} />
      <Field
        label="First action"
        value={firstAction}
        onChangeText={setFirstAction}
        placeholder="Pray for 5 minutes"
        maxLength={200}
      />
      {mutation.error ? <ErrorState message={mutation.error} /> : null}
      <Button label="Create goal" onPress={create} disabled={mutation.busy} />
    </Screen>
  );
}

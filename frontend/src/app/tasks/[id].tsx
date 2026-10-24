import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Field, FieldGroup } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { ErrorState, Loading } from '@/components/StateView';
import { addDays, formatDue, localDate } from '@/lib/dates';
import { goBack } from '@/lib/navigation';
import { useApi, useMutation } from '@/lib/useApi';
import type { Goal, Task } from '@/types/models';

/**
 * UI-02: edit, reschedule or delete a to-do. New tasks are added in tasks/new.tsx.
 * Loads the task and the goal list (for the Goal chips), then mounts TaskForm.
 */
export default function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useMemo(() => localDate(), []);

  const load = useCallback(() => Promise.all([api.tasks.get(Number(id)), api.goals.list()]), [id]);
  const { data, error, loading, reload } = useApi<[Task, Goal[]]>(load);

  return (
    <Screen title="Edit task" subtitle="Keep it small enough to start.">
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? <TaskForm task={data[0]} goals={data[1]} today={today} /> : null}
    </Screen>
  );
}

type FormProps = { task: Task; goals: Goal[]; today: string };

/** Edit form for one task. Mounted after loading, so its fields start from the saved task. */
function TaskForm({ task, goals, today }: FormProps) {
  const mutation = useMutation();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const [due, setDue] = useState<string | null>(task.due_date);
  const [goal, setGoal] = useState<number | null>(task.goal_id);

  const dueOptions = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: addDays(today, 1) },
    { label: 'Next week', value: addDays(today, 7) },
    { label: 'Any time', value: null },
  ];
  // Keep a date that isn't one of the presets selectable.
  if (due && !dueOptions.some((o) => o.value === due)) {
    dueOptions.unshift({ label: formatDue(due, today), value: due });
  }

  const goalOptions = [
    { label: 'No goal', value: null as number | null },
    ...goals.map((g) => ({ label: g.title, value: g.id as number | null })),
  ];

  const save = async () => {
    // Check on the device first for a quicker message; the backend validates again.
    if (!title.trim()) {
      mutation.setError('Give the task a short name.');
      return;
    }
    const body = { title, notes, due_date: due, goal_id: goal };
    const saved = await mutation.run(() => api.tasks.update(task.id, body));
    if (saved) goBack('/lists');
  };

  const remove = async () => {
    // DELETE returns no body, so return true to tell "deleted" apart from "failed" (undefined).
    const ok = await mutation.run(async () => {
      await api.tasks.remove(task.id);
      return true;
    });
    if (ok) goBack('/lists');
  };

  return (
    <>
      <Field label="Task" value={title} onChangeText={setTitle} placeholder="Take a short walk" maxLength={200} />
      <Field
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional"
        multiline
        maxLength={2000}
      />
      <FieldGroup label="When">
        <Chips options={dueOptions} isSelected={(v) => v === due} onPress={setDue} />
      </FieldGroup>
      <FieldGroup label="Goal">
        <Chips options={goalOptions} isSelected={(v) => v === goal} onPress={setGoal} />
      </FieldGroup>

      {mutation.error ? <ErrorState message={mutation.error} /> : null}
      <Button label="Save changes" onPress={save} disabled={mutation.busy} />
      <Button label="Delete task" variant="secondary" onPress={remove} disabled={mutation.busy} />
    </>
  );
}

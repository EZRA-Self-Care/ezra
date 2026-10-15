import { Stack, useLocalSearchParams } from 'expo-router';
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

// UI-02: create, edit, reschedule or delete a to-do. Route id is a task id or "new".
export default function TaskScreen() {
  const { id, goalId } = useLocalSearchParams<{ id: string; goalId?: string }>();
  const isNew = id === 'new';
  const today = useMemo(() => localDate(), []);

  const load = useCallback(
    () => Promise.all([isNew ? Promise.resolve(null) : api.tasks.get(Number(id)), api.goals.list()]),
    [id, isNew],
  );
  const { data, error, loading, reload } = useApi<[Task | null, Goal[]]>(load);

  return (
    <Screen title={isNew ? 'Add a task' : 'Edit task'} subtitle="Keep it small enough to start.">
      <Stack.Screen options={{ title: isNew ? 'New task' : 'Task' }} />
      {loading ? <Loading /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data ? (
        <TaskForm
          task={data[0]}
          goals={data[1]}
          today={today}
          defaultGoal={goalId ? Number(goalId) : null}
        />
      ) : null}
    </Screen>
  );
}

type FormProps = { task: Task | null; goals: Goal[]; today: string; defaultGoal: number | null };

function TaskForm({ task, goals, today, defaultGoal }: FormProps) {
  const isNew = task === null;
  const mutation = useMutation();
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [due, setDue] = useState<string | null>(task ? task.due_date : today);
  const [goal, setGoal] = useState<number | null>(task ? task.goal_id : defaultGoal);

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
    if (!title.trim()) {
      mutation.setError('Give the task a short name.');
      return;
    }
    const body = { title, notes, due_date: due, goal_id: goal };
    const saved = await mutation.run(() => (isNew ? api.tasks.create(body) : api.tasks.update(task.id, body)));
    if (saved) goBack('/lists');
  };

  const remove = async () => {
    const ok = await mutation.run(async () => {
      await api.tasks.remove(task!.id);
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
      <Button label={isNew ? 'Add task' : 'Save changes'} onPress={save} disabled={mutation.busy} />
      {!isNew ? <Button label="Delete task" variant="secondary" onPress={remove} disabled={mutation.busy} /> : null}
    </>
  );
}

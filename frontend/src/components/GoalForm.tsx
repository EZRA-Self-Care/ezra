import { Chips } from '@/components/Chips';
import { Field, FieldGroup } from '@/components/Field';
import { DAY_LABELS } from '@/lib/dates';

export type GoalDraft = { title: string; description: string; days: number[] };

const PRESETS = [
  { label: 'Every day', value: [] as number[] },
  { label: 'Weekdays', value: [0, 1, 2, 3, 4] },
  { label: 'Weekends', value: [5, 6] },
];

const same = (a: number[], b: number[]) => a.join() === b.join();

type Props = { draft: GoalDraft; onChange: (draft: GoalDraft) => void };

// Shared by "Create a goal" and goal editing (UI-03).
export function GoalForm({ draft, onChange }: Props) {
  const toggleDay = (day: number) => {
    // Empty means every day, so start from all seven days.
    const current = draft.days.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : draft.days;
    const days = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange({ ...draft, days: days.length === 7 ? [] : days.sort() });
  };

  return (
    <>
      <Field
        label="Goal"
        value={draft.title}
        onChangeText={(title) => onChange({ ...draft, title })}
        placeholder="Build a steady prayer habit"
        maxLength={200}
      />
      <Field
        label="Why it matters"
        value={draft.description}
        onChangeText={(description) => onChange({ ...draft, description })}
        placeholder="Make space for faith each day"
        multiline
        maxLength={2000}
      />
      <FieldGroup label="Schedule">
        <Chips
          options={PRESETS}
          isSelected={(v) => same(v, draft.days)}
          onPress={(days) => onChange({ ...draft, days })}
        />
        <Chips
          options={DAY_LABELS.map((label, value) => ({ label, value }))}
          isSelected={(d) => draft.days.length === 0 || draft.days.includes(d)}
          onPress={toggleDay}
        />
      </FieldGroup>
    </>
  );
}

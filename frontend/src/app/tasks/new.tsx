import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { api } from '@/api/client';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { ErrorState } from '@/components/StateView';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { goBack } from '@/lib/navigation';
import { useMutation } from '@/lib/useApi';

// UI-02: Add a task. Opened from Lists, or from a goal with ?goalId= to attach it to that goal.
export default function NewTaskScreen() {
  const { goalId } = useLocalSearchParams<{ goalId?: string }>();
  const mutation = useMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const canSave = name.trim().length > 0 && description.trim().length > 0;

  async function saveTask() {
    if (!canSave) return;

    const saved = await mutation.run(() =>
      api.tasks.create({
        title: name.trim(),
        notes: description.trim(),
        goal_id: goalId ? Number(goalId) : null,
      }),
    );
    if (saved) goBack('/lists');
  }

  return (
    <Screen title="Add a task" subtitle="Choose one small thing you want to complete.">
      <View style={styles.field}>
        <Text style={typography.label}>TASK NAME</Text>
        <TextInput
          accessibilityLabel="Task name"
          maxLength={200}
          onChangeText={setName}
          placeholder="Walk for 10 minutes"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={name}
        />
      </View>

      <View style={styles.field}>
        <Text style={typography.label}>SHORT DESCRIPTION</Text>
        <TextInput
          accessibilityLabel="Short task description"
          maxLength={2000}
          multiline
          numberOfLines={4}
          onChangeText={setDescription}
          placeholder="Take a short walk after lunch."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.description]}
          textAlignVertical="top"
          value={description}
        />
      </View>

      {mutation.error ? <ErrorState message={mutation.error} /> : null}
      <Button label="Save task" disabled={!canSave || mutation.busy} onPress={saveTask} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.md,
  },
  description: { minHeight: 112 },
});

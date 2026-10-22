import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useTasks } from '@/context/TasksContext';

export default function NewTaskScreen() {
  const { addTask } = useTasks();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const canSave = name.trim().length > 0 && description.trim().length > 0;

  function saveTask() {
    if (!canSave) return;

    addTask({ name, description });
    router.back();
  }

  return (
    <Screen title="Add a task" subtitle="Choose one small thing you want to complete.">
      <View style={styles.field}>
        <Text style={typography.label}>TASK NAME</Text>
        <TextInput
          accessibilityLabel="Task name"
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

      <Button label="Save task" disabled={!canSave} onPress={saveTask} />
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

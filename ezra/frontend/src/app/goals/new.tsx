import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, typography } from '@/constants/theme';

const FIELDS = [
  { label: 'Goal', placeholder: 'Build a steady prayer habit' },
  { label: 'Why it matters', placeholder: 'Make space for faith each day' },
  { label: 'First action', placeholder: 'Pray for 5 minutes' },
  { label: 'Schedule', placeholder: 'Weekdays · 8:00 AM' },
];

// UI-03: Create a goal (form wiring to POST /goals comes next)
export default function NewGoalScreen() {
  return (
    <Screen title="Create a goal" subtitle="Start small. You can revise this later.">
      {FIELDS.map((field) => (
        <View key={field.label} style={styles.field}>
          <Text style={typography.label}>{field.label.toUpperCase()}</Text>
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      ))}
      <Button label="Create goal" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
});

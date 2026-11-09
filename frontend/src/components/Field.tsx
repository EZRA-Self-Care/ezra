import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type Props = TextInputProps & { label: string };

/** Labelled text input. Any TextInput prop (value, placeholder, multiline, maxLength...) passes straight through. */
export function Field({ label, style, ...input }: Props) {
  return (
    <View style={styles.field}>
      <Text style={typography.label}>{label.toUpperCase()}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        {...input}
      />
    </View>
  );
}

/** Same label style as Field, wrapped around custom controls such as Chips. */
export function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={typography.label}>{label.toUpperCase()}</Text>
      {children}
    </View>
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
